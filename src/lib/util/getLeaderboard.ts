import { supabase } from '$lib/supabaseClient';
import type { Database } from '../../types/database';

type LeaderboardEntry = {
	user: {
		id: string;
		name: string;
		profile_image_url: string;
	};
	score: number;
};

// I think this works, but I haven't really tested it enough to be sure
function getLeaderboard(submissions: any, users: any): LeaderboardEntry[] {

	let leaderboard: LeaderboardEntry[] = [];

	// scoring works like this:
	// base points:
	// 4 points for completing part 1
	// 2 points for completing part 2

	// bonus points (each day):
	// 3 points for the fastest submission
	// 2 points for the second fastest submission
	// 1 point for the third fastest submission

	console.log(users);

	// initialize the leaderboard to be a list containing each user with their score set to 0
	if (users) {
		leaderboard = users.map(
			(user: Database['public']['Tables']['User']['Row']) => {

				// @ts-ignore - user_metadata is not in the type definition
				console.log(user.user_metadata);

				return {
					user: {
						id: user.id,
						// @ts-ignore - user_metadata is not in the type definition
						name: user.user_metadata.full_name,
						// @ts-ignore - user_metadata is not in the type definition
						profile_image_url: user.user_metadata.avatar_url
					},
					score: 0
				};
			}
		);
	}

	// add the base points to the leaderboard
	submissions.forEach((submission: Database['public']['Tables']['Submission']['Row']) => {
		// if the submission is completed, add the appropriate score to the user's score
		if (submission.is_completed) {
			const userIndex = leaderboard.findIndex(
				(entry: LeaderboardEntry) => entry.user.id === submission.user_id
			);

			if (userIndex !== -1) {
				leaderboard[userIndex].score += 4;
			}
		}

		// if the submission is completed, add the appropriate score to the user's score
		if (submission.part_2_completed) {
			const userIndex = leaderboard.findIndex(
				(entry: LeaderboardEntry) => entry.user.id === submission.user_id
			);

			if (userIndex !== -1) {
				leaderboard[userIndex].score += 2;
			}
		}
	});

	// for each day, add the bonus points to the leaderboard
	for (let day = 1; day <= 30; day++) {

		// first, filter out any submissions that are not completed (both parts)
		const submissionsForDay = submissions.filter(
			(submission: Database['public']['Tables']['Submission']['Row']) => submission.is_completed && submission.part_1_completed && submission.part_2_completed
		);

		// get the submissions for the day
		const daySubmissions = submissionsForDay.filter(
			(submission: Database['public']['Tables']['Submission']['Row']) => new Date(submission.created_at).getUTCDate() === day
		);

		// get the top 3 fastest submissions
		const top3 = daySubmissions
			.sort((a: Database['public']['Tables']['Submission']['Row'], b: Database['public']['Tables']['Submission']['Row']) => {
				if (a.submitted_at && b.submitted_at) {
					const timeTakenA = new Date(a.submitted_at).getTime() - new Date(a.created_at).getTime();
					const timeTakenB = new Date(b.submitted_at).getTime() - new Date(b.created_at).getTime();

					return timeTakenA - timeTakenB;
				} else {
					return 0;
				}
			})
			.slice(0, 3);

		// add the bonus points to the leaderboard
		top3.forEach((submission: Database['public']['Tables']['Submission']['Row'], index: number) => {
			const userIndex = leaderboard.findIndex(
				(entry: LeaderboardEntry) => entry.user.id === submission.user_id
			);

			if (userIndex !== -1) {
				leaderboard[userIndex].score += 3 - index;
			}
		});
	}

	return leaderboard;
}

export default getLeaderboard;