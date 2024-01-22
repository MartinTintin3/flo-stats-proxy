<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";

	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { ratio } from "../defs";

	let id = "";

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

		if (id != $page.url.searchParams.get("id")) {
			history.pushState({}, "", `?id=${id}`);
		}

		if (!await (async () => {
			const res = await fetch(`https://floarena-api.flowrestling.org/bouts/?identityPersonId=${id}&page[size]=1&page[offset]=0`, { headers });
			const data = await res.json();

			return !(data.data.length == 0 && data.meta.total == 0);
		})()) {
			alert(`No data found for ID ${id}`);
			return;
		}

		await (async () => {
			console.log("Fetching...");
			const d = await (await fetch(`https://floarena-api.flowrestling.org/bouts/?identityPersonId=${id}&page[size]=0&page[offset]=0&include=bottomWrestler.team,topWrestler.team,weightClass,topWrestler.division,bottomWrestler.division`, { headers })).json();
			raw_data = d;

			console.log("Processing...");

			raw_data.included.sort((a, b) => {
				Date.parse(a.attributes.modifiedDateTimeUtc) - Date.parse(b.attributes.modifiedDateTimeUtc);
			});

			window["raw_data"] = raw_data;

			const wrestler = d.included.find(x => x.type == "wrestler" && x.attributes.identityPersonId == id);
			const division = d.included.find(x => x.type == "division" && x.id == wrestler.attributes.divisionId);

			/*const thanksgiving = new Date(new Date().getFullYear(), 10, 1);
			thanksgiving.setDate(thanksgiving.getDate() + (4 - thanksgiving.getDay()) + 21);
			
			const season_start = new Date(thanksgiving.getFullYear(), thanksgiving.getMonth(), thanksgiving.getDate() + 4);*/

			const filteredBouts = d.data.filter(x => x.attributes.winType != "BYE" && x.attributes.winnerWrestlerId);

			/** @type {import("../defs").Stats} */
			const stats = {
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
						stats.wins++;

						if (bout.attributes.winType == "F") {
							stats.pins++;
						} else if (bout.attributes.winType == "TF") {
							stats.techs++;
						}
					} else {
						stats.losses++;
					}
				} else {
					console.log(bout);
				}
			});

			stats.ratio = ratio(stats.wins, stats.losses);

			data.wrestler = {
				id: wrestler.attributes.identityPersonId,
				createdTimestamp: Date.parse(wrestler.attributes.createdDateTimeUtc),
				firstName: wrestler.attributes.firstName,
				lastName: wrestler.attributes.lastName,
				grade: {
					name: wrestler.attributes.grade.attributes.name,
					number: wrestler.attributes.grade.attributes.numericValue,
				},
				location: {
					city: wrestler.attributes.location.city,
					country: wrestler.attributes.location.country,
					state: wrestler.attributes.location.state
				},
				modifiedTimestamp: Date.parse(wrestler.attributes.modifiedDateTimeUtc),
				division: `${division.attributes.name} D${division.attributes.sequence}`,
				stats,
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
</script>

<svelte:head>
	<title>Flo Stats{data.wrestler ? ` | ${data.wrestler.firstName} ${data.wrestler.lastName}` : ""}</title> 
</svelte:head>

<svelte:window on:keydown={({ repeat, key }) => { if (!repeat && key == "Enter") { load_data() } }} />

<div class="container">
	<div class="id-input">
		<input type="text" placeholder="ID or URL" bind:value={id}>
		<button type="button" on:click={load_data}>Fetch</button>
	</div>
	
	<div class="data">
		{#if data.wrestler == null}
			<p>No data</p>
		{:else}
			<div class="basic-info">
				<span class="basic-info-name">{data.wrestler.firstName} {data.wrestler.lastName}</span>
				<span class="basic-info-grade"><span class="info-label">Grade:</span> ({data.wrestler.grade.number.toString()}) {data.wrestler.grade.name}</span>
				<span class="basic-info-division"><span class="info-label">Division:</span> {data.wrestler.division}</span>
				<span class="basic-info-location"><span class="info-label">Location:</span> {data.wrestler.location.city}, {data.wrestler.location.state}, {data.wrestler.location.country}</span>
				<span class="basic-info-created"><span class="info-label">Created:</span> {new Date(data.wrestler.createdTimestamp).toLocaleString()}</span>
				<span class="basic-info-modified"><span class="info-label">Last Modified:</span> {new Date(data.wrestler.modifiedTimestamp).toLocaleString()}</span>
			</div>
	
			<div class="stats">
				<span><span class="stats-label">Total:</span> {data.wrestler.stats.total}</span>
				<span><span class="stats-label">Wins:</span> <span class="green">{data.wrestler.stats.wins}</span></span>
				<span><span class="stats-label">Losses:</span> <span class="red">{data.wrestler.stats.losses}</span></span>
				<span><span class="stats-label">Pins:</span> {data.wrestler.stats.pins}</span>
				<span><span class="stats-label">Techs:</span> {data.wrestler.stats.techs}</span>
				<span><span class="stats-label">W/L Ratio:</span> <span class="green">{data.wrestler.stats.ratio[0]}</span>:<span class="red">{data.wrestler.stats.ratio[1]}</span> <span class="{data.wrestler.stats.ratio[1] == 0 ? "green" : data.wrestler.stats.ratio[0] / data.wrestler.stats.ratio[1] > 1 ? "green" : "red"}">({data.wrestler.stats.ratio[1] != 0 ? ((Math.round(data.wrestler.stats.ratio[0] / data.wrestler.stats.ratio[1] * 100) / 100).toFixed(2)) : data.wrestler.stats.ratio[0]})</span></span>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(*) {
		text-align: center;
		margin: auto;
		font-family: Arial, Helvetica, sans-serif;
	}

	.container {
		padding: 0.7em;
	}

	.id-input {
		padding: 10px;
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

	.basic-info {
		margin: 15px 0;
		display: flex;
		flex-direction: column;
	}

	.basic-info-name {
		font-size: 1.5em;
		font-weight: bold;
	}

	.basic-info-grade {
		font-size: 1.2em;
	}

	.basic-info-division {
		font-size: 1.2em;
	}

	.basic-info-location {
		font-size: 1.2em;
	}

	.basic-info-created {
		font-size: 1.2em;
	}

	.basic-info-modified {
		font-size: 1.2em;
	}

	.stats {
		margin: 15px 0;
	}

	.stats-label {
		font-weight: bold;
	}

	.green {
		color: green;
	}

	.red {
		color: red;
	}

	.info-label {
		font-weight: bold;
	}
</style>