import { CommandFactory } from './commands/command-factory'
import {
	AbstractExpandedCommand,
	AbstractParsedCommand,
	CommandParser,
	ExpandedCommand,
	ParsedCommand,
	ParsedCommandOrAbstract,
} from './command-parser'
import { VFS } from './vfs'
import { IFileSystemService } from './services/filesystem.interface'
import { FileSystemService } from './services/filesystem.service'
import { EnvironmentManager } from './environment-manager'

export interface IExtraCommandResponse {
	clearTerminal?: boolean
}

export interface IExecuteResponse {
	output: string
	error?: boolean
	extra?: IExtraCommandResponse
}

export class ShellEmulator {
	private envManager: EnvironmentManager
	private commandFactory = new CommandFactory()
	private fileSystem: IFileSystemService
	private vfs: VFS

	private isRunning: boolean = true

	constructor(vfs: VFS) {
		this.vfs = vfs
		this.fileSystem = new FileSystemService(vfs)
		this.envManager = new EnvironmentManager()
		this.initEnvironment()
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
				if (parsedCommand.command === undefined) continue

				const expandedCommand = this.expandCommand(parsedCommand)

				const commandExecutor = this.commandFactory.getCommand(expandedCommand.command)
				if (!commandExecutor)
					return {
						output: `Error: command not found: ${expandedCommand.command}`,
						error: true,
					}

				const result = await commandExecutor.execute(expandedCommand.args, this)

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

	public getEnvironmentManager(): EnvironmentManager {
		return this.envManager
	}

	private initEnvironment(): void {
		this.envManager.set('HOME', '/home')
		this.envManager.set('USER', 'user')
		this.envManager.set('PWD', this.getCurrentPath())
	}

	private expandCommand<T extends ParsedCommandOrAbstract>(
		cmd: T,
	): T extends AbstractParsedCommand ? AbstractExpandedCommand : ExpandedCommand {
		if (!cmd.command)
			return {
				command: undefined,
				args: undefined,
				redirectInput: cmd.redirectInput,
				redirectOutput: cmd.redirectOutput,
			} as T extends AbstractParsedCommand ? AbstractExpandedCommand : ExpandedCommand

		const expandedCommand = this.envManager.expand(
			cmd.command.value,
			cmd.command.quoted !== 'single',
		)
		const expandedArgs = cmd.args.map(arg =>
			this.envManager.expand(arg.value, arg.quoted !== 'single'),
		)

		return {
			command: expandedCommand,
			args: expandedArgs,
			redirectInput: cmd.redirectInput,
			redirectOutput: cmd.redirectOutput,
		} as T extends AbstractParsedCommand ? AbstractExpandedCommand : ExpandedCommand
	}
}
