import { lineSetup } from './line_setup.js'
import { changeSetup } from './change_setup.js'
import { treemapSetup } from './treemap_setup.js';

export const loadUSSVG = (us_line_svg, us_change_svg, data_us, date_format, change_tooltip) => {
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

export const loadStateSVG = (state_line_svg, state_change_svg, data_states, state, date_format, change_tooltip) => {
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
	
	d3.select("#stateLine").text(`Number of COVID-19 cases in ${state}, ${data_single_state[0].date.toLocaleDateString('en-US')} - Present`);
	lineSetup(state_line_svg, data_single_state, date_format);
	d3.select("#stateChange").text(`Rate of Increase of COVID-19 cases per day in ${state}, ${data_single_state[0].date.toLocaleDateString('en-US')} - Present`);
	changeSetup(state_change_svg, change_data_single_state, date_format, change_tooltip);
}

export const loadTreemapSVG = (map_svg, data_states, input_date, width, height) => {

	//Filters state data by the input date, then adds hierarchy to the data by grouping states by region using FIPS codes
	const state_date = data_states.filter(d => d.date.valueOf() === input_date.valueOf()).map(d => {

		if((d.fips === "09") || (d.fips === "23") || (d.fips === "25") || (d.fips === "33") || (d.fips === "34") || (d.fips === "36") || (d.fips === "42") || (d.fips === "44") || (d.fips === "50")) {

			return initValueOfData(d, "Northeast");

		} else if ((d.fips === "17") || (d.fips === "18") || (d.fips === "19") || (d.fips === "20") || (d.fips === "26") || (d.fips === "27") || (d.fips === "29") || (d.fips === "31") || (d.fips === "38") || (d.fips === "39") || (d.fips === "46") || (d.fips === "55")) {

			return initValueOfData(d, "Midwest");

		} else if ((d.fips === "01") || (d.fips === "05") || (d.fips === "10") || (d.fips === "11") || (d.fips === "12") || (d.fips === "13") || (d.fips === "21") || (d.fips === "22") || (d.fips === "24") || (d.fips === "28") || (d.fips === "37") || (d.fips === "40") || (d.fips === "45") || (d.fips === "47") || (d.fips === "48") || (d.fips === "51") || (d.fips === "54")) {

			return initValueOfData(d, "South");

		} else if ((d.fips === "02") || (d.fips === "04") || (d.fips === "06") || (d.fips === "08") || (d.fips === "15") || (d.fips === "16") || (d.fips === "30") || (d.fips === "32") || (d.fips === "35") || (d.fips === "41") || (d.fips === "49") || (d.fips === "53") || (d.fips === "56")) {

			return initValueOfData(d, "West");

		} else {
			return initValueOfData(d, "Territories");
		}
	});

	//Added these to the front of the data array so that the hierarchy has root nodes for each region and the country as a whole
	state_date.unshift({
		date: null,
		state: "United States",
		region: null,
		fips: null,
		cases: null,
		deaths: null
	}, initValueOfData("nodata", "Northeast"), initValueOfData("nodata", "Midwest"), initValueOfData("nodata", "South"), initValueOfData("nodata", "West"), initValueOfData("nodata", "Territories"));

	d3.select("#treemapChange").text(`Treemap of cases in the U.S. on ${input_date.toLocaleDateString("en-US")}`);
	treemapSetup(map_svg, state_date, width, height);

}

const initValueOfData = (d, region) => {

	if (d === "nodata") {
		const value = {
			date: null,
			state: region,
			region: "United States",
			fips: null,
			cases: null,
			deaths: null
		};
		return value;
	} else {
		const value = {
			date: d.date,
			state: d.state,
			region: region,
			fips: d.fips,
			cases: d.cases,
			deaths: d.deaths
		};
		return value;
	}
}