export type Base = {
  id: string;
  name: string;
  price: number;
  thickness: number; // 3D crust height
  color: string;
};

export type Sauce = {
  id: string;
  name: string;
  price: number;
  color: string;
};

export type CheeseLevel = {
  id: string;
  name: string;
  price: number;
  opacity: number;
  blobCount: number;
};

export type Topping = {
  id: string;
  name: string;
  price: number;
  color: string;
  accentColor?: string;
  shape: "disc" | "ring" | "chunk" | "sphere" | "strip" | "leaf";
  count: number;
  size: number;
  veg: boolean;
  tags: string[]; // used for name generation + chaos scoring
};

export const BASES: Base[] = [
  { id: "thin", name: "Thin Crust", price: 180, thickness: 0.12, color: "#D9A867" },
  { id: "classic", name: "Classic Hand-Tossed", price: 200, thickness: 0.2, color: "#E8C08A" },
  { id: "thick", name: "Thick Pan", price: 230, thickness: 0.3, color: "#EFCF9E" },
  { id: "wheat", name: "Whole Wheat", price: 220, thickness: 0.18, color: "#B58B5A" },
];

export const SAUCES: Sauce[] = [
  { id: "classic", name: "Classic Tomato", price: 0, color: "#C0341F" },
  { id: "spicy", name: "Peri-Peri", price: 25, color: "#9E2B15" },
  { id: "pesto", name: "Basil Pesto", price: 40, color: "#5A8C3E" },
  { id: "bbq", name: "Smoky BBQ", price: 35, color: "#7A3B1E" },
  { id: "white", name: "Garlic White", price: 35, color: "#EFE4CE" },
];

export const CHEESE_LEVELS: CheeseLevel[] = [
  { id: "light", name: "Light", price: 0, opacity: 0.55, blobCount: 18 },
  { id: "regular", name: "Regular", price: 30, opacity: 0.78, blobCount: 30 },
  { id: "extra", name: "Extra Cheese", price: 70, opacity: 0.95, blobCount: 46 },
];

export const TOPPINGS: Topping[] = [
  {
    id: "pepperoni", name: "Pepperoni", price: 70, color: "#A8321F",
    shape: "disc", count: 11, size: 0.17, veg: false, tags: ["meat", "classic", "spicy"],
  },
  {
    id: "chicken", name: "Grilled Chicken", price: 80, color: "#C98B54",
    shape: "chunk", count: 13, size: 0.13, veg: false, tags: ["meat", "protein"],
  },
  {
    id: "capsicum", name: "Capsicum", price: 40, color: "#3E8E41",
    shape: "ring", count: 10, size: 0.16, veg: true, tags: ["veg", "garden", "classic"],
  },
  {
    id: "onion", name: "Red Onion", price: 30, color: "#9B5E9E",
    shape: "strip", count: 14, size: 0.14, veg: true, tags: ["veg", "garden", "sharp"],
  },
  {
    id: "mushroom", name: "Mushroom", price: 50, color: "#C4B49A",
    shape: "sphere", count: 9, size: 0.12, veg: true, tags: ["veg", "earthy", "classic"],
  },
  {
    id: "olive", name: "Black Olives", price: 55, color: "#2E2A30",
    shape: "ring", count: 12, size: 0.1, veg: true, tags: ["veg", "briny", "mediterranean"],
  },
  {
    id: "corn", name: "Sweet Corn", price: 35, color: "#E8C044",
    shape: "chunk", count: 20, size: 0.07, veg: true, tags: ["veg", "sweet"],
  },
  {
    id: "paneer", name: "Paneer", price: 75, color: "#F4EBD8",
    shape: "chunk", count: 11, size: 0.13, veg: true, tags: ["veg", "protein", "desi"],
  },
  {
    id: "jalapeno", name: "Jalapeño", price: 45, color: "#4E9B37",
    shape: "ring", count: 9, size: 0.1, veg: true, tags: ["veg", "spicy", "sharp"],
  },
  {
    id: "tomato", name: "Cherry Tomato", price: 40, color: "#CE3B2B",
    shape: "sphere", count: 9, size: 0.11, veg: true, tags: ["veg", "garden", "fresh"],
  },
  {
    id: "pineapple", name: "Pineapple", price: 45, color: "#F0C63C",
    shape: "chunk", count: 10, size: 0.12, veg: true, tags: ["veg", "sweet", "controversial"],
  },
  {
    id: "basil", name: "Fresh Basil", price: 30, color: "#3F7A34",
    shape: "leaf", count: 12, size: 0.13, veg: true, tags: ["veg", "garden", "fresh", "mediterranean"],
  },
];

export const MAX_TOPPINGS = 6;

export type PizzaState = {
  baseId: string;
  sauceId: string;
  cheeseId: string;
  toppingIds: string[];
};

export const DEFAULT_PIZZA: PizzaState = {
  baseId: "classic",
  sauceId: "classic",
  cheeseId: "regular",
  toppingIds: [],
};

export function getBase(id: string) {
  return BASES.find((b) => b.id === id) ?? BASES[1];
}
export function getSauce(id: string) {
  return SAUCES.find((s) => s.id === id) ?? SAUCES[0];
}
export function getCheese(id: string) {
  return CHEESE_LEVELS.find((c) => c.id === id) ?? CHEESE_LEVELS[1];
}
export function getToppings(ids: string[]) {
  return ids
    .map((id) => TOPPINGS.find((t) => t.id === id))
    .filter((t): t is Topping => Boolean(t));
}

