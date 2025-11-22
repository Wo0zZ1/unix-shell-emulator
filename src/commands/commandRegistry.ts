import { BaseCommand } from './base-command'

export class CommandRegistry {
	private commands: Map<string, new () => BaseCommand> = new Map()

	register(name: string, commandClass: new () => BaseCommand): void {
		this.commands.set(name.toLowerCase(), commandClass)
	}

	get(name: string): BaseCommand | null {
		const CommandClass = this.commands.get(name.toLowerCase())
		return CommandClass ? new CommandClass() : null
	}

	getAllNames(): string[] {
		return Array.from(this.commands.keys())
	}
}
