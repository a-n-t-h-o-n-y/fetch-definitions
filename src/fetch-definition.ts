import * as cheerio from "cheerio";

/**
 * Fetches the definition(s) of a word from websters1913.com
 *
 * @param word The word to fetch the definition(s) of
 * @returns A promise that resolves to a tuple of the word and its definition(s)
 */
export async function fetchDefinition(
    word: string
): Promise<[string, string[]] | null> {
    const url = `https://www.websters1913.com/words/${word}`;
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Check for errors
    const httpStatusElement = $("h1.http-status");
    const httpStatusText = httpStatusElement.text();
    if (httpStatusText === "404") {
        return null;
    }

    const wordText = $("h1").text();
    const meaningTexts = $("meaning")
        .map((_, element) => $(element).html())
        .get();

    // Modify meanings for better formatting
    const modMeaningTexts = meaningTexts.map((meaningText) => {
        const firstSnIndex = meaningText.indexOf("<sn><b>");
        const firstDefIndex = meaningText.indexOf("<def>");

        if (firstSnIndex !== -1) {
            return (
                meaningText.slice(0, firstSnIndex) +
                "</p><p>" +
                meaningText.slice(firstSnIndex)
            );
        } else if (firstDefIndex !== -1) {
            return (
                meaningText.slice(0, firstDefIndex) +
                "</p><p>" +
                meaningText.slice(firstDefIndex)
            );
        }

        return meaningText;
    });

    return [wordText, modMeaningTexts];
}
