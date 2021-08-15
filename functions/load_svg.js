import { lineSetup } from './line_setup.js'
import { changeSetup } from './change_setup.js'

export function loadUSSVG(us_line_svg, us_change_svg, data_us, date_format, change_tooltip){
	//Gets rate of change data from the main data source
	const change_data_us = data_us.map((d, i, data_us) => {
		const value = {
			date: d.date,
			cases: (i-1) === -1 ? (data_us[i].cases - 0) : (data_us[i].cases - data_us[i-1].cases),
			deaths: (i-1) === -1 ? (data_us[i].deaths - 0) : (data_us[i].deaths - data_us[i-1].deaths)
		};
		return value;
	});
	
	lineSetup(us_line_svg, data_us, date_format);
	changeSetup(us_change_svg, change_data_us, date_format, change_tooltip);
}

export function loadStateSVG(state_line_svg, state_change_svg, data_states, state, date_format, change_tooltip) {
	//Filters main data source for data of the selected state and gets the rate of change data for that state
	const data_single_state = data_states.filter(d => d.state === state);
	
	const change_data_single_state = data_single_state.map((d, i, data_single_state) => {
		const value = {
			date: d.date,
			state: d.state,
			fips: d.fips,
			cases: (i-1) === -1 ? (data_single_state[i].cases - 0) : (data_single_state[i].cases - data_single_state[i-1].cases),
			deaths: (i-1) === -1 ? (data_single_state[i].deaths - 0) : (data_single_state[i].deaths - data_single_state[i-1].deaths)
		};
		return value;
	});
	
	d3.select("#stateLine").text("Number of COVID-19 Cases in "+state+", "+data_single_state[0].date.toLocaleDateString('en-US')+" - Present");
	lineSetup(state_line_svg, data_single_state, date_format);
	d3.select("#stateChange").text("Rate of Increase of COVID-19 cases per day in "+state+", "+data_single_state[0].date.toLocaleDateString('en-US')+" - Present");
	changeSetup(state_change_svg, change_data_single_state, date_format, change_tooltip);
}