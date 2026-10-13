export function formatMessageTime(value: string | null | undefined) {
	if (!value) return null

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return null

	const today = new Date()
	const isSameDay = (left: Date, right: Date) =>
		left.getFullYear() === right.getFullYear() &&
		left.getMonth() === right.getMonth() &&
		left.getDate() === right.getDate()

	if (isSameDay(date, today)) {
		return date.toLocaleTimeString('pt-BR', {
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	const yesterday = new Date(today)
	yesterday.setDate(today.getDate() - 1)
	if (isSameDay(date, yesterday)) return 'ontem'

	return date.toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: '2-digit',
	})
}
