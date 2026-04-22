// ============================================
// CONFIGURAÇÕES DE NOTIFICAÇÕES
// ============================================

const CONFIG_NOTIFICACOES = {
  USAR_PUSHCUT: false,
  PUSHCUT_URLS: [
    "https://api.pushcut.io/SEU_TOKEN_AQUI/notifications/Novo%20Lead",
    "https://api.pushcut.io/SEU_TOKEN_2/notifications/Novo%20Lead",
  ],
  USAR_EMAIL: true,
  EMAIL_DESTINATARIOS: {
    "PI": ["francisco.gomes@decriopiranhas.com.br"],
    "MA": ["francisco.gomes@decriopiranhas.com.br"]
  }
};

function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);

    var nome          = dados.nomeCompleto    || dados.nome || '';
    var email         = dados.email           || '';
    var telefone      = dados.telefone        || '';
    var documento     = dados.documento       || '';
    var tipoDocumento = dados.tipoDocumento   || '';
    var estado        = dados.estado          || '';
    var cidade        = dados.cidade          || '';
    var utmSource     = dados.utm_source      || '';
    var utmMedium     = dados.utm_medium      || '';
    var utmCampaign   = dados.utm_campaign    || '';
    var utmContent    = dados.utm_content     || '';
    var utmTerm       = dados.utm_term        || '';

    var faturamento      = dados.faturamento      || '';
    var desempenho       = dados.desempenho       || '';
    var produtos         = dados.produtos         || [];
    var mediaFaturamento = dados.mediaFaturamento || '';

    var produtosStr = Array.isArray(produtos) ? produtos.join(', ') : String(produtos);

    var respostasQuiz = [
      'Email: '             + (email             || '-'),
      'Cidade: '            + (cidade            || '-'),
      'Faturamento: '       + (faturamento       || '-'),
      'Desempenho: '        + (desempenho        || '-'),
      'Categorias: '        + (produtosStr       || '-'),
      'Media Faturamento: ' + (mediaFaturamento  || '-'),
    ].join(' | ');

    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var nomePagina = estado.toUpperCase() === 'MA' ? 'MARANHAO' : 'PIAUI';
    var planilha = spreadsheet.getSheetByName(nomePagina);

    if (!planilha) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'erro', mensagem: 'Aba "' + nomePagina + '" não encontrada' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (documentoExiste(planilha, documento)) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'erro', mensagem: 'Documento já cadastrado', documento: documento }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var agora = new Date();
    var dataHora = agora.getFullYear() + '-' + (agora.getMonth() + 1) + '-' + agora.getDate();

    var telefoneFormatado = telefone.replace(/\D/g, '');
    if (!telefoneFormatado.startsWith('55')) {
      telefoneFormatado = '55' + telefoneFormatado;
    }

    var mensagem = tipoDocumento.toLowerCase() === 'cnpj'
      ? 'Olá ' + nome + ', tudo bem? Sou consultor da Rio Piranhas. Vimos que você tem interesse em nossos serviços para o seu negócio e gostaria de apresentar nossas condições especiais. Podemos conversar?'
      : 'Oi ' + nome + ', tudo bem? Aqui é da Rio Piranhas! Vimos que você tem interesse em nossos produtos e serviços. Posso te enviar mais informações e nosso catálogo?';

    var linkWhatsApp = '=HYPERLINK("https://wa.me/' + telefoneFormatado + '?text=' + encodeURIComponent(mensagem) + '"; "' + telefone + '")';

    var novaLinha = planilha.getLastRow() + 1;

    planilha.getRange(novaLinha, 1).setValue(nome);
    planilha.getRange(novaLinha, 2).setValue(linkWhatsApp);
    planilha.getRange(novaLinha, 3).setNumberFormat('@');
    planilha.getRange(novaLinha, 3).setValue(documento);
    planilha.getRange(novaLinha, 4).setValue(tipoDocumento);
    planilha.getRange(novaLinha, 5).setValue(estado);
    planilha.getRange(novaLinha, 6).setValue(dataHora);
    planilha.getRange(novaLinha, 7).setValue('CREATED');
    planilha.getRange(novaLinha, 11).setValue(utmSource);
    planilha.getRange(novaLinha, 12).setValue(utmMedium);
    planilha.getRange(novaLinha, 13).setValue(utmCampaign);
    planilha.getRange(novaLinha, 14).setValue(utmContent);
    planilha.getRange(novaLinha, 15).setValue(utmTerm);
    planilha.getRange(novaLinha, 16).setValue(respostasQuiz);

    enviarNotificacoes(nome, telefone, documento, tipoDocumento, estado, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, respostasQuiz);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'sucesso', mensagem: 'Dados salvos com sucesso', documento: documento }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (erro) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'erro', mensagem: erro.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function documentoExiste(planilha, documento) {
  var ultimaLinha = planilha.getLastRow();
  if (ultimaLinha < 2) return false;

  var documentos = planilha.getRange(2, 3, ultimaLinha - 1, 1).getValues();

  for (var i = 0; i < documentos.length; i++) {
    var valorSalvo = documentos[i][0].toString().trim();
    var valorRecebido = documento.toString().trim();
    if (valorSalvo === valorRecebido || Number(valorSalvo) === Number(valorRecebido)) {
      return true;
    }
  }
  return false;
}

