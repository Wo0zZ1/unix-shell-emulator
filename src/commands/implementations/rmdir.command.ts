import { ShellEmulator, IExecuteResponse } from '../../core/shell-emulator'
import { IBaseCommandOptions, BaseCommand } from '../core/base-command'

export interface IRmdirCommandOptions extends IBaseCommandOptions {
	parents: boolean
}

export class RmdirCommand extends BaseCommand {
	getName(): string {
		return 'rmdir'
	}

	getDescription(): string {
		return 'Delete an empty directory'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args, 1)
			const filePaths = args

			const options: IRmdirCommandOptions = {
				parents: false,
				help: false,
			}

			for (const arg of args) {
				if (arg === '-p' || arg === '--parents') options.parents = true
				else if (arg === '-h' || arg === '--help') options.help = true
			}

			if (options.help) return { output: this.getDescription() }

			const output: string[] = []
			for (const filePath of filePaths) {
				try {
					shell.getFileSystem().deleteDirectory(filePath, { parents: options.parents })
				} catch (error) {
					output.push(`failed to delete directory: ${(error as Error).message}`)
				}
			}

			return { output: output.join('\n') }
		} catch (error) {
			return { output: `rmdir: ${(error as Error).message}`, error: true }
		}
	}
}
