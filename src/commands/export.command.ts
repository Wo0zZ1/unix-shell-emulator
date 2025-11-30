import { IExecuteResponse, ShellEmulator } from '../shell-emulator'
import { BaseCommand, IBaseCommandOptions } from './base-command'

export interface IExportCommandOptions extends IBaseCommandOptions {}

export class ExportCommand extends BaseCommand {
	getName(): string {
		return 'export'
	}

	getDescription(): string {
		return 'Sets environment variables'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args)

			const options: IExportCommandOptions = {
				help: false,
			}

			const envParts: string[] = []

			for (const arg of args) {
				if (arg === '-h' || arg === '--help') options.help = true
				else envParts.push(arg)
			}

			if (options.help) return { output: this.getDescription() }

			const envManager = shell.getEnvironmentManager()

			if (envParts.length === 0) {
				const allVars = envManager.getAll()
				const outputLines = Object.entries(allVars).map(
					([key, value]) => `${key}='${value}'`,
				)
				return { output: outputLines.join('\n') }
			}

			envParts.forEach(part => {
				const [key, value] = part.split('=')
				envManager.set(key, value || '')
			})

			return { output: '' }
		} catch (error) {
			return { output: `export: ${(error as Error).message}`, error: true }
		}
	}
}
