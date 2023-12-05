<!-- // src/routes/auth/+page.svelte -->
<script lang="ts">
	import { startChallenge } from '$lib/startChallenge.js';
	import formatTime from '$lib/util/formatTime.js';
	import getLanguageInfo from '$lib/util/getLanguageInfo.js';
	import getLeaderboard from '$lib/util/getLeaderboard.js';
	import getColorFromDifficulty from '$lib/util/getColorFromDifficulty.js';
	import getScorecard from '$lib/util/getScorecard.js';
	import localizeDate from '$lib/util/localizeDate.js';

	export let data;

	const daysUntilChristmas = Math.ceil(
		(localizeDate(new Date('2023-12-25')).getTime() - localizeDate(new Date()).getTime()) / (1000 * 60 * 60 * 24)
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

	let usingCopilot = '';
	let githubUrl = '';

	let currentStep: 'started' | 'submitted' | 'not-started' = todaysSubmission
		? todaysSubmission.is_completed
			? 'submitted'
			: 'started'
		: 'not-started';
	$: currentStep = currentStep;

	let selectedTab: 'scores' | 'leaderboard' | 'languages' | 'rules' = 'leaderboard';

	async function handleStartChallenge(
		difficulty: 'Easy' | 'Medium' | 'Hard',
		usingCopilot: string
	) {
		if (usingCopilot.toLowerCase() !== 'y' && usingCopilot.toLowerCase() !== 'n') {
			alert('are you using copilot? (enter y/n)');
			return;
		}

		currentStep = 'started';

		const { success } = await startChallenge(difficulty, usingCopilot);
		if (!success) {
			currentStep = 'not-started';
		}
	}

	async function handleSubmitSolution(event: Event) {
		currentStep = 'submitted';
		event.preventDefault();

		// @ts-ignore
		const action = event.submitter.value;

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

	// listen for changes to submissions table
	supabase
		.channel('Submission')
		.on('postgres_changes', { event: '*', schema: 'public', table: 'Submission' }, () => {
			async function refetchSubmissions() {
				const refetched = await supabase.from('Submission').select('*, Language(name, difficulty)');
				submissions = refetched.data;
				if (submissions) {
					todaysSubmission = submissions.filter((submission) => {
						const submissionDate = localizeDate(new Date(submission.created_at)).toISOString().slice(0, 10);
						const today = localizeDate(new Date()).toISOString().slice(0, 10);
						return submissionDate === today && submission.user_id === session?.user.id;
					})?.[0];
				}
			}
			refetchSubmissions();
		})
		.subscribe();

	let mySubmissions =
		submissions?.filter((submission: any) => submission.user_id === session?.user.id) || [];
	$: mySubmissions =
		submissions?.filter((submission: any) => submission.user_id === session?.user.id) || [];

	let { usesLeftByDifficulty, usesLeftByLanguage } = getLanguageInfo(
		submissions || [], // all submissions
		mySubmissions || [], // submissions
		languages || [] // languages
	);
	$: ({ usesLeftByDifficulty, usesLeftByLanguage } = getLanguageInfo(
		submissions || [], // all submissions
		mySubmissions || [], // submissions
		languages || [] // languages
	));

	$: leaderboard = getLeaderboard(submissions || []);

	$: scorecard = getScorecard(session?.user.id || '', languages || []);
</script>

<div class="flex h-full">
	<div class="w-full h-[93vh] p-16 border-r border-zinc-800 flex flex-col gap-8 items-start">
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
				<p>Use Copilot? (Y/N)</p>
				<input type="text" class="text-black" bind:value={usingCopilot} />
			</div>

			<div class="flex flex-col gap-1 items-start mt-4">
				{#if usesLeftByDifficulty.easy === 0}
					<p>you have completed all easy challenges</p>
				{:else}
					<button on:click={() => handleStartChallenge('Easy', usingCopilot)}>
						start challenge (easy) - {usesLeftByDifficulty.easy} left
					</button>
				{/if}

				{#if usesLeftByDifficulty.medium === 0}
					<p>you have completed all medium challenges</p>
				{:else}
					<button on:click={() => handleStartChallenge('Medium', usingCopilot)}
						>start challenge (medium) - {usesLeftByDifficulty.medium} left</button
					>
				{/if}
				{#if usesLeftByDifficulty.hard === 0}
					<p>you have completed all hard challenges</p>
				{:else}
					<button on:click={() => handleStartChallenge('Hard', usingCopilot)}
						>start challenge (hard) - {usesLeftByDifficulty.hard} left</button
					>
				{/if}
			</div>
		{/if}
	</div>
	<div class="w-full">
		<div class="w-full flex p-4 px-8 gap-3 border-b border-zinc-800 text-zinc-400">
			<button
				class={selectedTab === 'leaderboard' ? 'text-white underline' : ''}
				on:click={() => (selectedTab = 'leaderboard')}>Leaderboard</button
			>
			<button
				class={selectedTab === 'scores' ? 'text-white underline' : ''}
				on:click={() => (selectedTab = 'scores')}>Scorecard</button
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

				{#await scorecard}
					<p>loading</p>
				{:then value}
					<div class="flex gap-2 font-bold text-lg">
						<img src={session?.user.user_metadata.picture} alt="avatar" class="w-10 h-10" />
						<p class="flex items-center justify-center min-h-min">
							{session?.user.user_metadata.name.split('#')[0]}
						</p>
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
				{#await leaderboard}
					<p>loading</p>
				{:then value}
					<div class="grid grid-cols-5 text-center leaderboard">
						<p class="underline text-left">User</p>
						<p class="underline">Part 1</p>
						<p class="underline">Part 2</p>
						<p class="underline">Placement</p>
						<p class="underline">Total</p>

						{#each value as entry, i}
							<div class="flex gap-2">
								<img
									src={entry?.user?.user_metadata?.picture || ''}
									alt="avatar"
									class="w-10 h-10"
								/>
								{#if i === 0}
									<p class="flex items-center justify-center min-h-min">🥇</p>
								{:else if i === 1}
									<p class="flex items-center justify-center min-h-min">🥈</p>
								{:else if i === 2}
									<p class="flex items-center justify-center min-h-min">🥉</p>
								{/if}
								<p class="flex items-center justify-center min-h-min">
									{entry?.user?.user_metadata?.full_name || ''}
								</p>
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
			<div class="p-8 grid grid-cols-3 gap-2">
				{#each Object.entries(usesLeftByLanguage) as [language, info]}
					<div
						class="flex flex-col items-center justify-center bg-[rgb(31,31,31)] py-6"
						style={`border-bottom: 4px solid ${getColorFromDifficulty(info.difficulty)};`}
					>
						<p class="flex-1">{language}</p>
						<p>
							{info.timesUsed} / {info.maxUses}
						</p>
					</div>
				{/each}
			</div>
		{:else if selectedTab === 'rules'}
			<div class="p-8 text-zinc-100">
				<h1 class="text-2xl font-bold mb-3">Welcome to Advent of Code (fun edition)</h1>

				<h2 class="text-lg font-bold">Challenge Overview:</h2>
				<ul class="list-disc list-inside">
					<li>Every day, choose a difficulty: easy, medium, or hard.</li>
					<li>
						Based on your selection, you will be assigned a random language from the chosen
						difficulty pool.
					</li>
					<li>If you select "any," you can use any language you prefer.</li>
					<li>
						Each medium difficulty language will be used twice, and each hard language will be used
						once.
					</li>
					<li>
						Six days will use easy languages, 16 days will use medium languages, and three days will
						use hard languages.
					</li>
					<li>Hard tasks will take a significant amount of time, so choose wisely.</li>
				</ul>

				<h2 class="text-lg font-bold">Scoring:</h2>
				<ul class="list-disc list-inside">
					<li>Part 1 submission: 4 points.</li>
					<li>Part 2 submission: 2 points.</li>
				</ul>

				<h2 class="text-lg font-bold">Bonus Points:</h2>
				<ul class="list-disc list-inside">
					<li>
						At the end of each day, bonus points are assigned based on the rank for that day,
						determined by completion time.
					</li>
					<li>1st place (fastest time): +3 points.</li>
					<li>2nd place: +2 points.</li>
					<li>3rd place: +1 point.</li>
				</ul>

				<h2 class="text-lg font-bold">Copilot Usage:</h2>
				<ul class="list-disc list-inside mb-4">
					<li>Copilot may be used, but you must decide at the start of the challenge.</li>
					<li>Using Copilot incurs a penalty of -2 points.</li>
					<li>ChatGPT is not allowed.</li>
				</ul>
				<div class="w-full h-[1px] bg-zinc-700"></div>
				<small class="text-xs italic text-zinc-500"
					>By participating in the Advent of Code (fun edition), you hereby acknowledge and agree to
					the following terms and conditions: Advent of Code (fun edition) is not responsible for
					any loss of sleep, sanity, or productivity that may occur as a result of participation in
					the Advent of Code (fun edition). Advent of Code (fun edition) is not responsible for any
					embarrassment that may occur as a result of losing to Raymond Keating and/or Austin
					Goodman. Side effects may include enhanced problem-solving skills, sleep deprivation, and
					a newfound appreciation for Raymond Keating's coding abilities. Randomly assigned
					languages are chosen by an algorithm that may or may care about how much work you have
					that day. Aditionally, "easy," "medium," and "hard" are subjective terms and do not
					necessarily reflect the actual difficulty of the challenge. Fun IS mandatory; failure to
					have fun may result in an increased likelihood of losing to Raymond Keating and/or Austin
					Goodman. You should back up your scores and submissions, as they may be lost at any time.
					This app was built in like a week and a half and probably has bugs. Let someone know
					if/when you find any, but don't be annoying about it. Also, i know it looks a little ugly
					right now but I'm gonna style it this weekend.
					<br />
					Any attempt to copy, steal, or otherwise reproduce this application is encouraged and would
					boost my stats on
					<a class="underline" href="https://github.com/raykeating/aoc-scorekeeper-2023">GitHub</a>

					<br />
				</small>
			</div>
		{/if}
	</div>
</div>
