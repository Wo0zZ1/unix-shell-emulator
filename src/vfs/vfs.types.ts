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
