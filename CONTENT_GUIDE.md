# Learn5 Content Guide

This guide is the rulebook for writing Learn5 drops. It is used by:

- the **daily generator** `scripts/generate-drops.ts` (Groq AI, run by the cron job in
  `.github/workflows/generate-drops.yml`). Its instructions in `scripts/lib/prompt.ts` are a
  short version of this guide, so keep the two in step; and
- people writing drops by hand in `content/` (then run `npm run seed-drops`).

Both must follow it exactly. The technical shape of a drop is defined in
`src/lib/schema.ts`. That file is the single source of truth, and `npm run validate-content`
checks every rule marked **[checked]** below.

---

## 1. Who we write for

Learn5 is for ordinary people who want to get a little smarter every day. Many readers are
**weak in English**. Write so that a 12-year-old, or someone learning English, understands
on the first read.

- Use **simple English** and **short sentences** (aim for under 15 words).
- Use common words. If a technical word is needed, explain it right away in plain words.
  Example: "Friction (the force that slows things down when they rub) ..."
- Speak directly to the reader: "you", "your".
- Use everyday examples from normal life: cooking, shopping, travel, cricket, phones,
  money, weather, the human body.
- Be friendly and encouraging. Never make the reader feel stupid.

## 2. What is allowed

- **School-level, well-established facts only.** Use facts found in standard textbooks
  (NCERT Classes 6–10, for example) and major references.
- **Never** include politics, religion, medical advice, caste, current events, prices,
  "latest" records, or anything controversial or time-sensitive.
- No brand names, no real living people (historical scientists like Newton are fine).
- No trick questions. A question is hard because it needs more thinking, not because it is
  worded to fool the reader.
- If a fact has exceptions or is often disputed, do not use it.

## 3. The shape of a drop **[checked]**

A drop is one JSON file with exactly **5 items**, and takes about 5 minutes.

File path: `content/<category>/<YYYY-MM-DD>/drop-<n>.json` (n = 1, 2 or 3).
The `date`, `category` and `drop` inside the file must match the path.

| Rule            | Value                                                                            |
| --------------- | -------------------------------------------------------------------------------- |
| Number of items | exactly 5                                                                        |
| Item types      | 3 `mcq` + 1 `true_false` + 1 `fill_blank` **or** `fact_card`                     |
| Difficulty      | 2 `easy` + 2 `medium` + 1 `hard`                                                 |
| Item order      | from easiest to hardest: easy, easy, medium, medium, hard                        |
| Item ids        | `<category>-<date>-d<drop>-0<position>`, e.g. `physics-2026-11-08-d1-01` … `-05` |
| Topics          | all 5 different inside a drop                                                    |
| Title           | short and catchy, max 60 characters, e.g. "Forces All Around You"                |

### Item fields

| Field             | Used by                     | Rule                                                                                              |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------------------------- |
| `id`              | all                         | see above                                                                                         |
| `type`            | all                         | `mcq`, `true_false`, `fill_blank` or `fact_card`                                                  |
| `difficulty`      | all                         | `easy`, `medium` or `hard`                                                                        |
| `topic`           | all                         | short topic name, max 60 characters, e.g. "Newton's third law"                                    |
| `question`        | mcq, true_false, fill_blank | one clear question                                                                                |
| `fact`            | fact_card                   | the fact to learn (instead of `question`)                                                         |
| `options`         | mcq                         | exactly 4 different options                                                                       |
| `options`         | true_false                  | exactly `["True", "False"]`                                                                       |
| `answerIndex`     | mcq, true_false             | position of the right option, starting at 0                                                       |
| `answer`          | fill_blank                  | the missing word or number (short)                                                                |
| `acceptedAnswers` | fill_blank (optional)       | other spellings we also accept, e.g. `["twenty five"]`                                            |
| `explanation`     | all                         | 2–4 simple sentences, with an everyday example when possible                                      |
| `funFact`         | all (optional)              | one fun line, max 200 characters                                                                  |
| `source`          | all                         | a well-known reference, e.g. "NCERT Class 9 Science", "Britannica", "Oxford Learner's Dictionary" |

### Example item (mcq)

```json
{
  "id": "physics-2026-11-08-d1-01",
  "type": "mcq",
  "difficulty": "easy",
  "topic": "Unit of force",
  "question": "What is the SI unit of force?",
  "options": ["Joule", "Newton", "Watt", "Pascal"],
  "answerIndex": 1,
  "explanation": "Force is measured in newtons (N). One newton is about the weight of a small apple in your hand.",
  "funFact": "The unit is named after Isaac Newton.",
  "source": "NCERT Class 9 Science"
}
```

### Example item (fill_blank)

