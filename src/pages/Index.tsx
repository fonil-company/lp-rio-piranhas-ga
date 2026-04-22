import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Truck, Handshake, MessageCircle } from "lucide-react";
import QuizForm from "@/components/QuizForm";
import heroImg from "@/assets/hero-warehouse.jpg";
import image1 from "@/assets/1.png";
import image2 from "@/assets/2.png";
import image3 from "@/assets/3.png";
import image4 from "@/assets/4.png";
import solutionImageSrc from "@/assets/funcionaria.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Section = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => (
  <section id={id} className={`py-16 md:py-24 ${className}`}>
    <div className="container">{children}</div>
  </section>
);

const SectionTitle = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
  <div className="text-center mb-12 max-w-2xl mx-auto">
    <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground text-balance leading-tight">{children}</h2>
    {sub && <p className="mt-4 text-muted-foreground text-base md:text-lg">{sub}</p>}
  </div>
);

/* ── DOBRA 1 — HERO ────────────────────────────────── */
const Hero = () => (
  <section className="relative overflow-hidden bg-primary">
    <div
      className="absolute inset-0 scale-105 bg-cover bg-center blur-md"
      style={{ backgroundImage: `url(${heroImg})` }}
      aria-hidden="true"
    />
    <div className="absolute inset-0 bg-black/55" aria-hidden="true" />
    <div className="absolute inset-0 bg-primary/25" aria-hidden="true" />

    <div className="container relative z-10 py-12 md:py-20">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Copy */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-primary-foreground">
          <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide shadow-sm">
            Distribuição direta • MA & PI
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-extrabold leading-tight text-balance">
            Você pode estar pagando mais caro nas fraldas… e perdendo margem sem perceber
          </h1>
          <p className="mt-5 text-primary-foreground/85 text-base md:text-lg leading-relaxed max-w-lg">
            Compre direto da distribuidora e aumente sua margem com as marcas mais vendidas, com pedido mínimo acessível e frete grátis no Maranhão e Piauí.
          </p>
          <ul className="mt-6 space-y-3 text-sm md:text-base">
            {[
              "Distribuição em todo Maranhão e Piauí",
              "Atendimento exclusivo para empresas com CNPJ",
              "Entrega rápida e negociação direta",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2 text-primary-foreground/95">
                <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Quiz */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <QuizForm origem="topo" />
        </motion.div>
      </div>
    </div>
  </section>
);

/* ── DOBRA 2 — CARROSSEL DE IMAGENS ───────────────── */
const socialProofImages = [
  image1,
  image2,
  image3,
  image4,
];

const SocialProof = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goPrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? socialProofImages.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentSlide((prev) => (prev === socialProofImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <Section className="bg-section-alt">
      <SectionTitle>
        Empresas do Maranhão e Piauí já compram direto da distribuidora
      </SectionTitle>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="max-w-4xl mx-auto"
      >
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="relative aspect-[16/9] w-full bg-muted">
            <AnimatePresence mode="wait">
              <motion.img
                key={socialProofImages[currentSlide]}
                src={socialProofImages[currentSlide]}
                alt={`Imagem ${currentSlide + 1} do carrossel`}
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />

            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/70"
              aria-label="Imagem anterior"
            >
              ←
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/70"
              aria-label="Próxima imagem"
            >
              →
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 px-4 py-4">
            {socialProofImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  currentSlide === index ? "w-8 bg-primary" : "w-2.5 bg-primary/30"
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </Section>
  );
};

/* ── DOBRA 3 — QUEBRA DE CRENÇA ───────────────────── */
const BeliefBreak = () => (
  <Section>
    <div className="max-w-3xl mx-auto text-center">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground mb-6">
          O problema não é a fralda… é de quem você está comprando
        </h2>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          Quando você compra de intermediários, está pagando pela margem deles — e não pela qualidade do produto.
          Cada camada entre a fábrica e sua loja encarece o preço final, reduz sua margem e dificulta a competitividade.
          A solução é eliminar esses intermediários e comprar direto de quem distribui.
        </p>
      </motion.div>
    </div>
  </Section>
);

/* ── DOBRA 4 — SOLUÇÃO ────────────────────────────── */
const solutionImage = solutionImageSrc;

const solutionBullets = [
  {
    icon: DollarSign,
    title: "Pedido mínimo de R$ 250",
    desc: "Acessível para qualquer porte de empresa.",
  },
  {
    icon: Truck,
    title: "Frete grátis MA/PI",
    desc: "Sem custo de entrega em todo Maranhão e Piauí.",
  },
  {
    icon: Handshake,
    title: "Compra direta",
    desc: "Sem intermediários, preço real de distribuidor.",
  },
  {
    icon: MessageCircle,
    title: "Atendimento via WhatsApp",
    desc: "Rápido, pessoal e sem burocracia.",
  },
];

const Solution = () => (
  <Section className="py-16 bg-[#d2effa]">
    <div className="grid gap-8 lg:grid-cols-[1.02fr_1fr] lg:gap-12 items-center max-w-6xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="order-2 lg:order-1"
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <img
            src={solutionImage}
            alt="Foto da seção de solução"
            className="h-full min-h-[320px] w-full object-cover"
          />
        </div>
      </motion.div>

      <div className="order-1 lg:order-2">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            Compra direta
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground leading-tight">
            Agora você pode comprar direto da distribuidora
          </h2>
          <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            Tenha acesso a condições mais competitivas, menos intermediação e uma negociação mais simples para abastecer sua empresa com mais margem.
          </p>
        </motion.div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {solutionBullets.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </div>
                <h3 className="font-bold text-foreground text-sm md:text-base">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </Section>
);

/* ── DOBRA 5 — CONDIÇÕES ──────────────────────────── */
const conditions = [
  { icon: "", title: "Pedido mínimo acessível", desc: "A partir de R$ 250 você já pode fazer seu primeiro pedido." },
  { icon: "", title: "Frete grátis", desc: "Entrega sem custo para todo Maranhão e Piauí." },
  { icon: "", title: "Atendimento rápido", desc: "Resposta em minutos pelo WhatsApp. Nada de esperar dias." },
  { icon: "", title: "Exclusivo para empresas", desc: "Condições especiais para quem compra com CNPJ." },
];

const Conditions = () => (
  <Section>
    <SectionTitle>Condições exclusivas para sua empresa</SectionTitle>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {conditions.map((c, i) => (
        <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
          className="bg-card p-6 rounded-lg border border-border text-center shadow-sm hover:shadow-md transition-shadow">
          <span className="text-4xl block mb-3">{c.icon}</span>
          <h3 className="font-bold text-foreground text-sm mb-1">{c.title}</h3>
          <p className="text-muted-foreground text-xs">{c.desc}</p>
        </motion.div>
      ))}
    </div>
  </Section>
);

/* ── DOBRA 6 — VSL ────────────────────────────────── */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "vturb-smartplayer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { id?: string }, HTMLElement>;
    }
  }
}

const VSL = () => {
  useEffect(() => {
    const scriptId = "converteai-player-script";
    if (document.getElementById(scriptId)) return;

    const s = document.createElement("script");
    s.id = scriptId;
    s.src = "https://scripts.converteai.net/0b256e8c-1ea0-49a1-a6c2-4aa9d6840568/players/69de754aedea69ec7aa08174/v4/player.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  return (
    <Section className="bg-section-alt">
      <div className="grid lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="aspect-video bg-foreground/5 rounded-lg border border-border overflow-hidden">
            <vturb-smartplayer
              id="vid-69de754aedea69ec7aa08174"
              style={{ display: "block", margin: "0 auto", width: "100%" }}
            />
          </div>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4">
            Entenda como funciona a compra direta
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed mb-6">
            Neste vídeo rápido, mostramos como você pode fazer seu primeiro pedido,
            quais marcas estão disponíveis e como o frete grátis funciona na prática.
          </p>
          <a href="#formulario-final" className="inline-flex items-center gap-2 bg-cta text-cta-foreground px-6 py-3 rounded-lg font-bold text-sm hover:brightness-110 transition-all">
            Preencha o formulário abaixo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </a>
        </motion.div>
      </div>
    </Section>
  );
};

/* ── DOBRA 7 — FORMULÁRIO REPETIDO ────────────────── */
const FormRepeat = () => (
  <Section id="formulario-final">
    <div className="max-w-xl mx-auto">
      <SectionTitle sub="Preencha em menos de 1 minuto e receba as condições pelo WhatsApp.">
        Solicite suas condições agora
      </SectionTitle>
      <QuizForm origem="dobra_7" />
    </div>
  </Section>
);

/* ── DOBRA 8 — FILTRO FINAL ───────────────────────── */
const checkItems = [
  "Revende produtos de higiene e beleza",
  "Quer aumentar a margem de lucro",
  "Compra com CNPJ",
  "Atua no Maranhão ou Piauí",
];

const FinalFilter = () => (
  <Section className="bg-primary">
    <div className="max-w-2xl mx-auto text-center text-primary-foreground">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8">Essa oportunidade é pra você?</h2>
        <div className="space-y-4 text-left inline-block">
          {checkItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-bold">✓</span>
              <span className="text-base">{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <a href="#formulario-final" className="inline-flex items-center gap-2 bg-cta text-cta-foreground px-8 py-4 rounded-lg font-bold text-base hover:brightness-110 transition-all">
            Quero minhas condições agora
          </a>
        </div>
      </motion.div>
    </div>
  </Section>
);

/* ── FOOTER ───────────────────────────────────────── */
const Footer = () => (
  <footer className="bg-foreground text-primary-foreground/60 py-8">
    <div className="container text-center text-xs">
      <p>© {new Date().getFullYear()} — Distribuição direta de fraldas e higiene para empresas do MA e PI.</p>
      <p className="mt-1">Todos os direitos reservados.</p>
    </div>
  </footer>
);

/* ── PAGE ──────────────────────────────────────────── */
const Index = () => (
  <>
    <Hero />
    <SocialProof />
    <BeliefBreak />
    <Solution />
    <Conditions />
    <VSL />
    <FormRepeat />
    <FinalFilter />
    <Footer />
  </>
);

export default Index;
