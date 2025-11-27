import { IExecuteResponse, ShellEmulator } from '../shell-emulator'
import { BaseCommand } from './base-command'

export class PwdCommand extends BaseCommand {
	getName(): string {
		return 'pwd'
	}

	getDescription(): string {
		return 'Print working directory'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args, 0, 0)
			const currentPath = shell.getFileSystem().getCurrentPath()
			return { output: currentPath }
		} catch (error) {
			return { output: `pwd: ${(error as Error).message}`, error: true }
		}
	}
}
