# NarrativeVizProject
Narrative Visualization Project for Summer 2021 Data Visualization Course for Illinois Urbana-Champaign Online MCS

This project reads data from the [New York Times COVID-19 Git Repository](https://github.com/nytimes/covid-19-data) and visualizes trends in COVID-19 cases on the national and state levels, which the viewer can then compare and contrast.

To view this project, please go to https://malodgher.github.io/NarrativeVizProject/

This project utilizes a JavaScript library called D3, which is primarily used for visualizing data on web pages. More information about D3 can be found at https://d3js.org/

<br><br>

## Developer's Note:
This project imports script.js as **module** in index.html, not as text/javascript. Please remember to run this code in a server, such as LiveServer on Visual Studio Code, when doing development and testing. If you try to load the HTML file locally (i.e. with a `file://` URL), you'll run into CORS errors due to JavaScript module security requirements.

Visit https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules for more information on JavaScript modules.
