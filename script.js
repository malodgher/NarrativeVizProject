async function init() {
	const data_us = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv", d => {
		return { date : d3.timeParse("%Y-%m-%d")(d.date), cases : d.cases, deaths : d.deaths }
	});
	
	const data_states = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv", d => {
		return { date : d3.timeParse("%Y-%m-%d")(d.date), state : d.state, fips : d.fips, cases : d.cases, deaths : d.deaths }
	});
	
	const states_all = data_states.map(d => d.state).filter((d, i, arr) => arr.indexOf(d) === i).sort();
	states_all.unshift("United States")
	
	const dropdown = document.getElementById("statesList")
	states_all.map(d => {
		let opt = document.createElement('option');
		opt.value = d;
		opt.innerHTML = d;
		dropdown.appendChild(opt);
	})
	
	/*
		For some reason, when using d3.max or d3.extent to get the number of cases, I don't get the
		correct number of maximum cases, instead I get 9957805. Need to ask about that
	*/
	
	const line_svg = d3.select("#canvas").append("svg")
					.attr("width", (1300 + 2*(70)))
					.attr("height", (500 + 2*(70)));
	
	const change_svg = d3.select("#canvas").append("svg")
					.attr("width", (1300 + 2*(70)))
					.attr("height", (500 + 2*(70)));
	
	const date_format = d3.timeFormat("%m/%d/%Y")
	
	loadUSSVG(line_svg, change_svg, data_us, date_format)
	
	dropdown.addEventListener("change", event => {
		if(event.target.value === "United States" || dropdown.value === "United States") {
			line_svg.selectAll("*").remove();
			change_svg.selectAll("*").remove();
			loadUSSVG(line_svg, change_svg, data_us, date_format);
		} else {
			line_svg.selectAll("*").remove();
			change_svg.selectAll("*").remove();
			loadStateSVG(line_svg, change_svg, data_states, event.target.value, date_format)
		}
	})
}

function loadUSSVG(line_svg, change_svg, data_us, date_format) {
	const change_data_us = data_us.map((d, i, data_us) => {
		const value = {
			date: d.date,
			cases: (i-1) === -1 ? (data_us[i].cases - 0) : (data_us[i].cases - data_us[i-1].cases),
			deaths: (i-1) === -1 ? (data_us[i].deaths - 0) : (data_us[i].deaths - data_us[i-1].deaths)
		}
		return value;
	});
	
	const xs = d3.scaleTime().domain(d3.extent(data_us, d => d.date)).range([0, 1300]);
	const ys = d3.scaleLinear().domain([0, data_us[data_us.length - 1].cases]).range([500, 0]);
	const cs = d3.scaleLinear().domain([/* d3.min(change_data_us, d => d.cases) */0, d3.max(change_data_us, d => d.cases)]).range([500, 0]);
	
	line_svg.append("g").attr("transform", "translate(70,70)")
		.append("path")
			.datum(data_us)
			.attr("class", "lineSet")
			.attr("id", "totalCases")
			.attr("d", d3.line()
				.x(d => xs(d.date))
				.y(d => ys(d.cases)));
	
	change_svg.append("g").attr("transform", "translate(70,70)")
		.attr("class", "allBars")
		.attr("id", "caseRect")
		.selectAll("rect")
		.data(change_data_us).enter().append("rect")
			.attr("width", 2)
			.attr("height", function(d) { return (500 - cs(d.cases)); })
			.attr("x", d => xs(d.date))
			.attr("y", d => cs(d.cases))
	
	line_svg.append("g")
		.attr("transform", "translate(70,570)") //translate(margin,height + margin)
		.call(d3.axisBottom(xs)
			.ticks(11)
			.tickFormat(date_format));
	
	line_svg.append("g").attr("transform", "translate(70,70)").call(d3.axisLeft(ys));
	
	change_svg.append("g")
		.attr("transform", "translate(70,570)") //translate(margin,height + margin)
		.call(d3.axisBottom(xs)
			.ticks(11)
			.tickFormat(date_format));
	
	change_svg.append("g").attr("transform", "translate(70,70)").call(d3.axisLeft(cs));
}

function loadStateSVG(line_svg, change_svg, data_states, state, date_format) {
	const data_single_state = data_states.filter((d) => d.state === state);
	
	const change_data_single_state = data_single_state.map((d, i, data_us) => {
		const value = {
			date: d.date,
			state: d.state,
			fips: d.fips,
			cases: (i-1) === -1 ? (data_us[i].cases - 0) : (data_us[i].cases - data_us[i-1].cases),
			deaths: (i-1) === -1 ? (data_us[i].deaths - 0) : (data_us[i].deaths - data_us[i-1].deaths)
		}
		return value;
	});
	const xs = d3.scaleTime().domain(d3.extent(data_single_state, d => d.date)).range([0, 1300]);
	const ys = d3.scaleLinear().domain([0, data_single_state[data_single_state.length - 1].cases]).range([500, 0]);
	const cs = d3.scaleLinear().domain([0, d3.max(change_data_single_state, d => d.cases)]).range([500, 0]);
	
	line_svg.append("g").attr("transform", "translate(70,70)")
		.append("path")
			.datum(data_single_state)
			.attr("class", "lineSet")
			.attr("id", "totalCases")
			.attr("d", d3.line()
				.x(d => xs(d.date))
				.y(d => ys(d.cases)));
	
	change_svg.append("g").attr("transform", "translate(70,70)")
		.attr("class", "allBars")
		.attr("id", "caseRect")
		.selectAll("rect")
		.data(change_data_single_state).enter().append("rect")
			.attr("width", 2)
			.attr("height", function(d) { return (500 - cs(d.cases)); })
			.attr("x", d => xs(d.date))
			.attr("y", d => cs(d.cases))
	
	line_svg.append("g")
		.attr("transform", "translate(70,570)") //translate(margin,height + margin)
		.call(d3.axisBottom(xs)
			.ticks(11)
			.tickFormat(date_format));
	
	line_svg.append("g").attr("transform", "translate(70,70)").call(d3.axisLeft(ys));
	
	change_svg.append("g")
		.attr("transform", "translate(70,570)") //translate(margin,height + margin)
		.call(d3.axisBottom(xs)
			.ticks(11)
			.tickFormat(date_format));
	
	change_svg.append("g").attr("transform", "translate(70,70)").call(d3.axisLeft(cs));
}