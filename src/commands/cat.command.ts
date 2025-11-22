import { IExecuteResponse, ShellEmulator } from '../shell-emulator'
import { BaseCommand, IBaseCommandOptions } from './base-command'

export interface ICatCommandOptions extends IBaseCommandOptions {}

export class CatCommand extends BaseCommand {
	getName(): string {
		return 'cat'
	}

	getDescription(): string {
		return "Print the file's content"
	}

	execute(args: string[], shell: ShellEmulator): IExecuteResponse {
		try {
			this.validateArgs(args, 1, 1)
			const path = args[0]

			const options: ICatCommandOptions = {
				help: false,
			}

			for (const arg of args) {
				if (arg === '-h' || arg === '--help') options.help = true
			}

			if (options.help) return { output: this.getDescription() }

			const content = shell.getVFS().catFile(path)
			return { output: content }
		} catch (error) {
			return { output: `cat: ${(error as Error).message}`, error: true }
		}
	}
}
