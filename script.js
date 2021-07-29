async function init() {
	const data = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv", d => {
		return { date : d3.timeParse("%Y-%m-%d")(d.date), cases : d.cases, deaths: d.deaths }
	});
	
	const change_data = data.map((d, i, data) => {
		const value = {
			date: d.date,
			cases: (i-1) === -1 ? (data[i].cases - 0) : (data[i].cases - data[i-1].cases),
			deaths: (i-1) === -1 ? (data[i].deaths - 0) : (data[i].deaths - data[i-1].deaths)
		}
		return value;
	});
	
	const xs = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, 1300]);
	const ys = d3.scaleLinear().domain([0, data[data.length - 1].cases]).range([500, 0]);
	// const ds = d3.scaleLinear().domain([0, data[data.length - 1].deaths]).range([500, 0]);
	// const ds = d3.scaleLinear().domain([/* d3.min(change_data, d => d.cases) */0, d3.max(change_data, d => d.deaths)]).range([500, 0]);
	const cs = d3.scaleLinear().domain([/* d3.min(change_data, d => d.cases) */0, d3.max(change_data, d => d.cases)]).range([500, 0]);
	
	/*
		For some reason, when using d3.max or d3.extent to get the number of cases, I don't get the
		correct number of maximum cases, instead I get 9957805. Need to ask about that
	*/
	
	const svg = d3.select("#canvas").append("svg")
					.attr("width", (1300 + 2*(70)))
					.attr("height", (500 + 2*(70)));
	
	/* d3.select("#canvas").append("h1").text("Number of deaths from COVID-19 in the U.S., Jan 21, 2020 - Present");
	
	const deaths_svg = d3.select("#canvas").append("svg")
					.attr("width", (1300 + 2*(70)))
					.attr("height", (500 + 2*(70))); */
	
	const change_svg = d3.select("#canvas").append("svg")
					.attr("width", (1300 + 2*(70)))
					.attr("height", (500 + 2*(70)));
	
	/*d3.select("#canvas").append("h1").text("Daily rate of COVID-19 Deaths in the U.S., Jan 21, 2020 - Present");
	
	const death_svg = d3.select("#canvas").append("svg")
					.attr("width", (1300 + 2*(70)))
					.attr("height", (500 + 2*(70)));*/
	
	
	const dateFormat = d3.timeFormat("%m/%d/%Y")
	const fileName = location.pathname.split("/").slice(-1)[0]
	
	svg.append("g").attr("transform", "translate(70,70)")
		.append("path")
			.datum(data)
			.attr("class", "lineSet")
			.attr("id", "totalCases")
			.attr("d", d3.line()
				.x(d => xs(d.date))
				.y(d => ys(d.cases)));
	
	/* deaths_svg.append("g").attr("transform", "translate(70,70)")
		.append("path")
			.datum(data)
			.attr("class", "lineSet")
			.attr("id", "totalDeaths")
			.attr("d", d3.line()
				.x(d => xs(d.date))
				.y(d => ds(d.deaths))); //Different ds than one currently initialized */
	
	change_svg.append("g").attr("transform", "translate(70,70)")
		.attr("class", "allBars")
		.attr("id", "caseRect")
		.selectAll("rect")
		.data(change_data).enter().append("rect")
			.attr("width", 2)
			.attr("height", function(d) { return (500 - cs(d.cases)); })
			.attr("x", d => xs(d.date))
			.attr("y", d => cs(d.cases))
	
	/* death_svg.append("g").attr("transform", "translate(70,70)")
		.attr("class", "allBars")
		.attr("id", "deathRect")
		.selectAll("rect")
		.data(change_data).enter().append("rect")
			.attr("width", 2)
			.attr("height", function(d) { return (500 - ds(d.deaths)); })
			.attr("x", d => xs(d.date))
			.attr("y", d => ds(d.deaths)) */
	
	/* change_svg.append("g").attr("transform", "translate(70,70)")
		.append("path")
			.datum(change_data)
			.attr("class", "lineSet")
			.attr("id", "changeCases")
			.attr("d", d3.line()
				.x(d => xs(d.date))
				.y(d => cs(d.cases))); */
	
	
	svg.append("g")
		.attr("transform", "translate(70,570)") //translate(margin,height + margin)
		.call(d3.axisBottom(xs)
			.ticks(11)
			.tickFormat(dateFormat));
	
	svg.append("g").attr("transform", "translate(70,70)").call(d3.axisLeft(ys));
	
	change_svg.append("g")
		.attr("transform", "translate(70,570)") //translate(margin,height + margin)
		.call(d3.axisBottom(xs)
			.ticks(11)
			.tickFormat(dateFormat));
	
	change_svg.append("g").attr("transform", "translate(70,70)").call(d3.axisLeft(cs));
	
	/* death_svg.append("g")
		.attr("transform", "translate(70,570)") //translate(margin,height + margin)
		.call(d3.axisBottom(xs)
			.ticks(11)
			.tickFormat(dateFormat));
	
	death_svg.append("g").attr("transform", "translate(70,70)").call(d3.axisLeft(ds)); */
	
}