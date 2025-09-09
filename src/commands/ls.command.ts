import { ShellEmulator } from '../shell-emulator'
import { BaseCommand } from './base-command'

export class LsCommand extends BaseCommand {
	getName(): string {
		return 'ls'
	}

	getDescription(): string {
		return 'List directory contents'
	}

	execute(args: string[], shell: ShellEmulator): { output: string; error?: boolean } {
		try {
			this.validateArgs(args, 0, 1)
			const path: string | undefined = args[0]
			const output = shell.getVFS().listDirectory(path)
			return { output }
		} catch (error) {
			return { output: `ls ${(error as Error).message}`, error: true }
		}
	}
}
