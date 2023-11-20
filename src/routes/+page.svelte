<!-- // src/routes/auth/+page.svelte -->
<script lang="ts">
	export let data;
	let { submissions, supabase } = data;
	$: ({ submissions, supabase } = data);

	async function checkIfSubmittedToday() {
		// check submissions for today
		console.log(submissions);

		let { data, error } = await supabase.rpc('get_random_language', {
            difficulty: "Easy"
        });
        
		if (error) console.error(error);
		else console.log(data);
	}

	checkIfSubmittedToday();

	let usingCopilot: string = '';

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

		console.log(res);
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

		<form class="flex flex-col gap-1 items-start mt-4">
			<button on:click={() => startChallenge('easy')}>start challenge (easy)</button>
			<button on:click={() => startChallenge('medium')}>start challenge (medium)</button>
			<button on:click={() => startChallenge('hard')}>start challenge (hard)</button>
		</form>

		<button on:click={() => startChallenge('raincheck')}>raincheck</button>
	</div>
	<div class="w-full"></div>
</div>
