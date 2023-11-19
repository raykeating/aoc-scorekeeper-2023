export const load = async ({ locals: { supabase } }) => {
	return {
		submissions: await supabase.from('Submission').select('*')
	};
};