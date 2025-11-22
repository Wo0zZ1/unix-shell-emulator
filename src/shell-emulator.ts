import { CommandParser } from './command-parser'
import { CommandFactory } from './commands/command-factory'
import { VFSError } from './errors/vfs-error'
import { VFS } from './vfs'

export interface IExecuteResponse {
	output: string
	error?: boolean
	extra?: { clearTerminal?: boolean }
}

export class ShellEmulator {
	private currentDirectory: string = '/'
	private isRunning: boolean = true
	private vfs?: VFS

	constructor() {}

	public async loadVFS(VFSPath?: string): Promise<void> {
		this.vfs = new VFS()
		if (VFSPath) return await this.vfs.loadFromXML(VFSPath)
		this.vfs.loadDefault()
	}

	public execute(input: string): IExecuteResponse {
		input = input.trim()
		if (!input) return { output: '' }

		try {
			const { command, args } = CommandParser.parse(input)

			if (!this.vfs) throw new VFSError("VFS isn't loaded")
			const commandExecutor = CommandFactory.createCommand(command)

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
		if (!this.vfs) throw new VFSError("VFS isn't loaded")
		return this.vfs
	}
}