// ============================================
// SISTEMA DE NOTIFICAÇÕES
// ============================================

function enviarNotificacoes(nome, telefone, documento, tipoDocumento, estado, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, respostasQuiz) {
  var resultado = [];

  if (CONFIG_NOTIFICACOES.USAR_PUSHCUT) {
    var pushcutResultado = enviarPushcutMultiplo(nome, telefone, tipoDocumento);
    if (pushcutResultado.sucesso > 0) resultado.push('Pushcut: ' + pushcutResultado.sucesso + '/' + pushcutResultado.total);
  }

  if (CONFIG_NOTIFICACOES.USAR_EMAIL) {
    var emailResultado = enviarEmailMultiplo(nome, telefone, documento, tipoDocumento, estado, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, respostasQuiz);
    if (emailResultado.sucesso > 0) resultado.push('Email: ' + emailResultado.sucesso + '/' + emailResultado.total);
  }

  Logger.log('Notificações enviadas: ' + resultado.join(', '));
}

function enviarPushcutMultiplo(nome, telefone, tipo) {
  var sucesso = 0;
  var erros = 0;
  var total = CONFIG_NOTIFICACOES.PUSHCUT_URLS.length;
  var tipoNegocio = tipo.toLowerCase() === 'cnpj' ? '🏢 B2B' : '🛒 B2C';

  for (var i = 0; i < CONFIG_NOTIFICACOES.PUSHCUT_URLS.length; i++) {
    try {
      var payload = { title: "🎯 Novo Lead Rio Piranhas!", text: tipoNegocio + " - " + nome + " (" + telefone + ")", isTimeSensitive: true, sound: "default" };
      var options = { method: "post", contentType: "application/json", payload: JSON.stringify(payload), muteHttpExceptions: true };
      var response = UrlFetchApp.fetch(CONFIG_NOTIFICACOES.PUSHCUT_URLS[i], options);
      response.getResponseCode() === 200 ? sucesso++ : erros++;
    } catch (error) {
      erros++;
      Logger.log('Erro Pushcut ' + (i + 1) + ': ' + error);
    }
  }
  return { sucesso: sucesso, erros: erros, total: total };
}

// ============================================
// EMAIL
// ============================================

function enviarEmailMultiplo(nome, telefone, documento, tipoDocumento, estado, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, respostasQuiz) {
  var sucesso = 0;
  var erros = 0;
  var destinatarios = CONFIG_NOTIFICACOES.EMAIL_DESTINATARIOS[estado.toUpperCase()] || CONFIG_NOTIFICACOES.EMAIL_DESTINATARIOS["PI"];
  var total = destinatarios.length;
  var tipoNegocio = tipoDocumento.toLowerCase() === 'cnpj' ? 'B2B (Empresa)' : 'B2C (Pessoa Física)';
  var assunto = '🎯 Novo Lead Rio Piranhas - ' + tipoNegocio + ' - ' + nome;
  var corpo = criarCorpoEmail(nome, telefone, documento, tipoDocumento, estado, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, respostasQuiz);

  for (var i = 0; i < destinatarios.length; i++) {
    try {
      MailApp.sendEmail({ to: destinatarios[i], subject: assunto, htmlBody: corpo });
      sucesso++;
    } catch (error) {
      erros++;
      Logger.log('Erro Email ' + (i + 1) + ': ' + error);
    }
  }
  return { sucesso: sucesso, erros: erros, total: total };
}

