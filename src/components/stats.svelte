<span class="stats-data-field"><span class="stats-data-field-label">Total:</span> {stats.total}</span>
<span class="stats-data-field"><span class="stats-data-field-label">Wins:</span> <span class="green">{stats.wins}</span></span>
<span class="stats-data-field"><span class="stats-data-field-label">Losses:</span> <span class="red">{stats.losses}</span></span>
<span class="stats-data-field"><span class="stats-data-field-label">Pins:</span> {stats.pins}</span>
<span class="stats-data-field"><span class="stats-data-field-label">Techs:</span> {stats.techs}</span>
<span class="stats-data-field"><span class="stats-data-field-label">W/L Ratio:</span> <span class="green">{stats.ratio[0]}</span>:<span class="red">{stats.ratio[1]}</span> <span class="{stats.ratio[1] == 0 ? "green" : stats.ratio[0] / stats.ratio[1] > 1 ? "green" : "red"}">({stats.ratio[1] != 0 ? ((Math.round(stats.ratio[0] / stats.ratio[1] * 100) / 100).toFixed(2)) : stats.ratio[0]})</span></span>

<script>
	/** @type {import("../defs").Stats} */
	export let stats;
</script>