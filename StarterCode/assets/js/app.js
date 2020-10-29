// Set height and width for svg

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// Set chart width and height

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// creating svg wrapper

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// appending svg group

var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// axis params

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// updating x/y scale when clicked

function xScale(stateData, chosenXAxis) {
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(stateData, d => d[chosenXAxis]) * 0.8,
      d3.max(stateData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(stateData, chosenYAxis) {
  var yLinearScale = d3
    .scaleLinear()
    .domain([0, d3.max(stateData, d => d[chosenYAxis])])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating x/yAxis var upon click on axis label

function renderxAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis
    .transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderyAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis
    .transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// creating function to update circles group w/ transition to 'new' circles and text

function renderCircles(
  circlesGroup,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  circlesGroup
    .selectAll("circle")
    .transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function rendertextCircles(
  circlesGroup,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  circlesGroup
    .selectAll("text")
    .transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// func for updating circles with tooltip

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  if (chosenXAxis === "poverty") {
    var xlabel = "In Poverty(%): ";
  } else if (chosenXAxis === "age") {
    var xlabel = "Median Age: ";
  } else {
    var xlabel = "Median Income($): ";
  }

  // condi for x axis

  if (chosenYAxis === "healthcare") {
    var ylabel = "Lacks Healthcare(%): ";
  } else if (chosenYAxis === "smokes") {
    var ylabel = "Smokers(%): ";
  } else {
    var ylabel = "Obesity(%): ";
  }

  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return `${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`;
    });

  circlesGroup.call(toolTip);
  circlesGroup
    .on("mouseover", function(data) {
      toolTip.show(data);
    })
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// importing data and formatting
d3.csv("assets/data/data.csv")
  .then(function(stateData, err) {
  if (err) throw err;
  console.log(stateData);