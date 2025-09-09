export class VFSError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'VFSError'
	}
}

export class VFSLoadingError extends VFSError {
	constructor(message: string) {
		super(message)
		this.name = 'VFSLoadingError'
	}
}

export class VFSFormatError extends VFSLoadingError {
	constructor(expectedFormat: string) {
		super(`expected ${expectedFormat}`)
		this.name = 'VFSFormatError'
	}
}

export class VFSFileOrDirectoryNotFound extends VFSError {
	constructor(path: string) {
		super(`no such file or directory: ${path}`)
	}
}

export class VFSFileNotFound extends VFSError {
	constructor(path: string) {
		super(`no such file: ${path}`)
	}
}

export class VFSDirectoryNotFound extends VFSError {
	constructor(path: string) {
		super(`no such directory: ${path}`)
	}
}
