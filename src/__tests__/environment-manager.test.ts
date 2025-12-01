import { describe, expect, test } from '@jest/globals'
import { EnvironmentManager } from '../core/environment-manager'

describe('EnvironmentManager', () => {
	const env = new EnvironmentManager()

	test('set and get variable', () => {
		env.set('USER', 'john')
		expect(env.get('USER')).toBe('john')

		expect(env.get('HOME')).toBeUndefined()
		env.set('HOME', '/home/john')
		expect(env.get('HOME')).toBe('/home/john')

		env.set('EMPTY', '')
		expect(env.get('EMPTY')).toBe('')

		expect(env.getAll()).toEqual({ USER: 'john', HOME: '/home/john', EMPTY: '' })

		env.unset('EMPTY')
		expect(env.get('EMPTY')).toBeUndefined()

		env.clear()
		expect(env.getAll()).toEqual({})
	})

	test('expand variables', () => {
		env.set('USER', 'john')
		env.set('HOME', '/home/john')
		env.set('EMPTY', '')

		expect(env.expand('Hello $USER', true)).toBe('Hello john')
		expect(env.expand('Path: $HOME/docs', true)).toBe('Path: /home/john/docs')
		expect(env.expand('Empty var: $EMPTY.', true)).toBe('Empty var: .')
		expect(env.expand('Undefined var: $UNDEF.', true)).toBe('Undefined var: .')
		expect(env.expand('Mixed ${USER} and $HOME', true)).toBe('Mixed john and /home/john')
		expect(env.expand('No expansion here', false)).toBe('No expansion here')
		expect(env.expand('Literal $USER should not expand', false)).toBe(
			'Literal $USER should not expand',
		)
		expect(env.expand('Price: 100$', true)).toBe('Price: 100$')
	})
})
