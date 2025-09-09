import { ShellEmulator } from '../shell-emulator'
import { BaseCommand } from './base-command'

export class PWDCommand extends BaseCommand {
	getName(): string {
		return 'pwd'
	}

	getDescription(): string {
		return 'Print working directory'
	}

	execute(args: string[], shell: ShellEmulator): { output: string; error?: boolean } {
		try {
			this.validateArgs(args, 0, 0)
			const output = shell.getVFS().getCurrentDirectory()
			return { output }
		} catch (error) {
			return { output: `pwd: ${(error as Error).message}`, error: true }
		}
	}
}
