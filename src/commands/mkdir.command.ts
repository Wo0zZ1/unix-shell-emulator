import { IExecuteResponse, ShellEmulator } from '../shell-emulator'
import { BaseCommand, IBaseCommandOptions } from './base-command'

export interface IMkdirCommandOptions extends IBaseCommandOptions {
	parents: boolean
}

export class MkdirCommand extends BaseCommand {
	getName(): string {
		return 'mkdir'
	}

	getDescription(): string {
		return 'Create an empty directory(s)'
	}

	execute(args: string[], shell: ShellEmulator): IExecuteResponse {
		try {
			this.validateArgs(args, 1)

			const options: IMkdirCommandOptions = {
				parents: false,
				help: false,
			}

			const filePaths: string[] = []

			for (const arg of args) {
				if (arg === '-p' || arg === '--parents') options.parents = true
				else if (arg === '-h' || arg === '--help') options.help = true
				else filePaths.push(arg)
			}

			if (options.help) return { output: this.getDescription() }

			const output: string[] = []
			for (const filePath of filePaths) {
				try {
					shell.getVFS().createDirectory(filePath, options)
				} catch (error) {
					output.push(`failed to create directory: ${(error as Error).message}`)
				}
			}

			return { output: output.join('\n') }
		} catch (error) {
			return { output: `mkdir: ${(error as Error).message}`, error: true }
		}
	}
}
