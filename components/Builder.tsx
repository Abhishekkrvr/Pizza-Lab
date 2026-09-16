"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import {
  BASES,
  SAUCES,
  CHEESE_LEVELS,
  TOPPINGS,
  MAX_TOPPINGS,
  DEFAULT_PIZZA,
  PizzaState,
  calculatePrice,
  generatePizzaName,
  getChefVerdict,
  getToppings,
  isVeg,
  randomPizza,
} from "@/lib/pizza";
import { generateShareCard } from "@/lib/shareCard";

const PizzaScene = dynamic(() => import("./PizzaScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-sm opacity-40">
      Warming the oven…
    </div>
  ),
});

type Stage = "build" | "baking" | "done";

export default function Builder() {
  const [pizza, setPizza] = useState<PizzaState>(DEFAULT_PIZZA);
  const [stage, setStage] = useState<Stage>("build");
  const [bakeProgress, setBakeProgress] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const price = calculatePrice(pizza);
  const name = generatePizzaName(pizza);
  const verdict = getChefVerdict(pizza);
  const toppings = getToppings(pizza.toppingIds);
  const veg = isVeg(pizza);

  const toggleTopping = (id: string) => {
    setPizza((p) => {
      if (p.toppingIds.includes(id)) {
        return { ...p, toppingIds: p.toppingIds.filter((t) => t !== id) };
      }
      if (p.toppingIds.length >= MAX_TOPPINGS) return p;
      return { ...p, toppingIds: [...p.toppingIds, id] };
    });
  };

  const bake = () => {
    setStage("baking");
    setBakeProgress(0);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: 100,
      duration: 3.2,
      ease: "power1.inOut",
      onUpdate: () => setBakeProgress(Math.round(obj.v)),
      onComplete: () => setStage("done"),
    });
  };

  useEffect(() => {
    if (stage === "done" && resultRef.current) {
      gsap.fromTo(
        resultRef.current.children,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [stage]);

  const handleShare = () => {
    const dataUrl = generateShareCard({ name, price, pizza, verdict, veg });
    const link = document.createElement("a");
    link.download = `${name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = dataUrl;
    link.click();
  };

  const reset = () => {
    setPizza(DEFAULT_PIZZA);
    setStage("build");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ---------- 3D stage ---------- */}
      <div className="relative lg:w-[55%] h-[42vh] lg:h-screen shrink-0 bg-gradient-to-b from-[#F6EADA] to-[#EFDFC9]">
        <PizzaScene state={pizza} baked={stage !== "build"} autoRotate={stage !== "build"} />

        {/* header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 sm:px-7 py-5">
          <span className="font-display font-bold text-lg tracking-tight text-charcoal">
            Pizza Lab
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${
              veg
                ? "text-basil border-basil/40 bg-basil/10"
                : "text-terracotta border-terracotta/40 bg-terracotta/10"
            }`}
          >
            {veg ? "Veg" : "Non-Veg"}
          </span>
        </div>

        {/* baking overlay */}
        {stage === "baking" && (
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
            <p className="font-display font-bold text-2xl text-cream mb-1">Baking…</p>
            <p className="text-cream/60 text-sm mb-5">240°C · stone oven</p>
            <div className="w-[200px] h-[4px] rounded-full bg-cream/20 overflow-hidden">
              <div
                className="h-full bg-terracotta rounded-full transition-none"
                style={{ width: `${bakeProgress}%` }}
              />
            </div>
            <p className="text-cream/50 text-xs mt-2 tabular-nums">{bakeProgress}%</p>
          </div>
        )}

        {stage === "build" && (
          <p className="absolute bottom-4 left-0 right-0 text-center text-[11px] uppercase tracking-[2px] text-charcoal/35">
            Drag to rotate · scroll to zoom
          </p>
        )}
      </div>

      {/* ---------- controls / result ---------- */}
      <div className="lg:w-[45%] bg-cream px-5 sm:px-8 py-8 lg:py-10 lg:h-screen lg:overflow-y-auto">
        {stage === "done" ? (
          <div ref={resultRef} className="max-w-[420px] mx-auto lg:mx-0 flex flex-col gap-5">
            <div>
              <p className="text-[11px] uppercase tracking-[3px] text-terracotta font-semibold mb-2">
                Out of the oven
              </p>
              <h1 className="font-display font-bold text-[clamp(30px,5vw,44px)] leading-tight text-charcoal">
                {name}
              </h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display font-bold text-3xl text-charcoal">₹{price}</span>
              <span className="text-sm opacity-50">
                {toppings.length} topping{toppings.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="rounded-2xl border border-charcoal/10 bg-white/60 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{verdict.emoji}</span>
                <span className="font-semibold text-sm">Chef says: {verdict.label}</span>
              </div>
              <p className="text-sm opacity-65 leading-relaxed">{verdict.comment}</p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[2px] opacity-40 mb-2">On this pizza</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  BASES.find((b) => b.id === pizza.baseId)?.name,
                  SAUCES.find((s) => s.id === pizza.sauceId)?.name,
                  `${CHEESE_LEVELS.find((c) => c.id === pizza.cheeseId)?.name} cheese`,
                  ...toppings.map((t) => t.name),
                ].map((label, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-charcoal/[0.06] text-charcoal/75"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={handleShare}
                className="flex-1 rounded-full bg-charcoal text-cream font-semibold py-3.5 text-sm hover:opacity-90 transition-opacity"
              >
                Download card
              </button>
              <button
                onClick={() => setStage("build")}
                className="flex-1 rounded-full border border-charcoal/20 font-semibold py-3.5 text-sm hover:bg-charcoal/5 transition-colors"
              >
                Keep editing
              </button>
            </div>
            <button
              onClick={reset}
              className="text-xs uppercase tracking-[2px] opacity-40 hover:opacity-70 transition-opacity self-start"
            >
              Start fresh
            </button>
          </div>
        ) : (
          <div className="max-w-[440px] mx-auto lg:mx-0">
            <div className="mb-7">
              <h1 className="font-display font-bold text-[clamp(26px,4vw,36px)] leading-tight text-charcoal mb-1">
                {name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-xl text-terracotta">₹{price}</span>
                <span className="text-lg" title={verdict.label}>
                  {verdict.emoji}
                </span>
                <span className="text-xs opacity-45">{verdict.label}</span>
              </div>
            </div>

            <Section title="Base">
              <OptionRow
                options={BASES.map((b) => ({ id: b.id, label: b.name, price: b.price }))}
                selected={pizza.baseId}
                onSelect={(id) => setPizza((p) => ({ ...p, baseId: id }))}
                showPrice
              />
            </Section>

            <Section title="Sauce">
              <OptionRow
                options={SAUCES.map((s) => ({ id: s.id, label: s.name, price: s.price, color: s.color }))}
                selected={pizza.sauceId}
                onSelect={(id) => setPizza((p) => ({ ...p, sauceId: id }))}
              />
            </Section>

            <Section title="Cheese">
              <OptionRow
                options={CHEESE_LEVELS.map((c) => ({ id: c.id, label: c.name, price: c.price }))}
                selected={pizza.cheeseId}
                onSelect={(id) => setPizza((p) => ({ ...p, cheeseId: id }))}
              />
            </Section>

            <Section
              title="Toppings"
              hint={`${pizza.toppingIds.length}/${MAX_TOPPINGS}`}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TOPPINGS.map((t) => {
                  const active = pizza.toppingIds.includes(t.id);
                  const full = !active && pizza.toppingIds.length >= MAX_TOPPINGS;
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTopping(t.id)}
                      disabled={full}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                        active
                          ? "border-terracotta bg-terracotta/10"
                          : full
                          ? "border-charcoal/10 opacity-35 cursor-not-allowed"
                          : "border-charcoal/12 hover:border-charcoal/30"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                        style={{ background: t.color }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium truncate">{t.name}</span>
                        <span className="block text-[10px] opacity-45">₹{t.price}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 sticky bottom-0 bg-cream pt-3 pb-1">
              <button
                onClick={bake}
                className="flex-1 rounded-full bg-terracotta text-white font-semibold py-4 text-sm hover:opacity-90 transition-opacity"
              >
                Bake it · ₹{price}
              </button>
              <button
                onClick={() => setPizza(randomPizza())}
                className="rounded-full border border-charcoal/20 font-semibold px-5 py-4 text-sm hover:bg-charcoal/5 transition-colors whitespace-nowrap"
              >
                🎲 Surprise me
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between mb-2.5">
        <h2 className="text-[11px] uppercase tracking-[2px] font-semibold opacity-50">{title}</h2>
        {hint && <span className="text-[11px] opacity-40 tabular-nums">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function OptionRow({
  options,
  selected,
  onSelect,
  showPrice,
}: {
  options: { id: string; label: string; price: number; color?: string }[];
  selected: string;
  onSelect: (id: string) => void;
  showPrice?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.id === selected;
        return (
          <button
            key={o.id}
            onClick={() => onSelect(o.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[13px] font-medium transition-colors ${
              active ? "border-terracotta bg-terracotta/10" : "border-charcoal/12 hover:border-charcoal/30"
            }`}
          >
            {o.color && (
              <span
                className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                style={{ background: o.color }}
              />
            )}
            {o.label}
            {(showPrice || o.price > 0) && (
              <span className="text-[10px] opacity-45">
                {showPrice ? `₹${o.price}` : `+₹${o.price}`}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
