import { ShellEmulator, IExecuteResponse } from '../../core/shell-emulator'
import { IBaseCommandOptions, BaseCommand } from '../core/base-command'

export interface IMvCommandOptions extends IBaseCommandOptions {}

export class MvCommand extends BaseCommand {
	getName(): string {
		return 'mv'
	}

	getDescription(): string {
		return 'Move files and directories\n\nUsage:\n  mv <source>... <destination>\n\nArguments:\n  source         Source file(s) or directory\n  destination    Destination path'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args, 2)

			const paths: string[] = []

			const options: IMvCommandOptions = {
				help: false,
			}

			for (const arg of args) {
				if (arg === '-h' || arg === '--help') options.help = true
				else paths.push(arg)
			}

			if (options.help) return { output: this.getDescription() }

			const sourcePaths = paths.slice(0, -1)
			const destPath = paths[paths.length - 1]

			const output: string[] = []
			for (const sourcePath of sourcePaths) {
				try {
					shell.getFileSystem().moveFileOrDirectory(sourcePath, destPath, {
						rename: sourcePaths.length === 1,
					})
				} catch (error) {
					output.push(`failed to move: ${(error as Error).message}`)
				}
			}

			return { output: output.join('\n') }
		} catch (error) {
			return { output: `mv: ${(error as Error).message}`, error: true }
		}
	}
}
