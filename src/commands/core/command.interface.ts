import { ShellEmulator, IExecuteResponse } from '../../core/shell-emulator'

export interface Command {
	execute(args: string[], shell: ShellEmulator): Promise<IExecuteResponse>
	getName(): string
	getDescription(): string
}
