/** What the user answered for one item in the quiz. */
export interface ItemAnswer {
  correct: boolean;
  /** Text of the chosen option or the typed answer (null for fact cards). */
  given: string | null;
  /** Index of the chosen option (mcq / true_false only). */
  choiceIndex: number | null;
}
