import type { Database } from '../types/database.js';

export const load = async ({ locals: { supabase, getSession }, cookies }) => {
	const session = await getSession();

	console.log(session?.user.id);

	const todaysSubmission = await supabase
		.from('Submission')
		.select('*, Language(name)')
		.gte('created_at', new Date().toISOString().slice(0, 10))
		.eq('user_id', session?.user.id);

	return {
		todaysSubmission: todaysSubmission?.data?.[0],
		session: session || null
	}
};
