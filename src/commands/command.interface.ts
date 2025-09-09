import type { ShellEmulator } from '../shell-emulator'

export interface Command {
	execute(args: string[], shell: ShellEmulator): { output: string; error?: boolean }
	getName(): string
	getDescription(): string
}
