import type { Database } from '../../types/database';

type SubmissionLanguageJoin = Database['public']['Tables']['Submission']['Row'] & {
	Language: Database['public']['Tables']['Language']['Row'];
};

function getLanguageUsesLeftByDifficulty(
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

		if (languageDifficulty === 'Hard') usesLeft.hard--;
		if (languageDifficulty === 'Medium') usesLeft.medium--;
		if (languageDifficulty === 'Easy') usesLeft.easy--;
	});

	return usesLeft;
}

function getUsesLeftByLanguage(
	submissions: SubmissionLanguageJoin[],
	languages: Database['public']['Tables']['Language']['Row'][]
) {
	const results: Record<string, { maxUses: number; timesUsed: number, difficulty: string }> = {};

	languages.forEach((language) => {
		if (!language.name) return;
		results[language.name] = { maxUses: 0, timesUsed: 0, difficulty: language.difficulty || ""};
	});

	languages.forEach((language) => {
		if (!language.name) return;
		results[language.name].maxUses++;
	});

	submissions.forEach((submission) => {
		if (!submission.Language.name) return;
		results[submission.Language.name].timesUsed++;
	});

	return results;
}

// takes in your submissions and languages and returns an object with the following properties:
export default function getLanguageInfo(
	submissions: Database['public']['Tables']['Submission']['Row'][],
	mySubmissions: Database['public']['Tables']['Submission']['Row'][],
	languages: Database['public']['Tables']['Language']['Row'][]
) {

	const usesLeftByDifficulty = getLanguageUsesLeftByDifficulty(mySubmissions, languages);
	const usesLeftByLanguage = getUsesLeftByLanguage(mySubmissions, languages);

	return {
		usesLeftByDifficulty,
		usesLeftByLanguage
	};
}
