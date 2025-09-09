import { ShellEmulator } from './shell-emulator'
import { minmax } from './utils'
import { type AppConfig } from './main'
import { getErrorMessage } from './errors/error-handler'

export class TerminalRenderer {
	private terminal: HTMLElement
	private prompt: HTMLElement
	private input: HTMLInputElement
	private shell!: ShellEmulator
	private commandHistory: string[] = []
	private historyIndex: number = -1
	private customPrompt: string = '$'

	constructor() {
		this.terminal = document.getElementById('terminal') as HTMLElement
		this.prompt = document.getElementById('prompt') as HTMLElement
		this.input = document.getElementById('command-input') as HTMLInputElement

		this.initializeEventListeners()
		this.init()
	}

	private async init() {
		const config = await window.electronAPI.getAppConfig()
		this.shell = new ShellEmulator()
		await this.applyConfig(config)
		this.printWelcomeMessage()
	}

	private async applyConfig(config: AppConfig): Promise<void> {
		if (config?.prompt) this.updatePrompt(config.prompt)

		if (config?.vfsPath) await this.downloadVFS(config.vfsPath)
		else await this.downloadDefaultVFS()

		if (config?.scriptPath) await this.executeStartupScript(config.scriptPath)
	}

	private updatePrompt(prompt: string): void {
		this.customPrompt = prompt
		this.prompt.textContent = prompt
	}

	private async downloadVFS(VFSPath: string): Promise<void> {
		try {
			this.printLine('Trying to download VFS configuration...')
			await this.shell.loadVFS(VFSPath)
			this.printLine(`VFS configuration successfully loaded`)
		} catch (error) {
			const errorMessage = getErrorMessage(error)
			this.printLine(errorMessage)
			this.downloadDefaultVFS()
		}
	}

	private async downloadDefaultVFS(): Promise<void> {
		await this.shell.loadVFS()
		this.printLine(`Loaded default VFS configuration`)
	}

	private async executeStartupScript(scriptPath: string): Promise<void> {
		try {
			this.printLine('Trying to download startup script...')
			const scriptContent = await window.electronAPI.readFile(scriptPath)
			this.printLine('Startup script successfully loaded')
			const commands = scriptContent
				.split('\n')
				.map(line => line.trim())
				.filter(line => line !== '')

			this.printLine(`Executing startup script: ${scriptPath}`)
			this.printLine('---------------------------------------------')

			let someError: boolean = false
			for (const command of commands)
				someError = this.executeCommand(command, true) || someError

			this.printLine('---------------------------------------------')
			let finishMessage = 'Startup script execution completed'
			if (someError) finishMessage += ' with error'
			this.printLine(finishMessage)
		} catch (error) {
			const errorMessage = getErrorMessage(error)
			this.printLine(errorMessage)
		}
	}

	private initializeEventListeners(): void {
		this.input.addEventListener('keydown', e => this.handleKeyDown(e))

		this.terminal.addEventListener('click', () => this.input.focus())
	}

	private handleKeyDown(e: KeyboardEvent): void {
		switch (e.key) {
			case 'Enter':
				e.preventDefault()
				this.executeCommand(this.getInputValue())
				this.setInputValue('')
				break
			case 'ArrowUp':
				e.preventDefault()
				this.navigateHistory(-1)
				break
			case 'ArrowDown':
				e.preventDefault()
				this.navigateHistory(1)
				break
			case 'Tab':
				// TODO РЕАЛИЗОВАТЬ АВТОДОПОЛНЕНИЕ
				e.preventDefault()
				break
		}
	}

	private executeCommand(command: string, safeMode: boolean = false): boolean {
		let withError: boolean = false
		command = command.trim()

		if (command) {
			const result = this.shell.execute(command)
			if (result.error) withError = true
			if (!safeMode || !result.error) {
				this.addToHistory(command)
				this.printPrompt(command)
				this.printLine(result.output)
			}
		} else {
			this.resetHistoryIndex()
			this.printPrompt(command)
		}

		if (!this.shell.getRunning()) window.close()

		this.scrollToBottom()
		return withError
	}

	private addToHistory(command: string): void {
		if (this.commandHistory[this.commandHistory.length - 1] !== command)
			this.commandHistory.push(command)
		this.resetHistoryIndex()
	}

	private navigateHistory(direction: number): void {
		this.historyIndex = minmax(
			0,
			this.commandHistory.length,
			this.historyIndex + direction,
		)

		if (this.historyIndex < this.commandHistory.length)
			this.input.value = this.commandHistory[this.historyIndex]
		else this.input.value = ''

		this.input.setSelectionRange(this.input.value.length, this.input.value.length)
	}

	private resetHistoryIndex(): void {
		this.historyIndex = this.commandHistory.length
	}

	private printWelcomeMessage(): void {
		this.printLine('Terminal Emulator v0.3')
		this.printLine('Type "exit" to quit or try "ls", "cd" and "pwd" commands')
		this.printLine('---------------------------------------------')
	}

	private printPrompt(text: string) {
		this.printLine(`${this.customPrompt} ${text}`)
	}

	private printLine(text: string): void {
		const line = document.createElement('div')
		line.textContent = text
		this.terminal.appendChild(line)
	}

	private getInputValue(): string {
		return this.input.value.trim()
	}

	private setInputValue(value: string): void {
		this.input.value = value.trim()
	}

	private scrollToBottom(): void {
		this.terminal.scrollTop = this.terminal.scrollHeight
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new TerminalRenderer()
})
