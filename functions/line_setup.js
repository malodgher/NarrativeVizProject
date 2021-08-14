function lineSetup(line_svg, data, date_format) {
	const bisectDate = d3.bisector(d => d.date).left //Look up D3 documentation API for info on d3.bisector
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
	
	//Tooltip creation. Creates invisible rect object with same bounds as the svg canvas for the tooltip to traverse the line through
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
					.attr("x", xs(d.date) - 15) //15, 20, and 5 are arbitrary pixel numbers. No formula involved as to why those numbers are used
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
		//and putting the date and it's corresponding number of cases in the respective scales.
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


export {lineSetup};