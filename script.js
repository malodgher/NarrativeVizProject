async function init() {
	const data = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv")
	
	d3.select("h1").text(data[0].date)
}