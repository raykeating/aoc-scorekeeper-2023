
import { supabase } from '$lib/supabaseClient';
import type { Score } from '../../types/general';
import { Scoring } from '$types/general';
import type { Submission, Tables } from '../../types/shorthands';

/* 
 * Every exported function in this file will throw an error if the database request fails.
 * Wrap in try/catch blocks to handle errors when failure is not an option.
 */

//returns a range of dates to select a range from a given day
function getDateQuery(day: number): { gte: string, lt: string } {
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth() + 1;
	const startDate = new Date(currentYear, currentMonth - 1, day, 0, 0, 0, 0);
	const endDate = new Date(currentYear, currentMonth - 1, day + 1, 0, 0, 0, 0);

	return {
		gte: startDate.toISOString(),
		lt: endDate.toISOString()
	}
}

//returns true if the given day is completed
function isDayCompleted(day: number): boolean {
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth() + 1;
	const endDate = new Date(currentYear, currentMonth - 1, day + 1, 0, 0, 0, 0);

	return now > endDate;
}

//returns the top n fastest submissions for a given day. Does not check if the day is completed.
export async function getPlacements(day: number): Promise<Submission[]> {
	const dateQuery = getDateQuery(day);

	const res = await supabase
		.from('Submission')
		.select('*')
		.gte('submitted_at', dateQuery.gte)
		.lt('submitted_at', dateQuery.lt)
		.order('submitted_at', { ascending: true })
		.eq('is_completed', true)
		.limit(Scoring.NUMBER_OF_PLACEMENTS)

	if (res.error) {
		throw res.error;
	}

	return res.data as Submission[];
}

//returns the 0 indexed placement of a user for a given day. Returns -1 if the user has not submitted.
export async function getUserPlacement(day: number, userId: string, placements?: Submission[]): Promise<number> {
	if (!placements) {
		placements = await getPlacements(day);
	}

	return placements.findIndex((submission) =>
		submission.user_id === userId
	);
}

//computers the score of a user for a given day. 
export async function computeUserScore(
	day: number, userId: string, submission?: Submission, placements?: Submission[]
): Promise<Score> {
	const dateQuery = getDateQuery(day);

	if (!submission) {
		const res = await supabase
			.from('Submission')
			.select('*')
			.eq('user_id', userId)
			.gte('submitted_at', dateQuery.gte)
			.lt('submitted_at', dateQuery.lt)

		if (res.error) {
			throw res.error;
		}

		const submissions = res.data as Submission[];
		submission = submissions[0];
	}

	if (!submission) return Scoring.getEmptyScore()

	const placement = isDayCompleted(day) ? await getUserPlacement(day, userId, placements) : -1;
	const score = Scoring.getScore(submission.part_1_completed, submission.part_2_completed, placement, false);

	return score;
}

//fetches user's scores for a given day, ordered by total score
export async function getUserDailyScores(day: number, userId: string): Promise<Tables<"Score">[]> {
	const dateQuery = getDateQuery(day);

	const scoreResponse = await supabase.from('Score')
		.select('*')
		.eq('user_id', userId)
		.gte('created_at', dateQuery.gte)
		.lt('created_at', dateQuery.lt)
		.order('total', { ascending: false })

	if (scoreResponse.error) {
		throw scoreResponse.error;
	}

	return scoreResponse.data as Tables<"Score">[];
}

export async function getUserTopDailyScore(day: number, userId: string): Promise<Tables<"Score">> {
	const scores = await getUserDailyScores(day, userId);
	return scores[0];
}

//fetches all of user's scores, ordered by total score
export async function getUserScores(userId: string): Promise<Tables<"Score">[]> {
	const scoreResponse = await supabase.from('Score')
		.select('*')
		.eq('user_id', userId)
		.order('total', { ascending: false })

	if (scoreResponse.error) {
		throw scoreResponse.error;
	}

	return scoreResponse.data as Tables<"Score">[];
}

export async function getUserTotalScore(userId: string) {
	const scores = await getUserScores(userId);
	const topScoreByDay: Record<number, Tables<"Score">> = {};

	//assumes scores are ordered by total score
	scores.forEach((score) => {
		const date = new Date(score.created_at)
		const day = date.getDate();

		if (!topScoreByDay[day]) {
			topScoreByDay[day] = score;
		}
	})

	return Object.values(topScoreByDay).reduce((acc, score) => {
		return {
			part_1: acc.part_1 + score.part_1,
			part_2: acc.part_2 + score.part_2,
			placement: acc.placement + score.placement,
			copilot: acc.copilot + score.copilot,
			total: acc.total + score.total
		}
	}, Scoring.getEmptyScore());
}