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
  .then(function(stateData,err) {
    if (err) throw err;
    console.log(stateData);

    // parsing data
    stateData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.smokes = +data.smokes;
      data.income = +data.income;
      data.obesity = +data.obesity;
    });

    var xLinearScale = xScale(stateData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(stateData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x and y axis

    var xAxis = chartGroup
      .append('g')
      .classed('x-axis', true)
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis);
    
    var yAxis = chartGroup
      .append('g')
      .classed('y-axis', true)
      .call(leftAxis);

    // appending initial circles w/ txt
    var r = 10;
    var circles = chartGroup.selectAll('g circle').data(stateData);
    var circlesGroup = circles
      .enter()
      .append('g')
      .attr('id', 'circlesGroup');

    circlesGroup
      .append('circle')
      .attr('cx', d => xLinearScale(d[chosenXAxis]))
      .attr('cy', d => yLinearScale(d[chosenYAxis]))
      .attr('r', r)
      .classed('stateCircle', true);
    
    circlesGroup
      .append('text')
      .attr('x', d => xLinearScale(d[chosenXAxis]))
      .attr('x', d => yLinearScale(d[chosenYAxis]))
      .classed('stateText', true)
      .text(d => d.abbr)
      .attr('font-size', r * 0.9);
    
    // creating x and y axis titles
    var xlabelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var ylabelsGroup = chartGroup.append("g");

    var povertyLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("In Poverty(%)");
    
    var ageLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age(Median)");
    
    var incomeLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Household Income(Median)");

    var healthcareLabel = ylabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 50)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("value", "healthcare")
      .classed("active", true)
      .text("Lacks Healthcare(%)");

    var smokeLabel = ylabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 30)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smoke(%)");

    var obesityLabel = ylabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 10)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("value", "obesity")
      .classed("inactive", true)
      .text("Obesity(%)");

    // adding event listeners to x axis
    xlabelsGroup.selectAll("text").on("click", function updateScatter() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis w/ value
        chosenXAxis = value;
        console.log(chosenXAxis);
        // updates x scale
        xLinearScale = xScale(stateData, chosenXAxis);

        // updates x axis w/ transition
        xAxis = renderxAxes(xLinearScale, xAxis);

        // update circles w/ new values
        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis
        );

        circlesGroup = rendertextCircles(
          circlesGroup,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis
        );

        // update tooltips w/ new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
