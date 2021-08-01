async function init() {
	const data_us = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv", d => {
		return { date : d3.timeParse("%Y-%m-%d")(d.date), cases : d.cases, deaths : d.deaths }
	});
	
	const data_states = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv", d => {
		return { date : d3.timeParse("%Y-%m-%d")(d.date), state : d.state, fips : d.fips, cases : d.cases, deaths : d.deaths }
	});
	
	const states_all = data_states.map(d => d.state).filter((d, i, arr) => arr.indexOf(d) === i).sort(); //Getting states from data and filtering out duplicates
	
	const state_dropdown = document.getElementById("statesList")
	initDropdown(state_dropdown, states_all)
	
	//For this project the width of each svg canvas is 1200px, the height is 300px and the margins are 70px
	
	d3.select("#usCanvas").append("h2").text("Number of COVID-19 Cases in the U.S., 1/21/2020 - Present")
	
	const us_line_svg = d3.select("#usCanvas").append("svg")
					.attr("width", (1200 + 2*(70)))
					.attr("height", (300 + 2*(70)));
	
	d3.select("#usCanvas").append("h2").text("Rate of Increase of COVID-19 cases per day in the U.S., 1/21/2020 - Present")
	
	const us_change_tooltip = d3.select("#usCanvas").append("div") //Tooltip for bar chart is appended before bar chart svg. Very Important!
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
	
	const state_change_tooltip = d3.select("#stateCanvas").append("div") //Tooltip for bar chart is appended before bar chart svg. Very Important!
					.style("opacity", 0)
					.attr("class", "tooltip")
	
	const state_change_svg = d3.select("#stateCanvas").append("svg")
					.attr("width", (1200 + 2*(70)))
					.attr("height", (300 + 2*(70)));
	
	
	const date_format = d3.timeFormat("%m/%d/%Y")
	
	loadUSSVG(us_line_svg, us_change_svg, data_us, date_format, us_change_tooltip)
	loadStateSVG(state_line_svg, state_change_svg, data_states, state_dropdown.value, date_format, state_change_tooltip)
	
	state_dropdown.addEventListener("change", event => {
		//Clears everything from state svg canvases and repopulates them with information about the newly selected state
		state_line_svg.selectAll("*").remove();
		state_change_svg.selectAll("*").remove();
		d3.select("#stateLine").html("");
		d3.select("#stateChange").html("");
		loadStateSVG(state_line_svg, state_change_svg, data_states, event.target.value, date_format, state_change_tooltip)
	})
}

function lineSetup(line_svg, data, date_format) {
	const bisectDate = d3.bisector(d => d.date).left //Look up D3 documenation API for info on d3.bisector
	const xs = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, 1200]);
	const ys = d3.scaleLinear().domain([0, data[data.length - 1].cases]).range([300, 0])
	
	const focusText = line_svg.append("g").attr("transform", "translate(70,70)")
		.append("text")
			.attr("text-anchor", "end")
			.attr("alignment-baseline", "middle")
	
	line_svg.append("g").attr("transform", "translate(70,70)")
		.append("path") //Line is added in canvas
			.datum(data)
			.attr("class", "line-set total-cases")
			.attr("d", d3.line()
				.x(d => xs(d.date))
				.y(d => ys(d.cases)));
	
	const focus = line_svg.append("g").attr("transform", "translate(70,70)").style("opacity", 0)
	
	if(data[0].state === undefined) {
		lineAnnotation(line_svg, data, xs, ys, "Between approximately September 8th, 2020 to March 1st, 2021, the United States experienced a major spike in COVID-19 cases")
	} else {
		lineAnnotation(line_svg, data, xs, ys, "The majority of states and territories were also experiencing a spike in COVID-19 cases around this time, with some notable exceptions, such as Hawaii")
	}
	
	
	line_svg.append("g")
		.attr("transform", "translate(70,370)") //translate(margin,height + margin)
		.call(d3.axisBottom(xs) //Creates x axis on canvas
			.ticks(8)
			.tickFormat(date_format));
	
	line_svg.append("g").attr("transform", "translate(70,70)").call(d3.axisLeft(ys)); //Creates y axis on canvas
	
	focus.append("circle")
		.style("fill", "steelblue")
		.style("stroke", "steelblue")
		.attr("r", 4)
	
	focusText.append("tspan").attr("id", "tspan1")
	focusText.append("tspan").attr("id", "tspan2")
	
	//Toolip creation. Creates invisible rect object with same bounds as the svg canvas for the tooltip to traverse the line through
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
			//Uses x,y position of event pointer to get a date and get the index of that date using bisect
			//Then uses the conditional to determine if the position data is outputted or the data before it in the array is outputted
			let x0 = xs.invert((d3.pointer(e, this)[0]) - 78), // -78 is used since the x position is offset by about 78 pixels using d3.pointer
				i = bisectDate(data, x0, 1),
				d0 = data[i - 1],
				d1 = data[i],
				d = (x0 - d0.date > d1.date - x0) ? d1 : d0
			
			focus.select("circle")
				.attr("cx", xs(d.date))
				.attr("cy", ys(d.cases))
			
			focusText.select("#tspan1")
				.html("Date: "+d.date.toLocaleDateString('en-US'))
					.attr("x", xs(d.date) - 15) //15, 20, and 5 are arbitrary pixel numbers. No fomula involved as to why those numbers are used
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

