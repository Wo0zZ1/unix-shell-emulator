import { VFSError } from '../errors/vfs-error'
import { ShellEmulator } from '../shell-emulator'
import { BaseCommand } from './base-command'

export class MvCommand extends BaseCommand {
	getName(): string {
		return 'mv'
	}

	getDescription(): string {
		return 'Move files and directories'
	}

	execute(args: string[], shell: ShellEmulator): { output: string; error?: boolean } {
		try {
			this.validateArgs(args, 2, 2)

			const sourcePath = args[0]
			const destPath = args[1]
			const success = shell.getVFS().moveNode(sourcePath, destPath)

			if (!success) throw new VFSError(`failed to move ${sourcePath} to ${destPath}`)

			return { output: '' }
		} catch (error) {
			return { output: `mv: ${(error as Error).message}`, error: true }
		}
	}
}