function criarCorpoEmail(nome, telefone, documento, tipoDocumento, estado, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, respostasQuiz) {
  var agora = new Date();
  var dataFormatada = agora.getFullYear() + '-' + (agora.getMonth() + 1) + '-' + agora.getDate();
  var tipoNegocio = tipoDocumento.toLowerCase() === 'cnpj' ? '🏢 B2B (Empresa)' : '🛒 B2C (Pessoa Física)';
  var tipoDoc = tipoDocumento.toUpperCase();

  var telefoneFormatado = telefone.replace(/\D/g, '');
  if (!telefoneFormatado.startsWith('55')) telefoneFormatado = '55' + telefoneFormatado;

  var mensagem = tipoDocumento.toLowerCase() === 'cnpj'
    ? 'Olá ' + nome + ', tudo bem? Sou consultor da Rio Piranhas. Vimos que você tem interesse em nossos serviços para o seu negócio e gostaria de apresentar nossas condições especiais. Podemos conversar?'
    : 'Oi ' + nome + ', tudo bem? Aqui é da Rio Piranhas! Vimos que você tem interesse em nossos produtos e serviços. Posso te enviar mais informações e nosso catálogo?';

  var linkWhatsApp = 'https://wa.me/' + telefoneFormatado + '?text=' + encodeURIComponent(mensagem);

  var quizLinhas = '';
  if (respostasQuiz) {
    var partes = respostasQuiz.split(' | ');
    for (var i = 0; i < partes.length; i++) {
      var kv = partes[i].split(': ');
      var chave = kv[0] || '';
      var valor = kv.slice(1).join(': ') || '-';
      quizLinhas += '<tr><td style="padding:10px;background-color:#f8f9fa;font-weight:bold;width:35%;color:#666;">' + chave + ':</td><td style="padding:10px;background-color:#fff;color:#333;">' + valor + '</td></tr>';
    }
  }

  return `
    <html><body style="font-family:Arial,sans-serif;background-color:#f5f5f5;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background-color:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:30px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;">🎯 Novo Lead Capturado!</h1>
          <p style="color:#e0e0e0;margin:10px 0 0 0;font-size:14px;">Rio Piranhas</p>
        </div>
        <div style="background-color:#f8f9fa;padding:15px;text-align:center;border-bottom:3px solid ${tipoDocumento.toLowerCase() === 'cnpj' ? '#2196F3' : '#4CAF50'};">
          <span style="font-size:18px;font-weight:bold;color:#333;">${tipoNegocio}</span>
        </div>
        <div style="padding:30px;">
          <h2 style="color:#333;margin:0 0 20px 0;font-size:18px;border-bottom:2px solid #667eea;padding-bottom:10px;">📋 Dados do Lead</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:25px;">
            <tr><td style="padding:12px;background-color:#f8f9fa;font-weight:bold;width:35%;color:#666;">👤 Nome:</td><td style="padding:12px;background-color:#fff;color:#333;">${nome}</td></tr>
            <tr><td style="padding:12px;background-color:#f8f9fa;font-weight:bold;color:#666;">📱 Telefone:</td><td style="padding:12px;background-color:#fff;"><a href="${linkWhatsApp}" style="color:#25D366;text-decoration:none;font-weight:bold;">${telefone} (Abrir WhatsApp)</a></td></tr>
            <tr><td style="padding:12px;background-color:#f8f9fa;font-weight:bold;color:#666;">📄 ${tipoDoc}:</td><td style="padding:12px;background-color:#fff;color:#333;">${documento}</td></tr>
            <tr><td style="padding:12px;background-color:#f8f9fa;font-weight:bold;color:#666;">📍 Estado:</td><td style="padding:12px;background-color:#fff;color:#333;">${estado}</td></tr>
            <tr><td style="padding:12px;background-color:#f8f9fa;font-weight:bold;color:#666;">⏰ Capturado:</td><td style="padding:12px;background-color:#fff;color:#333;">${dataFormatada}</td></tr>
          </table>
          <h2 style="color:#333;margin:0 0 20px 0;font-size:18px;border-bottom:2px solid #667eea;padding-bottom:10px;">📝 Respostas do Quiz</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:25px;">${quizLinhas}</table>
          <h2 style="color:#333;margin:0 0 20px 0;font-size:18px;border-bottom:2px solid #667eea;padding-bottom:10px;">📣 Origem da Lead</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:25px;">
            <tr><td style="padding:12px;background-color:#f8f9fa;font-weight:bold;width:35%;color:#666;">Source:</td><td style="padding:12px;background-color:#fff;color:#333;">${utmSource || '-'}</td></tr>
            <tr><td style="padding:12px;background-color:#f8f9fa;font-weight:bold;color:#666;">Medium:</td><td style="padding:12px;background-color:#fff;color:#333;">${utmMedium || '-'}</td></tr>
            <tr><td style="padding:12px;background-color:#f8f9fa;font-weight:bold;color:#666;">Campaign:</td><td style="padding:12px;background-color:#fff;color:#333;">${utmCampaign || '-'}</td></tr>
            <tr><td style="padding:12px;background-color:#f8f9fa;font-weight:bold;color:#666;">Content:</td><td style="padding:12px;background-color:#fff;color:#333;">${utmContent || '-'}</td></tr>
            <tr><td style="padding:12px;background-color:#f8f9fa;font-weight:bold;color:#666;">Term:</td><td style="padding:12px;background-color:#fff;color:#333;">${utmTerm || '-'}</td></tr>
          </table>
          <div style="text-align:center;margin-top:30px;">
            <a href="${linkWhatsApp}" style="display:inline-block;background:linear-gradient(135deg,#25D366 0%,#128C7E 100%);color:white;padding:15px 40px;text-decoration:none;border-radius:50px;font-weight:bold;font-size:16px;box-shadow:0 4px 15px rgba(37,211,102,0.3);">💬 Contatar via WhatsApp</a>
          </div>
        </div>
        <div style="background-color:#f8f9fa;padding:20px;text-align:center;border-top:1px solid #e0e0e0;">
          <p style="margin:0;color:#666;font-size:12px;">Notificação automática - Sistema de Captura de Leads Rio Piranhas</p>
        </div>
      </div>
    </body></html>
  `;
}

