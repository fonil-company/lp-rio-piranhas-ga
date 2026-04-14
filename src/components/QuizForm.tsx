import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InputMask from "react-input-mask";

interface QuizFormProps {
  origem: string;
}

const STEPS = [
  {
    question: "Hoje, o que mais gera faturamento na sua farmácia?",
    type: "single" as const,
    options: ["Medicamentos", "Higiene e Beleza", "Fraldas e Infantil", "Perfumaria", "Outros"],
  },
  {
    question: "Como está o desempenho da sua linha de higiene e beleza?",
    type: "single" as const,
    options: ["Excelente", "Bom, mas pode melhorar", "Fraco", "Não trabalho essa linha"],
  },
  {
    question: "Quais categorias você trabalha?",
    type: "multi" as const,
    options: ["Fraldas", "Lenços umedecidos", "Absorventes", "Shampoo/Condicionador", "Sabonetes", "Creme dental"],
  },
  {
    question: "Qual o faturamento médio mensal da sua empresa?",
    type: "single" as const,
    options: ["Até R$ 30 mil", "R$ 30 mil – R$ 100 mil", "R$ 100 mil – R$ 500 mil", "Acima de R$ 500 mil"],
  },
  {
    question: "Onde fica sua empresa?",
    type: "location" as const,
    options: [],
  },
  {
    question: "Preencha seus dados para receber as condições",
    type: "contact" as const,
    options: [],
  },
];

const QuizForm = ({ origem }: QuizFormProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [contact, setContact] = useState({ nome: "", whatsapp: "", email: "", cnpj: "" });
  const [location, setLocation] = useState({ estado: "", cidade: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const goNext = useCallback(() => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
  }, [step, totalSteps]);

  const handleSingle = (option: string) => {
    setAnswers((a) => ({ ...a, [step]: option }));
    setTimeout(goNext, 300);
  };

  const handleMultiToggle = (option: string) => {
    setMultiSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleMultiNext = () => {
    if (multiSelected.length === 0) return;
    setAnswers((a) => ({ ...a, [step]: multiSelected }));
    goNext();
  };

  const handleLocationNext = () => {
    if (!location.estado || !location.cidade) {
      setErrors({ estado: !location.estado ? "Selecione o estado" : "", cidade: !location.cidade ? "Informe a cidade" : "" });
      return;
    }
    setErrors({});
    setAnswers((a) => ({ ...a, [step]: `${location.estado} - ${location.cidade}` }));
    goNext();
  };

  const validateContact = () => {
    const e: Record<string, string> = {};
    if (!contact.nome.trim()) e.nome = "Informe seu nome";
    if (contact.whatsapp.replace(/\D/g, "").length < 11) e.whatsapp = "WhatsApp inválido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) e.email = "E-mail inválido";
    if (contact.cnpj.replace(/\D/g, "").length < 14) e.cnpj = "CNPJ inválido";
    return e;
  };

  const handleSubmit = () => {
    const e = validateContact();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    const payload = {
      ...answers,
      location,
      contact,
      origem_formulario: origem,
    };
    console.log("Lead capturado:", payload);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-card rounded-lg p-8 shadow-lg border border-border text-center">
        <div className="w-16 h-16 bg-cta/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Recebemos seus dados!</h3>
        <p className="text-muted-foreground">Nossa equipe entrará em contato pelo WhatsApp em breve.</p>
      </div>
    );
  }

  const currentStep = STEPS[step];

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border overflow-hidden">
      {/* Progress */}
      <div className="h-2 bg-muted">
        <motion.div
          className="h-full bg-accent rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-6 md:p-8">
        <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
          Etapa {step + 1} de {totalSteps}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="text-lg font-bold text-foreground mb-5">{currentStep.question}</h3>

            {currentStep.type === "single" && (
              <div className="space-y-3">
                {currentStep.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSingle(opt)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all font-medium text-sm
                      ${answers[step] === opt
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/40 text-foreground"
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {currentStep.type === "multi" && (
              <>
                <div className="space-y-3 mb-5">
                  {currentStep.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleMultiToggle(opt)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all font-medium text-sm
                        ${multiSelected.includes(opt)
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/40 text-foreground"
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs
                          ${multiSelected.includes(opt) ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"}`}>
                          {multiSelected.includes(opt) && "✓"}
                        </span>
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleMultiNext}
                  disabled={multiSelected.length === 0}
                  className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 transition-opacity"
                >
                  Continuar
                </button>
              </>
            )}

            {currentStep.type === "location" && (
              <div className="space-y-4">
                <div>
                  <select
                    value={location.estado}
                    onChange={(e) => setLocation((l) => ({ ...l, estado: e.target.value }))}
                    className="w-full p-3.5 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="">Selecione o estado</option>
                    <option value="MA">Maranhão</option>
                    <option value="PI">Piauí</option>
                  </select>
                  {errors.estado && <p className="text-destructive text-xs mt-1">{errors.estado}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Sua cidade"
                    value={location.cidade}
                    onChange={(e) => setLocation((l) => ({ ...l, cidade: e.target.value }))}
                    className="w-full p-3.5 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                  {errors.cidade && <p className="text-destructive text-xs mt-1">{errors.cidade}</p>}
                </div>
                <button
                  onClick={handleLocationNext}
                  className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm"
                >
                  Continuar
                </button>
              </div>
            )}

            {currentStep.type === "contact" && (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={contact.nome}
                    onChange={(e) => setContact((c) => ({ ...c, nome: e.target.value }))}
                    className="w-full p-3.5 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                  {errors.nome && <p className="text-destructive text-xs mt-1">{errors.nome}</p>}
                </div>
                <div>
                  <InputMask
                    mask="(99) 99999-9999"
                    value={contact.whatsapp}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContact((c) => ({ ...c, whatsapp: e.target.value }))}
                  >
                    {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
                      <input
                        {...inputProps}
                        type="tel"
                        placeholder="(99) 99999-9999"
                        className="w-full p-3.5 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none"
                      />
                    )}
                  </InputMask>
                  {errors.whatsapp && <p className="text-destructive text-xs mt-1">{errors.whatsapp}</p>}
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={contact.email}
                    onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                    className="w-full p-3.5 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none"
                  />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <InputMask
                    mask="99.999.999/9999-99"
                    value={contact.cnpj}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContact((c) => ({ ...c, cnpj: e.target.value }))}
                  >
                    {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
                      <input
                        {...inputProps}
                        type="text"
                        placeholder="00.000.000/0000-00"
                        className="w-full p-3.5 rounded-lg border-2 border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none"
                      />
                    )}
                  </InputMask>
                  {errors.cnpj && <p className="text-destructive text-xs mt-1">{errors.cnpj}</p>}
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-lg bg-cta text-cta-foreground font-bold text-base hover:brightness-110 transition-all"
                >
                  Quero receber minhas condições no WhatsApp
                </button>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span>✓ Atendimento rápido</span>
                  <span>✓ Sem compromisso</span>
                  <span>✓ Exclusivo para empresas</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizForm;
