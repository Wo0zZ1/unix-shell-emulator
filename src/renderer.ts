import { type AppConfig } from './main'

import { HistoryManager } from './history-manager'
import { ShellEmulator } from './shell-emulator'

import { getErrorMessage } from './errors/error-handler'

export class TerminalRenderer {
	private shell!: ShellEmulator
	private historyManager = new HistoryManager()

	private terminal: HTMLElement
	private prompt: HTMLElement
	private input: HTMLInputElement
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
			this.shell = await ShellEmulator.create(VFSPath)
			this.printLine(`VFS configuration successfully loaded`)
		} catch (error) {
			const errorMessage = getErrorMessage(error)
			this.printLine(errorMessage)
			this.downloadDefaultVFS()
		}
	}

	private async downloadDefaultVFS(): Promise<void> {
		this.shell = await ShellEmulator.create()
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
				this.navigateHistoryUp()
				break
			case 'ArrowDown':
				e.preventDefault()
				this.navigateHistoryDown()
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
				this.historyManager.add(command)
				this.printPrompt(command)
				this.printLine(result.output)
				if (result.extra?.clearTerminal) this.clearTerminal()
			}
		} else {
			this.printPrompt(command)
		}

		if (!this.shell.getRunning()) window.close()

		this.scrollToBottom()
		return withError
	}

	private navigateHistoryUp(): void {
		const previousCommand = this.historyManager.getPrevious()
		if (previousCommand !== null) {
			this.setInputValue(previousCommand)
			this.moveCursorToEnd()
		}
	}

	private navigateHistoryDown(): void {
		const nextCommand = this.historyManager.getNext()
		if (nextCommand !== null) {
			this.setInputValue(nextCommand)
			this.moveCursorToEnd()
		}
	}

	private moveCursorToEnd(): void {
		this.input.setSelectionRange(this.input.value.length, this.input.value.length)
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

	private clearTerminal(): void {
		this.terminal.innerHTML = ''
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
