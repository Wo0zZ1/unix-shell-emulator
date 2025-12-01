import { ShellEmulator, IExecuteResponse } from '../../core/shell-emulator'
import { IBaseCommandOptions, BaseCommand } from '../core/base-command'

export interface IEchoCommandOptions extends IBaseCommandOptions {}

export class EchoCommand extends BaseCommand {
	getName(): string {
		return 'echo'
	}

	getDescription(): string {
		return 'Displays a line of text\n\nUsage:\n  echo [text]...\n\nArguments:\n  text    Text to display'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args)

			const options: IEchoCommandOptions = {
				help: false,
			}

			const inputParts: string[] = []

			for (const arg of args) {
				if (arg === '-h' || arg === '--help') options.help = true
				else inputParts.push(arg)
			}

			if (options.help) return { output: this.getDescription() }

			const output = inputParts.join('')
			return { output: output }
		} catch (error) {
			return { output: `echo: ${(error as Error).message}`, error: true }
		}
	}
}
