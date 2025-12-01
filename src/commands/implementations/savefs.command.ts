import { ShellEmulator, IExecuteResponse } from "../../core/shell-emulator"
import { IBaseCommandOptions, BaseCommand } from "../core/base-command"

export interface ISavefsCommandOptions extends IBaseCommandOptions {}

export class SavefsCommand extends BaseCommand {
	getName(): string {
		return 'savefs'
	}

	getDescription(): string {
		return 'Save the virtual file system to an XML file'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args, 0, 1)
			const fileName = args[0] || 'vfs-snapshot.xml'

			const options: ISavefsCommandOptions = {
				help: false,
			}

			for (const arg of args) {
				if (arg === '-h' || arg === '--help') options.help = true
			}

			if (options.help) return { output: this.getDescription() }

			const content = shell.getFileSystem().toXML()
			await shell.saveToFile(fileName, content)
			return { output: `Successfully saved to ${fileName}` }
		} catch (error) {
			return { output: `savefs: ${(error as Error).message}`, error: true }
		}
	}
}
