import { supabase } from '$lib/supabaseClient';
import type { Database } from '../../types/database';
import { nowDateTime, createDateTime, sort, fromDatabaseObjects } from '$lib/util/dateTime';
import type { DateTime } from '../../types/dateTime';

type LeaderboardEntry = {
	user: {
		id: string;
		name: string;
		profile_image_url: string;
	};
	language: {
		id: number;
		name: string;
		difficulty: string;
	};
	score: number;
};


function getSubmissionScores(submissions: any[]): Record<number, number> {
	//convenient date time objects to hold the submission times
	let submissionDateTimes = sort(fromDatabaseObjects(submissions, 'submitted_at'));

	//record to hold the submission scores by id
	let submissionScores: Record<number, number> = {}
	submissionDateTimes.forEach((submissionDateTime) => {
		const submission = submissionDateTime.ref;
		submissionScores[submission.id] = 0;
	});

	//store the submissions by day
	let submissionsByDay: Record<number, DateTime[]> = {}
	submissionDateTimes.forEach((submissionDateTime) => {
		const day = submissionDateTime.day;
		if (!submissionsByDay[day]) submissionsByDay[day] = [];
		submissionsByDay[day].push(submissionDateTime);
	});

	//compute completion scores
	submissionDateTimes.forEach((submissionDateTime) => {
		const submission = submissionDateTime.ref;
		submission.part_1_completed && (submissionScores[submission.id] += 4);
		submission.part_2_completed && (submissionScores[submission.id] += 2);
	})

	//compute finish time scores
	Object.keys(submissionsByDay).forEach((day) => {
		const fastestSubmissions = sort(submissionsByDay[day]).slice(0, 3);

		fastestSubmissions.forEach((submissionDateTime, index) => {
			const submission = submissionDateTime.ref;
			submissionScores[submission.id] += 3 - index;
		});
	})

	return submissionScores;
}

export default async function getLeaderboard(
	submissions: any,
	languages: any
): Promise<LeaderboardEntry[]> {
	//console.log("submissions", submissions);
	//console.log("languages", languages);

	// scoring works like this:
	// 4 points for completing part 1
	// 2 points for completing part 2

	// an additional 3 points is awarded to the fastest time each day
	// an additional 2 points is awarded to the second fastest time each day
	// an additional 1 point is awarded to the third fastest time each day

	getSubmissionScores(submissions);

	const leaderboard: LeaderboardEntry[] = [];

	const users = await supabase.from('User').select('*');
	//console.log("users", users);

	// get the fastest submissions for each day (excluding today)
	// submission time is submitted_at - created_at
	// then add the additional points to the leaderboard
	// then sort the leaderboard by score
	// then return the leaderboard
	/*
	function getFastestSubmissions() {
		const fastestSubmissions: any[] = [];

		const todaysDate = new Date().toISOString().slice(0, 10);
		console.log(new Date().toISOString())

		submissions.forEach((submission: any) => {
			const submissionDate = new Date(submission.created_at).toISOString().slice(0, 10);
			console.log(new Date(submission.created_at).toISOString())
			if (submissionDate !== todaysDate) {
				const submissionTime =
					new Date(submission.submitted_at).getTime() - new Date(submission.created_at).getTime();
				fastestSubmissions.push({
					submission,
					submissionTime
				});
			}
		});

		fastestSubmissions.sort((a, b) => a.submissionTime - b.submissionTime);

		return fastestSubmissions;
	}


	const fastestSubmissions = getFastestSubmissions();
		*/

	//console.log("fastestSubmissions", fastestSubmissions);

	// add the additional points to the leaderboard
	// fastestSubmissions.forEach((submission, index) => {
	// 	const user = users.data?.find((user) => user.id === submission.submission.user_id);
	// 	const language = languages.data?.find((language: any) => language.id === submission.submission.language_id);

	// 	if (user && language) {
	// 		leaderboard.push({
	// 			user: {
	// 				id: user.id,
	// 				name: user.user_metadata?.full_name,
	// 				profile_image_url: user.user_metadata?.avatar_url
	// 			}
	// 			language,
	// 			score: index === 0 ? 3 : index === 1 ? 2 : index === 2 ? 1 : 0
	// 		});
	// 	}
	// });

	//console.log("leaderboard route", leaderboard)

	return leaderboard;
}
