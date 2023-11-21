<!-- // src/routes/auth/+page.svelte -->
<script lang="ts">
	export let data;
	let { submissions, mySubmissionToday, supabase, session } = data;
	$: ({ submissions, mySubmissionToday, supabase, session } = data);

	$: todayIsCompleted;

	let todayIsCompleted: boolean = false;
	if (mySubmissionToday.data && mySubmissionToday.data.length > 0) {
		todayIsCompleted = mySubmissionToday.data[0].is_completed;
	} else {
		todayIsCompleted = false;
	}

	$: yourLanguage;
	
	let yourLanguage: string = '';
	if (mySubmissionToday.data && mySubmissionToday.data.length > 0) {
		console.log(mySubmissionToday.data[0])
		// @ts-ignore
		yourLanguage = mySubmissionToday.data[0].Language.name;
	} else {
		yourLanguage = '';
	}

	$: todayIsStarted;

	let todayIsStarted: boolean = false;
	if (mySubmissionToday.data && mySubmissionToday.data.length > 0) {
		todayIsStarted = true;
	} else {
		todayIsStarted = false;
	}

	console.log(mySubmissionToday);

	console.log(submissions);

	let usingCopilot: string = 'Y';

	async function startChallenge(difficulty: string) {
		const { data, error } = await supabase.auth.getSession();

		if (usingCopilot.toLowerCase() !== 'y' && usingCopilot.toLowerCase() !== 'n') {
			alert('are you using copilot? (enter y/n)');
			return;
		}

		if (error) {
			alert('You must be logged in to start a challenge');
			return;
		}
		// send a request to /api/start-day
		const res = await fetch('/api/start-day', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${data.session?.access_token}`
			},
			body: JSON.stringify({
				difficulty,
				usingCopilot: usingCopilot.toLowerCase() === 'y' ? true : false
			})
		});

		if (!res.ok) {
			const json = await res.json();
			console.log(json);
			alert(json.error);
		} else {
			console.log('started challenge');
			const data = await res.json();

			console.log(data);

			todayIsStarted = true;
			yourLanguage = data.language.name;


		}
	}
</script>

<div class="flex h-full">
	<div class="w-full h-full p-16 border-r border-zinc-800 flex flex-col gap-8 items-start">
		<div>
			<p>day 13</p>
			<p>17 days left</p>
		</div>

		<div>
			<p>Use Copilot?</p>
			<input type="text" class="text-black" bind:value={usingCopilot} />
		</div>

		{#if mySubmissionToday.data && mySubmissionToday.data.length > 0 && todayIsCompleted}
			<div>
				<p>you have completed today's challenge</p>
			</div>
		{:else if mySubmissionToday.data && mySubmissionToday.data.length > 0}
			<div>
				<p>you have started today's challenge</p>
				<p>your language: {yourLanguage}</p>
			</div>
		{:else}
			<div>
				<p>you have not started today's challenge</p>
			</div>
		{/if}

		<form class="flex flex-col gap-1 items-start mt-4">
			<button on:click={() => startChallenge('Easy')}>start challenge (easy)</button>
			<button on:click={() => startChallenge('Medium')}>start challenge (medium)</button>
			<button on:click={() => startChallenge('Hard')}>start challenge (hard)</button>
		</form>
	</div>
	<div class="w-full"></div>
</div>
