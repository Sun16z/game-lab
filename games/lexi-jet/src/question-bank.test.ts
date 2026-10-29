import { describe, expect, it } from 'vitest';
import { languages, type Question, type Reason } from './content-types';
import { choiceLabel, explainQuestion, getQuestion, questionBank, questionPrompt, reasonTemplates } from './question-bank';

const item = (id: string): Question => {
  const question = getQuestion(id);
  if (!question) throw new Error(`Missing curriculum item: ${id}`);
  return question;
};
const sentence = (q: Question) => q.before + q.target + q.after;

describe('curated Lexi-Jet curriculum', () => {
  it('contains the promised 36 middle and 48 upper items, with balanced POS and four upper skills', () => {
    expect(questionBank).toHaveLength(84);
    const middle = questionBank.filter((q) => q.band === 'middle');
    const upper = questionBank.filter((q) => q.band === 'upper');
    expect(middle).toHaveLength(36);
    expect(upper).toHaveLength(48);
    expect(middle.every((q) => q.kind === 'pos')).toBe(true);
    for (const reason of ['noun', 'verb', 'adjective']) {
      expect(middle.filter((q) => q.reason === reason)).toHaveLength(12);
      expect(upper.filter((q) => q.kind === 'pos' && q.reason === reason)).toHaveLength(4);
    }
    for (const kind of ['pos', 'synonym', 'antonym', 'gap']) expect(upper.filter((q) => q.kind === kind)).toHaveLength(12);
  });

  it('has unique stable IDs, three distinct choices and a complete English context for every target', () => {
    expect(new Set(questionBank.map((q) => q.id)).size).toBe(84);
    for (const q of questionBank) {
      expect(getQuestion(q.id)).toBe(q);
      expect(q.id).toMatch(/^[mu]-[a-z]+-\d{2}$/);
      expect(q.choices).toHaveLength(3);
      expect(new Set(q.choices).size).toBe(3);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(2);
      expect(q.target).not.toBe('');
      expect(q.before).toMatch(/\s$/);
      expect(q.after).toMatch(/^[\s,.]/);
      expect(sentence(q)).toMatch(/^[A-Z].*\.$/);
      expect(sentence(q).split(q.target)).toHaveLength(2);
      expect(q.choices.every((choice) => /^[a-z]+$/.test(choice))).toBe(true);
      expect(q.kind === 'gap' ? q.target === '___' : q.target !== '___').toBe(true);
    }
    expect(getQuestion('missing')).toBeUndefined();
  });

  it('keeps gun meaning fixed and attaches the right reason to each skill', () => {
    const partOfSpeech = ['noun', 'verb', 'adjective'];
    const grammarReasons = ['pluralVerb', 'singularVerb', 'beSingular', 'bePlural'];
    for (const q of questionBank) {
      if (q.kind === 'pos') {
        expect(q.choices).toEqual(partOfSpeech);
        expect(q.reason).toBe(partOfSpeech[q.correct]);
      } else if (q.kind === 'gap') {
        expect(grammarReasons).toContain(q.reason);
      } else {
        expect(q.reason).toBe(q.kind);
      }
      if (q.reason === 'adjective') {
        expect(q.describes?.length).toBeGreaterThan(0);
        expect(sentence(q).split(/\W+/)).toContain(q.describes);
      }
    }
  });

  it('classifies the concrete middle vocabulary by its actual sentence use', () => {
    const expected = {
      noun: 'apple bird chair teacher river pencil window flower carrot school turtle spoon',
      verb: 'jumps reads swim claps draws eat opens carry bakes wash kicks sing',
      adjective: 'red small soft tall cold sweet round green clean warm long loud',
    };
    for (const [category, words] of Object.entries(expected)) {
      for (const target of words.split(' ')) {
        const q = questionBank.find((entry) => entry.band === 'middle' && entry.target === target);
        expect(q, target).toBeDefined();
        expect(q?.choices[q.correct], target).toBe(category);
      }
    }
  });

  it('uses explicit context for homographs instead of assigning a permanent POS to a word', () => {
    const checks: [string, string, string][] = [
      ['u-pos-01', 'Please turn on the light above the desk.', 'noun'],
      ['u-pos-02', 'This light bag is easy to carry.', 'adjective'],
      ['u-pos-03', 'The water in the bottle is cold.', 'noun'],
      ['u-pos-04', 'We water the plants every morning.', 'verb'],
      ['u-pos-05', 'The blue paint is still wet.', 'noun'],
      ['u-pos-06', 'They paint the fence every spring.', 'verb'],
      ['u-pos-07', 'The round mirror hangs above the sink.', 'adjective'],
      ['u-pos-08', 'My watch tells the time.', 'noun'],
      ['u-pos-09', 'We watch birds through the window.', 'verb'],
      ['u-pos-10', 'A bright lamp lights the room.', 'adjective'],
      ['u-pos-11', 'We book a table at the restaurant every Friday.', 'verb'],
      ['u-pos-12', 'We found a quiet corner for reading.', 'adjective'],
    ];
    for (const [id, context, answer] of checks) {
      const q = item(id);
      expect(sentence(q)).toBe(context);
      expect(q.choices[q.correct]).toBe(answer);
    }
    expect(item('u-pos-02').describes).toBe('bag');
    expect(item('u-pos-07').describes).toBe('mirror');
  });

  it('protects reviewed word relationships and excludes a second accepted relationship in each option set', () => {
    // Explicit editorial answer keys, independent of item.correct and the item constructors.
    const synonyms: Record<string, string> = { quick: 'fast', happy: 'glad', small: 'tiny', large: 'big', begin: 'start', end: 'finish', silent: 'quiet', tidy: 'neat', clever: 'smart', ill: 'sick', gift: 'present', path: 'trail' };
    const antonyms: Record<string, string> = { hot: 'cold', open: 'closed', early: 'late', full: 'empty', easy: 'difficult', strong: 'weak', clean: 'dirty', near: 'far', shallow: 'deep', wide: 'narrow', arrive: 'leave', push: 'pull' };
    for (const q of questionBank.filter((entry) => entry.kind === 'synonym' || entry.kind === 'antonym')) {
      const expected = (q.kind === 'synonym' ? synonyms : antonyms)[q.target];
      expect(expected).toBeDefined();
      expect(q.choices[q.correct]).toBe(expected);
      expect(q.choices.filter((choice) => choice === expected)).toHaveLength(1);
      expect(q.choices).not.toContain(q.target);
    }
  });

  it('completes all present-tense gaps with correct subject agreement, including irregular be', () => {
    const expected: [string, string, Reason][] = [
      ['They play football after school every day.', 'play', 'pluralVerb'],
      ['I wash my hands before lunch every day.', 'wash', 'pluralVerb'],
      ['The birds sing in the tree every morning.', 'sing', 'pluralVerb'],
      ['You drink a glass of water at lunch every day.', 'drink', 'pluralVerb'],
      ['He reads a book before bed every night.', 'reads', 'singularVerb'],
      ['Dodo goes to the park every Sunday.', 'goes', 'singularVerb'],
      ['My brother watches the birds every morning.', 'watches', 'singularVerb'],
      ['Lili carries her bag to school every day.', 'carries', 'singularVerb'],
      ['It is cold here every winter.', 'is', 'beSingular'],
      ['The puppy is hungry every morning.', 'is', 'beSingular'],
      ['They are ready for school at eight every day.', 'are', 'bePlural'],
      ['We are happy to see our friends every day.', 'are', 'bePlural'],
    ];
    for (let i = 0; i < expected.length; i++) {
      const q = item(`u-gap-${String(i + 1).padStart(2, '0')}`);
      const [completed, form, reason] = expected[i];
      expect(q.before + q.choices[q.correct] + q.after).toBe(completed);
      expect(q.choices[q.correct]).toBe(form);
      expect(q.reason).toBe(reason);
      expect(q.choices.filter((choice) => q.before + choice + q.after === completed)).toHaveLength(1);
    }
  });

  it('distinguishes I/you base forms from third-person singular forms in every explanation locale', () => {
    const firstPerson = item('u-gap-02');
    const he = item('u-gap-05');
    const lili = item('u-gap-08');
    expect(firstPerson.before + firstPerson.choices[firstPerson.correct] + firstPerson.after).toBe('I wash my hands before lunch every day.');
    expect(he.before + he.choices[he.correct] + he.after).toBe('He reads a book before bed every night.');
    expect(lili.before + lili.choices[lili.correct] + lili.after).toBe('Lili carries her bag to school every day.');
    for (const language of languages) {
      expect(explainQuestion(firstPerson, language)).toContain('I');
      expect(explainQuestion(firstPerson, language)).toContain('you');
      for (const q of [he, lili, item('u-gap-09'), item('u-gap-10')]) {
        const explanation = explainQuestion(q, language);
        expect(explanation.length).toBeGreaterThan(25);
        for (const pronoun of ['he', 'she', 'it']) expect(explanation).toContain(pronoun);
        expect(explanation).not.toMatch(/(?:[“«]\s*I\s*[”»]|I、|I\/)/);
      }
    }
    expect(explainQuestion(he, 'en')).toContain('third-person singular');
    expect(explainQuestion(he, 'en')).toContain('a singular noun or a name');
    expect(explainQuestion(item('u-gap-09'), 'en')).toContain('third-person singular');
  });

  it('supplies nine localized instructions, POS labels and explanations without leaking placeholders', () => {
    expect(languages).toHaveLength(9);
    for (const language of languages) {
      expect(Object.keys(reasonTemplates[language])).toHaveLength(9);
      expect(new Set([0, 1, 2].map((i) => choiceLabel(item('m-noun-01'), i as 0 | 1 | 2, language))).size).toBe(3);
      for (const q of questionBank) {
        expect(questionPrompt(q.kind, language).trim().length).toBeGreaterThan(8);
        const explanation = explainQuestion(q, language);
        expect(explanation).not.toMatch(/\{(?:target|answer|describes)\}/);
        expect(explanation.trim().length).toBeGreaterThan(12);
        expect(explanation).toContain(q.kind === 'gap' ? q.choices[q.correct] : q.target);
        if (q.reason === 'adjective') expect(explanation).toContain(q.describes);
        for (const index of [0, 1, 2] as const) {
          expect(choiceLabel(q, index, language).trim()).not.toBe('');
          if (q.kind !== 'pos') expect(choiceLabel(q, index, language)).toBe(q.choices[index]);
        }
      }
    }
    expect(choiceLabel(item('m-noun-01'), 0, 'zh-Hant')).toBe('名詞');
    expect(choiceLabel(item('m-verb-01'), 1, 'en')).toBe('Verb');
    expect(explainQuestion(item('m-adj-01'), 'en')).toContain('describes “hat”');
  });
});
