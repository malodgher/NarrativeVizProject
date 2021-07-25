async function init() {
	const data = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv", function (d) {
		return { date : d3.timeParse("%Y-%m-%d")(d.date), cases : d.cases, deaths: d.deaths }
	});
	
	const xs = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, 1300]);
	const ys = d3.scaleLinear().domain([0, data[data.length - 1].cases]).range([500, 0]);
	
	/*
		For some reason, when using d3.max or d3.extent to get the number of cases, I don't get the
		correct number of maximum cases, instead I get 9957805. Need to ask about that
	*/
	
	const svg = d3.select("#canvas").append("svg")
					.attr("width", (1300 + 2*(70)))
					.attr("height", (500 + 2*(70)));
	
	const dateFormat = d3.timeFormat("%m/%d/%Y")
	
	svg.append("g").attr("transform", "translate(70,70)")
		.append("path")
			.datum(data)
			.attr("class", "lineSet")
			.attr("id", "totalCases")
			.attr("d", d3.line()
				.x(d => xs(d.date))
				.y(d => ys(d.cases)));
	
	svg.append("g")
		.attr("transform", "translate(70,570)") //translate(margin,height + margin)
		.call(d3.axisBottom(xs)
			.ticks(11)
			.tickFormat(dateFormat));
	
	svg.append("g").attr("transform", "translate(70,70)").call(d3.axisLeft(ys));
	
}