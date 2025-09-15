import type { BaseCommand } from './base-command'

import { LsCommand } from './ls.command'
import { CdCommand } from './cd.command'
import { ExitCommand } from './exit.command'
import { PWDCommand } from './pwd.command'
import { RmDirCommand } from './rmdir.command'
import { MvCommand } from './mv.command'

export class CommandFactory {
	static createCommand(commandName: string): BaseCommand | null {
		const commandMap: { [key: string]: new () => BaseCommand } = {
			ls: LsCommand,
			cd: CdCommand,
			exit: ExitCommand,
			pwd: PWDCommand,
			rmdir: RmDirCommand,
			mv: MvCommand,
		}

		const CommandClass = commandMap[commandName.toLowerCase()]
		return CommandClass ? new CommandClass() : null
	}
}
