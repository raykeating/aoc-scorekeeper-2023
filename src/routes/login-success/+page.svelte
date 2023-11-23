<script>
	import { onMount } from "svelte";

    // immediately redirect to the homepage
    onMount(() => {
        window.location.href = "/";
    });

    // this is a hack.  
    // for some reason, the session is not available to the server-side load function when the user is redirected from the OAuth provider.
    // However, if we load this page first, then the session is available to the server-side load function when we go back to the homepage.
    // There's probably a better way to do this, but this works for now.
    // It seems like supabase knows about this: https://supabase.com/docs/guides/auth/server-side-rendering#no-session-on-the-server-side-with-nextjs-route-prefetching
</script>