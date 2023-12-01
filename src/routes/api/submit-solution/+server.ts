import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabaseServerClient';
import { computeUserScore, getUserPlacement } from '$lib/util/scores';
import getLeaderboard from '$lib/util/getLeaderboard';

export async function POST({ request, cookies, locals }) {
	const supabaseAuthCookie = cookies.get('sb-bbbrnwinzilcycqgvzed-auth-token');

	// just get the first string in the stringified array
	if (!supabaseAuthCookie)
		return json(
			{ success: false, error: 'no auth cookie' },
			{
				status: 401,
				statusText: 'Unauthorized'
			}
		);

	const jwt = supabaseAuthCookie.split('"')[1];

	// check who's making the request
	const { data: userRes } = await supabase.auth.getUser(jwt);
	const user = userRes.user;

	if (!user)
		return json({ success: false, error: 'no user' }, { status: 401, statusText: 'Unauthorized' });

	const { githubUrl, part1, part2 } = await request.json();

	if (!githubUrl)
		return json(
			{ success: false, error: 'no github url' },
			{
				status: 400,
				statusText: 'Bad Request'
			}
		);

	const { data: todaysSubmission } = await supabase
		.from('Submission')
		.select('*')
		.eq('user_id', user.id)
		.gte('created_at', new Date().toISOString().slice(0, 10));

	// if there's a completed submission for today already, return an error
	if (todaysSubmission?.length && todaysSubmission[0].is_completed) {
		return json(
			{ success: false, error: "You've already completed today" },
			{
				status: 400,
				statusText: 'Bad Request'
			}
		);
	}

	const todaysSubmissionId = todaysSubmission?.[0].id;

	// set the submission to completed
	const submissionData = await supabase
		.from('Submission')
		.update({
			is_completed: true,
			github_url: githubUrl,
			submitted_at: new Date().toISOString(),
			part_1_completed: part1,
			part_2_completed: part2,
		})
		.eq('id', todaysSubmissionId || -1)
		.select("*")

	//compute the score for the submission
	const day = (new Date()).getDate()
	const score = await computeUserScore(day, user.id, submissionData.data[0]);

	//insert score into db
	const scoreRes = await supabase.from('Score').insert([{
		user_id: user.id,
		...score
	}])

	if (scoreRes.error) return json({ error: scoreRes.error.message }, { status: scoreRes.error.code })

	//discord 
	const discordBot = locals.discordBot;
	(async () => {
		const name = user.user_metadata.full_name;
		const placement = await getUserPlacement(day, user.id);
		const placementString = placement === 0 ? "**1st** 🥇" : placement === 1 ? "**2nd** 🥈" : placement === 2 ? "**3rd** 🥉" : `**${placement - 1}th** 😐`;
		discordBot.sendMessage(
			`**${name}** has placed ${placementString}\nsee their solution at **${githubUrl}**`);
		const leaderboard = await getLeaderboard();
		discordBot.sendMessage(`**Leaderboard**:\n${leaderboard.splice(0, 10).map((entry, i) => `${i + 1}. **${entry.user.user_metadata.full_name}** - **${entry.score.total}**`).join("\n")}`)
	})()

	return json({
		success: true
	});
}
