import { IExecuteResponse, ShellEmulator } from '../shell-emulator'
import { BaseCommand } from './base-command'

export class ClearCommand extends BaseCommand {
	getName(): string {
		return 'clear'
	}

	getDescription(): string {
		return 'Clear screen'
	}

	execute(args: string[], shell: ShellEmulator): IExecuteResponse {
		try {
			this.validateArgs(args, 0, 0)
			return { output: '', extra: { clearTerminal: true } }
		} catch (error) {
			return { output: `clear: ${(error as Error).message}`, error: true }
		}
	}
}
