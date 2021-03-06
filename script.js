import { loadUSSVG, loadStateSVG, loadTreemapSVG } from './functions/load_svg.js'

const init = async () => {
	const data_us = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv", d => {
		return { date : d3.timeParse("%Y-%m-%d")(d.date), cases : Number(d.cases), deaths : Number(d.deaths) };
	});
	
	const data_states = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv", d => {
		return { date : d3.timeParse("%Y-%m-%d")(d.date), state : d.state, fips : d.fips, cases : Number(d.cases), deaths : Number(d.deaths) };
	});
	
	const states_all = data_states.map(d => d.state).filter((d, i, arr) => arr.indexOf(d) === i).sort(); //Getting states from data and filtering out duplicates
	
	const state_dropdown = initDropdown("statesList", states_all);
	const dateSlider = initDateInput("dateSlider", data_us);

	
	//For this project the width of each svg canvas is 1200px, the height is 300px and the margins are 70px
	
	d3.select("#usCanvas").append("h2").text("Number of COVID-19 Cases in the U.S., 1/21/2020 - Present");
	const us_line_svg = initSVG("#usCanvas", (1200 + 2*(70)), (300 + 2*(70)));
	d3.select("#usCanvas").append("h2").text("Rate of Increase of COVID-19 cases per day in the U.S., 1/21/2020 - Present");
	const us_change_tooltip = initTooltip("#usCanvas") //Tooltip for bar chart is appended before bar chart svg. Very Important!
	const us_change_svg = initSVG("#usCanvas", (1200 + 2*(70)), (300 + 2*(70)));
	
	/* ---------------------------------------------------------------------------------------------------------------------------------------------- */
	
	
	d3.select("#stateCanvas").append("h2").attr("id", "stateLine");
	const state_line_svg = initSVG("#stateCanvas", (1200 + 2*(70)), (300 + 2*(70)));
	d3.select("#stateCanvas").append("h2").attr("id", "stateChange");
	const state_change_tooltip = initTooltip("#stateCanvas") //Tooltip for bar chart is appended before bar chart svg. Very Important!
	const state_change_svg = initSVG("#stateCanvas", (1200 + 2*(70)), (300 + 2*(70)));
	
	/* ---------------------------------------------------------------------------------------------------------------------------------------------- */
	
	d3.select("#mapCanvas").append("h2").attr("id", "treemapChange");
	const map_svg = initSVG("#mapCanvas", (1200 + 2*(70)), (300 + 2*(70)));
	
	const date_format = d3.timeFormat("%m/%d/%Y");
	
	loadUSSVG(us_line_svg, us_change_svg, data_us, date_format, us_change_tooltip);
	loadStateSVG(state_line_svg, state_change_svg, data_states, state_dropdown.value, date_format, state_change_tooltip);
	loadTreemapSVG(map_svg, data_states, data_us[dateSlider.value].date, (1200 + 2*(70)), (300 + 2*(70)));
	
	state_dropdown.addEventListener("change", event => {
		//Clears everything from state svg canvases and repopulates them with information about the newly selected state
		state_line_svg.selectAll("*").remove();
		state_change_svg.selectAll("*").remove();
		d3.select("#stateLine").html("");
		d3.select("#stateChange").html("");
		loadStateSVG(state_line_svg, state_change_svg, data_states, event.target.value, date_format, state_change_tooltip);
	});

	dateSlider.addEventListener("input" , event => {
		map_svg.selectAll("*").remove();
		d3.select("treemapChange").html("");
		loadTreemapSVG(map_svg, data_states, data_us[event.target.value].date, (1200 + 2*(70)), (300 + 2*(70)));
	})
}

const initDropdown = (id, list) => {
	const dropdown = document.getElementById(id);

	list.forEach(d => {
		const opt = document.createElement("option");
		opt.value = d;
		opt.innerHTML = d;
		dropdown.appendChild(opt);
	});

	return dropdown;
}

const initDateInput = (id, data) => {
	const date_input = document.getElementById(id);
	date_input.min = 0;
	date_input.max = data.length - 1;
	date_input.value = Math.floor(data.length / 2); //value is set to value in middle of data array

	return date_input;
}

const initSVG = (identifier, width, height) => {
	return d3.select(identifier).append("svg").attr("viewBox", "0 0 "+width+" "+height).attr("width", "93%");

	/*
		Using viewBox allows for scalable SVG canvases. You can set a width of the canvas to whatever width you wish,
		but you don't need to set the height, as the browser will determine the height of the canvas based on what
		is set in the viewBox attribute, as well as what you have set the width of the canvas to.


		The old way of initializing svg:
		return d3.select("#idOfHTMLTag").append("svg").attr("width", (1200 + 2*(70))).attr("height", (300 + 2*(70)));
	*/
}

const initTooltip = (identifier) => {
	return d3.select(identifier).append("div")
				.style("opacity", 0)
				.attr("class", "tooltip");
}

init();