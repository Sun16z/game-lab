export interface PlatformAdapter {
  readonly name: "portal" | "standalone" | "crazygames" | "poki";
  gameplayStart(): void;
  gameplayStop(): void;
  requestInterstitial(): Promise<"completed" | "skipped" | "unavailable">;
}

export const standaloneAdapter: PlatformAdapter = {
  name: "standalone",
  gameplayStart: () => undefined,
  gameplayStop: () => undefined,
  requestInterstitial: async () => "unavailable"
};

/** Pick the instruction that matches the primary input device. */
export function inputInstruction(keyboard: string, touch: string, coarsePointer: boolean): string {
  return coarsePointer ? touch : keyboard;
}

/** A shared query so every standalone game treats touch input the same way. */
export function touchPointerQuery(): MediaQueryList {
  return window.matchMedia("(pointer: coarse)");
}

const homeExitCopy = {
  "zh-Hant": "放棄本局，回首頁", en: "Leave game and go home", es: "Salir del juego e ir al inicio",
  "pt-BR": "Sair do jogo e voltar ao início", fr: "Quitter la partie et revenir à l’accueil",
  ar: "اترك اللعبة وعد إلى الرئيسية", sw: "Acha mchezo, rudi mwanzo",
  id: "Keluar dari permainan, kembali ke beranda", hi: "खेल छोड़ें, होम पर जाएँ"
} as const;
const homeExitShortCopy: Record<keyof typeof homeExitCopy, string> = {
  "zh-Hant": "回首頁", en: "Home", es: "Inicio", "pt-BR": "Início", fr: "Accueil",
  ar: "الرئيسية", sw: "Mwanzo", id: "Beranda", hi: "होम"
};

export type HomeExitLanguage = keyof typeof homeExitCopy;

