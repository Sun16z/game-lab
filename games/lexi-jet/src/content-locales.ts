import type { Language, QuestionKind, Reason } from './content-types';

interface ContentLocale {
  pos: readonly [string, string, string];
  prompts: Record<QuestionKind, string>;
  reasons: Record<Reason, string>;
}

/** Draft instructional translations; native-language and teacher review remains pending. */
export const contentLocales: Record<Language, ContentLocale> = {
  en: {
    pos: ['Noun', 'Verb', 'Adjective'],
    prompts: { pos: 'Is the highlighted word a noun, verb or adjective?', synonym: 'Which word means almost the same as the highlighted word here?', antonym: 'Which word has the opposite meaning to the highlighted word here?', gap: 'Choose the simple present form that completes the sentence.' },
    reasons: {
      noun: '“{target}” is a noun: it names a person, animal, place or thing in this sentence.',
      verb: '“{target}” is a verb: it tells what someone or something does in this sentence.',
      adjective: '“{target}” is an adjective: it describes “{describes}” in this sentence.',
      synonym: 'Here, “{answer}” means almost the same as “{target}”.',
      antonym: 'Here, “{answer}” has the opposite meaning to “{target}”.',
      pluralVerb: 'With a plural subject or “I”/“you”, use the base form “{answer}” in the simple present.',
      singularVerb: 'With a third-person singular subject (“he”, “she”, “it”, a singular noun or a name), use “{answer}” in the simple present.',
      beSingular: 'With a third-person singular subject (“he”, “she”, “it”, a singular noun or a name), use “is”: “{answer}”.',
      bePlural: 'With “you”, “we”, “they” or a plural subject, use “are”: “{answer}”.',
    },
  },
  'zh-Hant': {
    pos: ['名詞', '動詞', '形容詞'],
    prompts: { pos: '標示的單字在這個句子中是什麼詞性？', synonym: '哪個字與標示的單字在這裡意思相近？', antonym: '哪個字與標示的單字在這裡意思相反？', gap: '選出能完成句子的一般現在式。' },
    reasons: {
      noun: '「{target}」是名詞，在這個句子中表示人、動物、地點或事物。',
      verb: '「{target}」是動詞，在這個句子中表示人或事物做的動作。',
      adjective: '「{target}」是形容詞，在這個句子中形容「{describes}」。',
      synonym: '在這裡，「{answer}」與「{target}」意思相近。',
      antonym: '在這裡，「{answer}」與「{target}」意思相反。',
      pluralVerb: '主詞是複數或I、you時，一般現在式使用原形動詞「{answer}」。',
      singularVerb: '主詞是第三人稱單數（he、she、it、單數名詞或人名）時，一般現在式使用「{answer}」。',
      beSingular: '主詞是第三人稱單數（he、she、it、單數名詞或人名）時，be動詞使用is：「{answer}」。',
      bePlural: '主詞是you、we、they或複數時，be動詞使用are：「{answer}」。',
    },
  },
  es: {
    pos: ['Sustantivo', 'Verbo', 'Adjetivo'],
    prompts: { pos: '¿Qué función tiene la palabra resaltada en esta oración?', synonym: '¿Qué palabra tiene un significado parecido al de la palabra resaltada aquí?', antonym: '¿Qué palabra tiene el significado opuesto al de la palabra resaltada aquí?', gap: 'Elige la forma del presente simple que completa la oración.' },
    reasons: {
      noun: '«{target}» es un sustantivo: nombra una persona, un animal, un lugar o una cosa en esta oración.',
      verb: '«{target}» es un verbo: indica lo que alguien o algo hace en esta oración.',
      adjective: '«{target}» es un adjetivo: describe «{describes}» en esta oración.',
      synonym: 'Aquí, «{answer}» tiene un significado parecido al de «{target}».',
      antonym: 'Aquí, «{answer}» tiene el significado opuesto al de «{target}».',
      pluralVerb: 'Con un sujeto plural o «I»/«you», se usa la forma base «{answer}» en presente simple.',
      singularVerb: 'Con un sujeto en tercera persona del singular («he», «she», «it», un sustantivo singular o un nombre propio), se usa «{answer}» en presente simple.',
      beSingular: 'Con un sujeto en tercera persona del singular («he», «she», «it», un sustantivo singular o un nombre propio), se usa «is»: «{answer}».',
      bePlural: 'Con «you», «we», «they» o un sujeto plural, se usa «are»: «{answer}».',
    },
  },
  'pt-BR': {
    pos: ['Substantivo', 'Verbo', 'Adjetivo'],
    prompts: { pos: 'Qual é a função da palavra destacada nesta frase?', synonym: 'Qual palavra tem um significado parecido com o da palavra destacada aqui?', antonym: 'Qual palavra tem o significado oposto ao da palavra destacada aqui?', gap: 'Escolha a forma do presente simples que completa a frase.' },
    reasons: {
      noun: '“{target}” é um substantivo: nomeia uma pessoa, um animal, um lugar ou uma coisa nesta frase.',
      verb: '“{target}” é um verbo: indica o que alguém ou algo faz nesta frase.',
      adjective: '“{target}” é um adjetivo: descreve “{describes}” nesta frase.',
      synonym: 'Aqui, “{answer}” tem um significado parecido com o de “{target}”.',
      antonym: 'Aqui, “{answer}” tem o significado oposto ao de “{target}”.',
      pluralVerb: 'Com sujeito no plural ou “I”/“you”, usamos a forma base “{answer}” no presente simples.',
      singularVerb: 'Com sujeito na terceira pessoa do singular (“he”, “she”, “it”, um substantivo singular ou um nome próprio), usamos “{answer}” no presente simples.',
      beSingular: 'Com sujeito na terceira pessoa do singular (“he”, “she”, “it”, um substantivo singular ou um nome próprio), usamos “is”: “{answer}”.',
      bePlural: 'Com “you”, “we”, “they” ou sujeito no plural, usamos “are”: “{answer}”.',
    },
  },
  fr: {
    pos: ['Nom', 'Verbe', 'Adjectif'],
    prompts: { pos: 'Quelle est la nature du mot surligné dans cette phrase ?', synonym: 'Quel mot a presque le même sens que le mot surligné ici ?', antonym: 'Quel mot a le sens contraire du mot surligné ici ?', gap: 'Choisis la forme du présent simple qui complète la phrase.' },
    reasons: {
      noun: '« {target} » est un nom : il désigne une personne, un animal, un lieu ou une chose dans cette phrase.',
      verb: '« {target} » est un verbe : il indique ce que fait une personne ou une chose dans cette phrase.',
      adjective: '« {target} » est un adjectif : il décrit « {describes} » dans cette phrase.',
      synonym: 'Ici, « {answer} » a presque le même sens que « {target} ».',
      antonym: 'Ici, « {answer} » a le sens contraire de « {target} ».',
      pluralVerb: 'Avec un sujet pluriel ou « I »/« you », on utilise la base verbale « {answer} » au présent simple.',
      singularVerb: 'Avec un sujet à la troisième personne du singulier (« he », « she », « it », un nom singulier ou un prénom), on utilise « {answer} » au présent simple.',
      beSingular: 'Avec un sujet à la troisième personne du singulier (« he », « she », « it », un nom singulier ou un prénom), on utilise « is » : « {answer} ».',
      bePlural: 'Avec « you », « we », « they » ou un sujet pluriel, on utilise « are » : « {answer} ».',
    },
  },
  ar: {
    pos: ['اسم', 'فعل', 'صفة'],
    prompts: { pos: 'ما نوع الكلمة المظللة في هذه الجملة؟', synonym: 'أي كلمة لها معنى قريب من الكلمة المظللة هنا؟', antonym: 'أي كلمة لها معنى مضاد للكلمة المظللة هنا؟', gap: 'اختر صيغة المضارع البسيط التي تكمل الجملة.' },
    reasons: {
      noun: '«{target}» اسم: يدل على شخص أو حيوان أو مكان أو شيء في هذه الجملة.',
      verb: '«{target}» فعل: يبين ما يفعله شخص أو شيء في هذه الجملة.',
      adjective: '«{target}» صفة: تصف «{describes}» في هذه الجملة.',
      synonym: 'هنا، معنى «{answer}» قريب من معنى «{target}».',
      antonym: 'هنا، معنى «{answer}» مضاد لمعنى «{target}».',
      pluralVerb: 'مع الفاعل الجمع أو «I» و«you»، نستخدم الصيغة الأساسية «{answer}» في المضارع البسيط.',
      singularVerb: 'مع فاعل الغائب المفرد («he» أو «she» أو «it» أو اسم مفرد أو اسم علم)، نستخدم «{answer}» في المضارع البسيط.',
      beSingular: 'مع فاعل الغائب المفرد («he» أو «she» أو «it» أو اسم مفرد أو اسم علم)، نستخدم «is»: «{answer}».',
      bePlural: 'مع «you» أو «we» أو «they» أو فاعل جمع، نستخدم «are»: «{answer}».',
    },
  },
  sw: {
    pos: ['Nomino', 'Kitenzi', 'Kivumishi'],
    prompts: { pos: 'Neno lililoangaziwa ni aina gani ya neno katika sentensi hii?', synonym: 'Ni neno gani lenye maana inayokaribiana na neno lililoangaziwa hapa?', antonym: 'Ni neno gani lenye maana ya kinyume na neno lililoangaziwa hapa?', gap: 'Chagua umbo la wakati wa sasa sahili linalokamilisha sentensi.' },
    reasons: {
      noun: '“{target}” ni nomino: hutaja mtu, mnyama, mahali au kitu katika sentensi hii.',
      verb: '“{target}” ni kitenzi: huonyesha anachofanya mtu au kitu katika sentensi hii.',
      adjective: '“{target}” ni kivumishi: hueleza “{describes}” katika sentensi hii.',
      synonym: 'Hapa, “{answer}” ina maana inayokaribiana na “{target}”.',
      antonym: 'Hapa, “{answer}” ina maana ya kinyume na “{target}”.',
      pluralVerb: 'Kwa kiima cha wingi au “I”/“you”, tumia umbo la msingi “{answer}” katika wakati wa sasa sahili.',
      singularVerb: 'Kwa kiima cha nafsi ya tatu umoja (“he”, “she”, “it”, nomino ya umoja au jina), tumia “{answer}” katika wakati wa sasa sahili.',
      beSingular: 'Kwa kiima cha nafsi ya tatu umoja (“he”, “she”, “it”, nomino ya umoja au jina), tumia “is”: “{answer}”.',
      bePlural: 'Kwa “you”, “we”, “they” au kiima cha wingi, tumia “are”: “{answer}”.',
    },
  },
  id: {
    pos: ['Kata benda', 'Kata kerja', 'Kata sifat'],
    prompts: { pos: 'Apa jenis kata yang disorot dalam kalimat ini?', synonym: 'Kata mana yang maknanya hampir sama dengan kata yang disorot di sini?', antonym: 'Kata mana yang maknanya berlawanan dengan kata yang disorot di sini?', gap: 'Pilih bentuk simple present yang melengkapi kalimat.' },
    reasons: {
      noun: '“{target}” adalah kata benda: menyebut orang, hewan, tempat, atau benda dalam kalimat ini.',
      verb: '“{target}” adalah kata kerja: menunjukkan apa yang dilakukan seseorang atau sesuatu dalam kalimat ini.',
      adjective: '“{target}” adalah kata sifat: menjelaskan “{describes}” dalam kalimat ini.',
      synonym: 'Di sini, makna “{answer}” hampir sama dengan “{target}”.',
      antonym: 'Di sini, makna “{answer}” berlawanan dengan “{target}”.',
      pluralVerb: 'Dengan subjek jamak atau “I”/“you”, gunakan bentuk dasar “{answer}” dalam simple present.',
      singularVerb: 'Dengan subjek orang ketiga tunggal (“he”, “she”, “it”, kata benda tunggal, atau nama), gunakan “{answer}” dalam simple present.',
      beSingular: 'Dengan subjek orang ketiga tunggal (“he”, “she”, “it”, kata benda tunggal, atau nama), gunakan “is”: “{answer}”.',
      bePlural: 'Dengan “you”, “we”, “they”, atau subjek jamak, gunakan “are”: “{answer}”.',
    },
  },
  hi: {
    pos: ['संज्ञा', 'क्रिया', 'विशेषण'],
    prompts: { pos: 'इस वाक्य में उभारा गया शब्द किस प्रकार का है?', synonym: 'यहाँ किस शब्द का अर्थ उभारे गए शब्द से मिलता-जुलता है?', antonym: 'यहाँ किस शब्द का अर्थ उभारे गए शब्द के विपरीत है?', gap: 'वाक्य पूरा करने के लिए सामान्य वर्तमान काल का सही रूप चुनें।' },
    reasons: {
      noun: '“{target}” संज्ञा है: इस वाक्य में यह किसी व्यक्ति, जानवर, जगह या वस्तु का नाम बताता है।',
      verb: '“{target}” क्रिया है: इस वाक्य में यह बताता है कि कोई क्या करता है।',
      adjective: '“{target}” विशेषण है: इस वाक्य में यह “{describes}” की विशेषता बताता है।',
      synonym: 'यहाँ “{answer}” का अर्थ “{target}” से मिलता-जुलता है।',
      antonym: 'यहाँ “{answer}” का अर्थ “{target}” के विपरीत है।',
      pluralVerb: 'बहुवचन कर्ता या “I”/“you” के साथ सामान्य वर्तमान काल में मूल रूप “{answer}” का प्रयोग करें।',
      singularVerb: 'अन्य पुरुष एकवचन कर्ता (“he”, “she”, “it”, एकवचन संज्ञा या नाम) के साथ सामान्य वर्तमान काल में “{answer}” का प्रयोग करें।',
      beSingular: 'अन्य पुरुष एकवचन कर्ता (“he”, “she”, “it”, एकवचन संज्ञा या नाम) के साथ “is” का प्रयोग करें: “{answer}”।',
      bePlural: '“you”, “we”, “they” या बहुवचन कर्ता के साथ “are” का प्रयोग करें: “{answer}”।',
    },
  },
};

export const reasonTemplates: Record<Language, Record<Reason, string>> = Object.fromEntries(
  Object.entries(contentLocales).map(([language, copy]) => [language, copy.reasons]),
) as Record<Language, Record<Reason, string>>;
