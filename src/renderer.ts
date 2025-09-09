import { ShellEmulator } from './shell-emulator'
import { minmax } from './utils'

class TerminalRenderer {
	private terminal: HTMLElement
	private prompt: HTMLElement
	private input: HTMLInputElement
	private shell: ShellEmulator
	private commandHistory: string[] = []
	private historyIndex: number = -1

	constructor() {
		this.terminal = document.getElementById('terminal') as HTMLElement
		this.prompt = document.getElementById('prompt') as HTMLElement
		this.input = document.getElementById('command-input') as HTMLInputElement
		this.shell = new ShellEmulator()

		this.initializeEventListeners()
		this.printWelcomeMessage()
	}

	private initializeEventListeners(): void {
		this.input.addEventListener('keydown', e => this.handleKeyDown(e))

		this.terminal.addEventListener('click', () => this.input.focus())
	}

	private handleKeyDown(e: KeyboardEvent): void {
		switch (e.key) {
			case 'Enter':
				e.preventDefault()
				this.executeCommand()
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

	private executeCommand(): void {
		const command = this.input.value.trim()
		this.printLine(`$ ${command}`)

		this.addToHistory(command)
		if (command) {
			const result = this.shell.execute(command)
			this.printLine(result)
		}

		if (!this.shell.getRunning()) window.close()

		this.input.value = ''
		this.scrollToBottom()
	}

	private addToHistory(command: string): void {
		if (command && this.commandHistory[this.commandHistory.length - 1] !== command)
			this.commandHistory.push(command)
		this.historyIndex = this.commandHistory.length
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

	private printWelcomeMessage(): void {
		this.printLine('Terminal Emulator v0.1')
		this.printLine('Type "exit" to quit or try "ls", "cd" commands')
		this.printLine('--------------------------------------------')
	}

	private printLine(text: string): void {
		const line = document.createElement('div')
		line.textContent = text
		this.terminal.appendChild(line)
	}

	private scrollToBottom(): void {
		this.terminal.scrollTop = this.terminal.scrollHeight
	}
}

document.addEventListener('DOMContentLoaded', () => {
	new TerminalRenderer()
})
