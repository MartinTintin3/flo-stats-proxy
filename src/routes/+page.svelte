<script>
	import { page } from "$app/stores";
	import { onMount } from "svelte";

	let id = $page.url.searchParams.get("id")
	let input_data = "";

	let loading = false;

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

	/**
	 * @type {{
	 * 	wrestler: {
	 * 		id: string,
	 *  	createdTimestamp: number,
	 *  	divisionId: string,
	 *  	firstName: string,
	 *  	lastName: string,
	 * 		grade: {
	 * 			name: string,
	 * 			grade: number,
	 *  	},
	 *  	location: {
	 *  		city: string,
	 *  		country: string,
	 *  		state: string,
	 * 		},
	 * 		modifiedTimestamp: number,
	 *  } | null
	 * }}
	*/
	const data = {
		wrestler: null,
	};

	const load_data = async () => {
		loading = true;

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

		(await fetch(`https://floarena-api.flowrestling.org/bouts/?identityPersonId=${id}&page[size]=1&page[offset]=0&fields[bout]=none&include=bottomWrestler,topWrestler`, { headers })).json().then(d => {
			const wrestler = d.included.find(x => x.type == "wrestler" && x.attributes.identityPersonId == id);
			data.wrestler = {
				id: wrestler.attributes.identityPersonId,
				createdTimestamp: Date.parse(wrestler.attributes.createdDateTimeUtc),
				divisionId: wrestler.attributes.divisionId,
				firstName: wrestler.attributes.firstName,
				lastName: wrestler.attributes.lastName,
				grade: {
					name: wrestler.attributes.grade.attributes.name,
					grade: wrestler.attributes.grade.attributes.numericValue,
				},
				location: {
					city: wrestler.attributes.location.city,
					country: wrestler.attributes.location.country,
					state: wrestler.attributes.location.state
				},
				modifiedTimestamp: Date.parse(wrestler.attributes.modifiedDateTimeUtc),
			}

			window["current_data"] = data;
		});

		//await fetch(`https://floarena-api.flowrestling.org/bouts/?identityPersonId=064ad7f4-8d16-4dd2-94b1-1dd1c45c3832&page[size]=0&page[offset]=0&include=bottomWrestler.team,topWrestler.team,weightClass`, { headers });
		
		loading = false;
	};

	onMount(() => {
		if ($page.url.searchParams.get("id") != "") load_data();
	});
</script>

<svelte:head>
	<title>Flo Stats{data.wrestler != null ? ` | ${data.wrestler.firstName} ${data.wrestler.lastName}` : ""}</title> 
</svelte:head>

<svelte:window on:keydown={({ repeat, key }) => { if (!repeat && key == "Enter") { id = input_data; load_data() } }} />

<div>
	<input type="text" placeholder="ID or URL" bind:value={input_data}>
	<button type="button" on:click={() => { id = input_data; load_data() }}>Fetch</button>
</div>

<style>
	* {
		text-align: center;
		margin: auto;
		font-family: Arial, Helvetica, sans-serif;
	}
</style>