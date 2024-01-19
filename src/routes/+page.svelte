<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";

	let id = $page.url.searchParams.get("id");

	let current_name = "";
	let loading = false;

	const load_data = async () => {
		loading = true;

		if (id == "") return alert("No ID provided");

		const headers = new Headers({
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
		});

		if (id.includes("flowrestling.org")) {
			const regex = /flowrestling.org\/athletes\/((?:[0-9a-z]+-?)+)/g;

			const match = regex.exec(id);
			alert(match);

			if (match) {
				id = match;
			} else {
				alert("Invalid link");
				return;
			}
		}

		history.pushState({}, null, `?id=${encodeURIComponent(id)}`);
		
		loading = false;
	};

	onMount(() => {
		if (id != "") load_data();
	});
</script>

<svelte:head>
	<title>Flo Stats{current_name ? ` | ${current_name}` : ""}</title> 
</svelte:head>

<svelte:window on:keydown={({ repeat, key }) => { if (!repeat && key == "Enter") { load_data() } }} />

<input type="text" placeholder="ID or URL" bind:value={id}>
<button type="button" on:click={load_data}>Fetch</button>

<style>
	* {
		text-align: center;
		margin: auto;
		font-family: Arial, Helvetica, sans-serif;
	}
</style>