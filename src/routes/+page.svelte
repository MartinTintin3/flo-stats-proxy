<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";

	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { ratio } from "../defs";
	
	import Stats from "../components/Stats.svelte";
	import Modal from "../components/Modal.svelte";

	let id = "";

	/**
	 * @param {Date} date
	 */
	const get_season = date => {
		const thanksgiving = new Date(date.getFullYear(), 10, 1);
		
		if (thanksgiving.getDay() > 4) {
			thanksgiving.setDate(thanksgiving.getDate() + (4 - thanksgiving.getDay()) + 28);
		} else {
			thanksgiving.setDate(thanksgiving.getDate() + (4 - thanksgiving.getDay()) + 21);
		}

		if (date < thanksgiving) {
			return `${date.getFullYear() - 1}-${date.getFullYear()}`;
		} else {
			return `${date.getFullYear()}-${date.getFullYear() + 1}`;
		}
	};

/*
"bracketSpot": null,
        "city": "Lexington",
        "comments": null,
        "createdByUserId": "10015558",
        "createdDateTimeUtc": "2024-01-09T10:45:31.000Z",
        "custom1": null,
        "custom2": null,
        "dateOfBirth": null,
        "districtPlace": null,
        "divisionId": "e1c8a42f-cf55-43c3-88e9-320b432eb7d5",
        "draw": null,
        "eventId": "a60ccb57-42bc-4ac1-9821-4c89088ad3e9",
        "exactWeight": 138.5,
        "exactWeight2": null,
        "exactWeight3": null,
        "exempt": null,
        "firstName": "Martin",
        "fullName": "Maroyan, Martin",
        "gender": null,
        "grade": {
            "attributes": {
                "name": "HS Freshman",
                "numericValue": 9,
                "sequence": 11
            },
            "id": "70173183-d7ac-4ca6-bd16-21a84d63b4cb",
            "type": "grade"
        },
        "gradeId": "70173183-d7ac-4ca6-bd16-21a84d63b4cb",
        "identityPersonId": "064ad7f4-8d16-4dd2-94b1-1dd1c45c3832",
        "isSkinChecked": true,
        "isTeamScorer": true,
        "isWeighInOk": true,
        "lastName": "Maroyan",
        "location": {
            "address": null,
            "city": "Lexington",
            "country": "US",
            "googlePlaceId": "ChIJy1hS39qd44kRzRM2FsiFNoU",
            "id": "e9055699-96a6-4dee-8888-b290dd20df8f",
            "latitude": 42.4473497,
            "longitude": -71.2271531,
            "name": "Lexington",
            "state": "MA",
            "zipCode": null
        },
        "modifiedByUserId": "18988755",
        "modifiedDateTimeUtc": "2024-01-13T13:07:44.000Z",
        "nickname": null,
        "nwcaId": null,
        "onlineRegistrationStatus": "complete",
        "opcNumber": null,
        "otbId": 148,
        "paid": true,
        "previousPlace": null,
        "record": "16-6",
        "regionPlace": null,
        "sectionPlace": null,
        "seed": null,
        "seedingCriteria1": null,
        "seedingCriteria2": null,
        "seedingCriteria3": null,
        "seedingCriteria4": null,
        "seedingCriteria5": null,
        "skillLevelId": null,
        "source": "online-registration",
        "state": "MA",
        "teamId": "caef87e3-8d30-497d-8761-1f0a9ed9df91",
        "tier": null,
        "usaWrestlingCardNum": null,
        "weightClassId": "2ea1ed67-07ba-4550-bc0e-70c801833d44",
        "withdrawn": false,
        "zipCode": null
*/

	/** @type {import("../defs").Data} */
	const data = {
		wrestler: null,
	};

	let raw_data = null;

	const load_data = async () => {
		if (id == "") return alert("No ID/URL provided");

		const headers = new Headers({
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
		});

		if (id.includes("flowrestling.org")) {
			const regex = /flowrestling.org\/athletes\/((?:[0-9a-z]+-?)+)/g;

			const match = regex.exec(id);
			
			if (match && match[1]) {
				id = match[1];
			} else {
				alert("Invalid link");
				return;
			}
		}

		window["get_season"] = get_season;

		if (!await (async () => {
			const res = await fetch(`https://floarena-api.flowrestling.org/bouts/?identityPersonId=${id}&page[size]=1&page[offset]=0`, { headers });
			const data = await res.json();

			return !(data.data.length == 0 && data.meta.total == 0);
		})()) {
			alert(`No data found for ID ${id}`);
			return;
		}

		await (async () => {
			console.log("Fetching bouts...");
			const d = await (await fetch(`https://floarena-api.flowrestling.org/bouts/?identityPersonId=${id}&page[size]=0&hasResult=true&page[offset]=0&include=bottomWrestler.team,topWrestler.team,weightClass,topWrestler.division,bottomWrestler.division`, { headers })).json();
			raw_data = d;

			console.log("Processing...");

			raw_data.included.sort((a, b) => {
				Date.parse(a.attributes.modifiedDateTimeUtc) - Date.parse(b.attributes.modifiedDateTimeUtc);
			});

			window["raw_data"] = raw_data;

			const wrestler = d.included.find(x => x.type == "wrestler" && x.attributes.identityPersonId == id);
			const division = d.included.find(x => x.type == "division" && x.id == wrestler.attributes.divisionId);

			document.title = `Flo Stats | ${wrestler.attributes.firstName} ${wrestler.attributes.lastName}`;
			history.pushState({}, "", `?id=${id}`);

			/*const thanksgiving = new Date(new Date().getFullYear(), 10, 1);
			thanksgiving.setDate(thanksgiving.getDate() + (4 - thanksgiving.getDay()) + 21);
			
			const season_start = new Date(thanksgiving.getFullYear(), thanksgiving.getMonth(), thanksgiving.getDate() + 4);*/

			const filteredBouts = d.data.filter(x => x.attributes.winType != "BYE" && x.attributes.winnerWrestlerId);

			/** @type {import("../defs").Stats} */
			const total_stats = {
				total: filteredBouts.length,
				wins: 0,
				losses: 0,
				pins: 0,
				techs: 0,
				ratio: [0, 0],
			};

			filteredBouts.forEach(bout => {
				const winner = d.included.find(x => x.type == "wrestler" && x.id == bout.attributes.winnerWrestlerId);
				if (winner) {
					if (winner.attributes.identityPersonId == wrestler.attributes.identityPersonId) {
						total_stats.wins++;

						if (bout.attributes.winType == "F") {
							total_stats.pins++;
						} else if (bout.attributes.winType == "TF") {
							total_stats.techs++;
						}
					} else {
						total_stats.losses++;
					}
				} else {
					console.log(bout);
				}
			});

			total_stats.ratio = ratio(total_stats.wins, total_stats.losses);

			/** @type {Array<{ season: string, stats: import("../defs").Stats, grade: import("../defs").Grade | null }>} */
			const seasons = [];

			let latest_location = {
				city: wrestler.attributes.location.city,
				state: wrestler.attributes.location.state,
				country: wrestler.attributes.location.country,
			};

			filteredBouts.forEach(bout => {
				const top_wrestler = d.included.find(x => x.type == "wrestler" && x.id == bout.attributes.topWrestlerId);
				const bottom_wrestler = d.included.find(x => x.type == "wrestler" && x.id == bout.attributes.bottomWrestlerId);

				const selected_wrestler = top_wrestler ? top_wrestler.attributes.identityPersonId == wrestler.attributes.identityPersonId ? top_wrestler : bottom_wrestler : bottom_wrestler;

				if (latest_location.city == null || latest_location.state == null || latest_location.country == null) {
					latest_location = {
						city: selected_wrestler.attributes.location.city,
						state: selected_wrestler.attributes.location.state,
						country: selected_wrestler.attributes.location.country,
					};
				}

				const winner = d.included.find(x => x.type == "wrestler" && x.id == bout.attributes.winnerWrestlerId);
				if (winner) {
					const season = get_season(new Date(bout.attributes.modifiedDateTimeUtc || bout.attributes.createdDateTimeUtc));

					if (!seasons.find(x => x.season == season)) {
						seasons.push({
							season,
							stats: {
								total: 0,
								wins: 0,
								losses: 0,
								pins: 0,
								techs: 0,
								ratio: [0, 0],
							},
							grade: null,
						});
					}

					// @ts-ignore
					const season_stats = seasons.find(x => x.season == season).stats;

					season_stats.total++;

					if (winner.attributes.identityPersonId == wrestler.attributes.identityPersonId) {
						season_stats.wins++;

						if (bout.attributes.winType == "F") {
							season_stats.pins++;
						} else if (bout.attributes.winType == "TF") {
							season_stats.techs++;
						}
					} else {
						season_stats.losses++;
					}

					if (selected_wrestler.attributes.grade) {
						seasons.find(x => x.season == season).grade = {
							name: selected_wrestler.attributes.grade.attributes.name,
							number: selected_wrestler.attributes.grade.attributes.numericValue,
						};
					}
				}
			});

			seasons.forEach(season => {
				season.stats.ratio = ratio(season.stats.wins, season.stats.losses);
			});

			data.wrestler = {
				id: wrestler.attributes.identityPersonId,
				firstName: wrestler.attributes.firstName,
				lastName: wrestler.attributes.lastName,
				grade: wrestler.attributes.grade ? {
					name: wrestler.attributes.grade.attributes.name,
					number: wrestler.attributes.grade.attributes.numericValue,
				} : null,
				location: latest_location,
				total_stats,
				seasons,
			}

			window["current_data"] = data;
		})();
	};

	afterNavigate(() => {
		console.log("afterNavigate", $page.url.searchParams.get("id"));
		id = $page.url.searchParams.get("id") || "";
		if (id != "") load_data();
	});

	onMount(() => {
		console.log("onMount", $page.url.searchParams.get("id"));
		id = $page.url.searchParams.get("id") || "";
		if (id != "") load_data();
	});

	const handle_popstate = () => {
		if ($page.url.searchParams.get("id") && $page.url.searchParams.get("id") != id) {
			id = $page.url.searchParams.get("id");
			load_data();
		}
	}

	let showing_help = false;
