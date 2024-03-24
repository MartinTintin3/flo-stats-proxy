<div class="stats-data">
	<div class="stat">
		<span class="stats-data-field-label">Total:</span> {stats.total}
	</div>
	<div class="stat">
		<span class="stats-data-field-label">Total:</span> {stats.total}
	</div>
	<div class="stat">
		<span class="stats-data-field-label">Wins:</span> <span class="green">{stats.wins}</span>
	</div>
	<div class="stat">
		<span class="stats-data-field-label">Losses:</span> <span class="red">{stats.losses}</span>
	</div>
	<div class="stat">
		<span class="stats-data-field-label">Pins:</span> {stats.pins}
	</div>
	<div class="stat">
		<span class="stats-data-field-label">Techs:</span> {stats.techs}
	</div>
	<div class="stat">
		<span class="stats-data-field-label">W/L Ratio:</span> <span class="green">{stats.ratio[0]}</span>:<span class="red">{stats.ratio[1]}</span> <span class="{stats.ratio[1] == 0 ? "green" : stats.ratio[0] / stats.ratio[1] > 1 ? "green" : "red"}">({stats.ratio[1] != 0 ? ((Math.round(stats.ratio[0] / stats.ratio[1] * 100) / 100).toFixed(2)) : stats.ratio[0]})</span>
	</div>
	<div class="stat">
		<span class="stats-data-field-label">Win Percentage:</span> <span class="{Math.round(stats.wins / stats.total * 100) > 50 ? "green" : "red"}">{((stats.wins / stats.total).toFixed(3) * 100).toFixed(1)}%</span>
	</div>
</div>

<script>
	/** @type {import("../defs").Stats} */
	export let stats;
</script>

<style>
	.stats-data {
		display: flex;
		flex-direction: row;
		justify-content: center;
		padding: 10px 10px;
		gap: 1.5em;
	}
</style>
