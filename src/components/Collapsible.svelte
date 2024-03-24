<script>
    // based on suggestions from:
    // Inclusive Components by Heydon Pickering https://inclusive-components.design/collapsible-sections/
    let expanded = false;

	export let expanded_title;
	export let unexpanded_title;
</script>

<div class="collapsible">
	<button aria-expanded={expanded} on:click={() => expanded = !expanded}>
		<div></div>
		<h4>{expanded ? expanded_title : unexpanded_title}</h4>
		<svg viewBox="0 0 20 20" fill="none" >
		<path class="vert" d="M10 1V19" stroke="black" stroke-width="2"/>
		<path d="M1 10L19 10" stroke="black" stroke-width="2"/>
		</svg>
    </button>

    <div class='contents' hidden={!expanded}>
        <slot></slot>
    </div>
</div>

<style>
	.collapsible {
		border: 1px solid var(--gray-light, #ccc);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.contents {
		padding: 1em;
	}
	
	h4 {
		margin: 0;
	}
	
	button {
		background-color: var(--background, #fff);
		color: var(--gray-darkest, #282828);
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		border: none;
		margin: 0;
		padding: 1em 0.5em;
	}

	button:hover {
		background-color: var(--gray-light, #eee);
	}

  button[aria-expanded="true"] {
    border-bottom: 1px solid var(--gray-light, #ccc);
  }

    button[aria-expanded="true"] .vert {
        display: none;
    }

    button:focus svg{
        outline: 1px solid;
    }

    button [aria-expanded="true"] rect {
        fill: currentColor;
    }

    svg {
        height: 0.7em;
				width: 0.7em;
    }
</style>