type LearningGame = "perfect-stack" | "monster-math" | "color-lab" | "island-conquest" | "memory-monsters" | "math-runner";
const learningHeadings: Record<HomeExitLanguage, string> = {
  "zh-Hant":"玩中學",en:"Play & grow",es:"Jugar y aprender","pt-BR":"Brincar e aprender",fr:"Jouer et grandir",ar:"العب وتعلّم",sw:"Cheza na ujifunze",id:"Bermain sambil belajar",hi:"खेलें और सीखें"
};
const learningBenefitCopy: Record<HomeExitLanguage, Record<LearningGame, string>> = {
  "zh-Hant":{
    "perfect-stack":"練習專注力、視覺判斷與手眼協調。兒童模式節奏較慢，適合從容挑戰。",
    "monster-math":"反覆熟悉九九乘法，同時練習快速判斷、專注與失誤後再嘗試。",
    "color-lab":"練習顏色分類、步驟規劃與解決問題。沒有倒數，可以慢慢思考。",
    "island-conquest":"練習空間推理、輪流等待與策略規劃；同裝置雙人也能學習友善競賽。",
    "memory-monsters":"練習圖像記憶、配對與語音詞彙；全程可聽，不需要先會認字。",
    "math-runner":"在動作中練習數學或英文，同時培養快速判斷、反應與手眼協調。"
  },
  en:{"perfect-stack":"Practise focus, visual judgement, and hand-eye coordination. Child mode offers a gentler pace.","monster-math":"Build multiplication fluency while practising quick decisions, focus, and trying again after mistakes.","color-lab":"Practise colour sorting, planning, and problem-solving with no timer pressure.","island-conquest":"Practise spatial reasoning, turn-taking, and strategy; local two-player mode supports friendly competition.","memory-monsters":"Practise visual memory, matching, and spoken vocabulary. Listening means reading is not required.","math-runner":"Practise maths or English in motion while building quick decisions, reactions, and hand-eye coordination."},
  es:{"perfect-stack":"Practica la concentración, el cálculo visual y la coordinación ojo-mano. El modo infantil va más despacio.","monster-math":"Refuerza las tablas mientras practicas decisiones rápidas, concentración y volver a intentarlo.","color-lab":"Practica clasificación de colores, planificación y resolución de problemas, sin cronómetro.","island-conquest":"Practica razonamiento espacial, turnos y estrategia; el modo para dos fomenta la competición amistosa.","memory-monsters":"Practica memoria visual, parejas y vocabulario hablado. No hace falta saber leer.","math-runner":"Practica matemáticas o inglés en movimiento, junto con reacción y coordinación ojo-mano."},
  "pt-BR":{"perfect-stack":"Pratique foco, percepção visual e coordenação motora. O modo infantil tem ritmo mais tranquilo.","monster-math":"Ganhe fluência na tabuada enquanto pratica decisões rápidas, foco e persistência.","color-lab":"Pratique classificação de cores, planejamento e solução de problemas, sem pressão de tempo.","island-conquest":"Pratique raciocínio espacial, respeito aos turnos e estratégia; o modo local incentiva disputa amigável.","memory-monsters":"Pratique memória visual, associação e vocabulário falado. Não é preciso saber ler.","math-runner":"Pratique matemática ou inglês em movimento, com decisões rápidas e coordenação motora."},
  fr:{"perfect-stack":"Travaille la concentration, le jugement visuel et la coordination œil-main. Le mode enfant est plus doux.","monster-math":"Mémorise les tables tout en travaillant décisions rapides, concentration et persévérance.","color-lab":"Travaille le tri des couleurs, la planification et la résolution de problèmes, sans chronomètre.","island-conquest":"Travaille le raisonnement spatial, le tour de rôle et la stratégie ; le duo encourage une compétition amicale.","memory-monsters":"Travaille mémoire visuelle, association et vocabulaire oral. Savoir lire n’est pas nécessaire.","math-runner":"Travaille les maths ou l’anglais en mouvement, avec réaction et coordination œil-main."},
  ar:{"perfect-stack":"تدرّب على التركيز والتقدير البصري والتنسيق بين العين واليد. وضع الأطفال أهدأ.","monster-math":"ثبّت جداول الضرب وتدرّب على سرعة القرار والتركيز والمحاولة بعد الخطأ.","color-lab":"تدرّب على تصنيف الألوان والتخطيط وحل المشكلات من دون ضغط الوقت.","island-conquest":"تدرّب على التفكير المكاني وتبادل الأدوار والتخطيط، مع منافسة ودية للاعبين.","memory-monsters":"تدرّب على الذاكرة البصرية والمطابقة والمفردات المسموعة، من دون حاجة إلى القراءة.","math-runner":"تدرّب على الرياضيات أو الإنجليزية أثناء الحركة مع سرعة الاستجابة والتنسيق."},
  sw:{"perfect-stack":"Jizoeze umakini, kutazama nafasi na uratibu wa macho na mikono. Hali ya watoto ni tulivu zaidi.","monster-math":"Jenga ufasaha wa kuzidisha huku ukijifunza kuamua haraka, kuzingatia na kujaribu tena.","color-lab":"Jizoeze kupanga rangi, kupanga hatua na kutatua matatizo bila shinikizo la muda.","island-conquest":"Jizoeze kufikiri kwa nafasi, kusubiri zamu na kupanga mikakati; wachezaji wawili hushindana kirafiki.","memory-monsters":"Jizoeze kumbukumbu ya picha, kuoanisha na msamiati wa sauti; kusoma hakuhitajiki.","math-runner":"Jizoeze hesabu au Kiingereza ukiwa katika mwendo, pamoja na uamuzi wa haraka na uratibu."},
  id:{"perfect-stack":"Latih fokus, penilaian visual, dan koordinasi mata-tangan. Mode anak memberi tempo lebih santai.","monster-math":"Kuasai perkalian sambil melatih keputusan cepat, fokus, dan mencoba lagi setelah salah.","color-lab":"Latih pengelompokan warna, perencanaan, dan pemecahan masalah tanpa tekanan waktu.","island-conquest":"Latih nalar ruang, bergiliran, dan strategi; mode dua pemain mendukung persaingan yang ramah.","memory-monsters":"Latih ingatan visual, mencocokkan, dan kosakata lisan. Tidak harus bisa membaca.","math-runner":"Latih matematika atau bahasa Inggris sambil bergerak, juga reaksi dan koordinasi mata-tangan."},
  hi:{"perfect-stack":"ध्यान, दृश्य अनुमान और हाथ-आँख तालमेल का अभ्यास करें। बच्चों का मोड धीमी गति देता है।","monster-math":"पहाड़े पक्के करें और तेज़ निर्णय, ध्यान तथा गलती के बाद दोबारा कोशिश का अभ्यास करें।","color-lab":"बिना समय के दबाव के रंग वर्गीकरण, योजना और समस्या-समाधान का अभ्यास करें।","island-conquest":"स्थानिक सोच, बारी लेना और रणनीति का अभ्यास करें; दो खिलाड़ी दोस्ताना मुकाबला कर सकते हैं।","memory-monsters":"चित्र स्मृति, मिलान और बोले गए शब्दों का अभ्यास करें। पढ़ना आना ज़रूरी नहीं है।","math-runner":"चलते हुए गणित या अंग्रेज़ी, तेज़ निर्णय और हाथ-आँख तालमेल का अभ्यास करें।"}
};
const learningIcons: Record<LearningGame, string> = {"perfect-stack":"◼ △ ●","monster-math":"× ✦ ÷","color-lab":"● ◆ ✳","island-conquest":"☀ 〰 ◇","memory-monsters":"★ ♪ ☁","math-runner":"↑ » ★"};

