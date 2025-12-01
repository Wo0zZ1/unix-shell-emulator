import { ShellEmulator, IExecuteResponse } from '../../core/shell-emulator'
import { BaseCommand } from '../core/base-command'

export class CdCommand extends BaseCommand {
	getName(): string {
		return 'cd'
	}

	getDescription(): string {
		return 'Change the current working directory\n\nUsage:\n  cd <directory>\n\nArguments:\n  directory    Target directory path'
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
