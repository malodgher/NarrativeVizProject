async function init() {
	const data_us = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv", d => {
		return { date : d3.timeParse("%Y-%m-%d")(d.date), cases : d.cases, deaths : d.deaths }
	});
	
	const data_states = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv", d => {
		return { date : d3.timeParse("%Y-%m-%d")(d.date), state : d.state, fips : d.fips, cases : d.cases, deaths : d.deaths }
	});
	
	const states_all = data_states.map(d => d.state).filter((d, i, arr) => arr.indexOf(d) === i).sort();
	
	const state_dropdown = document.getElementById("statesList")
	const map_dropdown = document.getElementById("mapList")
	initDropdown(state_dropdown, states_all)
	initDropdown(map_dropdown, states_all)
	
	d3.select("#usCanvas").append("h2").text("Number of COVID-19 Cases in the US, 1/21/2020 - Present")
	
	const us_line_svg = d3.select("#usCanvas").append("svg")
					.attr("width", (650 + 2*(70)))
					.attr("height", (500 + 2*(70)));
	
	d3.select("#usCanvas").append("h2").text("Rate of Increase of COVID-19 cases per day in US, 1/21/2020 - Present")
	
	const us_change_svg = d3.select("#usCanvas").append("svg")
					.attr("width", (650 + 2*(70)))
					.attr("height", (500 + 2*(70)));
	
	const state_line_svg = d3.select("#stateCanvas").append("svg")
					.attr("width", (650 + 2*(70)))
					.attr("height", (500 + 2*(70)));
	
	const state_change_svg = d3.select("#stateCanvas").append("svg")
					.attr("width", (650 + 2*(70)))
					.attr("height", (500 + 2*(70)));
	
	const date_format = d3.timeFormat("%m/%d/%Y")
	
	loadUSSVG(us_line_svg, us_change_svg, data_us, date_format)
	loadStateSVG(state_line_svg, state_change_svg, data_states, state_dropdown.value, date_format)
	
	state_dropdown.addEventListener("change", event => {
		state_line_svg.selectAll("*").remove();
		state_change_svg.selectAll("*").remove();
		loadStateSVG(state_line_svg, state_change_svg, data_states, event.target.value, date_format)
	})
}

function lineSetup(line_svg, data, xs, ys, date_format) {
	line_svg.append("g").attr("transform", "translate(70,70)")
		.append("path")
			.datum(data)
			.attr("class", "lineSet totalCases")
			.attr("d", d3.line()
				.x(d => xs(d.date))
				.y(d => ys(d.cases)));
	
	line_svg.append("g")
		.attr("transform", "translate(70,570)") //translate(margin,height + margin)
		.call(d3.axisBottom(xs)
			.ticks(8)
			.tickFormat(date_format));
	
	line_svg.append("g").attr("transform", "translate(70,70)").call(d3.axisLeft(ys));
}

function changeSetup(change_svg, data, xs, cs, date_format) {
	change_svg.append("g").attr("transform", "translate(70,70)")
		.attr("class", "allBars")
		.selectAll("rect")
		.data(data).enter().append("rect")
			.attr("width", 2)
			.attr("height", function(d) {
				if((500 - cs(d.cases)) < 0) {
					return 0
				} else {
					return (500 - cs(d.cases))
				}
			})
			.attr("x", d => xs(d.date))
			.attr("y", d => cs(d.cases))
	
	change_svg.append("g")
		.attr("transform", "translate(70,570)") //translate(margin,height + margin)
		.call(d3.axisBottom(xs)
			.ticks(8)
			.tickFormat(date_format));
	
	change_svg.append("g").attr("transform", "translate(70,70)").call(d3.axisLeft(cs));
}

function initDropdown(dropdown, list) {
	list.map(d => {
		let opt = document.createElement("option");
		opt.value = d;
		opt.innerHTML = d;
		dropdown.appendChild(opt)
	})
}

function loadUSSVG(us_line_svg, us_change_svg, data_us, date_format){
	const change_data_us = data_us.map((d, i, data_us) => {
		const value = {
			date: d.date,
			cases: (i-1) === -1 ? (data_us[i].cases - 0) : (data_us[i].cases - data_us[i-1].cases),
			deaths: (i-1) === -1 ? (data_us[i].deaths - 0) : (data_us[i].deaths - data_us[i-1].deaths)
		}
		return value;
	});
	
	const xs = d3.scaleTime().domain(d3.extent(data_us, d => d.date)).range([0, 650]);
	const ys = d3.scaleLinear().domain([0, data_us[data_us.length - 1].cases]).range([500, 0]);
	const cs = d3.scaleLinear().domain([/* d3.min(change_data_us, d => d.cases) */0, d3.max(change_data_us, d => d.cases)]).range([500, 0]);
	
	lineSetup(us_line_svg, data_us, xs, ys, date_format)
	changeSetup(us_change_svg, change_data_us, xs, cs, date_format)
}

function loadStateSVG(state_line_svg, state_change_svg, data_states, state, date_format) {
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
	const xs = d3.scaleTime().domain(d3.extent(data_single_state, d => d.date)).range([0, 650]);
	const ys = d3.scaleLinear().domain([0, data_single_state[data_single_state.length - 1].cases]).range([500, 0]);
	const cs = d3.scaleLinear().domain([0, d3.max(change_data_single_state, d => d.cases)]).range([500, 0]);
	
	lineSetup(state_line_svg, data_single_state, xs, ys, date_format)
	changeSetup(state_change_svg, change_data_single_state, xs, cs, date_format)
}