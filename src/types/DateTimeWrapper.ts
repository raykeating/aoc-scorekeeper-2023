/* wrapped object must have the following fields */
type EnforcedFields = { id: number, created_at: string | null, submitted_at: string | null};

/* wraps an arbitrary object with date time information */
export default class DateTimeWrapper<T extends EnforcedFields> {
	date: Date;
	iso: string;
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
	ref: T;

	public constructor(dateString: string, ref: T) {
		this.date = new Date(dateString);
		this.iso = this.date.toISOString();
		this.year = this.date.getFullYear();
		this.month = this.date.getMonth() + 1;
		this.day = this.date.getDate();
		this.hour = this.date.getHours();
		this.minute = this.date.getMinutes();
		this.second = this.date.getSeconds();
		this.ref = ref;
	}

	//create an array DateTimeWrapper from a database object
	public static createFromDatabaseObjects<T extends EnforcedFields>(
		refs: T[],
		fieldName: "created_at" | "submitted_at"
	): DateTimeWrapper<T>[] {
		return refs.map((ref) => {
			return new DateTimeWrapper<T>(ref[fieldName], ref);
		});
	}

	//return a new array of DateTimeWrapper sorted by date (no mutation)
	public static sorted<T extends EnforcedFields>(
		dateTimes: DateTimeWrapper<T>[],
		order: "asc" | "desc" = "asc"
	): DateTimeWrapper<T>[] {
		return [...dateTimes].sort((a, b) => {
			return (order === "asc" ? 1 : -1) * (a.date.getTime() - b.date.getTime());
		});
	}

	//sort the array of DateTimeWrapper by date (mutates the array)
	public static sort<T extends EnforcedFields>(
		dateTimes: DateTimeWrapper<T>[],
		order: "asc" | "desc" = "asc"
	): DateTimeWrapper<T>[] {
		return dateTimes.sort((a, b) => {
			return (order === "asc" ? 1 : -1) * (a.date.getTime() - b.date.getTime());
		});
	}
}