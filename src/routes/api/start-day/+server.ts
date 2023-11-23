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

	const { usingCopilot, difficulty } = await request.json();

	// fetch the user's submissions so far
	const { data: submissions } = await supabase
		.from('Submission')
		.select('*')
		.eq('user_id', user.id);

	// if there's a submission for today already, return an error
	const { data: todaysSubmission } = await supabase
		.from('Submission')
		.select('*')
		.eq('user_id', user.id)
		.gte('created_at', new Date().toISOString().slice(0, 10));

	if (todaysSubmission?.length) {
		return json(
			{ success: false, error: "You've already submitted today" },
			{
				status: 400,
				statusText: 'Bad Request'
			}
		);
	}

	// fetch all the languages which don't have an associated submission yet
	const { data: languages } = await supabase
		.from('Language')
		.select('*')
		.eq('difficulty', difficulty)
		.not('id', 'in', sbSyntax(submissions?.map((submission) => submission.language_id)));

	if (!languages?.length) {
		return json(
			{ success: false, error: `You've already submitted all the ${difficulty.toLowerCase()} languages` },
			{
				status: 400,
				statusText: "Bad Request"
			}
		);
	}

    // select a random language from the list of languages
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];

	// insert a new submission
	await supabase
		.from('Submission')
		.insert({
			user_id: user.id,
			is_using_copilot: usingCopilot,
			language_id: randomLanguage.id
		});

	return json({
		success: true,
        language: randomLanguage
	});
}

// for some reason, supabase wants ids in this format
function sbSyntax(arr: number[] | undefined) {
	if (!arr) return '()';
	return `(${arr.map((i) => i.toString()).join(', ')})`;
}
