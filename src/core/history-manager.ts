export class HistoryManager {
	private history: string[] = []
	private currentIndex: number = -1

	public add(command: string): void {
		this.currentIndex = -1
		if (this.history[this.history.length - 1] === command) return
		this.history.push(command)
	}

	public getPrevious(): string | null {
		if (this.currentIndex === -1) this.currentIndex = this.history.length - 1
		else if (this.currentIndex === 0) return null
		else this.currentIndex--

		return this.history[this.currentIndex]
	}

	public getNext(): string | null {
		if (this.currentIndex === -1) return null
		else if (this.currentIndex + 1 >= this.history.length) {
			this.currentIndex = -1
			return ''
		} else this.currentIndex++

		return this.history[this.currentIndex]
	}

	public getAll(): string[] {
		return [...this.history]
	}

	public clear(): void {
		this.history = []
		this.currentIndex = -1
	}
}