export function learningBenefitText(game: LearningGame, language: string): string {
  const key = (language in learningBenefitCopy ? language : "en") as HomeExitLanguage;
  return learningBenefitCopy[key][game];
}

function detectLearningGame(): LearningGame | null {
  if (document.getElementById("game-canvas")) return "perfect-stack";
  if (document.getElementById("monster")) return "monster-math";
  if (document.getElementById("tubes")) return "color-lab";
  if (document.getElementById("pieces")) return "island-conquest";
  if (document.querySelector(".hero-monsters")) return "memory-monsters";
  if (document.getElementById("gate")) return "math-runner";
  return null;
}

function mountLearningBenefit(language: string): { updateLanguage: (language: string) => void } | undefined {
  const game = detectLearningGame();
  if (!game) return undefined;
  const anchors: Record<LearningGame, string> = {"perfect-stack":"#ready-description","monster-math":"#ready-description","color-lab":"#ready-description","island-conquest":"#intro","memory-monsters":"#setup .speech","math-runner":"#setup .intro-row"};
  const anchor = document.querySelector<HTMLElement>(anchors[game]);
  if (!anchor) return undefined;
  const card = document.createElement("aside");
  card.className = `learning-benefit learning-benefit--${game}`;
  card.innerHTML = `<span class="learning-benefit__art" aria-hidden="true">${learningIcons[game]}</span><span><strong></strong><small></small></span>`;
  anchor.insertAdjacentElement("afterend", card);
  const updateLanguage = (nextLanguage: string): void => {
    const key = (nextLanguage in learningBenefitCopy ? nextLanguage : "en") as HomeExitLanguage;
    card.querySelector("strong")!.textContent = learningHeadings[key];
    card.querySelector("small")!.textContent = learningBenefitText(game, key);
  };
  updateLanguage(language);
  return { updateLanguage };
}

export function homeExitLabel(language: string): string {
  return homeExitCopy[language as HomeExitLanguage] ?? homeExitCopy.en;
}

/** Keep this link outside game overlays so leaving is always possible. */
export function mountHomeExit(actions: HTMLElement, language: string): { updateLanguage: (language: string) => void } {
  const learningBenefit = mountLearningBenefit(language);
  const link = document.createElement("a");
  link.className = "home-exit";
  link.href = "/";
  link.target = "_top";
  link.innerHTML = '<span aria-hidden="true">🏠</span><span class="home-exit-text"></span>';
  actions.prepend(link);
  const updateLanguage = (nextLanguage: string): void => {
    const label = homeExitLabel(nextLanguage);
    link.setAttribute("aria-label", label);
    link.title = label;
    link.querySelector<HTMLElement>(".home-exit-text")!.textContent = homeExitShortCopy[nextLanguage as HomeExitLanguage] ?? homeExitShortCopy.en;
    learningBenefit?.updateLanguage(nextLanguage);
  };
  updateLanguage(language);
  return { updateLanguage };
}
