export type Score = {
	part_1: number;
	part_2: number;
	placement: number;
	total: number;
}

export function isScore(x: Score): x is Score {
	let isScore = true;

	if(typeof x !== 'object' || x == null) isScore = false;
	if(Object.keys(x).length !== 4) isScore = false;
	if(typeof x.part_1 !== 'number') isScore = false;
	if(typeof x.part_2 !== 'number') isScore = false;
	if(typeof x.placement !== 'number') isScore = false;
	if(typeof x.total !== 'number') isScore = false;

	return isScore;
}