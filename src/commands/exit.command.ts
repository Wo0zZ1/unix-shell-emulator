import { ShellEmulator } from '../shell-emulator'
import { BaseCommand } from './base-command'

export class ExitCommand extends BaseCommand {
	getName(): string {
		return 'exit'
	}

	getDescription(): string {
		return 'Terminate the terminal emulator session'
	}

	execute(args: string[], shell: ShellEmulator): { output: string; error?: boolean } {
		try {
			this.validateArgs(args, 0, 0)
			shell.terminate()
			return { output: 'Exitting terminal...' }
		} catch (error) {
			return { output: `exit: ${(error as Error).message}`, error: true }
		}
	}
}
