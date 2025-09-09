import { VFSNode } from './vfs'

export const DEFAULT_VFS_STRUCTURE: VFSNode[] = [
	{
		name: 'home',
		type: 'directory',
		children: [
			{
				name: 'user',
				type: 'directory',
				children: [
					{
						name: 'file1.txt',
						type: 'file',
						content: 'Hello from VFS!',
					},
					{
						name: 'file2.txt',
						type: 'file',
						content: 'Another hello from VFS!',
					},
				],
			},
			{
				name: 'bin',
				type: 'directory',
				children: [],
			},
		],
	},
]
