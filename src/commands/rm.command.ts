import { ShellEmulator } from '../shell-emulator'
import { BaseCommand, IBaseCommandOptions } from './base-command'
import { ILsCommandOptions } from './ls.command'

export interface IRmCommandOptions extends IBaseCommandOptions {
	recursive: boolean
}

export class RmCommand extends BaseCommand {
	getName(): string {
		return 'rm'
	}

	getDescription(): string {
		return 'Remove files or directories (use -r for directories)'
	}

	execute(args: string[], shell: ShellEmulator): { output: string; error?: boolean } {
		try {
			this.validateArgs(args, 1)

			const options: IRmCommandOptions = { recursive: false, help: false }
			const filePaths: string[] = []

			for (const arg of args) {
				if (arg === '-r' || arg === '--recursive') options.recursive = true
				else if (arg === '-h' || arg === '--help') options.help = true
				else filePaths.push(arg)
			}

			if (options.help) return { output: this.getDescription() }

			const output: string[] = []
			for (const filePath of filePaths) {
				try {
					shell.getVFS().deleteFileOrDirectory(filePath, options)
				} catch (error) {
					output.push(
						`failed to remove directory ${filePath}: ${(error as Error).message}`,
					)
				}
			}

			return { output: output.join('\n') }
		} catch (error) {
			return { output: `rm: ${(error as Error).message}`, error: true }
		}
	}
}
