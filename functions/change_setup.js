function changeSetup(change_svg, data, date_format, tooltip) {
	const xs = d3.scaleBand().domain(data.map(d => d.date)).range([0, 1200]); //Used scaleBand instead of scaleLinear for zooming and using x.bandwidth
	const cs = d3.scaleLinear().domain([/* d3.min(change_data_us, d => d.cases) */0, d3.max(data, d => d.cases)]).range([300, 0]);
	
	// Look up https://observablehq.com/@d3/zoomable-bar-chart for information on zoomable bar charts
	
	const extent = [[0, 0], [1200, 300]]
	
	change_svg.call(d3.zoom()
		.scaleExtent([1, 8])
		.translateExtent(extent)
		.extent(extent)
		.on("zoom", e => {
			xs.range([0, 1200].map(d => e.transform.applyX(d)))
			change_svg.selectAll(".all-bars rect").attr("x", d => xs(d.date)).attr("width", xs.bandwidth())
			change_svg.selectAll(".x-axis").call(d3.axisBottom(xs)
				.tickValues(xs.domain().filter((d, i) => !(i%64)))
				.tickFormat(date_format))
		}))
	
	change_svg.append("g").attr("transform", "translate(70,70)")
		.attr("class", "all-bars")
		.selectAll("rect")
		.data(data).enter().append("rect")
			.attr("width", xs.bandwidth())
			.attr("height", function(d) {
				if((300 - cs(d.cases)) < 0) {
					return 0
				} else {
					return (300 - cs(d.cases))
				}
			})
			.attr("x", d => xs(d.date))
			.attr("y", d => cs(d.cases))
			.on("mouseover", e => {
					tooltip.style("opacity", 1)
				})
			.on("mousemove", e => {
				tooltip.html("Date: "+e.target.__data__.date.toLocaleDateString('en-US')+"<br>Rate of Increase from day before: "+e.target.__data__.cases.toLocaleString("en-US")+" cases")
						.style("left", (e.pageX) + "px")
						.style("top", (e.pageY) + "px")
			})
			.on("mouseleave", e => {
					tooltip.style("opacity", 0)
				})
	
	change_svg.append("g")
		.attr("transform", "translate(70,370)") //translate(margin,height + margin)
		.attr("class", "x-axis")
		.call(d3.axisBottom(xs)
			.tickValues(xs.domain().filter((d, i) => !(i%64))) //The filter function makes it so that the scale displays 1 in every 64 ticks. Only used for scaleBand
			.tickFormat(date_format));
	
	change_svg.append("g").attr("transform", "translate(70,70)").attr("class", "y-axis").call(d3.axisLeft(cs));
}


export {changeSetup};