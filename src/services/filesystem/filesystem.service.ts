import {
	ICpOptions,
	ICreateDirectoryOptions,
	IDeleteDirectoryOptions,
	IDeleteFileOptions,
	IFileSystemService,
	IMoveOptions,
} from './filesystem.interface'
import { VFS, VFSNode } from '../../vfs'

export class FileSystemService implements IFileSystemService {
	constructor(private vfs: VFS) {}

	listDirectory(path?: string): string {
		return this.vfs.list(path)
	}

	changeDirectory(path: string): void {
		this.vfs.cd(path)
	}

	createDirectory(path: string, options?: ICreateDirectoryOptions): void {
		this.vfs.create(path, 'directory', { recursive: options?.parents })
	}

	deleteDirectory(path: string, options?: IDeleteDirectoryOptions): void {
		this.vfs.delete(path, { recursive: options?.parents, fileType: 'directory' })
	}

	readFile(path: string): string {
		return this.vfs.read(path)
	}

	writeFile(path: string, content: string): void {
		this.vfs.write(path, content)
	}

	createFile(path: string): void {
		this.vfs.create(path, 'file')
	}

	deleteFile(path: string, options?: IDeleteFileOptions): void {
		this.vfs.delete(path, {
			recursive: options?.recursive,
			fileType: options?.recursive ? undefined : 'file',
		})
	}

	moveFileOrDirectory(from: string, to: string, options?: IMoveOptions): void {
		this.vfs.move(from, to, { rename: options?.rename })
	}

	copyFileOrDirectory(from: string, to: string, options?: ICpOptions): void {
		this.vfs.copy(from, to, { recursive: options?.recursive })
	}

	getCurrentPath(): string {
		return this.vfs.getCurrentPath()
	}

	getNode(path: string): VFSNode {
		return this.vfs.get(path)
	}

	resolvePath(path: string): string {
		return this.vfs.resolvePath(path)
	}

	exists(path: string): boolean {
		try {
			const resolvedPath = this.vfs.resolvePath(path)
			const node = this.vfs.getNodeByPath(resolvedPath)
			return node !== null && node !== undefined
		} catch {
			return false
		}
	}

	isFile(path: string): boolean {
		try {
			const resolvedPath = this.vfs.resolvePath(path)
			const node = this.vfs.getNodeByPath(resolvedPath)
			return node !== null && node !== undefined && node.type === 'file'
		} catch {
			return false
		}
	}

	isDirectory(path: string): boolean {
		try {
			const resolvedPath = this.vfs.resolvePath(path)
			const node = this.vfs.getNodeByPath(resolvedPath)
			return node !== null && node !== undefined && node.type === 'directory'
		} catch {
			return false
		}
	}

	toXML(): string {
		return this.vfs.toXML()
	}
}
