import { VFSNode } from './vfs'

export const DEFAULT_VFS_STRUCTURE: VFSNode[] = [
	{
		name: 'home',
		type: 'directory',
		metadata: {
			owner: 'user',
			permissions: 'rwxr-xr-x',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		children: [
			{
				name: 'user',
				type: 'directory',
				metadata: {
					owner: 'user',
					permissions: 'rwxr-xr-x',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				children: [
					{
						name: 'file1.txt',
						type: 'file',
						content: 'Hello from VFS!',
						metadata: {
							owner: 'user',
							permissions: 'rw-r--r--',
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					},
					{
						name: 'file2.txt',
						type: 'file',
						content: 'Another hello from VFS!',
						metadata: {
							owner: 'user',
							permissions: 'rw-r--r--',
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					},
				],
			},
			{
				name: 'bin',
				type: 'directory',
				metadata: {
					owner: 'user',
					permissions: 'rwxr-xr-x',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				children: [],
			},
		],
	},
]
