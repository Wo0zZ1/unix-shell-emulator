import { ShellEmulator, IExecuteResponse } from '../../core/shell-emulator'
import { IBaseCommandOptions, BaseCommand } from '../core/base-command'

export interface IHeadCommandOptions extends IBaseCommandOptions {
	numberOfLines: number
}

export class HeadCommand extends BaseCommand {
	getName(): string {
		return 'head'
	}

	getDescription(): string {
		return 'Print first 10 lines of FILEs (or stdin)\n\nUsage:\n  head [-n NUM] <file>...\n\nArguments:\n  file    File(s) to read (default: stdin)\n\nFlags:\n  -n NUM           Print first NUM lines instead of 10\n  -h, --help       Show this help message'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args, 1)

			const options: IHeadCommandOptions = {
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
					const number = Number(nextArg)
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
					matchs.push(fileContent.split('\n').slice(0, options.numberOfLines).join('\n'))
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
