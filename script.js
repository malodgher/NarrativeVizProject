import {loadUSSVG, loadStateSVG} from './functions/load_svg.js'

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

function initDropdown(dropdown, list) {
	list.map(d => {
		let opt = document.createElement("option");
		opt.value = d;
		opt.innerHTML = d;
		dropdown.appendChild(opt)
	})
}

init()