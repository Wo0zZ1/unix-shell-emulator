import { describe, expect, test } from '@jest/globals'
import { CommandParser } from './command-parser'

describe('CommandParser', () => {
	let tokenize = CommandParser['tokenize']
	let splitByPipe = CommandParser['splitByPipe']
	let extractRedirects = CommandParser['extractRedirects']

	test('parses simple commands', () => {
		expect(tokenize('echo hello')).toStrictEqual([
			{ value: 'echo', quoted: false },
			{ value: 'hello', quoted: false },
		])

		expect(tokenize('echo "hello world"')).toStrictEqual([
			{ value: 'echo', quoted: false },
			{ value: 'hello world', quoted: 'double' },
		])

		expect(tokenize('ls > file.txt')).toStrictEqual([
			{ value: 'ls', quoted: false },
			{ value: '>', quoted: false },
			{ value: 'file.txt', quoted: false },
		])
		expect(tokenize('ls >> file.txt')).toStrictEqual([
			{ value: 'ls', quoted: false },
			{ value: '>>', quoted: false },
			{ value: 'file.txt', quoted: false },
		])

		expect(tokenize('ls|grep')).toStrictEqual([
			{ value: 'ls', quoted: false },
			{ value: '|', quoted: false },
			{ value: 'grep', quoted: false },
		])

		expect(tokenize('ls|grep txt')).toStrictEqual([
			{ value: 'ls', quoted: false },
			{ value: '|', quoted: false },
			{ value: 'grep', quoted: false },
			{ value: 'txt', quoted: false },
		])

		expect(tokenize('ls    -la')).toStrictEqual([
			{ value: 'ls', quoted: false },
			{ value: '-la', quoted: false },
		])

		expect(tokenize(`echo 'a|b>c'`)).toStrictEqual([
			{ value: 'echo', quoted: false },
			{ value: 'a|b>c', quoted: 'single' },
		])

		expect(tokenize(``)).toStrictEqual([])

		expect(tokenize(`      `)).toStrictEqual([])

		expect(tokenize.bind(CommandParser, `echo 'unclosed`)).toThrow(
			'Unclosed quotes in command',
		)
	})

	test('splits simple commands', () => {
		expect(
			splitByPipe([
				{ value: 'echo', quoted: false },
				{ value: 'hello world', quoted: 'double' },
			]),
		).toStrictEqual([
			[
				{ value: 'echo', quoted: false },
				{ value: 'hello world', quoted: 'double' },
			],
		])

		expect(
			splitByPipe([
				{ value: 'ls', quoted: false },
				{ value: '>>', quoted: false },
				{ value: 'file.txt', quoted: false },
			]),
		).toStrictEqual([
			[
				{ value: 'ls', quoted: false },
				{ value: '>>', quoted: false },
				{ value: 'file.txt', quoted: false },
			],
		])

		expect(
			splitByPipe([
				{ value: 'ls', quoted: false },
				{ value: '|', quoted: false },
				{ value: 'grep', quoted: false },
				{ value: 'txt', quoted: false },
			]),
		).toStrictEqual([
			[{ value: 'ls', quoted: false }],
			[
				{ value: 'grep', quoted: false },
				{ value: 'txt', quoted: false },
			],
		])

		expect(
			splitByPipe([
				{ value: 'echo', quoted: false },
				{ value: 'a|b>c', quoted: 'single' },
			]),
		).toStrictEqual([
			[
				{ value: 'echo', quoted: false },
				{ value: 'a|b>c', quoted: 'single' },
			],
		])

		expect(
			splitByPipe([
				{ value: 'ls', quoted: false },
				{ value: '>>', quoted: false },
				{ value: 'file.txt', quoted: false },
				{ value: '|', quoted: false },
				{ value: 'echo', quoted: false },
				{ value: '|', quoted: false },
			]),
		).toStrictEqual([
			[
				{ value: 'ls', quoted: false },
				{ value: '>>', quoted: false },
				{ value: 'file.txt', quoted: false },
			],
			[{ value: 'echo', quoted: false }],
		])

		expect(
			splitByPipe.bind(CommandParser, [
				{ value: 'ls', quoted: false },
				{ value: '|', quoted: false },
				{ value: '|', quoted: false },
				{ value: 'ls', quoted: false },
			]),
		).toThrow("Two consecutive '|' symbols")
	})

	test('extracts redirects correctly', () => {
		expect(
			extractRedirects([
				[
					{ value: 'echo', quoted: false },
					{ value: 'hello world', quoted: 'double' },
				],
			]),
		).toStrictEqual([
			{
				pipeTokens: [
					{ value: 'echo', quoted: false },
					{ value: 'hello world', quoted: 'double' },
				],
				redirects: {},
			},
		])

		expect(
			extractRedirects([
				[
					{ value: 'ls', quoted: false },
					{ value: '>', quoted: false },
					{ value: 'file.txt', quoted: false },
				],
			]),
		).toStrictEqual([
			{
				pipeTokens: [{ value: 'ls', quoted: false }],
				redirects: { redirectOutput: { type: '>', file: 'file.txt' } },
			},
		])

		expect(
			extractRedirects([
				[{ value: 'ls', quoted: false }],
				[
					{ value: 'grep', quoted: false },
					{ value: 'txt', quoted: false },
				],
			]),
		).toStrictEqual([
			{ pipeTokens: [{ value: 'ls', quoted: false }], redirects: {} },
			{
				pipeTokens: [
					{ value: 'grep', quoted: false },
					{ value: 'txt', quoted: false },
				],
				redirects: {},
			},
		])

		expect(
			extractRedirects([
				[
					{ value: 'ls', quoted: false },
					{ value: '>>', quoted: false },
					{ value: 'file.txt', quoted: false },
				],
				[{ value: 'echo', quoted: false }],
			]),
		).toStrictEqual([
			{
				pipeTokens: [{ value: 'ls', quoted: false }],
				redirects: { redirectOutput: { type: '>>', file: 'file.txt' } },
			},
			{ pipeTokens: [{ value: 'echo', quoted: false }], redirects: {} },
		])

		expect(
			extractRedirects([
				[
					{ value: 'ls', quoted: false },
					{ value: '>', quoted: false },
					{ value: 'file1.txt', quoted: false },
				],
				[
					{ value: '<', quoted: false },
					{ value: 'file1.txt', quoted: false },
					{ value: 'echo', quoted: false },
					{ value: '>>', quoted: false },
					{ value: 'file2.txt', quoted: false },
				],
			]),
		).toStrictEqual([
			{
				pipeTokens: [{ value: 'ls', quoted: false }],
				redirects: { redirectOutput: { type: '>', file: 'file1.txt' } },
			},
			{
				pipeTokens: [{ value: 'echo', quoted: false }],
				redirects: {
					redirectInput: 'file1.txt',
					redirectOutput: {
						type: '>>',
						file: 'file2.txt',
					},
				},
			},
		])

		expect(
			extractRedirects([
				[
					{ value: '>', quoted: false },
					{ value: 'file.txt', quoted: false },
				],
			]),
		).toStrictEqual([
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

		expect(
			extractRedirects([
				[
					{ value: '>>', quoted: false },
					{ value: 'file.txt', quoted: false },
				],
			]),
		).toStrictEqual([
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

		expect(
			extractRedirects([
				[
					{ value: '<', quoted: false },
					{ value: 'file.txt', quoted: false },
				],
			]),
		).toStrictEqual([
			{
				pipeTokens: [],
				redirects: { redirectInput: 'file.txt' },
			},
		])

		expect(
			extractRedirects.bind(CommandParser, [[{ value: 'ls >', quoted: false }]]),
		).toThrow('Redirect symbol at the end of pipe')

		expect(
			extractRedirects.bind(CommandParser, [[{ value: 'echo "123" >>', quoted: false }]]),
		).toThrow('Redirect symbol at the end of pipe')

		expect(
			extractRedirects.bind(CommandParser, [[{ value: 'ls <', quoted: false }]]),
		).toThrow('Redirect symbol at the end of pipe')
	})
})
