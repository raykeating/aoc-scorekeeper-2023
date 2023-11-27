export type DateTime = {
	date: Date;
	iso: string;
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
	ref: unknown; //arbitrary reference to an object
}