import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabaseServerClient';
import type { Score } from '$types/general'
import { isScore } from '$types/general'

export async function GET({ request, cookies, url }) {
	//get query string params
	const { user, day } = url.searchParams;

	//main query
	let query = supabase
		.from('Score')
		.select('*')

	//filter by user
	if (user != null) {
		query = query.eq('user_id', user)
	}

	//filter by day
	if (day != null) {
		//timestamptz range
		const start = new Date(day)
		const end = new Date(day)
		end.setDate(end.getDate() + 1)

		query = query
			.gte('created_at', start.toISOString())
			.lt('created_at', end.toISOString())
	}

	const res = await query

	if (res.error) return json({ error: res.error.message }, { status: res.error.code })

	return json({ data: res.data })
}

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

	//get score from request body
	const score: Score = (await request.json()).score as Score;
	if (!isScore(score)) return json({ success: false, error: 'invalid score' }, { status: 400, statusText: 'Bad Request' })

	//insert score into db
	const res = await supabase.from('Score').insert([{
		user_id: user.id,
		...score
	}])

	if (res.error) return json({ error: res.error.message }, { status: res.error.code })

	return json({ success: true })
}