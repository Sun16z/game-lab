export type GameId = `G${"001" | "002" | "003" | "004" | "005" | "006" | "007" | "008" | "009" | "010" | "011" | "012" | "013" | "014" | "015" | "016" | "017" | "018" | "019" | "020"}`;
export type RunState = "READY" | "PLAYING" | "PAUSED" | "RESULT" | "ERROR";
export type GameCategory = "手感挑戰" | "動腦解謎" | "創作實驗" | "探索同玩";

export interface GameDefinition {
  id: GameId;
  slug: string;
  title: string;
  summary: string;
  category: GameCategory;
  replay: string;
  motif: string;
  art: readonly [string, string];
  priority: "P0" | "P1" | "P2" | "P3";
  status: "planned" | "playable";
}

export interface GameRun {
  id: string;
  gameId: GameId;
  seed: string;
  state: RunState;
  startedAt?: string;
  endedAt?: string;
}

export function createRun(gameId: GameId, seed: string, id: string): GameRun {
  return { id, gameId, seed, state: "READY" };
}

export function transitionRun(run: GameRun, next: RunState, now: string): GameRun {
  const allowed: Record<RunState, RunState[]> = {
    READY: ["PLAYING", "ERROR"],
    PLAYING: ["PAUSED", "RESULT", "ERROR"],
    PAUSED: ["PLAYING", "RESULT", "ERROR"],
    RESULT: [],
    ERROR: []
  };
  if (!allowed[run.state].includes(next)) {
    throw new Error(`Invalid run transition: ${run.state} → ${next}`);
  }
  return {
    ...run,
    state: next,
    startedAt: next === "PLAYING" && !run.startedAt ? now : run.startedAt,
    endedAt: next === "RESULT" || next === "ERROR" ? now : run.endedAt
  };
}

