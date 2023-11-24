import type { Database } from '../../types/database';

export default function getLanguageUsesLeft(
	submissions: Database['public']['Tables']['Submission']['Row'][],
	languages: Database['public']['Tables']['Language']['Row'][]
) {

	const usesLeft = {
		hard: languages.filter((language) => language.difficulty === 'Hard').length,
		medium: languages.filter((language) => language.difficulty === 'Medium').length,
		easy: languages.filter((language) => language.difficulty === 'Easy').length
	};

	submissions.forEach((submission) => {
        // @ts-ignore
		const languageDifficulty = submission.Language.difficulty;

        console.log(languageDifficulty);

		if (languageDifficulty === 'Hard') usesLeft.hard--;
		if (languageDifficulty === 'Medium') usesLeft.medium--;
		if (languageDifficulty === 'Easy') usesLeft.easy--;
	});

	return usesLeft;
}
