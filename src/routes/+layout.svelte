<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import '../app.css';

	export let data;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: profile = session?.user.user_metadata;

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});

	const handleSignIn = async () => {
		await supabase.auth.signInWithOAuth({
			provider: 'discord',
			options: {
				redirectTo: window.location.origin + "/login-success"
			}
		});
	};

	const handleSignOut = async () => {
		await supabase.auth.signOut();
	};

	let navDropdownIsOpen = false;
</script>

<div class="min-h-screen bg-black text-white">
	<nav class="flex justify-between items-center px-4 border-b border-zinc-800">
		<p class="p-4">AOC</p>

		<div class="flex items-center gap-2">
			{#if profile}
				<p>{profile.full_name}</p>
				<button on:click={() => (navDropdownIsOpen = !navDropdownIsOpen)} class="relative">
					<img class="w-6 h-6 rounded-full" src={profile.avatar_url} alt="" />
					{#if navDropdownIsOpen}
						<div class="absolute top-8 right-0 px-4 py-2 bg-black border border-zinc-800">
							<button class="text-sm whitespace-nowrap" on:click={handleSignOut}> Sign out </button>
						</div>
					{/if}
				</button>
			{:else}
				<button class="p-4" on:click={handleSignIn}> Sign in </button>
			{/if}
		</div>
	</nav>
	{#if profile}
		<slot />
	{:else}
		<div class="flex flex-col items-center justify-center h-[90vh] gap-2">
			<p class="text-2xl">Welcome</p>
			<button class="px-4 py-2 border border-zinc-800" on:click={handleSignIn}>Sign in</button>
		</div>
	{/if}
</div>
