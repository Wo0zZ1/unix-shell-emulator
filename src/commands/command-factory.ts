import { CommandRegistry } from './command-registry'
import type { BaseCommand } from './base-command'
import { LsCommand } from './ls.command'
import { CatCommand } from './cat.command'
import { CdCommand } from './cd.command'
import { ClearCommand } from './clear.command'
import { CpCommand } from './cp.command'
import { EchoCommand } from './echo.command'
import { ExitCommand } from './exit.command'
import { ExportCommand } from './export.command'
import { GrepCommand } from './grep.command'
import { HeadCommand } from './head.command'
import { MkdirCommand } from './mkdir.command'
import { MvCommand } from './mv.command'
import { PwdCommand } from './pwd.command'
import { RmCommand } from './rm.command'
import { RmdirCommand } from './rmdir.command'
import { SavefsCommand } from './savefs.command'
import { TailCommand } from './tail.command'
import { TouchCommand } from './touch.command'
import { UnsetCommand } from './unset.command'

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
