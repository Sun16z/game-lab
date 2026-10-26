import type { Language } from "./i18n";
type SkyCopy={headline:string;journey:string;goal:string;repair:string;zones:[string,string,string]};
export const dropCopy:Record<Language,string>={"zh-Hant":"放下小屋",en:"Place a home",es:"Colocar casa","pt-BR":"Colocar casa",fr:"Poser la maison",ar:"ضع البيت",sw:"Weka nyumba",id:"Letakkan rumah",hi:"घर रखें"};
export const skyCopy:Record<Language,SkyCopy>={
  "zh-Hant":{headline:"把小屋，蓋進雲裡。",journey:"天空建築工坊",goal:"下一站",repair:"連續3次完美對齊，讓塔身恢復一點寬度。",zones:["屋頂城市","雲海工坊","星空基地"]},
  en:{headline:"Build a home among the clouds.",journey:"Sky Workshop",goal:"Next stop",repair:"Land 3 perfect drops in a row to restore a little tower width.",zones:["Rooftop city","Cloud workshop","Star base"]},
  es:{headline:"Construye un hogar entre nubes.",journey:"Taller del cielo",goal:"Próxima parada",repair:"Logra 3 colocaciones perfectas seguidas para recuperar algo de anchura.",zones:["Ciudad de tejados","Taller de nubes","Base estelar"]},
  "pt-BR":{headline:"Construa uma casa nas nuvens.",journey:"Oficina do céu",goal:"Próxima parada",repair:"Faça 3 encaixes perfeitos seguidos para recuperar um pouco da largura.",zones:["Cidade dos telhados","Oficina nas nuvens","Base estelar"]},
  fr:{headline:"Une maison au milieu des nuages.",journey:"Atelier du ciel",goal:"Prochain arrêt",repair:"Réussis 3 poses parfaites de suite pour retrouver un peu de largeur.",zones:["Ville des toits","Atelier des nuages","Base stellaire"]},
  ar:{headline:"ابنِ بيتًا بين الغيوم.",journey:"ورشة السماء",goal:"المحطة التالية",repair:"ضع 3 قطع مثالية متتالية لاستعادة قليل من عرض البرج.",zones:["مدينة الأسطح","ورشة الغيوم","قاعدة النجوم"]},
  sw:{headline:"Jenga nyumba kati ya mawingu.",journey:"Warsha ya angani",goal:"Kituo kijacho",repair:"Weka vipande 3 kikamilifu mfululizo ili kurejesha upana kidogo.",zones:["Jiji la paa","Warsha ya mawingu","Kituo cha nyota"]},
  id:{headline:"Bangun rumah di antara awan.",journey:"Bengkel langit",goal:"Tujuan berikut",repair:"Susun 3 balok sempurna berturut-turut untuk memulihkan sedikit lebar menara.",zones:["Kota atap","Bengkel awan","Pangkalan bintang"]},
  hi:{headline:"बादलों के बीच घर बनाएँ।",journey:"आसमान की कार्यशाला",goal:"अगला पड़ाव",repair:"लगातार 3 सटीक ब्लॉक रखकर टावर की थोड़ी चौड़ाई वापस पाएँ।",zones:["छतों का शहर","बादलों की कार्यशाला","तारों का अड्डा"]}
};
