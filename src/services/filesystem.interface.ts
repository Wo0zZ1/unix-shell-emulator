export interface ICreateDirectoryOptions {
	parents?: boolean
}

export interface IDeleteOptions {
	recursive?: boolean
	force?: boolean
}

export interface IMoveOptions {
	rename?: boolean
}

export interface IFileSystemService {
	// Операции с директориями
	listDirectory(path?: string): string
	changeDirectory(path: string): void
	createDirectory(path: string, options?: ICreateDirectoryOptions): void
	deleteDirectory(path: string): void

	// Операции с файлами
	readFile(path: string): string
	writeFile(path: string, content: string): void
	createFile(path: string): void
	deleteFileOrDirectory(path: string, options?: IDeleteOptions): void
	moveFileOrDirectory(from: string, to: string, options?: IMoveOptions): void

	// Утилиты
	getCurrentPath(): string
	exists(path: string): boolean
	isFile(path: string): boolean
	isDirectory(path: string): boolean
}
