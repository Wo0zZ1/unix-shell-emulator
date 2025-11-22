import { IMkdirCommandOptions } from './commands/mkdir.command'
import { IRmCommandOptions } from './commands/rm.command'
import {
	VFSDirectoryAlreadyExists,
	VFSDirectoryIsBusy,
	VFSDirectoryNotFound,
	VFSError,
	VFSFileAlreadyExists,
	VFSFileNotFound,
	VFSFileOrDirectoryAlreadyExists,
	VFSFileOrDirectoryNotFound,
	VFSFormatError,
	VFSLoadingError,
	VFSInvalidPath,
	VFSPathEscapesRoot,
} from './errors/vfs-error'
import { DEFAULT_VFS_STRUCTURE } from './vfs-default'

export interface VFSDirectoryNode extends VFSBaseNode {
	type: 'directory'
	children: VFSNode[]
}

export interface VFSFileNode extends VFSBaseNode {
	type: 'file'
	content: string
}

export interface VFSBaseNode {
	name: string
}

export type VFSNode = VFSDirectoryNode | VFSFileNode

export class VFS {
	private root!: VFSDirectoryNode
	private currentPath: string

	constructor() {
		this.currentPath = '/'
	}

	public loadDefault(): void {
		this.root = {
			name: 'root',
			type: 'directory',
			children: DEFAULT_VFS_STRUCTURE,
		} as VFSDirectoryNode
	}

	public async loadFromXML(VFSPath: string): Promise<void> {
		if (!VFSPath.endsWith('.xml')) throw new VFSFormatError('.xml')
		const file = await window.electronAPI.readFile(VFSPath.trim())
		const fileContent = file.toString()
		this.root = VFS.parseXML(fileContent)
	}

