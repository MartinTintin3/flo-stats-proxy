<script>
	/**
	 * @type {{
	 * 	id: string,
	 * 	createdTimestamp: number,
	 * 	division: string,
	 * 	firstName: string,
	 * 	lastName: string,
	 * 	city: string,
	 * 	state: string,
	 * 	grade: {
	 * 		name: string,
	 * 		number: number,
	 * 	},
	 * 	location: {
	 * 		city: string,
	 * 		country: string,
	 * 		state: string,
	 * 	},
	 * 	modifiedTimestamp: number,
	 * }}
	*/
	export let wrestler_data;
</script>

<span class="current-wrestler-info current-wrestler-info-name">{wrestler_data.firstName} {wrestler_data.lastName}</span>
<span class="current-wrestler-info current-wrestler-info-grade"><span class="info-label">Grade:</span> ({wrestler_data.grade.number.toString()}) {wrestler_data.grade.name}</span>
<span class="current-wrestler-info current-wrestler-info-division"><span class="info-label">Division:</span> {wrestler_data.division}</span>
<span class="current-wrestler-info current-wrestler-info-location"><span class="info-label">Location:</span> {wrestler_data.location.city}, {wrestler_data.location.state}, {wrestler_data.location.country}</span>
<span class="current-wrestler-info current-wrestler-info-created"><span class="info-label">Created:</span> {new Date(wrestler_data.createdTimestamp).toLocaleString()}</span>
<span class="current-wrestler-info current-wrestler-info-modified"><span class="info-label">Last Modified:</span> {new Date(wrestler_data.modifiedTimestamp).toLocaleString()}</span>

<style>
	.current-wrestler-info > .info-label {
		font-weight: bold;
	}

	.current-wrestler-info-name {
		display: block;
		font-size: 30px;
		font-weight: bold;
	}

	.current-wrestler-info-grade {
		display: block;
		font-size: 15px;
	}

	.current-wrestler-info-division {
		display: block;
		font-size: 15px;
	}

	.current-wrestler-info-location {
		display: block;
		font-size: 15px;
	}

	.current-wrestler-info-created {
		display: block;
		font-size: 15px;
	}

	.current-wrestler-info-modified {
		display: block;
		font-size: 15px;
	}
</style>