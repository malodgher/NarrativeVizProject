export function treemapSetup(map_svg, state_date, map_tooltip, width, height) {
    /**
     * View these exaples for d3 Treemaps:
     * 
     * https://observablehq.com/@d3/treemap
     * 
     * https://www.d3-graph-gallery.com/graph/treemap_basic.html
     * 
     */

    const root = d3.stratify().id(d => d.state).parentId(d => d.region)(state_date); //Creates tree where the the region is the parent and the state is teh child
	root.sum(d => +d.cases);

	d3.treemap().size([width, height]).padding(0.75)(root);

	map_svg.selectAll("rect")
		.data(root.leaves())
		.join("rect")
            .attr("class", d => {
				switch(d.parent.id){
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
			.attr("x", d => d.x0)
			.attr("y", d => d.y0)
			.attr("width", d => d.x1 - d.x0)
			.attr("height", d => d.y1 - d.y0)
			.on("mouseover", e => {
				map_tooltip.style("opacity", 1)
					.html("State/Territory: "+e.target.__data__.data.state+"<br>Cases: "+e.target.__data__.value.toLocaleString("en-US")+" case(s)<br>Percent of National Cases: " +((e.target.__data__.value/root.value)*100).toFixed(2)+ "%");
			})
			.on("mousemove", e => {
				map_tooltip.style("left", (e.pageX) + "px")
					.style("top", (e.pageY) + "px");
			})
			.on("mouseleave", e => {
				map_tooltip.style("opacity", 0);
			});
}