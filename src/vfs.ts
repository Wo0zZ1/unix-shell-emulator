import {
	VFSDirectoryNotFound,
	VFSError,
	VFSFileOrDirectoryNotFound,
	VFSFormatError,
	VFSLoadingError,
} from './errors/vfs-error'
import { DEFAULT_VFS_STRUCTURE } from './vfs-default'

export interface VFSNode {
	name: string
	type: 'file' | 'directory'
	content?: string // for files
	parent?: VFSNode
	children?: VFSNode[] // for directories
}

export class VFS {
	private root!: VFSNode
	private currentPath: string

	constructor() {
		this.currentPath = '/'
	}

	public loadDefault(): void {
		this.root = {
			name: '',
			type: 'directory',
			parent: undefined,
			children: DEFAULT_VFS_STRUCTURE,
		}
	}

	public async loadFromXML(VFSPath: string): Promise<void> {
		if (!VFSPath.endsWith('.xml')) throw new VFSFormatError('.xml')
		const file = await window.electronAPI.readFile(VFSPath.trim())
		const fileContent = file.toString()
		this.root = VFS.parseXML(fileContent)
	}

	private static parseXML(xmlContent: string): VFSNode {
		// TODO реализовать парсинг
		try {
			const parser = new DOMParser()
			const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')

			const parseError = xmlDoc.getElementsByTagName('parsererror')[0]
			if (parseError) throw new VFSFormatError('invalid XML structure')

			const rootElement = xmlDoc.documentElement
			if (rootElement.nodeName !== 'vfs')
				throw new VFSFormatError('root element must be <vfs>')

			const childElements = rootElement.children

			const rootNode = { name: '', type: 'directory', children: [] } as VFSNode
			for (let i = 0; i < childElements.length; i++) {
				const childNode = this.parseVFSNode(childElements[i])
				rootNode.children!.push(childNode)
			}

			return rootNode
		} catch (error) {
			if (error instanceof VFSFormatError) throw error
			throw new VFSLoadingError(`XML parsing failed: ${(error as Error).message}`)
		}
	}

	private static parseVFSNode(element: Element): VFSNode {
		const name = element.getAttribute('name')
		if (!name) throw new VFSFormatError('node must have a name attribute')

		const type = element.getAttribute('type')
		if (type !== 'file' && type !== 'directory')
			throw new VFSFormatError('node must have type "file" or "directory"')

		const node: VFSNode = { name, type }
		if (type === 'file') {
			const contentElement = element.getElementsByTagName('content')[0]
			if (!contentElement)
				throw new VFSFormatError('file node must have <conent> element')
			const encoding = contentElement.getAttribute('encoding')
			let content = contentElement.textContent || ''
			if (encoding === 'base64') {
				try {
					content = atob(content)
				} catch (error) {
					throw new VFSFormatError('invalid base64 encoding')
				}
			} else if (encoding && encoding !== 'text') {
				throw new VFSFormatError(`unsupported encoding: ${encoding}`)
			}

			node.content = content
		} else {
			node.children = []
			const childElements = element.children

			for (let i = 0; i < childElements.length; i++) {
				const childNode = this.parseVFSNode(childElements[i])
				node.children.push(childNode)
			}
		}

		return node
	}

	private getNode(path: string): VFSNode | null {
		let currentNode: VFSNode = this.root
		const targetPath = this.resolvePath(path)
		if (targetPath === '/') return currentNode
		const segments = this.resolvePath(path).split('/').slice(1)

		for (const segment of segments) {
			if (currentNode.type !== 'directory') return null
			const foundNode = currentNode.children?.find(child => child.name === segment)
			if (!foundNode) return null
			currentNode = foundNode
		}

		return currentNode
	}

	private resolvePath(path: string): string {
		if (path[0] === '/') return path

		const pathSegments = path.split('/').filter(Boolean)
		const currentPathSegments = this.currentPath.split('/').filter(Boolean)

		for (const segment of pathSegments)
			if (segment === '..') currentPathSegments.pop()
			else if (segment === '.') continue
			else currentPathSegments.push(segment)

		return '/' + currentPathSegments.join('/')
	}

	public listDirectory(path?: string): string {
		const targetPath = path ? this.resolvePath(path) : this.currentPath
		const node = this.getNode(targetPath)

		if (!node) throw new VFSFileOrDirectoryNotFound(path ?? targetPath)
		if (node.type !== 'directory') throw new VFSDirectoryNotFound(path ?? targetPath)

		return node.children
			? [{ name: '..' }, { name: '.' }, ...node.children]
					.map(child => child.name)
					.join('\t')
			: '..\t.'
	}

	public changeDirectory(path: string): void {
		const targetPath = this.resolvePath(path)
		const node = this.getNode(targetPath)

		if (!node) throw new VFSFileOrDirectoryNotFound(targetPath)
		if (node.type !== 'directory') throw new VFSDirectoryNotFound(targetPath)

		this.currentPath = targetPath
	}

	public deleteDirectory(path: string): boolean {
		const targetPath = this.resolvePath(path)
		const node = this.getNode(targetPath)

		if (!node) throw new VFSFileOrDirectoryNotFound(targetPath)
		if (node.type !== 'directory') throw new VFSDirectoryNotFound(targetPath)
		if (node.children && node.children.length > 0)
			throw new VFSError(`directory not empty: ${path}`)

		const parentPath = targetPath.split('/').slice(0, -1).join('/') || '/'
		const parentNode = this.getNode(parentPath)

		if (parentNode && parentNode.type === 'directory' && parentNode.children) {
			const index = parentNode.children.findIndex(child => child.name === node.name)

			if (index !== -1) {
				parentNode.children.splice(index, 1)
				return true
			}
		}

		return false
	}

	private deleteNode(path: string): boolean {
		const targetPath = this.resolvePath(path)
		const node = this.getNode(targetPath)

		if (!node) throw new VFSFileOrDirectoryNotFound(targetPath)

		const parentPath = targetPath.split('/').slice(0, -1).join('/') || '/'
		const parentNode = this.getNode(parentPath)

		if (parentNode && parentNode.type === 'directory' && parentNode.children) {
			const index = parentNode.children.findIndex(child => child.name === node.name)

			if (index !== -1) {
				parentNode.children.splice(index, 1)
				return true
			}
		}

		return false
	}

	public moveNode(pathFrom: string, pathTo: string): boolean {
		const globalPathFrom = this.resolvePath(pathFrom)
		const globalPathTo = this.resolvePath(pathTo)
		const node = this.getNode(globalPathFrom)
		const destDir = this.getNode(globalPathTo)

		if (!node) throw new VFSFileOrDirectoryNotFound(globalPathFrom)
		if (!destDir) throw new VFSFileOrDirectoryNotFound(globalPathFrom)
		if (destDir.type !== 'directory') throw new VFSDirectoryNotFound(globalPathFrom)

		const success = this.deleteNode(globalPathFrom)
		if (!success) return false
		destDir.children?.push(node)
		return true
	}

	public getCurrentDirectory(): string {
		return this.currentPath
	}
}
