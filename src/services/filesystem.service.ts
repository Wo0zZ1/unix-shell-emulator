import { VFS } from '../vfs'
import {
	ICreateDirectoryOptions,
	IDeleteOptions,
	IFileSystemService,
	IMoveOptions,
} from './filesystem.interface'

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

	deleteDirectory(path: string): void {
		this.vfs.delete(path, { recursive: false })
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

	deleteFileOrDirectory(path: string, options?: IDeleteOptions): void {
		this.vfs.delete(path, { recursive: options?.recursive })
	}

	moveFileOrDirectory(from: string, to: string, options?: IMoveOptions): void {
		this.vfs.move(from, to, { rename: options?.rename })
	}

	getCurrentPath(): string {
		return this.vfs.getCurrentPath()
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
}
