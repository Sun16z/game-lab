import type { GradeBand, Language, Question, QuestionKind, Reason } from './content-types';
import { contentLocales } from './content-locales';
export { reasonTemplates } from './content-locales';

const posChoices = ['noun', 'verb', 'adjective'] as const;
function pos(id: string, band: GradeBand, before: string, target: string, after: string, reason: 'noun' | 'verb' | 'adjective', describes?: string): Question {
  return { id, band, kind: 'pos', before, target, after, choices: posChoices, correct: reason === 'noun' ? 0 : reason === 'verb' ? 1 : 2, reason, ...(describes ? { describes } : {}) };
}
function word(id: string, kind: 'synonym' | 'antonym', before: string, target: string, after: string, choices: Question['choices'], correct: Question['correct']): Question {
  return { id, band: 'upper', kind, before, target, after, choices, correct, reason: kind };
}
function gap(id: string, before: string, after: string, choices: Question['choices'], correct: Question['correct'], reason: Extract<Reason, 'pluralVerb' | 'singularVerb' | 'beSingular' | 'bePlural'>): Question {
  return { id, band: 'upper', kind: 'gap', before, target: '___', after, choices, correct, reason };
}

/** Original, fixed teaching items. See CURRICULUM.md for scope and review limits. */
export const questionBank: readonly Question[] = [
  pos('m-noun-01', 'middle', 'I eat an ', 'apple', ' after lunch.', 'noun'),
  pos('m-noun-02', 'middle', 'A ', 'bird', ' sits in the tree.', 'noun'),
  pos('m-noun-03', 'middle', 'The ', 'chair', ' is beside the table.', 'noun'),
  pos('m-noun-04', 'middle', 'Our ', 'teacher', ' reads us a story.', 'noun'),
  pos('m-noun-05', 'middle', 'The ', 'river', ' flows past the farm.', 'noun'),
  pos('m-noun-06', 'middle', 'My ', 'pencil', ' is in my bag.', 'noun'),
  pos('m-noun-07', 'middle', 'The ', 'window', ' is above the desk.', 'noun'),
  pos('m-noun-08', 'middle', 'A ', 'flower', ' grows beside the gate.', 'noun'),
  pos('m-noun-09', 'middle', 'The rabbit eats a ', 'carrot', '.', 'noun'),
  pos('m-noun-10', 'middle', 'Our ', 'school', ' has a big playground.', 'noun'),
  pos('m-noun-11', 'middle', 'The ', 'turtle', ' swims in the pond.', 'noun'),
  pos('m-noun-12', 'middle', 'I use a ', 'spoon', ' to eat soup.', 'noun'),

  pos('m-verb-01', 'middle', 'The frog ', 'jumps', ' over a stone.', 'verb'),
  pos('m-verb-02', 'middle', 'Lili ', 'reads', ' a book every day.', 'verb'),
  pos('m-verb-03', 'middle', 'The fish ', 'swim', ' in the pond.', 'verb'),
  pos('m-verb-04', 'middle', 'Pip ', 'claps', ' after the song.', 'verb'),
  pos('m-verb-05', 'middle', 'Dodo ', 'draws', ' a picture of a tree.', 'verb'),
  pos('m-verb-06', 'middle', 'We ', 'eat', ' rice for lunch.', 'verb'),
  pos('m-verb-07', 'middle', 'Lili ', 'opens', ' the box.', 'verb'),
  pos('m-verb-08', 'middle', 'They ', 'carry', ' their bags to school.', 'verb'),
  pos('m-verb-09', 'middle', 'My dad ', 'bakes', ' bread on Sundays.', 'verb'),
  pos('m-verb-10', 'middle', 'We ', 'wash', ' our hands before lunch.', 'verb'),
  pos('m-verb-11', 'middle', 'Pip ', 'kicks', ' the ball.', 'verb'),
  pos('m-verb-12', 'middle', 'The children ', 'sing', ' a song together.', 'verb'),

  pos('m-adj-01', 'middle', 'Dodo wears a ', 'red', ' hat.', 'adjective', 'hat'),
  pos('m-adj-02', 'middle', 'A ', 'small', ' mouse hides under the chair.', 'adjective', 'mouse'),
  pos('m-adj-03', 'middle', 'The ', 'soft', ' pillow is on my bed.', 'adjective', 'pillow'),
  pos('m-adj-04', 'middle', 'A ', 'tall', ' tree grows by the house.', 'adjective', 'tree'),
  pos('m-adj-05', 'middle', 'Pip drinks ', 'cold', ' water after playing.', 'adjective', 'water'),
  pos('m-adj-06', 'middle', 'This ', 'sweet', ' mango is ready to eat.', 'adjective', 'mango'),
  pos('m-adj-07', 'middle', 'The ', 'round', ' clock hangs on the wall.', 'adjective', 'clock'),
  pos('m-adj-08', 'middle', 'A ', 'green', ' leaf falls from the tree.', 'adjective', 'leaf'),
  pos('m-adj-09', 'middle', 'Lili puts a ', 'clean', ' plate on the table.', 'adjective', 'plate'),
  pos('m-adj-10', 'middle', 'The ', 'warm', ' soup is in a bowl.', 'adjective', 'soup'),
  pos('m-adj-11', 'middle', 'A ', 'long', ' rope lies on the floor.', 'adjective', 'rope'),
  pos('m-adj-12', 'middle', 'The ', 'loud', ' bell wakes Dodo.', 'adjective', 'bell'),

  pos('u-pos-01', 'upper', 'Please turn on the ', 'light', ' above the desk.', 'noun'),
  pos('u-pos-02', 'upper', 'This ', 'light', ' bag is easy to carry.', 'adjective', 'bag'),
  pos('u-pos-03', 'upper', 'The ', 'water', ' in the bottle is cold.', 'noun'),
  pos('u-pos-04', 'upper', 'We ', 'water', ' the plants every morning.', 'verb'),
  pos('u-pos-05', 'upper', 'The blue ', 'paint', ' is still wet.', 'noun'),
  pos('u-pos-06', 'upper', 'They ', 'paint', ' the fence every spring.', 'verb'),
  pos('u-pos-07', 'upper', 'The ', 'round', ' mirror hangs above the sink.', 'adjective', 'mirror'),
  pos('u-pos-08', 'upper', 'My ', 'watch', ' tells the time.', 'noun'),
  pos('u-pos-09', 'upper', 'We ', 'watch', ' birds through the window.', 'verb'),
  pos('u-pos-10', 'upper', 'A ', 'bright', ' lamp lights the room.', 'adjective', 'lamp'),
  pos('u-pos-11', 'upper', 'We ', 'book', ' a table at the restaurant every Friday.', 'verb'),
  pos('u-pos-12', 'upper', 'We found a ', 'quiet', ' corner for reading.', 'adjective', 'corner'),

  word('u-syn-01', 'synonym', 'The ', 'quick', ' rabbit won the race.', ['fast', 'late', 'round'], 0),
  word('u-syn-02', 'synonym', 'Lili feels ', 'happy', ' when her friend visits.', ['angry', 'glad', 'tired'], 1),
  word('u-syn-03', 'synonym', 'A ', 'small', ' insect sits on the leaf.', ['wide', 'hot', 'tiny'], 2),
  word('u-syn-04', 'synonym', 'The elephant is a ', 'large', ' animal.', ['big', 'thin', 'sour'], 0),
  word('u-syn-05', 'synonym', 'We ', 'begin', ' our lesson at nine.', ['hide', 'start', 'sleep'], 1),
  word('u-syn-06', 'synonym', 'We ', 'end', ' our game before dinner.', ['open', 'carry', 'finish'], 2),
  word('u-syn-07', 'synonym', 'The empty room was ', 'silent', '.', ['quiet', 'noisy', 'heavy'], 0),
  word('u-syn-08', 'synonym', 'Pip keeps the desk ', 'tidy', '.', ['messy', 'neat', 'hungry'], 1),
  word('u-syn-09', 'synonym', 'The ', 'clever', ' child solved the puzzle.', ['sleepy', 'wet', 'smart'], 2),
  word('u-syn-10', 'synonym', 'Dodo feels ', 'ill', ' and rests in bed.', ['sick', 'well', 'brave'], 0),
  word('u-syn-11', 'synonym', 'Lili gives Pip a ', 'gift', ' for his birthday.', ['pocket', 'present', 'cloud'], 1),
  word('u-syn-12', 'synonym', 'We followed a ', 'path', ' through the woods.', ['basket', 'bottle', 'trail'], 2),

  word('u-ant-01', 'antonym', 'The soup is ', 'hot', '.', ['cold', 'fresh', 'soft'], 0),
  word('u-ant-02', 'antonym', 'The shop is ', 'open', '.', ['busy', 'closed', 'bright'], 1),
  word('u-ant-03', 'antonym', 'Pip arrived ', 'early', ' for class.', ['quietly', 'safely', 'late'], 2),
  word('u-ant-04', 'antonym', 'The basket is ', 'full', ' of apples.', ['empty', 'heavy', 'round'], 0),
  word('u-ant-05', 'antonym', 'This puzzle is ', 'easy', ' to solve.', ['colorful', 'difficult', 'small'], 1),
  word('u-ant-06', 'antonym', 'This rope is ', 'strong', '.', ['long', 'new', 'weak'], 2),
  word('u-ant-07', 'antonym', 'The kitchen floor is ', 'clean', '.', ['dirty', 'smooth', 'wide'], 0),
  word('u-ant-08', 'antonym', 'The school is ', 'near', ', so we can walk there.', ['above', 'far', 'inside'], 1),
  word('u-ant-09', 'antonym', 'The water in this pool is ', 'shallow', '.', ['clear', 'warm', 'deep'], 2),
  word('u-ant-10', 'antonym', 'This road is ', 'wide', '.', ['narrow', 'busy', 'flat'], 0),
  word('u-ant-11', 'antonym', 'The guests ', 'arrive', ' before noon.', ['wait', 'leave', 'smile'], 1),
  word('u-ant-12', 'antonym', 'We ', 'push', ' the cart along the path.', ['wash', 'carry', 'pull'], 2),

  gap('u-gap-01', 'They ', ' football after school every day.', ['play', 'plays', 'playing'], 0, 'pluralVerb'),
  gap('u-gap-02', 'I ', ' my hands before lunch every day.', ['washes', 'wash', 'washing'], 1, 'pluralVerb'),
  gap('u-gap-03', 'The birds ', ' in the tree every morning.', ['sings', 'singing', 'sing'], 2, 'pluralVerb'),
  gap('u-gap-04', 'You ', ' a glass of water at lunch every day.', ['drink', 'drinks', 'drinking'], 0, 'pluralVerb'),
  gap('u-gap-05', 'He ', ' a book before bed every night.', ['read', 'reads', 'reading'], 1, 'singularVerb'),
  gap('u-gap-06', 'Dodo ', ' to the park every Sunday.', ['go', 'going', 'goes'], 2, 'singularVerb'),
  gap('u-gap-07', 'My brother ', ' the birds every morning.', ['watches', 'watch', 'watching'], 0, 'singularVerb'),
  gap('u-gap-08', 'Lili ', ' her bag to school every day.', ['carry', 'carries', 'carrying'], 1, 'singularVerb'),
  gap('u-gap-09', 'It ', ' cold here every winter.', ['are', 'am', 'is'], 2, 'beSingular'),
  gap('u-gap-10', 'The puppy ', ' hungry every morning.', ['is', 'are', 'am'], 0, 'beSingular'),
  gap('u-gap-11', 'They ', ' ready for school at eight every day.', ['is', 'are', 'am'], 1, 'bePlural'),
  gap('u-gap-12', 'We ', ' happy to see our friends every day.', ['am', 'is', 'are'], 2, 'bePlural'),
];

const questionsById = new Map(questionBank.map((question) => [question.id, question]));
export function getQuestion(id: string): Question | undefined { return questionsById.get(id); }
export function questionPrompt(kind: QuestionKind, lang: Language): string { return contentLocales[lang].prompts[kind]; }
export function choiceLabel(question: Question, index: 0 | 1 | 2, lang: Language): string {
  return question.kind === 'pos' ? contentLocales[lang].pos[index] : question.choices[index];
}
export function explainQuestion(question: Question, lang: Language): string {
  const values: Record<string, string> = { target: question.target, answer: question.choices[question.correct], describes: question.describes ?? '' };
  return contentLocales[lang].reasons[question.reason].replace(/\{(target|answer|describes)\}/g, (_, key: string) => values[key] ?? '');
}
