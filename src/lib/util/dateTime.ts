import type { DateTime } from '../../types/dateTime';

export function createDateTime(dateString: string, ref?: unknown): DateTime {
	const date = new Date(dateString);

	return {
		date,
		iso: date.toISOString(),
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate(),
		hour: date.getHours(),
		minute: date.getMinutes(),
		second: date.getSeconds(),
		ref: ref
	}
}

export function nowDateTime(): DateTime {
	return createDateTime(new Date().toISOString());
}

export function fromDatabaseObjects(refs: unknown[], fieldName: string): DateTime[] {
	return refs.map((ref) => {
		return createDateTime(ref[fieldName], ref);
	});
}

export function sort(dateTimes: DateTime[], order: "asc" | "desc" = "asc"): DateTime[] {
	return [...dateTimes].sort((a, b) => {
		return (order === "asc" ? 1 : -1) * (a.date.getTime() - b.date.getTime());
	});
}