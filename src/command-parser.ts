interface RedirectOutput {
	type: '>' | '>>'
	file: string
}

interface Redirects {
	redirectOutput?: RedirectOutput
	redirectInput?: string
}

export type ParsedCommand = Redirects &
	(
		| {
				command?: undefined
				args?: undefined
		  }
		| {
				command: string
				args: string[]
		  }
	)

export class CommandParser {
	private static tokenize(input: string): string[] {
		input = input.trim()
		const tokens: string[] = []

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
					tokens.push(current)
					current = ''
					continue
				}
			} else if (!inQuotes && `\ \| \< \>`.includes(char)) {
				// Space, |, >, >, >>
				if (current !== '') {
					tokens.push(current)
					current = ''
				}

				if (char === '|') tokens.push('|')
				else if (char === '<') tokens.push('<')
				else if (char === '>') {
					if (input[i + 1] === '>') {
						i++
						tokens.push('>>')
					} else {
						tokens.push('>')
					}
				}
			} else current += char
		}

		if (current) tokens.push(current)

		if (inQuotes) throw new Error('Unclosed quotes in command')

		return tokens
	}

	private static splitByPipe(tokens: string[]): string[][] {
		const parts = []
		let lastI = 0
		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i] === '|') {
				if (lastI === i) throw new Error("Two consecutive '|' symbols") // TODO: может убрать?
				parts.push(tokens.slice(lastI, i))
				lastI = i + 1
			}
		}
		if (lastI < tokens.length) parts.push(tokens.slice(lastI))
		return parts
	}

	private static extractRedirects(pipes: string[][]): {
		pipeTokens: string[]
		redirects: Redirects
	}[] {
		const elements: {
			pipeTokens: string[]
			redirects: Redirects
		}[] = []

		for (const pipe of pipes) {
			const redirects: Redirects = {}

			for (let i = 0; i < pipe.length - 1; i++) {
				if (pipe[i] === '<') {
					redirects.redirectInput = pipe[i + 1]
					pipe.splice(i, 2)
					i--
				} else if (pipe[i] === '>') {
					redirects.redirectOutput = { type: '>', file: pipe[i + 1] }
					pipe.splice(i, 2)
					i--
				} else if (pipe[i] === '>>') {
					redirects.redirectOutput = { type: '>>', file: pipe[i + 1] }
					pipe.splice(i, 2)
					i--
				}
			}

			if (/<|>|>>/.test(pipe[pipe.length - 1]))
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
			pipeTokens: string[]
			redirects: Redirects
		}[],
	): ParsedCommand[] {
		const commands: ParsedCommand[] = []

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

	public static parse(input: string): ParsedCommand[] {
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
