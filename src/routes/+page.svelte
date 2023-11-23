<!-- // src/routes/auth/+page.svelte -->
<script lang="ts">
	import { startChallenge } from '$lib/startChallenge.js';
	import formatTime from '$lib/util/formatTime.js';

	export let data;

	console.log(data.todaysSubmission);

	let { todaysSubmission, session, supabase } = data;
	$: ({ todaysSubmission, session, supabase } = data);

	$: elapsed = todaysSubmission
		? Date.now() - new Date(todaysSubmission.created_at).getTime()
		: null;

	// update elapsed time every second
	setInterval(() => {
		elapsed = todaysSubmission
			? Date.now() - new Date(todaysSubmission.created_at).getTime()
			: null;
	}, 1000);

	console.log(todaysSubmission);

	let usingCopilot = 'Y';
	let githubUrl = '';

	async function handleStartChallenge(
		difficulty: 'Easy' | 'Medium' | 'Hard',
		usingCopilot: string
	) {
		await startChallenge(difficulty, usingCopilot);

		// refetch todays submission
		const { data } = await supabase
			.from('Submission')
			.select('*, Language(id, name)')
			.eq('user_id', session?.user.id || "")
			.gte('created_at', new Date().toISOString().slice(0, 10))

		console.log(data);

		todaysSubmission = data?.[0];
	}

	async function handleSubmitSolution(event: Event) {
		event.preventDefault();

		// @ts-ignore
		const action = event.submitter.value;

		console.log(action)

		if (action === "submit") {

			const form = event.target as HTMLFormElement;
			const formData = new FormData(form);

			const githubUrl = formData.get('github-url') as string;

			const res = await fetch("/api/submit-solution", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					skipping: false,
					githubUrl,
				}),
			});

			const json = await res.json();

			if (!json.success) {
				alert(json.error);
			}


		} else if (action === "raincheck") {
			const res = await fetch("/api/submit-solution", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					skipping: true,
					githubUrl: "",
				}),
			});

			const json = await res.json();

			if (!json.success) {
				alert(json.error);
			}

		}

		// refetch todays submission
		const { data } = await supabase
			.from('Submission')
			.select('*')
			.eq('user_id', session?.user.id || "")
			.gte('created_at', new Date().toISOString().slice(0, 10))

		todaysSubmission = data?.[0];
	}

</script>

<div class="flex h-full">
	<div class="w-full h-full p-16 border-r border-zinc-800 flex flex-col gap-8 items-start">
		<div>
			<p>day 13</p>
			<p>17 days left</p>
		</div>

		{#if todaysSubmission && todaysSubmission.is_completed}
			<div>
				<p>you have completed today's challenge</p>
			</div>
		{:else if todaysSubmission && !todaysSubmission.is_completed}
			<div>
				<p>you have started today's challenge</p>
				<p>your language: {todaysSubmission.Language.name}</p>
			</div>
			<form on:submit|preventDefault={handleSubmitSolution}>
				<label for="github-url">Solution URL:</label>
				<input class="text-black" type="text" name="github-url" id="github-url" required bind:value={githubUrl} />
				<button type="submit" value="submit">submit</button>
				<button type="submit" value="raincheck">not today</button>
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
				<button on:click={() => handleStartChallenge('Easy', usingCopilot)}
					>start challenge (easy)</button
				>
				<button on:click={() => handleStartChallenge('Medium', usingCopilot)}
					>start challenge (medium)</button
				>
				<button on:click={() => handleStartChallenge('Hard', usingCopilot)}
					>start challenge (hard)</button
				>
			</div>
		{/if}
	</div>
	<div class="w-full"></div>
</div>
