import { CommandRegistry } from './commands/command-registry'
import { IFileSystemService } from './services/filesystem.interface'

export class AutoCompleter {
	constructor(private registry: CommandRegistry, private fs: IFileSystemService) {}

	public getSuggestions(input: string): string[] {
		const tokens = input.trim().split(/\s+/)
		if (tokens.length === 0) return []

		const commandPart = tokens[0]
		const argsPart = tokens.slice(1)

		if (argsPart.length === 0) {
			return this.registry
				.getAllNames()
				.filter(cmdName => cmdName.startsWith(commandPart))
				.map(cmdName => cmdName.slice(commandPart.length))
		} else {
			const resolvedDirectoryPath = this.fs.resolvePath(
				argsPart[argsPart.length - 1] || './',
			)
			const segments = resolvedDirectoryPath.split('/')
			const dirPath = segments.slice(0, -1).join('/') || '/'
			const directoryNode = this.fs.getNode(dirPath)

			if (directoryNode.type !== 'directory') return []

			const entries = directoryNode.children
				.map(child => child.name)
				.filter(childName => childName.startsWith(segments[segments.length - 1]))
				.map(childName => childName.slice(segments[segments.length - 1].length))

			return entries
		}
	}

	complete(input: string): string {
		const suggestions = this.getSuggestions(input)
		if (suggestions.length === 0) return ''
		if (suggestions.length === 1) return suggestions[0]

		const commonPrefix = this.getCommonPrefix(suggestions)
		return commonPrefix
	}

	private getCommonPrefix(strings: string[]): string {
		if (strings.length === 0) return ''
		let prefix = strings[0]

		for (let i = 1; i < strings.length; i++) {
			while (strings[i].indexOf(prefix) !== 0) {
				prefix = prefix.slice(0, -1)
				if (prefix === '') return ''
			}
		}

		return prefix
	}
}
