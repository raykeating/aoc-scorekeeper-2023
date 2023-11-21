export const load = async ({ locals: { supabase, getSession } }) => {

	const session = await getSession()

	console.log(session?.user.id);



	const mySubmissionToday = await supabase
		.from('Submission')
		.select('id, is_completed, Language ( name )')
		.gte('created_at', new Date().toISOString().slice(0, 10)) 
		.eq('user_id', session?.user.id)

	console.log(mySubmissionToday);
	
	return {
		submissions: await supabase.from('Submission').select('*'),
		mySubmissionToday: mySubmissionToday,
	};
};