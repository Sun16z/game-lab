export interface ScoreCard {
  title: string;
  score: string;
  scoreLabel: string;
  best: string;
  bestLabel: string;
  invitation: string;
  url: string;
  language: string;
  direction?: "ltr" | "rtl";
  accent?: string;
  drawArtwork?: (ctx: CanvasRenderingContext2D) => void;
}

export function shareLink(currentUrl: string, language: string): string {
  const url = new URL(currentUrl);
  url.search = "";
  url.hash = "";
  url.searchParams.set("lang", language);
  return url.toString();
}

export async function createScoreCard(card: ScoreCard): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const accent = card.accent ?? "#ffd68f";
  const background = ctx.createLinearGradient(0, 0, 1080, 1350);
  background.addColorStop(0, "#123644");
  background.addColorStop(1, "#102430");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.textAlign = card.direction === "rtl" ? "right" : "left";
  ctx.direction = card.direction ?? "ltr";
  const startX = card.direction === "rtl" ? 980 : 100;
  ctx.fillStyle = "#a7e3ce";
  ctx.font = "bold 34px system-ui, sans-serif";
  ctx.fillText("GAME LAB", startX, 115);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 68px system-ui, sans-serif";
  ctx.fillText(card.title, startX, 225, 880);

  if (card.drawArtwork) card.drawArtwork(ctx);
  else {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(540, 545, 180, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = accent;
  ctx.font = "bold 205px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(card.score, 540, 905, 900);
  ctx.fillStyle = "#d6e6e6";
  ctx.font = "bold 40px system-ui, sans-serif";
  ctx.fillText(card.scoreLabel, 540, 970, 860);
  ctx.font = "30px system-ui, sans-serif";
  ctx.fillText(`${card.bestLabel} ${card.best}`, 540, 1030, 860);
  ctx.fillStyle = "#a7e3ce";
  ctx.font = "bold 42px system-ui, sans-serif";
  ctx.fillText(card.invitation, 540, 1160, 900);
  ctx.fillStyle = "#a5bdc4";
  ctx.font = "25px system-ui, sans-serif";
  ctx.fillText(card.url.replace(/^https?:\/\//, ""), 540, 1225, 940);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Image export unavailable")), "image/png");
  });
}

export async function shareCardOrDownload(blob: Blob, filename: string, title: string, url: string, text: string): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title, text, url, files: [file] });
    return "shared";
  }
  downloadScoreCard(blob, filename);
  return "downloaded";
}

export function downloadScoreCard(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export async function copyShareLink(url: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }
  const field = document.createElement("textarea");
  field.value = url;
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error("Clipboard unavailable");
}
