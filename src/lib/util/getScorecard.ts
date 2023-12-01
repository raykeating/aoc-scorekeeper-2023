import { supabase } from '$lib/supabaseClient';
import { Scoring } from '$types/general';
import type { Submission, User, Score, Tables } from '../../types/shorthands';
import { getUserTopDailyScore } from './scores';

type ScoreCardEntry = {
	score: string;
	day: string;
	language: string;
	placement: string;
	url: string;
}

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

export default async function getScorecard(user_id: string, languages: Tables<"Language">[]): Promise<ScoreCardEntry[]> {
	let ScoreCardEntries: ScoreCardEntry[] = [];
	let currentDay = new Date().getDate();

	for (let i = 1; i <= currentDay; i++) {
		const dateQuery = getDateQuery(i);
		const submissions = await supabase
			.from('Submission')
			.select('*')
			.eq('user_id', user_id)
			.gte('submitted_at', dateQuery.gte)
			.lt('submitted_at', dateQuery.lt)
		const submission = submissions.data[0] as Submission;

		const score = await getUserTopDailyScore(i, user_id);

		//console.log(score);
		//console.log(submission);

		if (!submission) {
			ScoreCardEntries.push({
				day: "Day " + i,
				score: "0",
				language: 'NA',
				placement: 'NA',
				url: 'NA'
			});
		} else {
			ScoreCardEntries.push({
				day: "Day " + i,
				score: "" + score.total,
				language: languages.find(lang => lang.id === submission.language_id)?.name || 'NA',
				placement: isDayCompleted(i) ? `${Math.max(0, 1 + Scoring.NUMBER_OF_PLACEMENTS - score.placement)}`: "N/A",
				url: submission.github_url || 'NA'
			});
		}
	}

	return ScoreCardEntries;
}

