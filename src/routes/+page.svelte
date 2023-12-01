<!-- // src/routes/auth/+page.svelte -->
<script lang="ts">
	import { startChallenge } from '$lib/startChallenge.js';
	import formatTime from '$lib/util/formatTime.js';
	import getLanguageUsesLeft from '$lib/util/getLanguageUsesLeft.js';
	import getLeaderboard from '$lib/util/getLeaderboard.js';
	import type { Database } from '../types/database.js';
	import getScorecard from '$lib/util/getScorecard.js';

	export let data;

	const daysUntilChristmas = Math.ceil(
		(new Date('2023-12-25').getTime() - Date.now()) / (1000 * 60 * 60 * 24)
	);

	let { submissions, languages, todaysSubmission, session, users, supabase } = data;
	$: ({ submissions, languages, todaysSubmission, session, users, supabase } = data);

	$: elapsed = todaysSubmission
		? Date.now() - new Date(todaysSubmission.created_at).getTime()
		: null;

	// update elapsed time every second
	setInterval(() => {
		elapsed = todaysSubmission
			? Date.now() - new Date(todaysSubmission.created_at).getTime()
			: null;
	}, 1000);

	let usingCopilot = 'Y';
	let githubUrl = '';

	let currentStep: 'started' | 'submitted' | 'not-started' = todaysSubmission
		? todaysSubmission.is_completed
			? 'submitted'
			: 'started'
		: 'not-started';
	$: currentStep = todaysSubmission
		? todaysSubmission.is_completed
			? 'submitted'
			: 'started'
		: 'not-started';

	let selectedTab: 'scores' | 'leaderboard' | 'languages' | 'rules' = 'scores';

	async function handleStartChallenge(
		difficulty: 'Easy' | 'Medium' | 'Hard',
		usingCopilot: string
	) {
		currentStep = 'started';
		await startChallenge(difficulty, usingCopilot);
	}

	async function handleSubmitSolution(event: Event) {
		currentStep = 'submitted';
		event.preventDefault();

		// @ts-ignore
		const action = event.submitter.value;

		console.log(action);

		if (action === 'submit') {
			const form = event.target as HTMLFormElement;
			const formData = new FormData(form);

			const githubUrl = formData.get('github-url') as string;
			const part1 = formData.get('part-1') as string;
			const part2 = formData.get('part-2') as string;

			const res = await fetch('/api/submit-solution', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					skipping: false,
					githubUrl,
					part1: part1 === 'on',
					part2: part2 === 'on'
				})
			});

			const json = await res.json();

			if (!json.success) {
				alert(json.error);
			}
		}
	}

	let languageUsageCounts: { easy: number; medium: number; hard: number } = getLanguageUsesLeft(
		submissions || [], // submissions
		languages || [] // languages
	);

	$: languageUsageCounts = getLanguageUsesLeft(submissions || [], languages || []);

	// listen for changes to submissions table
	supabase
		.channel('Submission')
		.on('postgres_changes', { event: '*', schema: 'public', table: 'Submission' }, () => {
			async function refetchSubmissions() {
				const refetched = await supabase.from('Submission').select('*, Language(name, difficulty)');
				submissions = refetched.data;
				if (submissions) {
					todaysSubmission = submissions.filter((submission) => {
						const submissionDate = new Date(submission.created_at).toISOString().slice(0, 10);
						const today = new Date().toISOString().slice(0, 10);
						return submissionDate === today && submission.user_id === session?.user.id;
					})?.[0];
				}
			}
			refetchSubmissions();
		})
		.subscribe();

	$: mySubmissions =
		submissions?.filter((submission: any) => submission.user_id === session?.user.id) || [];

	$: leaderboard = getLeaderboard(submissions);

	$: scorecard = getScorecard(session?.user.id, languages)
</script>

