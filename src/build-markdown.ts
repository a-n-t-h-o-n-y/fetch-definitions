import TurndownService from "turndown";

/**
 * Build markdown from word and meanings html
 * @param word The title word
 * @param meanings The individual meanings html
 * @returns The markdown
 */
export function buildMarkdown(word: string, meanings: string[]): string {
    const turndownService = new TurndownService();

    return meanings
        .map((meaning) => {
            const markdown = turndownService.turndown(meaning);
            const indentedLines = markdown
                .split("\n")
                .map((line) => `> ${line}`);
            return `>[!note]- ${word}\n${indentedLines.join("\n")}\n\n`;
        })
        .join("");
}
