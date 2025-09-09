import type { BaseCommand } from './base-command'

import { LsCommand } from './ls.command'
import { CdCommand } from './cd.command'
import { ExitCommand } from './exit.command'
import { PWDCommand } from './pwd.command'

export class CommandFactory {
	static createCommand(commandName: string): BaseCommand | null {
		const commandMap: { [key: string]: new () => BaseCommand } = {
			ls: LsCommand,
			cd: CdCommand,
			exit: ExitCommand,
			pwd: PWDCommand,
		}

		const CommandClass = commandMap[commandName.toLowerCase()]
		return CommandClass ? new CommandClass() : null
	}
}
