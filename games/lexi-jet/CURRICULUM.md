# Lexi-Jet curriculum, draft 1

This bundle contains 84 fixed, original English practice items. It uses local strings and deterministic answer keys. It requires no runtime AI, speech synthesis, dictionary service or network request.

| Intended band | Skill | Items | Answer coverage |
| --- | --- | ---: | --- |
| Middle primary (candidate grades 3–4) | Part of speech in a sentence | 36 | 12 nouns, 12 action verbs, 12 adjectives |
| Upper primary (candidate grades 5–6) | Part of speech in a sentence | 12 | 4 nouns, 4 action verbs, 4 adjectives |
| Upper primary | Contextual synonyms | 12 | One closest meaning among three choices |
| Upper primary | Contextual antonyms | 12 | One opposite meaning among three choices |
| Upper primary | Simple present gaps | 12 | 4 base verbs, 4 third-person singular verbs, 2 singular `is`, 2 plural `are` |

The grade bands are design targets, not a verified reading level, school syllabus alignment or placement assessment. Learners' English experience varies by region and school. No teacher, child participant or native-language reviewer has validated this edition. English editorial and automated checks do not replace that review.

## Active flight content

The continuous-flight release selects only the48 part-of-speech items:36 middle and12 upper. The36 synonym, antonym and present-tense items are retained as tested future content; they do not appear in gameplay or wrong-word review. They are not advertised as current modes. Word cards show short context, with the full source sentence beside the flight; the selected beam classifies the highlighted use. No question modal or Continue gate interrupts flight.

## Teaching boundaries

Each question highlights one exact word in a complete English sentence. POS classification describes that use, not every use of the word. For example, `light` is a noun in “turn on the light” and an adjective in “This light bag”; `water`, `paint` and `watch` each appear in separate noun and verb contexts. `round` describes a clock or mirror; `book` is a verb with a table reservation. Every adjective item records the noun it describes, so feedback identifies the relationship.

The middle band uses familiar objects, animals, observable actions, colours and physical descriptions. The upper band introduces context-dependent word classes and a limited vocabulary of word relationships. Synonyms mean “almost the same here”; the game does not teach that two words are interchangeable in all sentences. Antonyms ask for opposite meaning in the supplied context; they are not sentence-replacement exercises. Distractors avoid a second synonym or antonym for the intended sense.

Gap items ask specifically for the simple present. Habitual time expressions support that tense. Distractors are incompatible verb forms for the subject, including present participles without an auxiliary. Coverage contrasts `I wash` and `You drink` with `He reads` and `Lili carries`, and includes `goes`, `watches`, `is` and `are`. Singular-form explanations explicitly name third-person singular subjects (he/she/it, a singular noun or a name), so the rule does not include `I`. This edition excludes past/future tenses, question formation, negation, modal verbs and the `I am` pattern.

The three POS answer positions always mean noun, verb and adjective. Word and gap items retain English answer words. Instructions, POS labels and short rule explanations are provided in English, Traditional Chinese, Spanish, Brazilian Portuguese, French, Arabic, Swahili, Indonesian and Hindi. These are draft instructional translations; regional appropriateness and native-language readability still need review. English learning material remains English in every UI language.

## Authoring and sources

The sentences and answer sets were authored for this game using stable, basic English grammar and vocabulary knowledge. They were not copied from a textbook, examination bank, dictionary or external corpus. No external source was consulted or claimed as curriculum validation. Repository requirements came from `docs/PRD.md`, `docs/ROADMAP.md`, the child-safety overrides in `docs/design-agents/README.md`, and the approved Lexi-Jet implementation plan.

The authoring review checks sentence sense, highlighted usage, answer agreement, unique choices and adjective referents. Automated tests protect the 84-item coverage, explicit editorial answer keys, known homograph contexts, all completed gap sentences, stable IDs and nine-language template completeness. These tests detect content regressions; they do not establish that every translation is idiomatic or that every learner will find a word familiar.

Before an education-quality claim or school rollout, ask English teachers to review the full sentence/answer/distractor sets, ask native-language reviewers to review each instructional locale, and observe children answering without hints. Record reviewer, date, locale and changes. Add new items only with a complete context, a single defensible answer and a checked explanation; do not generate unchecked questions during play.