function lineAnnotation(line_svg, data, xs, ys, labelString) {
	/* Documentation for creating annotations found at https://d3-annotation.susielu.com/ */
	const annotations = [{
		note: {
			title: "The Big Spike",
			label: labelString
		},
		
		//Top Left corner of the annotation box is the origin point. Get origin point by finding the index of a date in the date array
		//and putting the date and it's corresponding number of cases in the respecive scales.
		x: xs(data[data.findIndex(d => d.date.valueOf() === d3.timeParse("%Y-%m-%d")('2020-09-08').valueOf())].date),
		y: ys(data[data.findIndex(d => d.date.valueOf() === d3.timeParse("%Y-%m-%d")('2020-09-08').valueOf())].cases),
		dx: -100,
		dy: -5,
		subject: {
			//Width of box is found by subtracting the x value of the date 03/01/2021 in the date array and the date 09/08/2020 in the date array
			//Height of box is found the same way, but using y values of the case at dates 03/01/2021 and 09/08/2020
			
			width: ((xs(data[data.findIndex(d => d.date.valueOf() === d3.timeParse("%Y-%m-%d")('2021-03-01').valueOf())].date)) - 
					(xs(data[data.findIndex(d => d.date.valueOf() === d3.timeParse("%Y-%m-%d")('2020-09-08').valueOf())].date))),
			height: ((ys(data[data.findIndex(d => d.date.valueOf() === d3.timeParse("%Y-%m-%d")('2021-03-01').valueOf())].cases)) - 
							(ys(data[data.findIndex(d => d.date.valueOf() === d3.timeParse("%Y-%m-%d")('2020-09-08').valueOf())].cases)))
		}
	}]
	
	const makeAnnotations = d3.annotation()
		.editMode(false)
		.notePadding(15)
		.type(d3.annotationCalloutRect)
		.annotations(annotations)
		
	line_svg.append("g").attr("transform", "translate(70,70)")
		.attr("class", "annotation-group")
		.call(makeAnnotations)
}

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
			change_svg.selectAll(".allBars rect").attr("x", d => xs(d.date)).attr("width", xs.bandwidth())
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

function initDropdown(dropdown, list) {
	list.map(d => {
		let opt = document.createElement("option");
		opt.value = d;
		opt.innerHTML = d;
		dropdown.appendChild(opt)
	})
}

function loadUSSVG(us_line_svg, us_change_svg, data_us, date_format, change_tooltip){
	//Gets rate of change data from the main data source
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
	//Filters main data source for data of the selected state and gets the rate of change data for that state
	const data_single_state = data_states.filter((d) => d.state === state);
	
	const change_data_single_state = data_single_state.map((d, i, data_single_state) => {
		const value = {
			date: d.date,
			state: d.state,
			fips: d.fips,
			cases: (i-1) === -1 ? (data_single_state[i].cases - 0) : (data_single_state[i].cases - data_single_state[i-1].cases),
			deaths: (i-1) === -1 ? (data_single_state[i].deaths - 0) : (data_single_state[i].deaths - data_single_state[i-1].deaths)
		}
		return value;
	});
	
	d3.select("#stateLine").text("Number of COVID-19 Cases in "+state+", "+data_single_state[0].date.toLocaleDateString('en-US')+" - Present")
	lineSetup(state_line_svg, data_single_state, date_format)
	d3.select("#stateChange").text("Rate of Increase of COVID-19 cases per day in "+state+", "+data_single_state[0].date.toLocaleDateString('en-US')+" - Present");
	changeSetup(state_change_svg, change_data_single_state, date_format, change_tooltip)
}