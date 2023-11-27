import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabaseServerClient';

export async function POST({ request, cookies }) {
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
	await supabase
		.from('Submission')
		.update({
			is_completed: true,
			github_url: githubUrl,
			submitted_at: new Date().toISOString(),
			part_1_completed: part1,
			part_2_completed: part2,
		})
		.eq('id', todaysSubmissionId || -1);

	return json({
		success: true
	});
}
