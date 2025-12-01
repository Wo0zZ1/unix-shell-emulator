import { ShellEmulator, IExecuteResponse } from '../../core/shell-emulator'
import { IBaseCommandOptions, BaseCommand } from '../core/base-command'

export interface IUnsetCommandOptions extends IBaseCommandOptions {}

export class UnsetCommand extends BaseCommand {
	getName(): string {
		return 'unset'
	}

	getDescription(): string {
		return 'Unsets environment variables'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args)

			const options: IUnsetCommandOptions = {
				help: false,
			}

			const envs: string[] = []

			for (const arg of args) {
				if (arg === '-h' || arg === '--help') options.help = true
				else envs.push(arg)
			}

			if (options.help) return { output: this.getDescription() }

			const envManager = shell.getEnvironmentManager()

			envs.forEach(env => {
				envManager.unset(env)
			})

			return { output: '' }
		} catch (error) {
			return { output: `unset: ${(error as Error).message}`, error: true }
		}
	}
}