<div class="flex h-full">
	<div class="w-full h-full p-16 border-r border-zinc-800 flex flex-col gap-8 items-start">
		<div>
			<p>day {25 - daysUntilChristmas} 🎄</p>
			<p>{daysUntilChristmas} days left</p>
			{#if daysUntilChristmas === 0}
				<p>🎄 Merry Christmas! 🎄</p>
			{/if}
		</div>

		{#if currentStep === 'submitted'}
			<div>
				<p>Nice work! You completed today's challenge!</p>
			</div>
		{:else if currentStep === 'started'}
			<div>
				<p>you have started today's challenge</p>
				<p>your language: {todaysSubmission?.Language?.name || 'loading...'}</p>
			</div>
			<form on:submit|preventDefault={handleSubmitSolution}>
				<label for="github-url">Solution URL:</label>
				<input
					class="text-black"
					type="text"
					name="github-url"
					id="github-url"
					required
					bind:value={githubUrl}
				/>

				<!-- check if user completed part 1, 2, or both (checkbox) -->
				<div class="flex gap-1 items-center">
					<input type="checkbox" name="part-1" id="part-1" />
					<label for="part-1">Part 1</label>
				</div>
				<div class="flex gap-1 items-center">
					<input type="checkbox" name="part-2" id="part-2" />
					<label for="part-2">Part 2</label>
				</div>

				<button type="submit" value="submit">submit</button>
			</form>
			<!-- timer -->
			<p>time elapsed: {formatTime(elapsed)}</p>
		{:else}
			<div>
				<p>you have not started today's challenge</p>
			</div>

			<div>
				<p>Use Copilot?</p>
				<input type="text" class="text-black" bind:value={usingCopilot} />
			</div>

			<div class="flex flex-col gap-1 items-start mt-4">
				{#if languageUsageCounts.easy === 0}
					<p>you have completed all easy challenges</p>
				{:else}
					<button on:click={() => handleStartChallenge('Easy', usingCopilot)}>
						start challenge (easy) - {languageUsageCounts.easy} left
					</button>
				{/if}

				{#if languageUsageCounts.medium === 0}
					<p>you have completed all medium challenges</p>
				{:else}
					<button on:click={() => handleStartChallenge('Medium', usingCopilot)}
						>start challenge (medium) - {languageUsageCounts.medium} left</button
					>
				{/if}
				{#if languageUsageCounts.hard === 0}
					<p>you have completed all hard challenges</p>
				{:else}
					<button on:click={() => handleStartChallenge('Hard', usingCopilot)}
						>start challenge (hard) - {languageUsageCounts.hard} left</button
					>
				{/if}
			</div>
		{/if}
	</div>
	<div class="w-full">
		<div class="w-full flex p-4 px-8 gap-3 border-b border-zinc-800 text-zinc-400">
			<button
				class={selectedTab === 'scores' ? 'text-white underline' : ''}
				on:click={() => (selectedTab = 'scores')}>Scorecard</button
			>
			<button
				class={selectedTab === 'leaderboard' ? 'text-white underline' : ''}
				on:click={() => (selectedTab = 'leaderboard')}>Leaderboard</button
			>
			<button
				class={selectedTab === 'languages' ? 'text-white underline' : ''}
				on:click={() => (selectedTab = 'languages')}>Languages</button
			>
			<button
				class={selectedTab === 'rules' ? 'text-white underline' : ''}
				on:click={() => (selectedTab = 'rules')}>Rules</button
			>
		</div>
		<!-- tabs -->
		{#if selectedTab === 'scores'}
			<div class="p-8">
				<!-- {#if mySubmissions.length === 0}
					<p>you have not submitted any solutions</p>
				{:else}
					{#each mySubmissions as submission}
						{#if submission.is_completed && submission.submitted_at}
							<div class="flex flex-col gap-1">
								<p>
									Day {new Date(submission.created_at).getDate()} - completed
								</p>
								<p>language: {submission?.Language?.name || ''}</p>
								<p>
									completed in: {formatTime(
										new Date(submission.submitted_at).getTime() -
											new Date(submission.created_at).getTime()
									)}
								</p>
								<p>
									github url: <a href={submission.github_url} target="_blank"
										>{submission.github_url}</a
									>
								</p>
							</div>
						{:else}
							<div class="flex flex-col gap-1">
								<p>Day {new Date(submission.created_at).getDate()} - started</p>
								<p>language: {submission?.Language?.name || ''}</p>
							</div>
						{/if}
					{/each}
				{/if} -->

				{#await scorecard }
					<p>loading</p>
				{:then value}
					<div class="flex gap-2 font-bold text-lg">
						<img src={session?.user.user_metadata.picture} alt="avatar" class="w-10 h-10"/>
						<p class="flex items-center justify-center min-h-min">{session?.user.user_metadata.name.split("#")[0]}</p>
					</div>

					{#each value as scorecardEntry}
						<div class="flex gap-2">
							<p>{scorecardEntry.day}</p>
							<p>/</p>
							<p>{scorecardEntry.language}</p>
							<p>/</p>
							<p>{scorecardEntry.placement}</p>
							<p>/</p>
							<p>{scorecardEntry.score}</p>
							<p>/</p>
							<a href={scorecardEntry.url}>github</a>
						</div>
					{/each}
				{:catch error}
					<p>error: {error.message}</p>
				{/await}

			</div>
		{:else if selectedTab === 'leaderboard'}
			<div class="p-8">
				{#await leaderboard }
					<p>loading</p>
				{:then value}
				<div class="grid grid-cols-5 text-center leaderboard">
					<p class="underline text-left">User</p>
					<p class="underline">Part 1</p>
					<p class="underline">Part 2</p>
					<p class="underline">Placement</p>
					<p class="underline">Total</p>

					{#each value as entry, i}
						<div class="flex flex gap-2">
							<img src={entry.user.user_metadata.picture} alt="avatar" class="w-10 h-10"/>
							{#if i === 0}
								<p class="flex items-center justify-center min-h-min">🥇</p>
							{:else if i === 1}
								<p class="flex items-center justify-center min-h-min">🥈</p>
							{:else if i === 2}
								<p class="flex items-center justify-center min-h-min">🥉</p>
							{/if}
							<p class="flex items-center justify-center min-h-min">{entry.user.user_metadata.name.split("#")[0]}</p>
						</div>

						<p class="flex items-center justify-center min-h-min">{entry.score.part_1}</p>
						<p class="flex items-center justify-center min-h-min">{entry.score.part_2}</p>
						<p class="flex items-center justify-center min-h-min">{entry.score.placement}</p>
						<p class="flex items-center justify-center min-h-min">{entry.score.total}</p>
					{/each}
				</div>
				{:catch error}
					{error.message}
				{/await}
			</div>
		{:else if selectedTab === 'languages'}
			<div class="p-8">languages</div>
		{:else if selectedTab === 'rules'}
			<div class="p-8">rules</div>
		{/if}
	</div>
</div>