	private static parseXML(xmlContent: string): VFSDirectoryNode {
		try {
			const parser = new DOMParser()
			const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')

			const parseError = xmlDoc.getElementsByTagName('parsererror')[0]
			if (parseError) throw new VFSFormatError('invalid XML structure')

			const rootElement = xmlDoc.documentElement
			if (rootElement.nodeName !== 'vfs')
				throw new VFSFormatError('root element must be <vfs>')

			const childElements = rootElement.children

			const rootNode = {
				name: rootElement.getAttribute('name'),
				type: 'directory',
				children: [],
			} as VFSDirectoryNode
			for (let i = 0; i < childElements.length; i++) {
				const childNode = this.parseVFSNode(childElements[i])
				rootNode.children.push(childNode)
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

		let node = { name, type } as VFSNode
		if (type === 'file') {
			const contentElement = element.getElementsByTagName('content')[0]
			if (!contentElement)
				throw new VFSFormatError('file node must have <conent> element')
			const encoding = contentElement.getAttribute('encoding')
			let content = contentElement.textContent || ''
			if (encoding === 'base64')
				try {
					content = atob(content)
				} catch (error) {
					throw new VFSFormatError('invalid base64 encoding')
				}
			else if (encoding && encoding !== 'text')
				throw new VFSFormatError(`unsupported encoding: ${encoding}`)

			node = { ...node, content } as VFSFileNode
		} else {
			node = { ...node, children: [] } as VFSDirectoryNode
			const childElements = element.children

			for (let i = 0; i < childElements.length; i++) {
				const childNode = this.parseVFSNode(childElements[i])
				node.children.push(childNode)
			}
		}

		return node
	}

	public listDirectory(path?: string): string {
		console.log('ls выбрал:', path)

		const resolvedPath = path ? this.resolvePath(path) : this.currentPath
		const node = this.getNodeByPath(resolvedPath)

		if (!node || node.type !== 'directory') throw new VFSDirectoryNotFound(resolvedPath)

		return (
			(resolvedPath == '/' ? '.\t' : '.\t..\t') +
			node.children.map(child => child.name).join('\t')
		)
	}

	public changeDirectory(path: string): void {
		const resolvedPath = this.resolvePath(path)
		const node = this.getNodeByPath(resolvedPath)

		if (!node || node.type !== 'directory') throw new VFSDirectoryNotFound(resolvedPath)

		this.currentPath = resolvedPath
	}

	public createFile(filePath: string): void {
		const resolvedPath = this.resolvePath(filePath)
		const fileName = this.getFileNameByPath(resolvedPath)

		const newNode: VFSFileNode = {
			name: fileName,
			type: 'file',
			content: '',
		}

		this.createNode(resolvedPath, newNode, { recursive: false })
	}

	public catFile(path: string): string {
		const resolvedPath = this.resolvePath(path)
		const file = this.getNodeByPath(resolvedPath)
		if (!file || file.type !== 'file') throw new VFSFileNotFound(resolvedPath)
		return file.content
	}

	public createDirectory(directoryPath: string, options: IMkdirCommandOptions): void {
		const resolvedPath = this.resolvePath(directoryPath)
		const directoryName = this.getFileNameByPath(resolvedPath)

		const newNode: VFSDirectoryNode = {
			name: directoryName,
			type: 'directory',
			children: [],
		}

		this.createNode(resolvedPath, newNode, { recursive: options.parents })
	}

	public deleteDirectory(directoryPath: string): void {
		const resolvedPath = this.resolvePath(directoryPath)

		this.deleteNode(resolvedPath)
	}

	public deleteFileOrDirectory(path: string, options: IRmCommandOptions): void {
		const resolvedPath = this.resolvePath(path)

		this.deleteNode(resolvedPath, { recursive: options.recursive })
	}

	public moveFileOrDirectory(pathFrom: string, pathTo: string, rename: boolean) {
		const resolvedPathFrom = this.resolvePath(pathFrom)
		const resolvedPathTo = this.resolvePath(pathTo)
		this.moveNode(resolvedPathFrom, resolvedPathTo, rename)
	}

	public getCurrentDirectory(): string {
		return this.currentPath
	}

	private resolvePath(path: string): string {
		console.log('до:', path)

		if (path[0] === '/') return path

		const pathSegments = path.replace(/\/$/, '').split('/')
		const currentPathSegments = this.currentPath.split('/').filter(Boolean)

		for (const segment of pathSegments)
			if (segment === '..') currentPathSegments.pop()
			else if (segment === '.') continue
			else {
				if (!segment) throw new VFSInvalidPath(path)
				currentPathSegments.push(segment)
			}

		console.log('после:', '/' + currentPathSegments.join('/'))

		return '/' + currentPathSegments.join('/')
	}

	private resolvePathSegments(resolvedPath: string): string[] {
		return resolvedPath.split('/').slice(1)
	}

	private getRootNode(): VFSDirectoryNode {
		return this.root
	}

	private getNodeByPath(resolvedPath: string): VFSNode | undefined {
		let currentNode: VFSNode = this.getRootNode()

		if (resolvedPath === '/') return currentNode
		const segments = this.resolvePathSegments(resolvedPath)

		for (const segment of segments) {
			if (currentNode.type !== 'directory') return
			const foundNode: VFSNode | undefined = currentNode.children.find(
				child => child.name === segment,
			)
			if (!foundNode) return
			currentNode = foundNode
		}

		return currentNode
	}

	private createNode(
		targetPath: string,
		node: VFSNode,
		options?: { recursive?: boolean },
	): void {
		const pathSegments = this.resolvePathSegments(targetPath)

		let currentNode = this.getRootNode()
		let currentPath = ''
		for (const segment of pathSegments.slice(0, -1)) {
			currentPath += `/${segment}`

			let childrenNode = currentNode.children.find(child => child.name === segment)

			if (childrenNode && childrenNode.type !== 'directory')
				throw new VFSDirectoryNotFound(currentPath)

			if (!childrenNode) {
				if (!options?.recursive) throw new VFSDirectoryNotFound(currentPath)

				const newNode = {
					name: segment,
					type: 'directory',
					children: [],
				} as VFSDirectoryNode
				currentNode.children.push(newNode)

				childrenNode = newNode
			}

			currentNode = childrenNode
		}

		if (currentNode.children.findIndex(child => child.name === node.name) !== -1)
			throw new VFSDirectoryAlreadyExists(targetPath)

		currentNode.children.push(node)
	}

	private moveNode(
		resolvedPathFrom: string,
		resolvedPathTo: string,
		rename: boolean,
	): void {
		const movingNode = this.getNodeByPath(resolvedPathFrom)
		if (!movingNode) throw new VFSFileOrDirectoryNotFound(resolvedPathFrom)

		if (rename) {
			const targetNode = this.getNodeByPath(resolvedPathTo)

			if (!targetNode) {
				const destDirPath = this.getParentPath(resolvedPathTo)
				const destDir = this.getNodeByPath(destDirPath)

				if (!destDir || destDir.type !== 'directory')
					throw new VFSDirectoryNotFound(destDirPath)

				const targetFileName = this.getFileNameByPath(resolvedPathTo)

				this.deleteNode(resolvedPathFrom, { recursive: true })
				movingNode.name = targetFileName
				destDir.children.push(movingNode)
			} else if (targetNode.type === 'file') {
				throw new VFSFileAlreadyExists(resolvedPathTo)
			} else {
				const existingNode = targetNode.children.find(
					child => child.name === movingNode.name,
				)
				if (existingNode) throw new VFSFileAlreadyExists(resolvedPathTo)

				this.deleteNode(resolvedPathFrom, { recursive: true })
				movingNode.name = movingNode.name
				targetNode.children.push(movingNode)
			}
		} else {
			const targetNode = this.getNodeByPath(resolvedPathTo)

			if (!targetNode || targetNode.type !== 'directory')
				throw new VFSDirectoryNotFound(resolvedPathTo)

			const existingNode = targetNode.children.find(
				child => child.name === movingNode.name,
			)

			if (existingNode) throw new VFSFileOrDirectoryAlreadyExists(resolvedPathTo)

			this.deleteNode(resolvedPathFrom, { recursive: true })
			targetNode.children.push(movingNode)
		}
	}

	private deleteNode(targetPath: string, options?: { recursive?: boolean }): void {
		const node = this.getNodeByPath(targetPath)

		if (!node) throw new VFSFileOrDirectoryNotFound(targetPath)

		if (this.currentPath.startsWith(targetPath)) throw new VFSDirectoryIsBusy(targetPath)

		const parentPath = this.getParentPath(targetPath)
		const parentNode = this.getNodeByPath(parentPath)

		if (!parentNode || parentNode.type !== 'directory')
			throw new VFSDirectoryNotFound(targetPath)

		if (node.type === 'directory' && node.children.length > 0 && !options?.recursive)
			throw new VFSError(`directory not empty: ${targetPath}`)

		const index = parentNode.children.findIndex(child => child.name === node.name)

		if (index === -1) throw new VFSFileOrDirectoryNotFound(targetPath)

		parentNode.children.splice(index, 1)
	}

	/**
	 * @example "/src/dir1/dir2" -> "/src/dir1"
	 * @example "/src" -> "/"
	 * @example "/" -> null
	 *  */
	private getParentPath(resolvedPath: string): string {
		const parentPath = resolvedPath.split('/').slice(0, -1)
		if (parentPath.length === 0) throw new VFSPathEscapesRoot()
		return '/' + parentPath.slice(1).join('/')
	}

	private getFileNameByPath(resolvedPath: string): string {
		const lastSegmentIndex = resolvedPath.lastIndexOf('/')
		return resolvedPath.substring(lastSegmentIndex + 1)
	}

	private getFileExtensionByName(fileName: string): string {
		const extensionIndex = fileName.lastIndexOf('.')
		return fileName.substring(extensionIndex + 1)
	}

	private getFileExtensionNameByPath(resolvedPath: string): string {
		const fileName = this.getFileNameByPath(resolvedPath)
		return this.getFileExtensionByName(fileName)
	}
}
