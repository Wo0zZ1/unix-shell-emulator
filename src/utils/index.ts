export function minmax(min: number, max: number, num: number) {
	if (num <= min) return min
	if (num >= max) return max
	return num
}

export async function sleep(ms: number) {
	return new Promise(res => setTimeout(res, ms))
}
