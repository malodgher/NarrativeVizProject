async function init() {
	const data_us = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv", d => {
		return { date : d3.timeParse("%Y-%m-%d")(d.date), cases : d.cases, deaths : d.deaths }
	});
	
	const data_states = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv", d => {
		return { date : d3.timeParse("%Y-%m-%d")(d.date), state : d.state, fips : d.fips, cases : d.cases, deaths : d.deaths }
	});
	
	const states_all = data_states.map(d => d.state).filter((d, i, arr) => arr.indexOf(d) === i).sort();
	
	const state_dropdown = document.getElementById("statesList")
	initDropdown(state_dropdown, states_all)
	
	d3.select("#usCanvas").append("h2").text("Number of COVID-19 Cases in the U.S., 1/21/2020 - Present")
	
	const us_line_svg = d3.select("#usCanvas").append("svg")
					.attr("width", (1200 + 2*(70)))
					.attr("height", (300 + 2*(70)));
	
	d3.select("#usCanvas").append("h2").text("Rate of Increase of COVID-19 cases per day in the U.S., 1/21/2020 - Present")
	
	const us_change_tooltip = d3.select("#usCanvas").append("div")
					.style("opacity", 0)
					.attr("class", "tooltip")
	
	const us_change_svg = d3.select("#usCanvas").append("svg")
					.attr("width", (1200 + 2*(70)))
					.attr("height", (300 + 2*(70)));
	
	
	
	
	d3.select("#stateCanvas").append("h2").attr("id", "stateLine")
	
	const state_line_svg = d3.select("#stateCanvas").append("svg")
					.attr("width", (1200 + 2*(70)))
					.attr("height", (300 + 2*(70)));
	
	d3.select("#stateCanvas").append("h2").attr("id", "stateChange")
	
	const state_change_tooltip = d3.select("#stateCanvas").append("div")
					.style("opacity", 0)
					.attr("class", "tooltip")
	
	const state_change_svg = d3.select("#stateCanvas").append("svg")
					.attr("width", (1200 + 2*(70)))
					.attr("height", (300 + 2*(70)));
	
	
	const date_format = d3.timeFormat("%m/%d/%Y")
	
	loadUSSVG(us_line_svg, us_change_svg, data_us, date_format, us_change_tooltip)
	loadStateSVG(state_line_svg, state_change_svg, data_states, state_dropdown.value, date_format, state_change_tooltip)
	
	state_dropdown.addEventListener("change", event => {
		state_line_svg.selectAll("*").remove();
		state_change_svg.selectAll("*").remove();
		d3.select("#stateLine").html("");
		d3.select("#stateChange").html("");
		loadStateSVG(state_line_svg, state_change_svg, data_states, event.target.value, date_format, state_change_tooltip)
	})
}