export function calculatePrice(state: PizzaState): number {
  const base = getBase(state.baseId).price;
  const sauce = getSauce(state.sauceId).price;
  const cheese = getCheese(state.cheeseId).price;
  const toppings = getToppings(state.toppingIds).reduce((sum, t) => sum + t.price, 0);
  return base + sauce + cheese + toppings;
}

export function isVeg(state: PizzaState): boolean {
  return getToppings(state.toppingIds).every((t) => t.veg);
}

/* ----------------------------------------------------------------
   Name generation — builds a name from what's actually on the pizza
   rather than picking from a fixed list, so unusual combos get
   unusual names.
   ---------------------------------------------------------------- */

function countTag(toppings: ReturnType<typeof getToppings>, tag: string) {
  return toppings.filter((t) => t.tags.includes(tag)).length;
}

export function generatePizzaName(state: PizzaState): string {
  const toppings = getToppings(state.toppingIds);
  const sauce = getSauce(state.sauceId);
  const cheese = getCheese(state.cheeseId);

  if (toppings.length === 0) {
    return cheese.id === "extra" ? "The Purist, Doubled" : "The Purist";
  }

  const spicy = countTag(toppings, "spicy") + (sauce.id === "spicy" ? 1 : 0);
  const garden = countTag(toppings, "garden");
  const meat = toppings.filter((t) => !t.veg).length;
  const sweet = countTag(toppings, "sweet");
  const controversial = countTag(toppings, "controversial");
  const desi = countTag(toppings, "desi");
  const mediterranean = countTag(toppings, "mediterranean");

  const adjectives: string[] = [];
  if (spicy >= 2) adjectives.push("Blazing");
  else if (spicy === 1) adjectives.push("Warm");
  if (sauce.id === "bbq") adjectives.push("Smoky");
  if (cheese.id === "extra") adjectives.push("Molten");
  if (sweet >= 2) adjectives.push("Sweet");
  if (desi >= 1) adjectives.push("Desi");

  let noun = "Special";
  if (controversial >= 1 && meat >= 1) noun = "Argument";
  else if (controversial >= 1) noun = "Debate";
  else if (meat >= 2) noun = "Carnivore";
  else if (meat === 1) noun = "Hunter";
  else if (mediterranean >= 2) noun = "Mediterranean";
  else if (garden >= 3) noun = "Garden";
  else if (garden >= 1) noun = "Harvest";
  else if (toppings.length >= 5) noun = "Everything";

  if (toppings.length >= 6) adjectives.unshift("Overloaded");

  const adj = adjectives.slice(0, 2).join(" ");
  return adj ? `The ${adj} ${noun}` : `The ${noun}`;
}

/* ----------------------------------------------------------------
   Chef's reaction — a light-hearted "how conventional is this?"
   score. Purely for fun; no combination is actually blocked.
   ---------------------------------------------------------------- */

export type ChefVerdict = {
  score: number; // 0 = textbook classic, 100 = chaos
  emoji: string;
  label: string;
  comment: string;
};

export function getChefVerdict(state: PizzaState): ChefVerdict {
  const toppings = getToppings(state.toppingIds);
  let chaos = 0;

  const hasPineapple = toppings.some((t) => t.id === "pineapple");
  const meat = toppings.filter((t) => !t.veg).length;
  const sweet = countTag(toppings, "sweet");
  const spicy = countTag(toppings, "spicy");
  const briny = countTag(toppings, "briny");

  if (hasPineapple) chaos += 30;
  if (hasPineapple && briny) chaos += 20;
  if (hasPineapple && spicy) chaos += 10;
  if (sweet >= 2) chaos += 15;
  if (toppings.length >= 6) chaos += 20;
  if (toppings.length >= 5) chaos += 10;
  if (meat >= 2 && sweet >= 1) chaos += 12;
  if (state.sauceId === "white" && toppings.some((t) => t.id === "pineapple")) chaos += 10;
  if (state.sauceId === "pesto" && meat >= 2) chaos += 8;
  if (state.cheeseId === "extra" && toppings.length >= 5) chaos += 8;

  chaos = Math.min(100, chaos);

  if (toppings.length === 0) {
    return {
      score: 0,
      emoji: "🧐",
      label: "Minimalist",
      comment: "A blank canvas. Bold in its own way — or you just haven't started yet.",
    };
  }
  if (chaos < 20) {
    return {
      score: chaos,
      emoji: "👌",
      label: "Textbook",
      comment: "Classic, balanced, hard to argue with. This is what a pizza looks like.",
    };
  }
  if (chaos < 45) {
    return {
      score: chaos,
      emoji: "🙂",
      label: "Interesting",
      comment: "A few unexpected choices, but it holds together. I'd try a slice.",
    };
  }
  if (chaos < 70) {
    return {
      score: chaos,
      emoji: "😬",
      label: "Adventurous",
      comment: "This is a lot going on. I respect the confidence more than the combination.",
    };
  }
  return {
    score: chaos,
    emoji: "🫠",
    label: "Chaotic",
    comment: "I have questions. Several of them. You'll eat this and enjoy it out of spite.",
  };
}

export function randomPizza(): PizzaState {
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  const count = 2 + Math.floor(Math.random() * 4);
  const shuffled = [...TOPPINGS].sort(() => Math.random() - 0.5);
  return {
    baseId: pick(BASES).id,
    sauceId: pick(SAUCES).id,
    cheeseId: pick(CHEESE_LEVELS).id,
    toppingIds: shuffled.slice(0, count).map((t) => t.id),
  };
}
