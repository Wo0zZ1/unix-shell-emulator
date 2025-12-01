import { ShellEmulator, IExecuteResponse } from '../../core/shell-emulator'
import { IBaseCommandOptions, BaseCommand } from '../core/base-command'

export interface IGrepCommandOptions extends IBaseCommandOptions {
	invertMatch: boolean
	ignoreCase: boolean
}

export class GrepCommand extends BaseCommand {
	getName(): string {
		return 'grep'
	}

	getDescription(): string {
		return 'Searches for patterns in files\n\nUsage:\n  grep [-v] [-i] <pattern> [file]...\n\nArguments:\n  pattern    Search pattern\n  file       File(s) to search (default: stdin)\n\nFlags:\n  -v, --invert-match  Select non-matching lines\n  -i, --ignore-case   Ignore case distinctions in patterns\n  -h, --help          Show this help message'
	}

	async execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse> {
		try {
			this.validateArgs(args, 1)

			const options: IGrepCommandOptions = {
				help: false,
				invertMatch: false,
				ignoreCase: false,
			}

			const input: string[] = []

			for (const arg of args) {
				if (arg === '-h' || arg === '--help') options.help = true
				else if (arg === '-v' || arg === '--invert-match') options.invertMatch = true
				else if (arg === '-i' || arg === '--ignore-case') options.ignoreCase = true
				else input.push(arg)
			}

			if (options.help) return { output: this.getDescription() }

			if (input.length < 2)
				throw new Error('Usage: grep [options] pattern file1 [file2 ...]')

			let pattern = new RegExp(input[0], options.ignoreCase ? 'i' : '')
			const filePaths = input.slice(1)

			const matchs: string[] = []
			const errIndexes: number[] = []
			for (let i = 0; i < filePaths.length; i++) {
				const filePath = filePaths[i]
				try {
					const fileContent = shell.getFileSystem().readFile(filePath)
					matchs.push(
						fileContent
							.split('\n')
							.filter(line =>
								options.invertMatch ? !pattern.test(line) : pattern.test(line),
							)
							.join('\n'),
					)
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
						if (errIndexes.includes(i)) output.push(matchs[i])
						else output.push(`${filePaths[i]}:${matchs[i]}`)
					}
			}

			return { output: output.join('\n') }
		} catch (error) {
			return { output: `grep: ${(error as Error).message}`, error: true }
		}
	}
}
