export class EnvironmentManager {
	private variables: Map<string, string> = new Map()

	public set(name: string, value: string) {
		this.variables.set(name, value)
	}

	public get(name: string): string | undefined {
		return this.variables.get(name)
	}

	public unset(name: string): void {
		this.variables.delete(name)
	}

	public getAll(): { [key: string]: string } {
		const result: { [key: string]: string } = {}
		for (const [key, value] of this.variables.entries()) result[key] = value
		return result
	}

	public clear(): void {
		this.variables.clear()
	}

	public expand(input: string, shouldExpand: boolean): string {
		if (!shouldExpand) return input

		return input.replace(/\$(\w+)|\$\{(\w+)\}/g, (match, var1, var2) => {
			const varName = var1 || var2
			return this.get(varName) || ''
		})
	}
}
