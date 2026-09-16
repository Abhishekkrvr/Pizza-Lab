import {
  PizzaState,
  ChefVerdict,
  BASES,
  SAUCES,
  CHEESE_LEVELS,
  getToppings,
} from "./pizza";

export function generateShareCard({
  name,
  price,
  pizza,
  verdict,
  veg,
}: {
  name: string;
  price: number;
  pizza: PizzaState;
  verdict: ChefVerdict;
  veg: boolean;
}): string {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // background
  ctx.fillStyle = "#FBF6EE";
  ctx.fillRect(0, 0, W, H);

  const margin = 90;

  // top label
  ctx.fillStyle = "#C4562F";
  ctx.font = "600 24px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.letterSpacing = "4px";
  ctx.fillText("PIZZA LAB", margin, 120);
  ctx.letterSpacing = "0px";

  // veg/non-veg badge
  const badgeText = veg ? "VEG" : "NON-VEG";
  ctx.font = "700 20px Arial, sans-serif";
  const badgeW = ctx.measureText(badgeText).width + 36;
  ctx.strokeStyle = veg ? "#4A7C4E" : "#C4562F";
  ctx.lineWidth = 2;
  roundRect(ctx, W - margin - badgeW, 96, badgeW, 38, 19);
  ctx.stroke();
  ctx.fillStyle = veg ? "#4A7C4E" : "#C4562F";
  ctx.textAlign = "center";
  ctx.fillText(badgeText, W - margin - badgeW / 2, 122);

  // pizza illustration
  const cx = W / 2;
  const cy = 520;
  const r = 280;
  drawPizza(ctx, cx, cy, r, pizza);

  // name
  ctx.textAlign = "center";
  ctx.fillStyle = "#241A14";
  ctx.font = "700 62px Georgia, serif";
  wrapText(ctx, name, cx, 900, W - margin * 2, 70);

  // price
  ctx.fillStyle = "#C4562F";
  ctx.font = "700 48px Arial, sans-serif";
  ctx.fillText(`₹${price}`, cx, 1000);

  // verdict
  ctx.fillStyle = "#241A14";
  ctx.font = "600 26px Arial, sans-serif";
  ctx.fillText(`${verdict.emoji}  Chef says: ${verdict.label}`, cx, 1065);

  // ingredients
  const ingredients = [
    BASES.find((b) => b.id === pizza.baseId)?.name,
    SAUCES.find((s) => s.id === pizza.sauceId)?.name,
    `${CHEESE_LEVELS.find((c) => c.id === pizza.cheeseId)?.name} cheese`,
    ...getToppings(pizza.toppingIds).map((t) => t.name),
  ].filter(Boolean) as string[];

  ctx.font = "22px Arial, sans-serif";
  ctx.fillStyle = "rgba(36,26,20,0.6)";
  wrapText(ctx, ingredients.join("  ·  "), cx, 1140, W - margin * 2, 34);

  // footer
  ctx.font = "italic 20px Georgia, serif";
  ctx.fillStyle = "rgba(36,26,20,0.35)";
  ctx.fillText("Built at Pizza Lab", cx, H - 70);

  return canvas.toDataURL("image/png");
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A flat top-down illustration of the pizza, drawn from the same
 *  state the 3D scene uses — so the card matches what the user built
 *  rather than being a generic stock graphic. */
function drawPizza(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  pizza: PizzaState
) {
  const base = BASES.find((b) => b.id === pizza.baseId)!;
  const sauce = SAUCES.find((s) => s.id === pizza.sauceId)!;
  const cheese = CHEESE_LEVELS.find((c) => c.id === pizza.cheeseId)!;
  const toppings = getToppings(pizza.toppingIds);

  // shadow
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.92, r * 0.92, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(36,26,20,0.10)";
  ctx.fill();
  ctx.restore();

  // crust (baked colour, matching the 3D scene's post-bake state)
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#B07A3F";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.93, 0, Math.PI * 2);
  ctx.fillStyle = base.color;
  ctx.fill();

  // sauce
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2);
  ctx.fillStyle = sauce.color;
  ctx.fill();

  // cheese
  ctx.save();
  ctx.globalAlpha = cheese.opacity;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.84, 0, Math.PI * 2);
  ctx.fillStyle = "#EFC25C";
  ctx.fill();
  ctx.restore();

  // toppings — same seeded scatter idea as the 3D scene so the two
  // views feel like the same pizza
  toppings.forEach((topping) => {
    const rng = seeded(`${topping.id}-${topping.count}`);
    for (let i = 0; i < topping.count; i++) {
      const rad = Math.sqrt(rng()) * r * 0.76;
      const theta = rng() * Math.PI * 2;
      const x = cx + Math.cos(theta) * rad;
      const y = cy + Math.sin(theta) * rad;
      const size = topping.size * r * 0.95;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rng() * Math.PI * 2);
      ctx.fillStyle = topping.color;

      switch (topping.shape) {
        case "ring":
          ctx.lineWidth = size * 0.45;
          ctx.strokeStyle = topping.color;
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "strip":
          roundRect(ctx, -size * 1.2, -size * 0.22, size * 2.4, size * 0.44, size * 0.22);
          ctx.fill();
          break;
        case "chunk":
          roundRect(ctx, -size * 0.7, -size * 0.55, size * 1.4, size * 1.1, size * 0.25);
          ctx.fill();
          break;
        case "leaf":
          ctx.beginPath();
          ctx.ellipse(0, 0, size * 1.1, size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        default:
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
          ctx.fill();
      }
      ctx.restore();
    }
  });
}

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  words.forEach((word, i) => {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, cursorY);
      line = word + " ";
      cursorY += lineHeight;
    } else {
      line = test;
    }
  });
  ctx.fillText(line.trim(), x, cursorY);
}
