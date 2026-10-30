"use client";
import { useEffect, useState, type ReactNode } from "react";
import { HandTap, PaintBrush, PuzzlePiece, SquaresFour, UsersThree, Play } from "@phosphor-icons/react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const lastPlayedKey = "game-lab:portal:last-played";
const filters = [
  { id: "all", label: "全部", Icon: SquaresFour },
  { id: "手感挑戰", label: "動動手", Icon: HandTap },
  { id: "動腦解謎", label: "想一想", Icon: PuzzlePiece },
  { id: "創作實驗", label: "做做看", Icon: PaintBrush },
  { id: "探索同玩", label: "一起玩", Icon: UsersThree }
] as const;
type FilterId = (typeof filters)[number]["id"];

/** Tiles are server-rendered; clicks on any play link are remembered for the continue card. */
export function FilterGrid({ count, children }: { count: number; children: ReactNode }) {
  const [filter, setFilter] = useState<FilterId>("all");
  const remember = (event: React.MouseEvent) => {
    const slug = (event.target as HTMLElement).closest<HTMLElement>("[data-play]")?.dataset.play;
    if (slug) try { window.localStorage.setItem(lastPlayedKey, slug); } catch { /* storage blocked: the shortcut is optional */ }
  };
  return <>
    <div className="chipBar" role="group" aria-label="依玩法挑遊戲">
      {filters.map(({ id, label, Icon }) => <button key={id} type="button" className="chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>
        <Icon size={26} weight={filter === id ? "fill" : "regular"} aria-hidden="true" /><span>{label}</span>
      </button>)}
    </div>
    <ul id="play-now" className="tileGrid" data-filter={filter} aria-label={`${count}款遊戲`} onClick={remember}>{children}</ul>
  </>;
}

export function ContinueCard({ titles }: { titles: Record<string, string> }) {
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => { try { setSlug(window.localStorage.getItem(lastPlayedKey)); } catch { /* storage blocked */ } }, []);
  if (!slug || !titles[slug]) return null;
  return <a className="continueCard" href={`${basePath}/play/${slug}/`}>
    <span className="continueIcon"><Play size={26} weight="fill" aria-hidden="true" /></span>
    <span className="continueCopy"><small>繼續玩</small><strong>{titles[slug]}</strong></span>
  </a>;
}
