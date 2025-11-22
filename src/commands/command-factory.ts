import { CommandRegistry } from './command-registry'
import type { BaseCommand } from './base-command'

import { LsCommand } from './ls.command'
import { CdCommand } from './cd.command'
import { ExitCommand } from './exit.command'
import { PwdCommand } from './pwd.command'
import { MkdirCommand } from './mkdir.command'
import { RmdirCommand } from './rmdir.command'
import { TouchCommand } from './touch.command'
import { RmCommand } from './rm.command'
import { MvCommand } from './mv.command'
import { CatCommand } from './cat.command'
import { ClearCommand } from './clear.command'

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
	}

	public getCommand(name: string): BaseCommand | null {
		return this.commandRegistry.get(name)
	}
}
