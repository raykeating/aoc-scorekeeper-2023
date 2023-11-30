//configuration
const part1Points = 4;
const part2Points = 2;
const placementPoints = [3, 2, 1];
const copilotDeduction = 0;

//different from the db Score type
export type Score = {
	part_1: number;
	part_2: number;
	placement: number;
	copilot: number;
	total: number;
}

//imperfect type guard
export function isScore(x: Score): x is Score {
	let isScore = true;

	if (typeof x !== 'object' || x == null) isScore = false;
	if (Object.keys(x).length !== 5) isScore = false;
	if (typeof x.part_1 !== 'number') isScore = false;
	if (typeof x.part_2 !== 'number') isScore = false;
	if (typeof x.placement !== 'number') isScore = false;
	if (typeof x.copilot !== 'number') isScore = false;
	if (typeof x.total !== 'number') isScore = false;

	return isScore;
}

//one place to modify the scoring system
//looks weird but ts doesn't support static properties on classes (yet another L)
export class Scoring {

	public static get PART_1_POINTS(): number { return part1Points }
	public static get PART_2_POINTS(): number { return part2Points }
	public static get PLACEMENT_POINTS(): number[] { return placementPoints }
	public static get COPILOT_DEDUCTION(): number { return copilotDeduction }
	public static get MAX_DAILY_SCORE(): number { return this.getScore(true, true, 0, false).total }
	public static get MAX_TOTAL_SCORE(): number { return 25 * this.MAX_DAILY_SCORE }
	public static get NUMBER_OF_PLACEMENTS(): number { return this.PLACEMENT_POINTS.length }

	public static getEmptyScore(): Score {
		return {
			part_1: 0,
			part_2: 0,
			placement: 0,
			copilot: 0,
			total: 0
		}
	}

	public static getScore(part1Completed: boolean, part2Completed: boolean, placement: number, copilot: boolean): Score {
		const score: Score = {
			part_1: 0,
			part_2: 0,
			placement: 0,
			copilot: 0,
			total: 0
		}

		if (part1Completed) score.part_1 = Scoring.PART_1_POINTS;
		if (part2Completed) score.part_2 = Scoring.PART_2_POINTS;
		if (placement !== -1 && placement < this.NUMBER_OF_PLACEMENTS) score.placement = Scoring.PLACEMENT_POINTS[placement];
		if (copilot) score.copilot = - Scoring.COPILOT_DEDUCTION;

		score.total = score.part_1 + score.part_2 + score.placement + score.copilot;

		return score;
	}
}