export const games: readonly GameDefinition[] = [
  { id: "G001", slug: "perfect-stack", title: "完美疊塔", summary: "抓準時機放下方塊，挑戰最高層數。", category: "手感挑戰", replay: "再高一層、再準一點", motif: "▰", art: ["#ef9b7a", "#a964ac"], priority: "P0", status: "playable" },
  { id: "G002", slug: "monster-math", title: "九九乘法怪獸塔", summary: "90秒乘法快問快答，用連擊打倒怪獸與Boss。", category: "動腦解謎", replay: "連擊打Boss、刷新打倒數", motif: "✕", art: ["#8ac8a7", "#5e69b9"], priority: "P1", status: "playable" },
  { id: "G003", slug: "color-lab", title: "顏色實驗室", summary: "倒轉試管，讓相同顏色住在一起。", category: "動腦解謎", replay: "用更少步數解出新關卡", motif: "◒", art: ["#70d1bc", "#5f92c1"], priority: "P1", status: "planned" },
  { id: "G004", slug: "math-runner", title: "算術跑酷王", summary: "衝向正確答案的跑道，躲過障礙。", category: "手感挑戰", replay: "選出正確路線延續連勝", motif: "➜", art: ["#f4b363", "#e37d79"], priority: "P2", status: "planned" },
  { id: "G005", slug: "snow-rush", title: "雪山極速90秒", summary: "轉彎、跳躍、穿越旗門滑下雪山。", category: "手感挑戰", replay: "熟悉雪道走出最佳路線", motif: "❄", art: ["#a2d8e9", "#6888c5"], priority: "P3", status: "planned" },
  { id: "G006", slug: "shadow-friends", title: "影子變變變", summary: "轉動物件，用影子拼出奇妙動物。", category: "動腦解謎", replay: "發現同一關的不同解法", motif: "◕", art: ["#c4a3e8", "#786bb8"], priority: "P2", status: "planned" },
  { id: "G007", slug: "rhythm-garden", title: "節奏花園", summary: "跟著節拍點亮花朵，讓花園開滿色彩。", category: "手感挑戰", replay: "聽懂節奏、完成更長的旋律", motif: "♫", art: ["#f7a5b5", "#b87cc1"], priority: "P2", status: "planned" },
  { id: "G008", slug: "paper-plane", title: "紙飛機郵差", summary: "調整飛行角度，乘著風把信送到朋友家。", category: "手感挑戰", replay: "探索不同風向與飛行路線", motif: "✈", art: ["#91d9cf", "#579dc1"], priority: "P2", status: "planned" },
  { id: "G009", slug: "bridge-builder", title: "小小造橋師", summary: "用有限積木搭橋，送小動物過河。", category: "創作實驗", replay: "用更少材料造出穩固的橋", motif: "⌒", art: ["#d5b073", "#8d8dba"], priority: "P2", status: "planned" },
  { id: "G010", slug: "tiny-chef", title: "迷你料理屋", summary: "組合食材、顏色和形狀，完成客人的點子。", category: "創作實驗", replay: "做出自己的創意菜單", motif: "✿", art: ["#ffc875", "#e98280"], priority: "P2", status: "planned" },
  { id: "G011", slug: "star-map", title: "星星連線家", summary: "連起夜空星點，找出藏起來的星座。", category: "探索同玩", replay: "收集星空故事與隱藏圖案", motif: "✦", art: ["#7889d5", "#463c8e"], priority: "P2", status: "planned" },
  { id: "G012", slug: "robot-maze", title: "機器人迷宮", summary: "排列前進與轉彎指令，帶機器人找到出口。", category: "動腦解謎", replay: "縮短指令、挑戰不同迷宮", motif: "⌘", art: ["#7bd4d2", "#5484a7"], priority: "P2", status: "planned" },
  { id: "G013", slug: "monster-band", title: "怪獸樂團", summary: "安排怪獸音符，錄下自己的短旋律。", category: "創作實驗", replay: "換樂器組合出新作品", motif: "♪", art: ["#f39ccc", "#8976c9"], priority: "P2", status: "planned" },
  { id: "G014", slug: "firefly-garden", title: "螢火蟲小花園", summary: "照顧植物、觀察夜晚來訪的小生物。", category: "探索同玩", replay: "嘗試不同花園配置", motif: "✺", art: ["#a5d485", "#5a9b90"], priority: "P2", status: "planned" },
  { id: "G015", slug: "island-postman", title: "小島郵差棋", summary: "每回合安排路線卡，把信送到島上的小屋。", category: "動腦解謎", replay: "換路線、縮短送信步數", motif: "♟", art: ["#e5bd83", "#ad88af"], priority: "P2", status: "planned" },
  { id: "G016", slug: "magnet-lab", title: "磁力遊樂場", summary: "拖動磁鐵，試出小球會怎麼走。", category: "創作實驗", replay: "改造機關、找到不同解法", motif: "⊙", art: ["#82c9d9", "#6d70bb"], priority: "P2", status: "planned" },
  { id: "G017", slug: "treasure-code", title: "寶藏密碼島", summary: "看圖案線索，拼出藏寶箱的密碼。", category: "動腦解謎", replay: "解鎖新線索與支線謎題", motif: "◇", art: ["#e8c672", "#bd8178"], priority: "P2", status: "planned" },
  { id: "G018", slug: "cloud-sculptor", title: "雲朵捏捏樂", summary: "推拉雲朵，做出心裡想像的形狀。", category: "創作實驗", replay: "保存作品、試新造型", motif: "☁", art: ["#b7d9e6", "#8da7d2"], priority: "P2", status: "planned" },
  { id: "G019", slug: "island-duo", title: "雙人小島任務", summary: "同一台裝置輪流操作，合作打開島上機關。", category: "探索同玩", replay: "和不同朋友找出合作方式", motif: "♧", art: ["#91d2a2", "#5d9db5"], priority: "P2", status: "planned" },
  { id: "G020", slug: "pocket-planet", title: "口袋星球", summary: "放上山、水和生物，觀察自己的星球變化。", category: "探索同玩", replay: "嘗試不同組合與星球故事", motif: "◌", art: ["#b4a0e3", "#6d90c6"], priority: "P2", status: "planned" }
];
