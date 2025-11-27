import type { IExecuteResponse, ShellEmulator } from '../shell-emulator'

export interface Command {
	execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse>
	getName(): string
	getDescription(): string
}
