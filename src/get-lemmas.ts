import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

const nlp = winkNLP(model);
const its = nlp.its;

/**
 * Generates the lemmas of a given word
 *
 * @param word The word to generate lemmas for
 * @returns A promise that resolves to an array of lemmas
 */
export async function getLemmas(word: string): Promise<string[]> {
    const tokens = nlp.readDoc(word).tokens();
    const lemmas = tokens.out(its.lemma);
    // if lemmas contains `word`, remove it
    return lemmas.filter((lemma) => lemma !== word);
}
