import { CommandFactory } from './commands/command-factory'
import { CommandParser } from './command-parser'
import { VFS } from './vfs'

export interface IExecuteResponse {
	output: string
	error?: boolean
	extra?: { clearTerminal?: boolean }
}

export class ShellEmulator {
	private vfs: VFS
	private currentDirectory: string = '/'
	private isRunning: boolean = true
	private commandFactory = new CommandFactory()

	constructor(vfs: VFS) {
		this.vfs = vfs
	}

	public static async create(vfsPath?: string): Promise<ShellEmulator> {
		const vfs = new VFS()
		if (vfsPath) await vfs.loadFromXML(vfsPath)
		else vfs.loadDefault()
		return new ShellEmulator(vfs)
	}

	public execute(input: string): IExecuteResponse {
		input = input.trim()
		if (!input) return { output: '' }

		try {
			const { command, args } = CommandParser.parse(input)

			const commandExecutor = this.commandFactory.getCommand(command)

			if (!commandExecutor)
				return { output: `Error: command not found: ${command}`, error: true }

			return commandExecutor.execute(args, this)
		} catch (error) {
			return { output: `Error: ${(error as Error).message}`, error: true }
		}
	}

	public terminate(): void {
		this.isRunning = false
	}

	public getRunning(): boolean {
		return this.isRunning
	}

	public getCurrentDirectory(): string {
		return this.currentDirectory
	}

	public getVFS(): VFS {
		return this.vfs
	}
}
