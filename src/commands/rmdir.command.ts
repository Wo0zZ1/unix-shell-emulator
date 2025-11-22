import { IExecuteResponse, ShellEmulator } from '../shell-emulator'
import { BaseCommand, IBaseCommandOptions } from './base-command'

export interface IRmdirCommandOptions extends IBaseCommandOptions {
	parents: boolean
}

export class RmDirCommand extends BaseCommand {
	getName(): string {
		return 'rmdir'
	}

	getDescription(): string {
		return 'Remove an empty directory'
	}

	execute(args: string[], shell: ShellEmulator): IExecuteResponse {
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
					shell.getVFS().deleteDirectory(filePath)
				} catch (error) {
					output.push(`failed to remove directory: ${(error as Error).message}`)
				}
			}

			return { output: output.join('\n') }
		} catch (error) {
			return { output: `rmdir: ${(error as Error).message}`, error: true }
		}
	}
}
