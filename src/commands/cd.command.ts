import { IExecuteResponse, ShellEmulator } from '../shell-emulator'
import { BaseCommand } from './base-command'

export class CdCommand extends BaseCommand {
	getName(): string {
		return 'cd'
	}

	getDescription(): string {
		return 'Change the current working directory'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args, 1, 1)
			shell.getFileSystem().changeDirectory(args[0])
			shell.getEnvironmentManager().set('PWD', shell.getFileSystem().getCurrentPath())
			return { output: '' }
		} catch (error) {
			return { output: `cd: ${(error as Error).message}`, error: true }
		}
	}
}