</script>

<svelte:head>
	<title>Flo Stats</title> 
</svelte:head>

<svelte:window on:keydown={({ repeat, key }) => { if (!repeat && key == "Enter") { load_data() } }} on:popstate={handle_popstate} />

<Modal bind:showModal = {showing_help}>
	<h2 slot="header">
		Correctly getting your ID
	</h2>

	<div class="help-info">
		<div class="correct">
			<span class="help-title">Correct:</span>
			<img src="correct.png" alt="Correct example" />
		</div>
		<div class="incorrect">
			<span class="help-title">Incorrect:</span>
			<img src="incorrect.png" alt="Incorrect example" />
		</div>
	</div>
	<span class="help-subtitle">Usually found in <a target="_blank" href="https://arena.flowrestling.org">FloArena</a> tournaments</span>
</Modal>

<div class="container">
	<h1>Calculate your FloWrestling statistics</h1>
	<div class="id-input">
		<input type="text" placeholder="Athlete ID or URL" bind:value={id}>
		<button type="button" on:click={load_data}>Fetch</button>
		<button type="button" on:click={() => { showing_help = true }}>Help</button>
	</div>
	
	<div class="data">
		{#if data.wrestler == null}
			<p>No data</p>
		{:else}
			<div class="basic-info">
				<span class="main-name">{data.wrestler.firstName} {data.wrestler.lastName}</span>
				{#if data.wrestler.grade}
				<span class="main-info"><span class="main-info-label">Grade:</span> ({data.wrestler.grade.number.toString()}) {data.wrestler.grade.name}</span>
				{/if}
				<span class="main-info"><span class="main-info-label">Location:</span> {data.wrestler.location.city}, {data.wrestler.location.state}, {data.wrestler.location.country}</span>

				<div class="all-stats-container">
					<span class="main-info-label" style="margin: 5px">Match Statistics:</span>
					<div class="total-stats">
						<span class="stats-group-label">Total</span>
						<Stats stats={data.wrestler.total_stats}/>
					</div>
					<div class="season-stats">
						<span class="stats-group-label">By Season</span>
						<div class="season-list">
							{#each data.wrestler.seasons as season}
								<div class="season">
									<h4 class="stats-label">{season.season}</h4>
									{#if season.grade}
										<span class="stats-data-field"><span class="stats-data-field-label">Grade:</span> ({season.grade.number}) {season.grade.name}</span>
									{/if}
									<Stats stats={season.stats}/>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style> 
	* {
		text-align: center;
		margin: auto;
		font-family: Arial, Helvetica, sans-serif;
	}

	:global(.red) {
		color: red;
	}

	:global(.green) {
		color: green;
	}

	.container {
		padding: 0.7em;
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.id-input {
		padding: 10px;
		display: flex;
		gap: 0.3em;
	}

	input {
		padding: 5px;
		border-radius: 5px;
		border: 1px solid #ccc;
	}

	button {
		padding: 5px;
		border-radius: 5px;
		border: 1px solid #ccc;
		background-color: #eee;
	}

	button:hover {
		background-color: #ddd;
	}

	button:active {
		background-color: #ccc;
	}

	.basic-info, .all-stats-container {
		margin: 15px 0;
		display: flex;
		flex-direction: column;
	}

	.main-name {
		font-size: 30px;
		font-weight: bold;
	}

	.main-info, .main-info-label {
		font-size: 20px;
	}

	.main-info-label {
		font-weight: bold;
	}

	.total-stats, .season-stats {
		margin: 10px 0;
	}

	:global(.stats-data-field-label) {
		font-weight: bold;
	}

	.stats-group-label {
		font-weight: bold;
		font-size: 25px;
	}

	.season-list {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		align-content: center;
		gap: 0px;
		align-items: stretch;

		/* display: inline-block; */

		padding: 10px;
	}

	.season-list > div {
		padding: 1em;
	}

	.season-stats {
		display: flex;
		flex-direction: column;
	}

	.season {
		border: 1px solid #ccc;
		flex: 1;
		margin: initial;
	}
	
	.help-info {
		display: flex;
		flex-direction: row;
		gap: 1em;
	}

	.correct > .help-title {
		color: green;
	}

	.incorrect > .help-title {
		color: red;
	}

	.help-title {
		font-weight: bold;
	}

	.help-info > div > img {
		width: 300px;
		border: 1px solid black;
	}

	.help-info > div {
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.help-subtitle {
		padding-top: 1em;
	}

	a:visited {
		color: blue;
	}
</style>