import { describe, expect, test } from '@jest/globals'
import { CommandParser } from './command-parser'

describe('CommandParser', () => {
	let tokenize = CommandParser['tokenize']
	let splitByPipe = CommandParser['splitByPipe']
	let extractRedirects = CommandParser['extractRedirects']

	test('parses simple commands', () => {
		expect(tokenize('echo hello')).toStrictEqual(['echo', 'hello'])

		expect(tokenize('echo "hello world"')).toStrictEqual(['echo', 'hello world'])

		expect(tokenize('ls > file.txt')).toStrictEqual(['ls', '>', 'file.txt'])

		expect(tokenize('ls >> file.txt')).toStrictEqual(['ls', '>>', 'file.txt'])

		expect(tokenize('ls|grep')).toStrictEqual(['ls', '|', 'grep'])

		expect(tokenize('ls|grep txt')).toStrictEqual(['ls', '|', 'grep', 'txt'])

		expect(tokenize('ls    -la')).toStrictEqual(['ls', '-la'])

		expect(tokenize(`echo 'a|b>c'`)).toStrictEqual(['echo', 'a|b>c'])

		expect(tokenize(``)).toStrictEqual([])

		expect(tokenize(`      `)).toStrictEqual([])

		expect(tokenize.bind(CommandParser, `echo 'unclosed`)).toThrow(
			'Unclosed quotes in command',
		)
	})

	test('splits simple commands', () => {
		expect(splitByPipe(['echo', 'hello world'])).toStrictEqual([['echo', 'hello world']])

		expect(splitByPipe(['ls', '>>', 'file.txt'])).toStrictEqual([
			['ls', '>>', 'file.txt'],
		])

		expect(splitByPipe(['ls', '|', 'grep', 'txt'])).toStrictEqual([
			['ls'],
			['grep', 'txt'],
		])

		expect(splitByPipe(['echo', 'a|b>c'])).toStrictEqual([['echo', 'a|b>c']])

		expect(splitByPipe(['ls', '>>', 'file.txt', '|', 'echo', '|'])).toStrictEqual([
			['ls', '>>', 'file.txt'],
			['echo'],
		])

		expect(splitByPipe.bind(CommandParser, ['ls', '|', '|', 'ls'])).toThrow(
			"Two consecutive '|' symbols",
		)
	})

	test('extracts redirects correctly', () => {
		expect(extractRedirects([['echo', 'hello world']])).toStrictEqual([
			{ pipeTokens: ['echo', 'hello world'], redirects: {} },
		])

		expect(extractRedirects([['ls', '>', 'file.txt']])).toStrictEqual([
			{
				pipeTokens: ['ls'],
				redirects: { redirectOutput: { type: '>', file: 'file.txt' } },
			},
		])

		expect(extractRedirects([['ls'], ['grep', 'txt']])).toStrictEqual([
			{ pipeTokens: ['ls'], redirects: {} },
			{ pipeTokens: ['grep', 'txt'], redirects: {} },
		])

		expect(extractRedirects([['ls', '>>', 'file.txt'], ['echo']])).toStrictEqual([
			{
				pipeTokens: ['ls'],
				redirects: { redirectOutput: { type: '>>', file: 'file.txt' } },
			},
			{ pipeTokens: ['echo'], redirects: {} },
		])

		expect(
			extractRedirects([
				['ls', '>', 'file1.txt'],
				['<', 'file1.txt', 'echo', '>>', 'file2.txt'],
			]),
		).toStrictEqual([
			{
				pipeTokens: ['ls'],
				redirects: { redirectOutput: { type: '>', file: 'file1.txt' } },
			},
			{
				pipeTokens: ['echo'],
				redirects: {
					redirectInput: 'file1.txt',
					redirectOutput: {
						type: '>>',
						file: 'file2.txt',
					},
				},
			},
		])

		expect(extractRedirects([['>', 'file.txt']])).toStrictEqual([
			{
				pipeTokens: [],
				redirects: {
					redirectOutput: {
						type: '>',
						file: 'file.txt',
					},
				},
			},
		])

		expect(extractRedirects([['>>', 'file.txt']])).toStrictEqual([
			{
				pipeTokens: [],
				redirects: {
					redirectOutput: {
						type: '>>',
						file: 'file.txt',
					},
				},
			},
		])

		expect(extractRedirects([['<', 'file.txt']])).toStrictEqual([
			{
				pipeTokens: [],
				redirects: { redirectInput: 'file.txt' },
			},
		])

		expect(extractRedirects.bind(CommandParser, [['ls >']])).toThrow(
			'Redirect symbol at the end of pipe',
		)

		expect(extractRedirects.bind(CommandParser, [['echo "123" >>']])).toThrow(
			'Redirect symbol at the end of pipe',
		)

		expect(extractRedirects.bind(CommandParser, [['ls <']])).toThrow(
			'Redirect symbol at the end of pipe',
		)
	})
})
