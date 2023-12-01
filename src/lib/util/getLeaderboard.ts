import { supabase } from '$lib/supabaseClient';
import type { Score } from '../../types/general';
import type {  Submission, User, Tables } from '../../types/shorthands';
import {  getUserTotalScore } from './scores';

type LeaderboardEntry = {
	user: User;
	score: Score;
};

export default async function getLeaderboard(
	submissions: Submission[],
): Promise<LeaderboardEntry[]> {
	const userResponse = await supabase.from('User').select('*');
	const users = userResponse.data as Tables<"User">[];

	//determine leaderboard entries
	const leaderboard: LeaderboardEntry[] = []
	for (const user of users) {
		const dbScore = await getUserTotalScore(user.id as string);
		const score = {
			part_1: dbScore.part_1,
			part_2: dbScore.part_2,
			placement: dbScore.placement,
			copilot: dbScore.copilot,
			total: dbScore.total,
		}

		leaderboard.push({ user, score });
	}

	//sort the leaderboard
	leaderboard.sort((a, b) => {
		return b.score.total - a.score.total;
	})

	return leaderboard;
}