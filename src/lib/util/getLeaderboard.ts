// scoring works like this:
// 4 points for completing part 1
// 2 points for completing part 2

// an additional 3 points is awarded to the fastest time each day
// an additional 2 points is awarded to the second fastest time each day
// an additional 1 point is awarded to the third fastest time each day

import { supabase } from '$lib/supabaseClient';
import type { Database } from '../../types/database';
import DateTimeWrapper from '../../types/DateTimeWrapper';
import type { Score } from '../../types/general';
import type { Language, Submission, User } from '../../types/shorthands';

type LeaderboardEntry = {
	user: User;
	score: Score;
};

//maps submissions ids to scores given submissions
function getSubmissionScores(submissions: Submission[]): Record<number, Score> {
	//convenient date time objects to hold the submission times
	let submissionTimes = DateTimeWrapper.createFromDatabaseObjects<Submission>(submissions, 'submitted_at');
	submissionTimes = DateTimeWrapper.sort(submissionTimes)

	//record to hold the submission scores by id
	const submissionScores: Record<number, Score> = {}
	submissionTimes.forEach((submissionTime) => {
		const submission = submissionTime.ref;
		submissionScores[submission.id] = { total: 0, part1: 0, part2: 0, finishTimeBonus: 0 };
	});

	//store the submissions by day
	const submissionsByDay: Record<number, DateTimeWrapper<Submission>[]> = {}
	submissionTimes.forEach((submissionTime) => {
		const day = submissionTime.day;
		if (!submissionsByDay[day]) submissionsByDay[day] = [];
		submissionsByDay[day].push(submissionTime);
	});

	//compute completion scores
	submissionTimes.forEach((submissionTime) => {
		const submission = submissionTime.ref;
		submission.part_1_completed && (submissionScores[submission.id].part1 = 4);
		submission.part_2_completed && (submissionScores[submission.id].part2 = 2);
	})

	//compute finish time scores
	Object.keys(submissionsByDay).forEach((day) => {
		DateTimeWrapper.sort(submissionsByDay[Number(day)])
			.filter((submission) => submission.ref.is_completed)
			.slice(0, 3)
			.forEach((submissionDateTime, index) => {
				const submission = submissionDateTime.ref;
				submissionScores[submission.id].finishTimeBonus += 3 - index;
			});
	})

	//compute total scores
	Object.keys(submissionScores).forEach((id) => {
		const score = submissionScores[Number(id)];
		score.total = score.part1 + score.part2 + score.finishTimeBonus;
	})

	return submissionScores;
}

//maps users ids to scores given submissions
function getUserScores(submissions: Submission[]): Record<string, Score> {
	const submissionScores = getSubmissionScores(submissions);

	///record to hold the user scores by id
	const userScores: Record<string, Score> = {}

	//total the scores
	submissions.forEach((submission) => {
		const submissionScore = submissionScores[submission.id];

		if (!userScores[submission.user_id as string])
			userScores[submission.user_id as string] = { total: 0, part1: 0, part2: 0, finishTimeBonus: 0 };

		const userScore = userScores[submission.user_id as string];
		userScore.part1 += submissionScore.part1;
		userScore.part2 += submissionScore.part2;
		userScore.finishTimeBonus += submissionScore.finishTimeBonus;
		userScore.total += submissionScore.total;
	})

	return userScores;
}

export default async function getLeaderboard(
	submissions: Submission[],
): Promise<LeaderboardEntry[]> {
	const userResponse = await supabase.from('User').select('*');
	const users = userResponse.data as User[];

	const userScores = getUserScores(submissions);

	const leaderboard: LeaderboardEntry[] = users.map((user) =>
		({ user, score: userScores[user.id as string] })
	).sort((a, b) => b.score.total - a.score.total);

	console.log(leaderboard);

	return leaderboard;
}