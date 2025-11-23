import { CommandFactory } from './commands/command-factory'
import { CommandParser } from './command-parser'
import { VFS } from './vfs'
import { IFileSystemService } from './services/filesystem.interface'
import { FileSystemService } from './services/filesystem.service'

export interface IExecuteResponse {
	output: string
	error?: boolean
	extra?: { clearTerminal?: boolean }
}

export class ShellEmulator {
	private commandFactory = new CommandFactory()
	private fileSystem: IFileSystemService

	private vfs: VFS
	private currentDirectory: string = '/'
	private isRunning: boolean = true

	constructor(vfs: VFS) {
		this.vfs = vfs
		this.fileSystem = new FileSystemService(vfs)
	}

	public static async create(vfsPath?: string): Promise<ShellEmulator> {
		let vfs: VFS
		if (vfsPath) vfs = await VFS.loadFromXML(vfsPath)
		else vfs = VFS.loadDefault()
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

	public getFileSystem(): IFileSystemService {
		return this.fileSystem
	}

	public getVFS(): VFS {
		return this.vfs
	}
}
