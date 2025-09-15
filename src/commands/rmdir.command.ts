import { VFSError } from '../errors/vfs-error'
import { ShellEmulator } from '../shell-emulator'
import { BaseCommand } from './base-command'

export class RmDirCommand extends BaseCommand {
	getName(): string {
		return 'rmdir'
	}

	getDescription(): string {
		return 'Remove an empty dirrectory'
	}

	execute(args: string[], shell: ShellEmulator): { output: string; error?: boolean } {
		try {
			this.validateArgs(args, 1, 1)
			const path = args[0]
			const success = shell.getVFS().deleteDirectory(path)
			if (!success) throw new VFSError(`failed to remove directory ${path}`)
			return { output: '' }
		} catch (error) {
			return { output: `rmdir: ${(error as Error).message}`, error: true }
		}
	}
}
