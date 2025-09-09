import { ShellEmulator } from '../shell-emulator'
import { BaseCommand } from './base-command'

export class CdCommand extends BaseCommand {
	getName(): string {
		return 'cd'
	}

	getDescription(): string {
		return 'Change the current working directory'
	}

	execute(args: string[], shell: ShellEmulator): { output: string; error?: boolean } {
		try {
			this.validateArgs(args, 1, 1)
			shell.getVFS().changeDirectory(args[0])
			return { output: '' }
		} catch (error) {
			return { output: `cd: ${(error as Error).message}`, error: true }
		}
	}
}
