<!-- // src/routes/auth/+page.svelte -->
<script lang="ts">
	export let data;
	let { submissions, supabase } = data;
	$: ({ submissions, supabase } = data);

    console.log(submissions);

    async function submit() {
        const { data, error } = await supabase.from('Submission').insert({
            github_url: "https://github.com/raykeating",
            status: "started",
        });

        console.log(data);

        if (error) {
            console.log(error);
        }
    }

</script>

<div class="flex h-full">
	<div class="w-full h-full p-16 border-r border-zinc-800">
		<p>today's challenge</p>
		<p>day 13</p>
	</div>
    <button on:click={submit} class="px-4 py-2 border-zinc-800 border flex h-fit m-4">Submit</button>
	<div class="w-full"></div>
</div>
