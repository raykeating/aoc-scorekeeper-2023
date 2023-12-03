import localizeDate from "$lib/util/localizeDate.js";

export const load = async ({ locals: { supabase, getSession }, cookies }) => {
	const session = await getSession();

	console.log(session?.user.id);

	// const todaysSubmission = await supabase
	// 	.from('Submission')
	// 	.select('*, Language(name)')
	// 	.gte('created_at', new Date().toISOString().slice(0, 10))
	// 	.eq('user_id', session?.user.id);

	let todaysSubmission = null;

	const submissions = await supabase.from('Submission').select('*, Language(name, difficulty)');

	const languages = await supabase.from('Language').select('*');

	const users = await supabase.from('User').select('*');

	if (submissions.data) {
		todaysSubmission = submissions.data.filter((submission) => {
			const submissionDate = new Date(submission.created_at).toISOString().slice(0, 10);
			const today = localizeDate(new Date()).toISOString().slice(0, 10);
			return submissionDate === today && submission.user_id === session?.user.id;
		});
	}

	return {
		todaysSubmission: todaysSubmission?.[0],
		submissions: submissions.data,
		languages: languages.data,
		session: session || null,
		users: users.data
	};
};
