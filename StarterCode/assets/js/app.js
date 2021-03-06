// Set height and width for svg
let svgWidth = 960;
let svgHeight = 500;

let margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// Set chart width and height

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// creating svg wrapper
let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
let chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty";
let chosenYAxis = "healthcare";

// updating x/y scale when clicked

function xScale(stateData, chosenXAxis) {
  let xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(stateData, d => d[chosenXAxis]) * 0.8,
      d3.max(stateData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(stateData, chosenYAxis) {
  let yLinearScale = d3
    .scaleLinear()
    .domain([0, d3.max(stateData, d => d[chosenYAxis])])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating x/yAxis let upon click on axis label

function renderxAxes(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);

  xAxis
    .transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderyAxes(newYScale, yAxis) {
  let leftAxis = d3.axisLeft(newYScale);

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
    let xlabel = "In Poverty(%): ";
  } else if (chosenXAxis === "age") {
    let xlabel = "Median Age: ";
  } else {
    let xlabel = "Median Income($): ";
  }

  // Conditional for Y Axis.
  if (chosenYAxis === "healthcare") {
    let ylabel = "Lacks Healthcare(%): ";
  } else if (chosenYAxis === "smokes") {
    let ylabel = "Smokers(%): ";
  } else {
    let ylabel = "Obesity(%): ";
  }
  let toolTip = d3
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

    // parsing data
    stateData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.smokes = +data.smokes;
      data.income = +data.income;
      data.obesity = +data.obesity;
    });

    // x scale func
    let xLinearScale = xScale(stateData, chosenXAxis);

    // y scale function
    let yLinearScale = yScale(stateData, chosenYAxis);

    //initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis and y axis
    let xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);


    let yAxis = chartGroup
      .append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // appending initial circles w/ texts
    let r = 10;
    let circles = chartGroup.selectAll("g circle").data(stateData);
    let circlesGroup = circles
      .enter()
      .append("g")
      .attr("id", "circlesGroup");

    circlesGroup
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", r)
      .classed("stateCircle", true);

    circlesGroup
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .classed("stateText", true)
      .text(d => d.abbr)
      .attr("font-size", r * 0.9);

    // group for x and y axis labels
    let xlabelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let ylabelsGroup = chartGroup.append("g");

    let povertyLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("In Poverty(%)");

    let ageLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age(Median)");

    let incomeLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Household Income(Median)");

    let healthcareLabel = ylabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 50)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("value", "healthcare")
      .classed("active", true)
      .text("Lacks Healthcare(%)");

    let smokeLabel = ylabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 30)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smoke(%)");

    let obesityLabel = ylabelsGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 10)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .attr("value", "obesity")
      .classed("inactive", true)
      .text("Obesity(%)");

    //axis label event listener
    xlabelsGroup.selectAll("text").on("click", function updateScatter() {
      //value of selection
      let value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis w/ value
        chosenXAxis = value;
        console.log(chosenXAxis);

        //x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        //x axis w/ transition
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

        //tooltips w/ new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes state of x axis
        if (chosenXAxis === "age") {
          ageLabel.classed("active", true).classed("inactive", false);
          povertyLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", false).classed("inactive", true);
        } else if (chosenXAxis === "poverty") {
          ageLabel.classed("active", false).classed("inactive", true);
          povertyLabel.classed("active", true).classed("inactive", false);
          incomeLabel.classed("active", false).classed("inactive", true);
        } else {
          ageLabel.classed("active", false).classed("inactive", true);
          povertyLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", true).classed("inactive", false);
        }
      }
    });
    ylabelsGroup.selectAll("text").on("click", function() {
      //value of selection
      let yvalue = d3.select(this).attr("value");

      if (yvalue !== chosenYAxis) {
        //replaces chosenYAxis w/ value
        chosenYAxis = yvalue;
        console.log(chosenYAxis);

        //x scale for new data
        yLinearScale = yScale(stateData, chosenYAxis);

        //y axis w/ transition
        yAxis = renderyAxes(yLinearScale, yAxis);

        // update circles with w/ values
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
        // update tooltips with w/ info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes state of y axis
        if (chosenYAxis === "healthcare") {
          healthcareLabel.classed("active", true).classed("inactive", false);
          smokeLabel.classed("active", false).classed("inactive", true);
          obesityLabel.classed("active", false).classed("inactive", true);
        } else if (chosenYAxis === "smokes") {
          healthcareLabel.classed("active", false).classed("inactive", true);
          smokeLabel.classed("active", true).classed("inactive", false);
          obesityLabel.classed("active", false).classed("inactive", true);
        } else {
          healthcareLabel.classed("active", false).classed("inactive", true);
          smokeLabel.classed("active", false).classed("inactive", true);
          obesityLabel.classed("active", true).classed("inactive", false);
        }
      }
    });
  })
  .catch(function(error) {
    console.log(error);
  });