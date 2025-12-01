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
	VFSInvalidPath,
	VFSPathEscapesRoot,
	VFSNotAFile,
	VFSNotADirectory,
} from './errors/vfs-error'
import { DEFAULT_VFS_STRUCTURE } from './vfs-default'
import VFSParser from './vfs-parser'

export type VFSContentEncoding = 'base64' | 'utf-8'

export interface VFSMetadata {
	owner: string
	permissions: string
	createdAt: Date
	updatedAt: Date
}

export interface VFSBaseNode {
	name: string
	metadata: VFSMetadata
}

export interface VFSDirectoryNode extends VFSBaseNode {
	type: 'directory'
	children: VFSNode[]
}

export interface VFSFileNode extends VFSBaseNode {
	type: 'file'
	content: string
}

export type VFSNode = VFSDirectoryNode | VFSFileNode

export interface VFSCreateOptions {
	recursive?: boolean
}

export interface VFSDeleteOptions {
	recursive?: boolean
	force?: boolean
	fileType?: 'file' | 'directory'
}

export interface VFSMoveOptions {
	rename?: boolean
}

export interface VFSCopyOptions {
	recursive?: boolean
}

export class VFS {
	private root!: VFSDirectoryNode
	private currentPath: string = '/'

	constructor(root: VFSDirectoryNode) {
		this.root = root
	}

	public static loadDefault(): VFS {
		const root = VFSParser.createRootNode(DEFAULT_VFS_STRUCTURE)
		return new VFS(root)
	}

	public static async loadFromXML(VFSPath: string): Promise<VFS> {
		if (!VFSPath.endsWith('.xml')) throw new VFSFormatError('.xml')
		const file = await window.electronAPI.readFile(VFSPath.trim())
		const fileContent = file.toString()
		const root = VFSParser.parseXML(fileContent)
		return new VFS(root)
	}

	public toXML(): string {
		const XMLDocument = VFSParser.serializeToXML(this.root)
		const serializer = new XMLSerializer()
		return serializer.serializeToString(XMLDocument)
	}

	public list(path?: string): string {
		const resolvedPath = path ? this.resolvePath(path) : this.currentPath
		const node = this.getNodeByPath(resolvedPath)

		if (!node) throw new VFSDirectoryNotFound(resolvedPath)
		if (node.type !== 'directory') throw new VFSNotADirectory(resolvedPath)

		return (
			(resolvedPath == '/' ? '.\t' : '.\t..\t') +
			node.children.map(child => child.name).join('\t')
		)
	}

	public cd(path: string): void {
		const resolvedPath = this.resolvePath(path)
		const node = this.getNodeByPath(resolvedPath)

		if (!node) throw new VFSDirectoryNotFound(resolvedPath)
		if (node.type !== 'directory') throw new VFSNotADirectory(resolvedPath)

		this.currentPath = resolvedPath
	}

	public read(path: string): string {
		const resolvedPath = this.resolvePath(path)
		const file = this.getNodeByPath(resolvedPath)
		if (!file) throw new VFSFileNotFound(resolvedPath)
		if (file.type !== 'file') throw new VFSNotAFile(resolvedPath)
		return file.content.replace(/\\n/g, '\n')
	}

	public get(path: string): VFSNode {
		const resolvedPath = this.resolvePath(path)
		const node = this.getNodeByPath(resolvedPath)
		if (!node) throw new VFSFileOrDirectoryNotFound(resolvedPath)
		return node
	}

	public create(
		path: string,
		type: 'file' | 'directory',
		options?: VFSCreateOptions,
	): void {
		const resolvedPath = this.resolvePath(path)
		const nodeName = this.getFileNameByPath(resolvedPath)

		const newNode = {
			name: nodeName,
			type: type,
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date(),
				owner: 'root',
				permissions: type === 'file' ? 'rw-r--r--' : 'rwxr-xr-x',
			},
			...(type === 'file' ? { content: '' } : { children: [] }),
		} as VFSNode

