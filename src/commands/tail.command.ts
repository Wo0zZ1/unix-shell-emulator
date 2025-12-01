import { match } from 'assert'
import { IExecuteResponse, ShellEmulator } from '../shell-emulator'
import { BaseCommand, IBaseCommandOptions } from './base-command'

export interface ITailCommandOptions extends IBaseCommandOptions {
	numberOfLines: number
}

export class TailCommand extends BaseCommand {
	getName(): string {
		return 'tail'
	}

	getDescription(): string {
		return 'Print last 10 lines of FILEs (or stdin)'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args, 1)

			const options: ITailCommandOptions = {
				help: false,
				numberOfLines: 10,
			}

			const filePaths: string[] = []

			for (let i = 0; i < args.length; i++) {
				const arg = args[i]
				if (arg === '-h' || arg === '--help') options.help = true
				else if (arg === '-n' || arg === '--lines') {
					const nextArg = args[++i]
					if (!nextArg) throw new Error(`option requires an argument: n`)
					const number = Math.abs(Number(nextArg))
					if (isNaN(number)) throw new Error(`invalid number ${nextArg}`)
					options.numberOfLines = number
				} else filePaths.push(arg)
			}

			if (options.help) return { output: this.getDescription() }

			const matchs: string[] = []
			const errIndexes: number[] = []
			for (let i = 0; i < filePaths.length; i++) {
				const filePath = filePaths[i]
				try {
					const fileContent = shell.getFileSystem().readFile(filePath)
					if (options.numberOfLines === 0) matchs.push('')
					else
						matchs.push(fileContent.split('\n').slice(-options.numberOfLines).join('\n'))
				} catch (error) {
					errIndexes.push(i)
					matchs.push(`grep: ${filePath}: No such file`)
				}
			}

			const output: string[] = []
			if (filePaths.length === 1) output.push(matchs[0])
			else {
				for (let i = 0; i < filePaths.length; i++)
					if (matchs[i]) {
						if (errIndexes.includes(i)) {
							output.push(matchs[i])
						} else {
							output.push(`==> ${filePaths[i]} <==`)
							output.push(`${filePaths[i]}:${matchs[i]}`)
						}
					}
			}

			return { output: output.join('\n') }
		} catch (error) {
			return { output: `grep: ${(error as Error).message}`, error: true }
		}
	}
}
