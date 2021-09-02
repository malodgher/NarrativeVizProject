export function treemapSetup(map_svg, state_date, width, height) {
    /**
     * View these exaples for d3 Treemaps:
     * 
     * https://observablehq.com/@d3/treemap
     * 
     * https://www.d3-graph-gallery.com/graph/treemap_basic.html
     * 
     */

    const root = d3.stratify().id(d => d.state).parentId(d => d.region)(state_date); // Creates tree where the the region is the parent and the state is teh child
	root.sum(d => +d.cases);

	d3.treemap().size([width, height]).padding(0.75)(root);

	const state_leaves = map_svg.selectAll("g").data(root.leaves()).enter().append("g").attr("transform", d => ("translate(" + d.x0 + "," + d.y0 + ")" ));

	state_leaves.append("title")
		.text(d => "State/Territory: " + d.data.state + "\nCases: " + d.value.toLocaleString("en-US") + " case(s)\nPercent of National Cases: " + ((d.value/root.value)*100).toFixed(2) + "%");

	state_leaves.append("rect")
		.attr("id", (d, i) => (d.leafId = "leaf-" + (i+1)))
		.attr("class", d => {
			switch(d.parent.id) {
				case "Northeast":
					return "ne-tree-rects";
				case "Midwest":
					return "mw-tree-rects";
				case "South":
					return "south-tree-rects";
				case "West":
					return "west-tree-rects";
				case "Territories":
					return "terr-tree-rects";
			}
		})
		.attr("width", d => d.x1 - d.x0)
		.attr("height", d => d.y1 - d.y0);
	
	// clipPath is used so that the tspans in the text container for each g are clipped off when they reach the edges of each rect
	// More info on clipPath here: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath
	
	state_leaves.append("clipPath")
		.attr("id", (d, i) => (d.clipId = "clip-" + (i+1)))
		.append("use")
			.attr("xlink:href", d => ("#" + d.leafId));
	
	state_leaves.append("text")
	.attr("clip-path", d => ("url(#" + d.clipId + ")"))
	.attr("class", "title-size")
    .selectAll("tspan")
	.data(d => d.data.state.split(" ")) // Had to add split here. Without it, d3 would loop through every char in the state string
	.enter().append("tspan")
		.attr("x", 2)
		.attr("y", (d, i, nodes) => (((i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9) + "em"))
		.attr("fill-opacity", 0.85)
			.text(d => d);
}