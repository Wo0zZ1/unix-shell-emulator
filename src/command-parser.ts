interface RedirectOutput {
	type: '>' | '>>'
	file: string
}

interface Redirects {
	redirectOutput?: RedirectOutput
	redirectInput?: string
}

export interface Token {
	value: string
	quoted: false | 'single' | 'double'
}

export interface AbstractParsedCommand extends Redirects {
	command?: undefined
	args?: undefined
}

export interface ParsedCommand extends Redirects {
	command: Token
	args: Token[]
}

export type ParsedCommandOrAbstract = ParsedCommand | AbstractParsedCommand

export interface AbstractExpandedCommand extends Redirects {
	command?: undefined
	args?: undefined
}

export interface ExpandedCommand extends Redirects {
	command: string
	args: string[]
}

export type ExpandedCommandOrAbstract = ExpandedCommand | AbstractExpandedCommand

export class CommandParser {
	private static tokenize(input: string): Token[] {
		input = input.trim()
		const tokens: Token[] = []

		let current: string = ''
		let inQuotes: Boolean = false
		let quoteChar = ''

		for (let i = 0; i < input.length; i++) {
			const char = input[i]

			if (char === `"` || char === `'`) {
				if (!inQuotes) {
					inQuotes = true
					quoteChar = char
				} else if (char === quoteChar) {
					inQuotes = false
					tokens.push({ value: current, quoted: quoteChar === `"` ? 'double' : 'single' })
					current = ''
					continue
				}
			} else if (!inQuotes && `\ \| \< \>`.includes(char)) {
				// Space, |, >, >, >>
				if (current !== '') {
					tokens.push({ value: current, quoted: false })
					current = ''
				}

				if (char === '|') tokens.push({ value: '|', quoted: false })
				else if (char === '<') tokens.push({ value: '<', quoted: false })
				else if (char === '>') {
					if (input[i + 1] === '>') {
						i++
						tokens.push({ value: '>>', quoted: false })
					} else {
						tokens.push({ value: '>', quoted: false })
					}
				}
			} else current += char
		}

		if (current) tokens.push({ value: current, quoted: false })

		if (inQuotes) throw new Error('Unclosed quotes in command')

		return tokens
	}

	private static splitByPipe(tokens: Token[]): Token[][] {
		const parts: Token[][] = []
		let lastI = 0
		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i].value === '|') {
				if (lastI === i) throw new Error("Two consecutive '|' symbols") // TODO: может убрать?
				parts.push(tokens.slice(lastI, i))
				lastI = i + 1
			}
		}
		if (lastI < tokens.length) parts.push(tokens.slice(lastI))
		return parts
	}

	private static extractRedirects(pipes: Token[][]): {
		pipeTokens: Token[]
		redirects: Redirects
	}[] {
		const elements: {
			pipeTokens: Token[]
			redirects: Redirects
		}[] = []

		for (const pipe of pipes) {
			const redirects: Redirects = {}

			for (let i = 0; i < pipe.length - 1; i++) {
				if (pipe[i].value === '<') {
					redirects.redirectInput = pipe[i + 1].value
					pipe.splice(i, 2)
					i--
				} else if (pipe[i].value === '>') {
					redirects.redirectOutput = { type: '>', file: pipe[i + 1].value }
					pipe.splice(i, 2)
					i--
				} else if (pipe[i].value === '>>') {
					redirects.redirectOutput = { type: '>>', file: pipe[i + 1].value }
					pipe.splice(i, 2)
					i--
				}
			}

			if (/<|>|>>/.test(pipe[pipe.length - 1]?.value))
				throw new Error('Redirect symbol at the end of pipe')

			elements.push({
				pipeTokens: pipe,
				redirects,
			})
		}

		return elements
	}

	private static parseCommandsFromPipesWithRedirects(
		pipesWithRedirects: {
			pipeTokens: Token[]
			redirects: Redirects
		}[],
	): ParsedCommandOrAbstract[] {
		const commands: ParsedCommandOrAbstract[] = []

		for (const pipeWithRedirects of pipesWithRedirects) {
			if (pipeWithRedirects.pipeTokens.length === 0)
				commands.push(pipeWithRedirects.redirects)
			else
				commands.push({
					command: pipeWithRedirects.pipeTokens[0],
					args: pipeWithRedirects.pipeTokens.slice(1),
					...pipeWithRedirects.redirects,
				})
		}

		return commands
	}

	public static parse(input: string): ParsedCommandOrAbstract[] {
		const tokens = this.tokenize(input)
		const pipes = this.splitByPipe(tokens)
		const pipesWithRedirects = this.extractRedirects(pipes)
		const commands = this.parseCommandsFromPipesWithRedirects(pipesWithRedirects)

		return commands
	}

	public static testParser(): void {
		const testCases = [
			'ls -la',
			'cd "My Documents"',
			'echo \'Hello World"',
			'command with "multiple quoted" arguments',
			'cd "C:\\Program Files\\"',
			'echo "unclosed quote',
			'ls    -l   -a  .',
			'',
		]

		console.log('Testing command parser:')
		testCases.forEach((testCase, index) => {
			try {
				const result = CommandParser.parse(testCase)
				console.log(`Test ${index + 1}: "${testCase}" ->`, result)
			} catch (error) {
				console.log(
					`Test ${index + 1}: "${testCase}" -> ERROR:`,
					(error as Error).message,
				)
			}
		})
	}
}
