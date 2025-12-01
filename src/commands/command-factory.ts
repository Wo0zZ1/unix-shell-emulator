import { CommandRegistry } from './command-registry'
import type { BaseCommand } from './base-command'

export class CommandFactory {
	private commandRegistry: CommandRegistry

	constructor() {
		this.commandRegistry = new CommandRegistry()
		this.initializeCommands()
	}

	private initializeCommands(): void {
		this.commandRegistry.register('ls', require('./ls.command').LsCommand)
		this.commandRegistry.register('cd', require('./cd.command').CdCommand)
		this.commandRegistry.register('exit', require('./exit.command').ExitCommand)
		this.commandRegistry.register('pwd', require('./pwd.command').PwdCommand)
		this.commandRegistry.register('mkdir', require('./mkdir.command').MkdirCommand)
		this.commandRegistry.register('rmdir', require('./rmdir.command').RmdirCommand)
		this.commandRegistry.register('touch', require('./touch.command').TouchCommand)
		this.commandRegistry.register('rm', require('./rm.command').RmCommand)
		this.commandRegistry.register('mv', require('./mv.command').MvCommand)
		this.commandRegistry.register('cat', require('./cat.command').CatCommand)
		this.commandRegistry.register('clear', require('./clear.command').ClearCommand)
		this.commandRegistry.register('savefs', require('./savefs.command').SavefsCommand)
		this.commandRegistry.register('cp', require('./cp.command').SaveCpCommand)
		this.commandRegistry.register('echo', require('./echo.command').EchoCommand)
		this.commandRegistry.register('export', require('./export.command').ExportCommand)
		this.commandRegistry.register('unset', require('./unset.command').UnsetCommand)
		this.commandRegistry.register('grep', require('./grep.command').GrepCommand)
	}

	public getCommand(name: string): BaseCommand | null {
		return this.commandRegistry.get(name)
	}
}
