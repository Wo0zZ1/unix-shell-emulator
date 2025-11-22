import { VFSError } from '../errors/vfs-error'
import { IExecuteResponse, ShellEmulator } from '../shell-emulator'
import { BaseCommand, IBaseCommandOptions } from './base-command'

export interface IMvCommandOptions extends IBaseCommandOptions {}

export class MvCommand extends BaseCommand {
	getName(): string {
		return 'mv'
	}

	getDescription(): string {
		return 'Move files and directories'
	}

	execute(args: string[], shell: ShellEmulator): IExecuteResponse {
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
					shell
						.getVFS()
						.moveFileOrDirectory(sourcePath, destPath, sourcePaths.length === 1)
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
