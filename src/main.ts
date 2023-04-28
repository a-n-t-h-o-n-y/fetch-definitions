import * as fs from "fs/promises";
import * as path from "path";
import * as yargs from "yargs";
import { fetchDefinition } from "./fetch-definition";
import { buildMarkdown } from "./build-markdown";
import { PromisePool } from "@supercharge/promise-pool";
import { getLemmas } from "./get-lemmas";

interface Args {
    input: string;
    output: string;
}

async function parseCommandLineArgs(): Promise<Args> {
    const argv = await yargs
        .command(
            "$0 <input> <output>",
            "Fetches the definition(s) of a word from websters1913.com and outputs it in Markdown format",
            (yargs) => {
                return yargs
                    .positional("input", {
                        describe: "Input file path",
                        type: "string",
                        demandOption: true,
                    })
                    .positional("output", {
                        describe: "Output location (directory or .md file)",
                        type: "string",
                        demandOption: true,
                    });
            }
        )
        .strict()
        .help().argv;
    return {
        input: argv.input as string,
        output: argv.output as string,
    };
}

function buildFilepaths(args: Args): [string, string] {
    const { input, output } = args;
    // throw if input file doesn't have .txt extension
    if (path.extname(input) !== ".txt") {
        throw new Error("Input file must have .txt extension");
    }

    const inputFilename = path.basename(input);
    const inputExtension = path.extname(input);
    const outputFilename =
        path.extname(output) === ".md"
            ? path.basename(output)
            : inputFilename.replace(inputExtension, ".md");
    const outputDir =
        path.extname(output) === ".md" ? path.dirname(output) : output;
    const outputPath = path.join(outputDir, outputFilename);
    return [input, outputPath];
}

/**
 * Reads the input file, trims and normalizes the words, and returns a Set of unique words.
 *
 * @param filepath - The path of the input file.
 * @returns A Promise that resolves to a Set of unique words in the input file.
 */
async function readInput(filepath: string): Promise<string[]> {
    const input = await fs.readFile(filepath, "utf-8");

    return Array.from(
        input
            .split("\n")
            .map((word) => word.trim().toLowerCase())
            .filter((word) => word !== "")
            .reduce(
                (uniqueWords, word) => uniqueWords.add(word),
                new Set<string>()
            )
    );
}

async function main() {
    try {
        const args = await parseCommandLineArgs();
        const [inputPath, outputPath] = buildFilepaths(args);
        const words = await readInput(inputPath);

        // Look for definitions for a single word, if none found, look use lemmas.
        const processWord = async (
            word: string
        ): Promise<[string, string[]] | null> => {
            console.log(`Fetching definition for ${word}`);
            const definition = await fetchDefinition(word);

            if (definition) {
                return definition;
            }

            // Attempt more searches on the lemmas if fetchDefinition returns null
            const lemmas = await getLemmas(word);
            for (const lemma of lemmas) {
                console.log(`Fetching definition for lemma: ${lemma}`);
                const lemmaDefinition = await fetchDefinition(lemma);
                if (lemmaDefinition) {
                    return lemmaDefinition;
                }
            }

            return null;
        };

        // Use a promise pool to limit the number of concurrent promises
        // For each word, fetch the definition and build the markdown.
        const { results, errors } = await PromisePool.withConcurrency(10)
            .for(words)
            .process(async (word) => {
                const definition = await processWord(word);
                if (definition) {
                    const [wordText, meaningTexts] = definition;
                    const md = buildMarkdown(wordText, meaningTexts);
                    return md;
                } else {
                    throw new Error(`No definition found for ${word}`);
                }
            });

        // log errors to console
        if (errors.length > 0) console.error("\nErrors:");
        errors.forEach((err) => console.error(err.message));
        if (errors.length > 0) console.error();

        const percentSuccessful = Math.round(
            (results.length / words.length) * 100
        );
        console.log(
            `${errors.length} error(s) encountered out of ${words.length} words.` +
                `\n${percentSuccessful}% of words found.`
        );

        // Write results to the output file
        if (results.length > 0) {
            console.log(`\nWriting results to ${outputPath}`);
            await fs.writeFile(outputPath, results.join(""));
            console.log("Done!");
        }
    } catch (err) {
        console.error(err);
    }
}

main();