// ============================================
// LOG DE ALTERAÇÃO DE STATUS
// ============================================

const LOG_SPREADSHEET_ID = '1wnYG02p1Xp-FXyVMEKg-t2UyStUZ2fYWdb3cFJe5oAg';

function onEditStatus(e) {
  var sheet = e.source.getActiveSheet();
  var nomePlanilha = sheet.getName();
  if (nomePlanilha !== 'PIAUI' && nomePlanilha !== 'MARANHAO') return;
  if (e.range.getColumn() !== 7) return;
  var statusAnterior = e.oldValue;
  if (statusAnterior !== 'CREATED') return;
  var linha = e.range.getRow();
  var nome = sheet.getRange(linha, 1).getValue();
  var dataInscricao = sheet.getRange(linha, 6).getValue();
  gravarLogAlteracao(nome, dataInscricao, new Date(), nomePlanilha);
}

function gravarLogAlteracao(nome, dataInscricao, dataAlteracao, nomePlanilha) {
  try {
    var ssLog = SpreadsheetApp.openById(LOG_SPREADSHEET_ID);
    var abaLog = ssLog.getSheetByName('Log');
    if (!abaLog) {
      abaLog = ssLog.insertSheet('Log');
      abaLog.appendRow(['lead_nome', 'data_inscricao', 'data_alteracao_status', 'planilha']);
      abaLog.getRange(1, 1, 1, 4).setFontWeight('bold');
    }
    abaLog.appendRow([nome, dataInscricao, dataAlteracao, nomePlanilha]);
    Logger.log('Log gravado: ' + nome + ' | ' + nomePlanilha);
  } catch (erro) {
    Logger.log('Erro ao gravar log: ' + erro.toString());
  }
}

// ============================================
// FUNÇÕES DE TESTE
// ============================================

function autorizarScript() {
  MailApp.getRemainingDailyQuota();
  SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Script autorizado com sucesso!');
}

function testarEmail() {
  var resultado = enviarEmailMultiplo('João Silva', '89999887766', '12345678901234', 'cnpj', 'PI', 'instagram', 'paid', 'oferta-varejo-pi', 'banner-topo', 'distribuidora', 'Email: teste@teste.com | Cidade: Teresina | Faturamento: Medicamentos | Desempenho: Poderia melhorar | Categorias: Capilar | Media Faturamento: Até R$80 mil');
  Logger.log('Sucessos: ' + resultado.sucesso + ' | Erros: ' + resultado.erros);
  SpreadsheetApp.getUi().alert('Teste de Email', 'Sucessos: ' + resultado.sucesso + '\nErros: ' + resultado.erros, SpreadsheetApp.getUi().ButtonSet.OK);
}

function debugDuplicata() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var planilha = spreadsheet.getSheetByName('PIAUI');
  var ultimaLinha = planilha.getLastRow();
  Logger.log('Última linha: ' + ultimaLinha);
  if (ultimaLinha < 2) { Logger.log('Planilha vazia'); return; }
  var documentos = planilha.getRange(2, 3, ultimaLinha - 1, 1).getValues();
  for (var i = 0; i < documentos.length; i++) {
    Logger.log('Linha ' + (i + 2) + ': [' + documentos[i][0] + '] tipo: ' + typeof documentos[i][0]);
  }
}