```json
{
  "id": "math-2026-11-08-d1-04",
  "type": "fill_blank",
  "difficulty": "medium",
  "topic": "Finding 10 percent",
  "question": "10% of 450 is ___.",
  "answer": "45",
  "explanation": "To find 10%, move the decimal point one place left. 450 becomes 45.0, so 10% of 450 is 45.",
  "source": "NCERT Class 8 Mathematics"
}
```

### Example item (fact_card)

```json
{
  "id": "biology-2026-11-08-d2-04",
  "type": "fact_card",
  "difficulty": "medium",
  "topic": "Red blood cells",
  "fact": "Red blood cells carry oxygen from your lungs to every part of your body.",
  "explanation": "They contain haemoglobin, a protein that holds oxygen and gives blood its red colour. ...",
  "source": "NCERT Class 10 Science"
}
```

## 4. Writing good questions

- **One idea per question.** Keep the question short.
- **MCQ wrong options must be believable but clearly wrong.** Use common mistakes and
  nearby ideas, never silly options. All 4 options should be about the same length and style.
- **Only one option may be correct.** Avoid "All of the above" and "None of the above".
- **Spread the right answer around.** Do not always put it in the same position.
  Across one drop, use at least 2 different `answerIndex` values for the 3 MCQs.
- **True/false:** the statement must be clearly true or clearly false. No "sometimes".
  Mix it up: about half true, half false over time.
- **Fill in the blank:** write `___` (three underscores) where the answer goes. The answer
  must be one word or one number that only fits one way. Add `acceptedAnswers` for other
  normal spellings (e.g. "20" and "twenty").
- **Fact card:** one surprising but true fact, stated in 1–2 sentences, with the
  explanation adding the "why".
- **Explanation:** 2–4 simple sentences. Say why the right answer is right. When useful,
  say why the most tempting wrong answer is wrong. Add an everyday example when possible.
- Use numbers that are easy to work with in your head unless the item is meant to be hard.

### Difficulty levels

- **easy** — most adults know this or can answer in under 10 seconds.
- **medium** — needs a moment of thought or a basic school concept.
- **hard** — needs a few steps of thinking or a less common (but still school-level) fact.

## 5. Category rules

| Category      | What to cover                                                                                                                                                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **English**   | Vocabulary (meanings, synonyms, opposites), grammar, common mistakes (e.g. "its/it's", "advice/advise"), idioms and phrases, correct word usage. Show the word inside a short example sentence.                                                               |
| **Math**      | Mental math tricks, everyday math (percentages, discounts, simple and compound interest, ratios, averages, time and speed, unit conversion), and basic concepts (fractions, primes, area). Show the working step by step in the explanation. Use ₹ for money. |
| **Reasoning** | Logic puzzles, number and letter series, analogies, coding-decoding, odd one out, directions, blood relations, simple syllogisms. The explanation MUST solve it **step by step** ("Step 1: … Step 2: …").                                                     |
| **Physics**   | Motion, force, energy, work, gravity, light, sound, heat, electricity, magnetism, simple machines — linked to daily life.                                                                                                                                     |
| **Chemistry** | Matter, atoms and molecules, elements and the periodic table, acids, bases and salts, metals and non-metals, everyday chemical reactions (rusting, cooking, cleaning). No instructions for dangerous experiments.                                             |
| **Biology**   | Cells, the human body, plants, animals, food and nutrition (as science, not diet advice), ecosystems, microorganisms. No medical advice — describe how the body works, never what someone should take or do for an illness.                                   |

## 6. No repeats **[checked]**

- **Never repeat a topic** used in the same category in the **last 30 days**. Before
  writing, read the `topic` of every item in `content/<category>/` for the last 30 days.
  Use a clearly different topic name, not the same topic with new words.
- **Never repeat a question** (in any category) from the **last 60 days**.
- Item ids must be unique across all content.

## 7. Fact-checking (do this for every item)

Before saving a drop, check each item one by one:

1. Is the marked answer definitely correct? Work it out again from scratch.
2. Are all the wrong options definitely wrong?
3. Is it a well-established, school-level fact that will not change?
4. Does the explanation agree with the answer, and are its numbers right?
5. Is the source a real, well-known reference that covers this fact?

If you are **not fully sure** about any item, **replace it** with an item you are sure
about. For math and reasoning, calculate every number twice.

## 8. Final checklist

- [ ] File is at `content/<category>/<YYYY-MM-DD>/drop-<n>.json`, and the file did not exist before.
- [ ] 5 items: 3 mcq, 1 true_false, 1 fill_blank or fact_card.
- [ ] Difficulty: easy, easy, medium, medium, hard (in that order).
- [ ] Ids are correct and in order 01–05.
- [ ] No topic repeated from the last 30 days in this category.
- [ ] Every item fact-checked; every explanation is 2–4 simple sentences.
- [ ] `npm run validate-content` passes.
- [ ] `npm run build-index` passes.
