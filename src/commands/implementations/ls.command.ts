import { ShellEmulator, IExecuteResponse } from '../../core/shell-emulator'
import { IBaseCommandOptions, BaseCommand } from '../core/base-command'

export interface ILsCommandOptions extends IBaseCommandOptions {}

export class LsCommand extends BaseCommand {
	getName(): string {
		return 'ls'
	}

	getDescription(): string {
		return 'List directory contents\n\nUsage:\n  ls [path]\n\nArguments:\n  path    Directory path (default: current directory)'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args, 0, 1)
			const path = args[0] as string | undefined

			const options: ILsCommandOptions = {
				help: false,
			}

			for (const arg of args) {
				if (arg === '-h' || arg === '--help') options.help = true
			}

			if (options.help) return { output: this.getDescription() }

			const output = shell.getFileSystem().listDirectory(path)
			return { output }
		} catch (error) {
			return { output: `ls ${(error as Error).message}`, error: true }
		}
	}
}
