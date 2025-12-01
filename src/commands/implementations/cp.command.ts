import { ShellEmulator, IExecuteResponse } from '../../core/shell-emulator'
import { IBaseCommandOptions, BaseCommand } from '../core/base-command'

export interface ICpCommandOptions extends IBaseCommandOptions {
	recursive?: boolean
}

export class CpCommand extends BaseCommand {
	getName(): string {
		return 'cp'
	}

	getDescription(): string {
		return 'Copy files or directories\n\nUsage:\n  cp [-r] <source> <destination>\n\nArguments:\n  source         Source file or directory\n  destination    Destination path\n\nFlags:\n  -r, --recursive  Copy directories recursively\n  -h, --help       Show this help message'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args, 2, 3)

			const options: ICpCommandOptions = {
				help: false,
				recursive: false,
			}

			const paths: string[] = []
			for (const arg of args) {
				if (arg === '-h' || arg === '--help') options.help = true
				else if (arg === '-r' || arg === '--recursive') options.recursive = true
				else paths.push(arg)
			}

			if (options.help) return { output: this.getDescription() }

			shell
				.getFileSystem()
				.copyFileOrDirectory(paths[0], paths[1], { recursive: options.recursive })

			return { output: '' }
		} catch (error) {
			return { output: `cp: ${(error as Error).message}`, error: true }
		}
	}
}
