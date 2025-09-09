import { CommandParser } from './command-parser'

export class ShellEmulator {
	private currentDirectory: string = '/'
	private isRunning: boolean = true

	public execute(input: string): string {
		input = input.trim()
		if (!input) return ''

		try {
			const { command, args } = CommandParser.parse(input)

			switch (command.toLowerCase()) {
				case 'ls':
					return this.handleLs(args)
				case 'cd':
					return this.handleCd(args)
				case 'exit':
					return this.handleExit()
				default:
					return `Error: command not found: ${command}`
			}
		} catch (error) {
			return `Error: ${(error as Error).message}`
		}
	}

	private handleLs(args: string[]): string {
		return `Command 'ls' executed with args: [${args.join(', ')}]`
	}

	private handleCd(args: string[]): string {
		return `Command 'cd' executed with args: [${args.join(', ')}]`
	}

	private handleExit(): string {
		this.isRunning = false
		return 'Exiting terminal...'
	}

	public getRunning(): boolean {
		return this.isRunning
	}

	public getCurrentDirectory(): string {
		return this.currentDirectory
	}
}