		this.createNode(resolvedPath, newNode, { recursive: options?.recursive ?? false })
	}

	public move(from: string, to: string, options?: VFSMoveOptions) {
		const resolvedPathFrom = this.resolvePath(from)
		const resolvedPathTo = this.resolvePath(to)
		this.moveNode(resolvedPathFrom, resolvedPathTo, options?.rename ?? false)
	}

	public copy(from: string, to: string, options?: VFSCopyOptions): void {
		const resolvedPathFrom = this.resolvePath(from)
		const resolvedPathTo = this.resolvePath(to)
		this.copyNode(resolvedPathFrom, resolvedPathTo, {
			recursive: options?.recursive ?? false,
		})
	}

	public delete(path: string, options?: VFSDeleteOptions): void {
		const resolvedPath = this.resolvePath(path)
		this.deleteNode(resolvedPath, {
			recursive: options?.recursive ?? false,
			force: options?.force ?? false,
			fileType: options?.fileType,
		})
	}

	public write(path: string, content: string): void {
		const resolvedPath = this.resolvePath(path)
		const file = this.getNodeByPath(resolvedPath)

		if (!file) {
			this.create(path, 'file')
			const newFile = this.getNodeByPath(resolvedPath) as VFSFileNode
			newFile.content = content
		} else if (file.type === 'file') {
			file.content = content
		} else throw new VFSNotAFile(path)
	}

	public getCurrentPath(): string {
		return this.currentPath
	}

	public resolvePath(path: string): string {
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

		return '/' + currentPathSegments.join('/')
	}

	public getNodeByPath(resolvedPath: string): VFSNode | undefined {
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

	private resolvePathSegments(resolvedPath: string): string[] {
		return resolvedPath.split('/').slice(1)
	}

	private getRootNode(): VFSDirectoryNode {
		return this.root
	}

	private createNode(
		resolvedPath: string,
		node: VFSNode,
		options?: { recursive?: boolean },
	): void {
		const pathSegments = this.resolvePathSegments(resolvedPath)

		let currentNode = this.getRootNode()
		let currentPath = ''
		for (const segment of pathSegments.slice(0, -1)) {
			currentPath += `/${segment}`

			let childrenNode = currentNode.children.find(child => child.name === segment)

			if (childrenNode && childrenNode.type !== 'directory')
				throw new VFSDirectoryNotFound(currentPath)

			if (!childrenNode) {
				if (!options?.recursive) throw new VFSDirectoryNotFound(currentPath)

				const newNode = this.createEmptyDirectoryNode(segment, 'user')
				currentNode.children.push(newNode)

				childrenNode = newNode
			}

			currentNode = childrenNode
		}

		if (currentNode.children.findIndex(child => child.name === node.name) !== -1)
			throw new VFSDirectoryAlreadyExists(resolvedPath)

		currentNode.children.push(node)
	}

	private moveNode(
		resolvedPathFrom: string,
		resolvedPathTo: string,
		rename: boolean,
	): void {
		const movingNode = this.getNodeByPath(resolvedPathFrom)
		if (!movingNode) throw new VFSFileOrDirectoryNotFound(resolvedPathFrom)

		const fromDirectory = this.getNodeByPath(this.getParentPath(resolvedPathFrom))

		if (!fromDirectory) throw new VFSDirectoryNotFound(resolvedPathTo)
		if (fromDirectory.type !== 'directory') throw new VFSNotADirectory(resolvedPathTo)

		if (rename) {
			const targetNode = this.getNodeByPath(resolvedPathTo)

			if (!targetNode) {
				const targetDirectoryPath = this.getParentPath(resolvedPathTo)
				const targetDirectory = this.getNodeByPath(targetDirectoryPath)

				if (!targetDirectory) throw new VFSDirectoryNotFound(targetDirectoryPath)
				if (targetDirectory.type !== 'directory')
					throw new VFSNotADirectory(targetDirectoryPath)

				const targetFileName = this.getFileNameByPath(resolvedPathTo)

				this.deleteNode(resolvedPathFrom, { recursive: true })

				movingNode.name = targetFileName
				targetDirectory.children.push(movingNode)
				targetDirectory.metadata.updatedAt = new Date()
			} else if (targetNode.type === 'file') {
				throw new VFSFileAlreadyExists(resolvedPathTo)
			} else {
				const existingNode = targetNode.children.find(
					child => child.name === movingNode.name,
				)
				if (existingNode) throw new VFSFileOrDirectoryAlreadyExists(resolvedPathTo)

				this.deleteNode(resolvedPathFrom, { recursive: true })

				movingNode.name = movingNode.name
				targetNode.children.push(movingNode)
				targetNode.metadata.updatedAt = new Date()
			}
		} else {
			const targetDirectory = this.getNodeByPath(resolvedPathTo)

			if (!targetDirectory) throw new VFSDirectoryNotFound(resolvedPathTo)
			if (targetDirectory.type !== 'directory') throw new VFSNotADirectory(resolvedPathTo)

			const existingNode = targetDirectory.children.find(
				child => child.name === movingNode.name,
			)

			if (existingNode) throw new VFSFileOrDirectoryAlreadyExists(resolvedPathTo)

			this.deleteNode(resolvedPathFrom, { recursive: true })

			targetDirectory.children.push(movingNode)
			targetDirectory.metadata.updatedAt = new Date()
		}
	}

	private copyNode(
		resolvedPathFrom: string,
		resolvedPathTo: string,
		options: VFSCopyOptions,
	) {
		const nodeToCopy = this.getNodeByPath(resolvedPathFrom)
		if (!nodeToCopy) throw new VFSFileOrDirectoryNotFound(resolvedPathFrom)

		let targetDirectory = this.getNodeByPath(resolvedPathTo)

		if (!options.recursive && !targetDirectory) {
			throw new VFSDirectoryNotFound(resolvedPathTo)
		} else {
			if (!targetDirectory) {
				targetDirectory = this.createEmptyDirectoryNode(
					this.getFileNameByPath(resolvedPathTo),
					'user',
				)

				this.createNode(resolvedPathTo, targetDirectory, {
					recursive: true,
				})
			}
		}
		if (targetDirectory.type !== 'directory') throw new VFSNotADirectory(resolvedPathTo)

		const existingNode = targetDirectory.children.find(
			child => child.name === nodeToCopy.name,
		)
		if (existingNode) throw new VFSFileOrDirectoryAlreadyExists(resolvedPathTo)

		const deepCopy = structuredClone(nodeToCopy)
		targetDirectory.children.push(deepCopy)
		targetDirectory.metadata.updatedAt = new Date()
	}

	private deleteNode(targetPath: string, options?: VFSDeleteOptions): void {
		const node = this.getNodeByPath(targetPath)

		if (!node) throw new VFSFileOrDirectoryNotFound(targetPath)
		if (node.type === 'directory' && options?.fileType === 'file')
			throw new VFSNotAFile(targetPath)
		else if (node.type === 'file' && options?.fileType === 'directory')
			throw new VFSNotADirectory(targetPath)

		if (this.currentPath.startsWith(targetPath)) throw new VFSDirectoryIsBusy(targetPath)

		const parentPath = this.getParentPath(targetPath)
		const parentDirectory = this.getNodeByPath(parentPath)

		if (!parentDirectory) throw new VFSDirectoryNotFound(targetPath)
		if (parentDirectory.type !== 'directory') throw new VFSNotADirectory(parentPath)

		if (node.type === 'directory' && node.children.length > 0 && !options?.recursive)
			throw new VFSError(`directory not empty: ${targetPath}`)

		const index = parentDirectory.children.findIndex(child => child.name === node.name)
		if (index === -1) throw new VFSFileOrDirectoryNotFound(targetPath)

		parentDirectory.children.splice(index, 1)
		parentDirectory.metadata.updatedAt = new Date()
	}

	private createEmptyDirectoryNode(
		directoryName: string,
		owner: string,
	): VFSDirectoryNode {
		const newDirectory: VFSDirectoryNode = {
			type: 'directory',
			name: directoryName,
			children: [],
			metadata: {
				owner: owner,
				permissions: 'rwxr-xr-x',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		}
		return newDirectory
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
