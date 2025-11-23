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
	VFSNotAFile,
} from './errors/vfs-error'
import { DEFAULT_VFS_STRUCTURE } from './vfs-default'
import VFSParser from './vfs-praser'

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

export interface VFSCreateOptions {
	recursive?: boolean
}

export interface VFSDeleteOptions {
	recursive?: boolean
	force?: boolean
}

export interface VFSMoveOptions {
	rename?: boolean
}

export class VFS {
	private root!: VFSDirectoryNode
	private currentPath: string = '/'

	constructor(root: VFSDirectoryNode) {
		this.root = root
	}

	public static loadDefault(): VFS {
		const root: VFSDirectoryNode = {
			name: 'root',
			type: 'directory',
			children: DEFAULT_VFS_STRUCTURE,
		} as VFSDirectoryNode
		return new VFS(root)
	}

	public static async loadFromXML(VFSPath: string): Promise<VFS> {
		if (!VFSPath.endsWith('.xml')) throw new VFSFormatError('.xml')
		const file = await window.electronAPI.readFile(VFSPath.trim())
		const fileContent = file.toString()
		const root = VFSParser.parseXML(fileContent)
		return new VFS(root)
	}

	public list(path?: string): string {
		console.log('ls выбрал:', path)

		const resolvedPath = path ? this.resolvePath(path) : this.currentPath
		const node = this.getNodeByPath(resolvedPath)

		if (!node || node.type !== 'directory') throw new VFSDirectoryNotFound(resolvedPath)

		return (
			(resolvedPath == '/' ? '.\t' : '.\t..\t') +
			node.children.map(child => child.name).join('\t')
		)
	}

	public cd(path: string): void {
		const resolvedPath = this.resolvePath(path)
		const node = this.getNodeByPath(resolvedPath)

		if (!node || node.type !== 'directory') throw new VFSDirectoryNotFound(resolvedPath)

		this.currentPath = resolvedPath
	}

	public read(path: string): string {
		const resolvedPath = this.resolvePath(path)
		const file = this.getNodeByPath(resolvedPath)
		if (!file || file.type !== 'file') throw new VFSFileNotFound(resolvedPath)
		return file.content
	}

	public create(
		path: string,
		type: 'file' | 'directory',
		options?: VFSCreateOptions,
	): void {
		const resolvedPath = this.resolvePath(path)
		const nodeName = this.getFileNameByPath(resolvedPath)

		const newNode: VFSNode =
			type === 'file'
				? { name: nodeName, type: 'file', content: '' }
				: { name: nodeName, type: 'directory', children: [] }

		this.createNode(resolvedPath, newNode, { recursive: options?.recursive ?? false })
	}

	public move(from: string, to: string, options?: VFSMoveOptions) {
		const resolvedPathFrom = this.resolvePath(from)
		const resolvedPathTo = this.resolvePath(to)
		this.moveNode(resolvedPathFrom, resolvedPathTo, options?.rename ?? false)
	}

	public delete(path: string, options?: VFSDeleteOptions): void {
		const resolvedPath = this.resolvePath(path)
		this.deleteNode(resolvedPath, {
			recursive: options?.recursive ?? false,
			force: options?.force ?? false,
		})
	}

	public write(path: string, content: string): void {
		const resolvedPath = this.resolvePath(path)
		const file = this.getNodeByPath(resolvedPath)

		if (!file) {
			this.create(path, 'file')
			const newFile = this.getNodeByPath(resolvedPath)
			if (newFile && newFile.type === 'file') newFile.content = content
		} else if (file.type === 'file') file.content = content
		else throw new VFSNotAFile(path)
	}

	public getCurrentPath(): string {
		return this.currentPath
	}

	public resolvePath(path: string): string {
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

	private deleteNode(targetPath: string, options?: VFSDeleteOptions): void {
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
