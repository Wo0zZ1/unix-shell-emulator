import {
	LsCommand,
	CdCommand,
	ExitCommand,
	PwdCommand,
	MkdirCommand,
	RmdirCommand,
	TouchCommand,
	RmCommand,
	MvCommand,
	CatCommand,
	ClearCommand,
	SavefsCommand,
	CpCommand,
	EchoCommand,
	ExportCommand,
	UnsetCommand,
	GrepCommand,
	HeadCommand,
	TailCommand,
} from '../implementations'
import { BaseCommand } from './base-command'
import { CommandRegistry } from './command-registry'

export class CommandFactory {
	private commandRegistry: CommandRegistry

	constructor() {
		this.commandRegistry = new CommandRegistry()
		this.initializeCommands()
	}

	private initializeCommands(): void {
		this.commandRegistry.register('ls', LsCommand)
		this.commandRegistry.register('cd', CdCommand)
		this.commandRegistry.register('exit', ExitCommand)
		this.commandRegistry.register('pwd', PwdCommand)
		this.commandRegistry.register('mkdir', MkdirCommand)
		this.commandRegistry.register('rmdir', RmdirCommand)
		this.commandRegistry.register('touch', TouchCommand)
		this.commandRegistry.register('rm', RmCommand)
		this.commandRegistry.register('mv', MvCommand)
		this.commandRegistry.register('cat', CatCommand)
		this.commandRegistry.register('clear', ClearCommand)
		this.commandRegistry.register('savefs', SavefsCommand)
		this.commandRegistry.register('cp', CpCommand)
		this.commandRegistry.register('echo', EchoCommand)
		this.commandRegistry.register('export', ExportCommand)
		this.commandRegistry.register('unset', UnsetCommand)
		this.commandRegistry.register('grep', GrepCommand)
		this.commandRegistry.register('head', HeadCommand)
		this.commandRegistry.register('tail', TailCommand)
	}

	public getCommand(name: string): BaseCommand | null {
		return this.commandRegistry.get(name)
	}

	public getCommandRegistry(): CommandRegistry {
		return this.commandRegistry
	}
}
