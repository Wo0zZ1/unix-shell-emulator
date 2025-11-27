import { CommandFactory } from './commands/command-factory'
import { CommandParser } from './command-parser'
import { VFS } from './vfs'
import { IFileSystemService } from './services/filesystem.interface'
import { FileSystemService } from './services/filesystem.service'

export interface IExtraCommandResponse {
	clearTerminal?: boolean
}

export interface IExecuteResponse {
	output: string
	error?: boolean
	extra?: IExtraCommandResponse
}

export class ShellEmulator {
	private commandFactory = new CommandFactory()
	private fileSystem: IFileSystemService
	private vfs: VFS

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

	public async execute(input: string): Promise<IExecuteResponse> {
		input = input.trim()
		if (!input) return { output: '' }

		try {
			const parsedCommands = CommandParser.parse(input)

			let stdout = ''
			let extraCommandResponse: IExtraCommandResponse | undefined

			for (const parsedCommand of parsedCommands) {
				if (!parsedCommand.command) continue

				const commandExecutor = this.commandFactory.getCommand(parsedCommand.command)
				if (!commandExecutor)
					return {
						output: `Error: command not found: ${parsedCommand.command}`,
						error: true,
					}

				const result = await commandExecutor.execute(parsedCommand.args, this)

				stdout = result.output
				extraCommandResponse = result.extra

				if (result.error) continue
			}

			return { output: stdout, extra: extraCommandResponse }
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

	public getCurrentPath(): string {
		return this.vfs.getCurrentPath()
	}

	public getFileSystem(): IFileSystemService {
		return this.fileSystem
	}

	public async saveToFile(fileName: string, content: string): Promise<void> {
		await window.electronAPI.saveFile(fileName, content)
	}
}
