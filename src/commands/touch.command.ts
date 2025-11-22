import { ShellEmulator } from '../shell-emulator'
import { BaseCommand, IBaseCommandOptions } from './base-command'

export interface ITouchCommandOptions extends IBaseCommandOptions {}

export class TouchCommand extends BaseCommand {
	getName(): string {
		return 'touch'
	}

	getDescription(): string {
		return 'Create an empty file(s)'
	}

	execute(args: string[], shell: ShellEmulator): { output: string; error?: boolean } {
		try {
			this.validateArgs(args, 1)

			const options: ITouchCommandOptions = {
				help: false,
			}

			const filePaths: string[] = []

			for (const arg of args) {
				if (arg === '-h' || arg === '--help') options.help = true
				else filePaths.push(arg)
			}

			if (options.help) return { output: this.getDescription() }

			const output: string[] = []
			for (const filePath of filePaths) {
				try {
					shell.getVFS().createFile(filePath)
				} catch (error) {
					output.push(`failed to create file: ${(error as Error).message}`)
				}
			}

			return { output: output.join('\n') }
		} catch (error) {
			return { output: `touch: ${(error as Error).message}`, error: true }
		}
	}
}
