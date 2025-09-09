export class CommandParser {
	public static parse(input: string): { command: string; args: string[] } {
		input = input.trim()
		if (input === '') return { command: '', args: [] }

		const tokens: string[] = []
		let currentToken: string = ''
		let inQuotes: Boolean = false

		for (let i = 0; i < input.length; i++)
			if ('\'"'.includes(input[i]))
				if (inQuotes) {
					inQuotes = false
					tokens.push(currentToken)
					currentToken = ''
				} else inQuotes = true
			else if (inQuotes) currentToken += input[i]
			else if (input[i] === ' ') {
				if (currentToken !== '') {
					tokens.push(currentToken)
					currentToken = ''
				}
			} else currentToken += input[i]
		currentToken !== '' && tokens.push(currentToken)

		if (inQuotes) throw new Error('Unclosed quotes in command')

		return { command: tokens[0], args: tokens.slice(1) }
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
