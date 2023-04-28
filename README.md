# Fetch Definitions

Fetch Definitions is a command-line tool to retrieve word definitions from [websters1913.com](https://www.websters1913.com) and save them in Obsidian Markdown format with callouts.

## Features

-   Fetch definitions for multiple words concurrently
-   Automatically lemmatize words to increase the chances of finding definitions
-   Save definitions for use in Obsidian.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/a-n-t-h-o-n-y/fetch-definitions.git
```

2. Change into the project directory:

```bash
cd fetch-definitions
```

3. Install the dependencies:

```bash
npm install
```

## Usage

Run the tool with the following command:

```bash
npm start -- <input-file> <output-location>
```

-   `<input-file>`: The path to the input `.txt` file containing the list of words, one word per line.
-   `<output-location>`: The directory or filepath where the Markdown file will be saved.

If a directory is given for `<output-location>` the output filename will be generated
from the input filename.

For example:

```bash
npm start -- input.txt ./out/book-i-am-reading.md
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