function lineSetup(line_svg, data, date_format) {
	const bisectDate = d3.bisector(d => d.date).left
	const xs = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, 1200]);
	const ys = d3.scaleLinear().domain([0, data[data.length - 1].cases]).range([300, 0])
	
	const focusText = line_svg.append("g").attr("transform", "translate(70,70)")
		.append("text")
			.attr("text-anchor", "end")
			.attr("alignment-baseline", "middle")
	
	line_svg.append("path").attr("transform", "translate(70,70)")
			.datum(data)
			.attr("class", "lineSet totalCases")
			.attr("d", d3.line()
				.x(d => xs(d.date))
				.y(d => ys(d.cases)));
	
	const focus = line_svg.append("g").attr("transform", "translate(70,70)").style("opacity", 0)
	
	line_svg.append("g")
		.attr("transform", "translate(70,370)") //translate(margin,height + margin)
		.call(d3.axisBottom(xs)
			.ticks(8)
			.tickFormat(date_format));
	
	line_svg.append("g").attr("transform", "translate(70,70)").call(d3.axisLeft(ys));
	
	focus.append("circle")
		.style("fill", "steelblue")
		.style("stroke", "steelblue")
		.attr("r", 4)
	
	focusText.append("tspan").attr("id", "tspan1")
	focusText.append("tspan").attr("id", "tspan2")
	
	
	line_svg.append("rect").attr("transform", "translate(70,70)")
		.attr("width", 1200)
		.attr("height", 300)
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", e => {
			focus.style("opacity", 1)
			focusText.style("opacity", 1)
		})
		.on("mousemove", e => {
			let x0 = xs.invert((d3.pointer(e, this)[0]) - 78),
				i = bisectDate(data, x0, 1),
				d0 = data[i - 1],
				d1 = data[i],
				d = (x0 - d0.date > d1.date - x0) ? d1 : d0
			
			focus.select("circle")
				.attr("cx", xs(d.date))
				.attr("cy", ys(d.cases))
			
			focusText.select("#tspan1")
				.html("Date: "+d.date.toLocaleDateString('en-US'))
					.attr("x", xs(d.date) - 15)
					.attr("y", ys(d.cases) - 20)
			
			
			focusText.select("#tspan2")
				.html("Number of Cases: "+d.cases.toLocaleString('en-US')+" cases")
					.attr("x", xs(d.date) - 15)
					.attr("y", ys(d.cases) - 5)
		})
		.on("mouseout", e => {
			focus.style("opacity", 0)
			focusText.style("opacity", 0)
		})
}

function changeSetup(change_svg, data, date_format, tooltip) {
	const xs = d3.scaleBand().domain(data.map(d => d.date)).range([0, 1200]);
	const cs = d3.scaleLinear().domain([/* d3.min(change_data_us, d => d.cases) */0, d3.max(data, d => d.cases)]).range([300, 0]);
	
	const extent = [[0, 0], [1200, 300]]
	
	change_svg.call(d3.zoom()
		.scaleExtent([1, 8])
		.translateExtent(extent)
		.extent(extent)
		.on("zoom", e => {
			xs.range([0, 1200].map(d => e.transform.applyX(d)))
			change_svg.selectAll(".allBars rect").attr("x", d => xs(d.date)).attr("width", xs.bandwidth())
			change_svg.selectAll(".x-axis").call(d3.axisBottom(xs)
				.tickValues(xs.domain().filter((d, i) => !(i%64)))
				.tickFormat(date_format))
		}))
	
	change_svg.append("g").attr("transform", "translate(70,70)")
		.attr("class", "allBars")
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
				tooltip.html("Date: "+e.target.__data__.date.toLocaleDateString('en-US')+"<br>Rate of Increase: "+e.target.__data__.cases.toLocaleString("en-US")+" cases")
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

function initDropdown(dropdown, list) {
	list.map(d => {
		let opt = document.createElement("option");
		opt.value = d;
		opt.innerHTML = d;
		dropdown.appendChild(opt)
	})
}

function loadUSSVG(us_line_svg, us_change_svg, data_us, date_format, change_tooltip){
	const change_data_us = data_us.map((d, i, data_us) => {
		const value = {
			date: d.date,
			cases: (i-1) === -1 ? (data_us[i].cases - 0) : (data_us[i].cases - data_us[i-1].cases),
			deaths: (i-1) === -1 ? (data_us[i].deaths - 0) : (data_us[i].deaths - data_us[i-1].deaths)
		}
		return value;
	});
	
	lineSetup(us_line_svg, data_us, date_format)
	changeSetup(us_change_svg, change_data_us, date_format, change_tooltip)
}

function loadStateSVG(state_line_svg, state_change_svg, data_states, state, date_format, change_tooltip) {
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
	
	d3.select("#stateLine").text("Number of COVID-19 Cases in "+state+", "+data_single_state[0].date.toLocaleDateString('en-US')+" - Present")
	lineSetup(state_line_svg, data_single_state, date_format)
	d3.select("#stateChange").text("Rate of Increase of COVID-19 cases per day in "+state+", "+data_single_state[0].date.toLocaleDateString('en-US')+" - Present");
	changeSetup(state_change_svg, change_data_single_state, date_format, change_tooltip)
}