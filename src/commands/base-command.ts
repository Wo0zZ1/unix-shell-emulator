import type { ShellEmulator } from '../shell-emulator'
import { Command } from './command.interface'

export abstract class BaseCommand implements Command {
	abstract execute(
		args: string[],
		shell: ShellEmulator,
	): { output: string; error?: boolean }

	abstract getName(): string

	abstract getDescription(): string

	protected validateArgs(args: string[], min: number = 0, max?: number): void {
		if (args.length < min) throw new Error(`Too few arguments. Expected at least ${min}`)
		if (max !== undefined && args.length > max)
			throw new Error(`Too many arguments. Expected at most ${max}`)
	}
}
