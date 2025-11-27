import { IExecuteResponse, ShellEmulator } from '../shell-emulator'
import { BaseCommand } from './base-command'

export class ExitCommand extends BaseCommand {
	getName(): string {
		return 'exit'
	}

	getDescription(): string {
		return 'Terminate the terminal emulator session'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args, 0, 0)
			shell.terminate()
			return { output: 'Exitting terminal...' }
		} catch (error) {
			return { output: `exit: ${(error as Error).message}`, error: true }
		}
	}
}
