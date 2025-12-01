import { ShellEmulator, IExecuteResponse } from '../../core'
import { BaseCommand } from '../core'

export class HelpCommand extends BaseCommand {
	getName(): string {
		return 'help'
	}

	getDescription(): string {
		return 'Display information about available commands\n\nUsage:\n  help [command]\n\nArguments:\n  command    Show detailed help for specific command'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args, 0, 1)

			const registry = shell.getCommandRegistry()
			const commandNames = registry.getAllNames().sort()

			if (args.length === 1) {
				const commandName = args[0]
				const command = registry.get(commandName)

				if (!command) {
					return {
						output: `help: no help topics match '${commandName}'`,
						error: true,
					}
				}

				return {
					output: `${command.getName()}: ${command.getDescription()}`,
				}
			}

			const output: string[] = ['Available commands:']

			output.push(commandNames.join('\t'))

			output.push('Type "help <command>" for more information on a specific command.')

			return { output: output.join('\n') }
		} catch (error) {
			return { output: `help: ${(error as Error).message}`, error: true }
		}
	}
}
