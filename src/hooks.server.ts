// src/hooks.server.ts
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import {supabase} from '$lib/server/supabaseServerClient';
import type { Handle } from '@sveltejs/kit';
import type { Score } from '$types/general';
import { isScore } from '$types/general';

async function submitScore(event: any) {
	const supabaseAuthCookie = event.cookies.get('sb-bbbrnwinzilcycqgvzed-auth-token');

	// just get the first string in the stringified array
	if (!supabaseAuthCookie) {
		console.log('no auth cookie')
		return
	}

	const jwt = supabaseAuthCookie.split('"')[1];

	// check who's making the request
	const { data: userRes } = await supabase.auth.getUser(jwt);
	const user = userRes.user;

	if (!user) {
		console.log('no user')
		return 
	}

	//get score from request body
	const score: Score = {part_1: 10, part_2: 10, placement: 10, total: 10}

	console.log(user.id)

	//insert score into db
	const res = await supabase.from('Score').insert([{
		user_id: user.id,
		...score
	}])

	if (res.error) {
		console.log(res.error)
		return
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	});

	/**
	 * a little helper that is written for convenience so that instead
	 * of calling `const { data: { session } } = await supabase.auth.getSession()`
	 * you just call this `await getSession()`
	 */
	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	//on submit-solution
	if (event.url.pathname.startsWith('/api/submit-solution')) {
		await submitScore(event)
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
};
