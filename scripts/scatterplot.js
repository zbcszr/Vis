const scatter = d3.select("svg#scatter_plot");
const height2 = scatter.attr("height");
const width2 = scatter.attr("width");
const margin2 = { top: 20, right: 10, bottom: 50, left: 60 };
const chartWidth2 = width2 - margin2.left - margin2.right;
const chartHeight2 = height2 - margin2.top - margin2.bottom;

const legend = d3.select("div#legend");

const line_working_hour = d3.select("svg#line_working_hour");
const lineHeight1 = line_working_hour.attr("height");
const lineWidth1 = line_working_hour.attr("width");
const lineMargin1 = { top: 15, right: 5, bottom: 30, left: 55 };
const lineChartWidth1 = lineWidth1 - lineMargin1.left - lineMargin1.right;
const lineChartHeight1 = lineHeight1 - lineMargin1.top - lineMargin1.bottom;

const line_gdp = d3.select("svg#line_gdp");
const lineHeight2 = line_gdp.attr("height");
const lineWidth2 = line_gdp.attr("width");
const lineMargin2 = { top: 15, right: 5, bottom: 30, left: 55 };
const lineChartWidth2 = lineWidth2 - lineMargin2.left - lineMargin2.right;
const lineChartHeight2 = lineHeight2 - lineMargin2.top - lineMargin2.bottom;

const year_bubble = d3.select("svg#year_bubble");

const loadData = async function () {
  const working_hour = await d3.csv("dataset/cleaned_working_hour.csv");
  const country_to_continent = await d3.csv(
    "dataset/country_to_continent1.csv"
  );
  const countries = [
    "United States",
    "Mexico",
    "Canada",
    "China",
    "Hong Kong",
    "Singapore",
    "Taiwan",
    "Myanmar",
    "India",
    "South Korea",
    "Japan",
    "Israel",
    "France",
    "United Kingdom",
    "Norway",
    "Russia",
    "Germany",
    "Denmark",
    "Switzerland",
    "Brazil",
    "Argentina",
    "Nigeria",
    "South Africa",
    "Australia",
    "New Zealand",
  ];

  const continents = [
    "South America",
    "Oceania",
    "Europe",
    "Asia",
    "North America",
    "Africa",
  ];

  const countryCodes = d3.map(country_to_continent, (d) => d.Code);
  let country_visibility = {};
  countryCodes.forEach((d, i) => {
    country_visibility[d] = true;
  });

  working_hour.forEach((d, i) => {
    d["GDP"] = Number(d["GDP"]);
    d["Population"] = Number(d["Population"]);
    d["Working_Hours"] = Number(d["Working_Hours"]) / (365 / 7);

    var entity = d["Entity"];
    var matchedData = country_to_continent.filter(
      (country_to_continent) => country_to_continent["Entity"] == entity
    );
    var continent = matchedData[0].Continent;
    d["Continent"] = continent;

    if (countries.includes(entity)) {
      d["Text_Visibility"] = true;
    } else {
      d["Text_Visibility"] = false;
    }
  });

  var dataByYear = [];
  for (let y = 1950; y <= 2017; y++) {
    var year = y;
    var dict = { Year: year };
    var values = [];

    working_hour.forEach((d, i) => {
      if (d.Year == year) {
        values.push(d);
      }
    });

    dict["Values"] = values;

    // let continents = [
    //   "South America",
    //   "Oceania",
    //   "Europe",
    //   "Asia",
    //   "North America",
    //   "Africa",
    // ];

    continents.forEach((continent) => {
      let count = 0;

      values.forEach((d) => {
        if (d["Continent"] === continent) {
          count += 1;
        }
      });

      if (Number(count) > 0) {
        dict[continent + " Working Hours"] = 0;
        values.forEach((d) => {
          if (d["Continent"] === continent) {
            dict[continent + " Working Hours"] += d["Working_Hours"];
          }
        });
      }

      dict[continent + " Working Hours"] /= count;
    });

    continents.forEach((continent) => {
      let count = 0;

      values.forEach((d) => {
        if (d["Continent"] === continent) {
          count += 1;
        }
      });

      if (count > 0) {
        dict[continent + " GDP"] = 0;
        values.forEach((d) => {
          if (d["Continent"] === continent) {
            dict[continent + " GDP"] += d["GDP"];
          }
        });
      }

      dict[continent + " GDP"] /= count;
    });

    dataByYear.push(dict);
  }

  console.log(dataByYear);

  let annotations = scatter.append("g").attr("id", "annotations");
  let chartArea = scatter
    .append("g")
    .attr("id", "points")
    .attr("transform", `translate(${margin2.left},${margin2.top})`);

  let yAxis = d3.axisLeft().tickFormat((x) => `$${x}`);
  let yGridlines = d3
    .axisLeft()
    .tickSize(-chartWidth2 - 10)
    .tickFormat("");
  let yAxisG = annotations
    .append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${margin2.left - 12},${margin2.top})`);
  let yGridlinesG = annotations
    .append("g")
    .attr("class", "y gridlines")
    .attr("transform", `translate(${margin2.left - 12},${margin2.top})`);

  let xAxis = d3.axisBottom().tickFormat((x) => `${x}h`);
  let xGridlines = d3
    .axisBottom()
    .tickSize(-chartHeight2 - 10)
    .tickFormat("");
  let xAxisG = annotations
    .append("g")
    .attr("class", "x axis")
    .attr(
      "transform",
      `translate(${margin2.left},${chartHeight2 + margin2.top + 20})`
    );
  let xGridlinesG = annotations
    .append("g")
    .attr("class", "x gridlines")
    .attr(
      "transform",
      `translate(${margin2.left},${chartHeight2 + margin2.top + 20})`
    );

  const continentScale = d3
    .scaleOrdinal()
    .domain(continents)
    .range([
      "rgb(136, 72, 132)",
      "rgb(41, 131, 254)",
      "rgb(11, 43, 79)",
      "rgb(208, 0, 47)",
      "rgb(77, 141, 141)",
      "rgb(150, 79, 46)",
    ]);

  let workingHourAnnotations = line_working_hour
    .append("g")
    .attr("id", "workingHourAnnotations");
  let workingHourChartArea = line_working_hour
    .append("g")
    .attr("id", "points")
    .attr("transform", `translate(${lineMargin1.left},${lineMargin1.top})`);

  const workingHourYearScale = d3
    .scaleLinear()
    .domain([1950, 2017])
    .range([0, lineChartWidth1]);

  const workingHourScale = d3
    .scaleLinear()
    .domain([30, 47])
    .range([lineChartHeight1, 0]);

  // Y axis
  let workingHourAxis = d3
    .axisLeft(workingHourScale)
    .tickFormat((x) => `${x}h`);
  let workingHourGridlines = d3
    .axisLeft(workingHourScale)
    .tickSize(-lineChartWidth1 - 5)
    .tickFormat("");
  workingHourAnnotations
    .append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${lineMargin1.left - 5},${lineMargin1.top})`)
    .call(workingHourAxis);
  workingHourAnnotations
    .append("g")
    .attr("class", "y gridlines")
    .attr("transform", `translate(${lineMargin1.left - 5},${lineMargin1.top})`)
    .call(workingHourGridlines);

  // X axis
  let workingHourYearAxis = d3
    .axisBottom(workingHourYearScale)
    .tickFormat((x) => `${x}`);
  let workingHourYearGridlines = d3
    .axisBottom(workingHourYearScale)
    .tickSize(-lineChartHeight1 - 5)
    .tickFormat("");
  workingHourAnnotations
    .append("g")
    .attr("class", "x axis")
    .attr(
      "transform",
      `translate(${lineMargin1.left},${lineChartHeight1 + lineMargin1.top + 5})`
    )
    .call(workingHourYearAxis);
  workingHourAnnotations
    .append("g")
    .attr("class", "x gridlines")
    .attr(
      "transform",
      `translate(${lineMargin1.left},${lineChartHeight1 + lineMargin1.top + 5})`
    )
    .call(workingHourYearGridlines);

  const continentsNotNA = [
    "South America",
    "Oceania",
    "Europe",
    "Asia",
    "North America",
  ];

  continentsNotNA.forEach((c) => {
    var lineGen = d3
      .line()
      .x((d) => Number(workingHourYearScale(d["Year"])))
      .y((d) => Number(workingHourScale(d[c + " Working Hours"])))
      .curve(d3.curveMonotoneX);

    for (let y = 1950; y <= 2001; y++) {
      workingHourChartArea
        .append("path")
        .datum(
          dataByYear.filter(
            (dataByYear) =>
              (y <= dataByYear["Year"]) & (dataByYear["Year"] <= y + 1)
          )
        )
        .attr("year", y)
        .attr("class", "working-hours-line")
        .attr("fill", "none")
        .attr("stroke", (d) => continentScale(c))
        .attr("stroke-width", 2)
        .attr("d", lineGen)
        .attr("opacity", 0.7);
    }
  });

  continents.forEach((c) => {
    var lineGen = d3
      .line()
      .x((d) => Number(workingHourYearScale(d["Year"])))
      .y((d) => Number(workingHourScale(d[c + " Working Hours"])))
      .curve(d3.curveMonotoneX);

    for (let y = 2001; y <= 2016; y++) {
      workingHourChartArea
        .append("path")
        .datum(
          dataByYear.filter(
            (dataByYear) =>
              (y <= dataByYear["Year"]) & (dataByYear["Year"] <= y + 1)
          )
        )
        .attr("year", y)
        .attr("class", "working-hours-line")
        .attr("fill", "none")
        .attr("stroke", (d) => continentScale(c))
        .attr("stroke-width", 2)
        .attr("d", lineGen)
        .attr("opacity", 0.7);
    }
  });

  let GDPAnnotations = line_gdp.append("g").attr("id", "gdpAnnotations");
  let GDPChartArea = line_gdp
    .append("g")
    .attr("id", "points")
    .attr("transform", `translate(${lineMargin1.left},${lineMargin1.top})`);

  const GDPYearScale = d3
    .scaleLinear()
    .domain([1950, 2017])
    .range([0, lineChartWidth2]);

  const GDPperCapScale = d3
    .scaleLinear()
    .domain([1900, 42000])
    .range([lineChartHeight2, 0]);

  // Y axis
  let GDPAxis = d3.axisLeft(GDPperCapScale).tickFormat((x) => `$${x}`);
  let GDPGridlines = d3
    .axisLeft(GDPperCapScale)
    .tickSize(-lineChartWidth2 - 5)
    .tickFormat("");
  GDPAnnotations.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${lineMargin2.left - 5},${lineMargin2.top})`)
    .call(GDPAxis);
  GDPAnnotations.append("g")
    .attr("class", "y gridlines")
    .attr("transform", `translate(${lineMargin2.left - 5},${lineMargin2.top})`)
    .call(GDPGridlines);

  // X axis
  let GDPearAxis = d3.axisBottom(GDPYearScale).tickFormat((x) => `${x}`);
  let GDPYearGridlines = d3
    .axisBottom(GDPYearScale)
    .tickSize(-lineChartHeight2 - 5)
    .tickFormat("");
  GDPAnnotations.append("g")
    .attr("class", "x axis")
    .attr(
      "transform",
      `translate(${lineMargin2.left},${lineChartHeight2 + lineMargin2.top + 5})`
    )
    .call(GDPearAxis);
  GDPAnnotations.append("g")
    .attr("class", "x gridlines")
    .attr(
      "transform",
      `translate(${lineMargin2.left},${lineChartHeight2 + lineMargin2.top + 5})`
    )
    .call(GDPYearGridlines);

  continentsNotNA.forEach((c) => {
    var lineGen = d3
      .line()
      .x((d) => Number(GDPYearScale(d["Year"])))
      .y((d) => Number(GDPperCapScale(d[c + " GDP"])))
      .curve(d3.curveMonotoneX);

    for (let y = 1950; y <= 2001; y++) {
      GDPChartArea.append("path")
        .datum(
          dataByYear.filter(
            (dataByYear) =>
              (y <= dataByYear["Year"]) & (dataByYear["Year"] <= y + 1)
          )
        )
        .attr("year", y)
        .attr("class", "gdp-line")
        .attr("fill", "none")
        .attr("stroke", (d) => continentScale(c))
        .attr("stroke-width", 2)
        .attr("d", lineGen)
        .attr("opacity", 0.7);
    }
  });

  continents.forEach((c) => {
    var lineGen = d3
      .line()
      .x((d) => Number(GDPYearScale(d["Year"])))
      .y((d) => Number(GDPperCapScale(d[c + " GDP"])))
      .curve(d3.curveMonotoneX);

    for (let y = 2001; y <= 2016; y++) {
      GDPChartArea.append("path")
        .datum(
          dataByYear.filter(
            (dataByYear) =>
              (y <= dataByYear["Year"]) & (dataByYear["Year"] <= y + 1)
          )
        )
        .attr("year", y)
        .attr("class", "gdp-line")
        .attr("fill", "none")
        .attr("stroke", (d) => continentScale(c))
        .attr("stroke-width", 2)
        .attr("d", lineGen)
        .attr("opacity", 0.7);
    }
  });

  var workingHourPosMap = {};
  [
    "Africa",
    "Asia",
    "South America",
    "North America",
    "Oceania",
    "Europe",
  ].forEach((c, i) => {
    workingHourPosMap[c] = i;
  });

  var gdpPosMap = {};
  [
    "Oceania",
    "Europe",
    "North America",
    "Asia",
    "South America",
    "Africa",
  ].forEach((c, i) => {
    gdpPosMap[c] = i;
  });

  // Working Hour line chart mouse over
  let workingHourMouseGroup = workingHourChartArea.append("g");

  if (sliderYear < 2001) {
    continentsNotNA.forEach((c) => {
      workingHourMouseGroup
        .append("circle")
        .attr("class", "working-hour-marker")
        .attr("id", c.replace(/ /g, "_") + "WorkingHourMarker")
        .attr("fill", continentScale(c))
        .attr("r", 5)
        .attr("visibility", "hidden")
        .attr("opacity", 0.8);

      workingHourMouseGroup
        .append("text")
        .attr("class", "working-hour-label")
        .attr("id", c.replace(/ /g, "_") + "WorkingHourLabel")
        .attr("visibility", "hidden");
    });
  } else {
    continents.forEach((c) => {
      workingHourMouseGroup
        .append("circle")
        .attr("class", "working-hour-marker")
        .attr("id", c.replace(/ /g, "_") + "WorkingHourMarker")
        .attr("fill", continentScale(c))
        .attr("r", 5)
        .attr("visibility", "hidden")
        .attr("opacity", 0.8);

      workingHourMouseGroup
        .append("text")
        .attr("class", "working-hour-label")
        .attr("id", c.replace(/ /g, "_") + "WorkingHourLabel")
        .attr("visibility", "hidden");
    });
  }

  let workingHourActiveRegion = workingHourMouseGroup
    .append("rect")
    .attr("id", "workingHourActiveRegion")
    .attr("width", lineChartWidth1 - lineMargin1.right)
    .attr("height", lineChartHeight1)
    .attr("fill", "none")
    .attr("pointer-events", "all");

  workingHourActiveRegion.on("mouseover", function () {
    d3.selectAll(".working-hour-marker").attr("visibility", "");
    d3.selectAll(".working-hour-label").attr("visibility", "");
  });

  workingHourActiveRegion.on("mouseout", function () {
    d3.selectAll(".working-hour-marker").attr("visibility", "hidden");
    d3.selectAll(".working-hour-label").attr("visibility", "hidden");
  });

  // GDP line chart mouse over
  let gdpMouseGroup = GDPChartArea.append("g");

  if (sliderYear < 2001) {
    continentsNotNA.forEach((c) => {
      gdpMouseGroup
        .append("circle")
        .attr("class", "gdp-marker")
        .attr("id", c.replace(/ /g, "_") + "GDPMarker")
        .attr("fill", continentScale(c))
        .attr("r", 5)
        .attr("visibility", "hidden")
        .attr("opacity", 0.8);

      gdpMouseGroup
        .append("text")
        .attr("class", "gdp-label")
        .attr("id", c.replace(/ /g, "_") + "GDPLabel")
        .attr("visibility", "hidden");
    });
  } else {
    continents.forEach((c) => {
      gdpMouseGroup
        .append("circle")
        .attr("class", "gdp-marker")
        .attr("id", c.replace(/ /g, "_") + "GDPMarker")
        .attr("fill", continentScale(c))
        .attr("r", 5)
        .attr("visibility", "hidden")
        .attr("opacity", 0.8);

      gdpMouseGroup
        .append("text")
        .attr("class", "gdp-label")
        .attr("id", c.replace(/ /g, "_") + "GDPLabel")
        .attr("visibility", "hidden");
    });
  }

  let gdpActiveRegion = gdpMouseGroup
    .append("rect")
    .attr("id", "GDPActiveRegion")
    .attr("width", lineChartWidth2 - lineMargin2.right)
    .attr("height", lineChartHeight2)
    .attr("fill", "none")
    .attr("pointer-events", "all");

  gdpActiveRegion.on("mouseover", function () {
    d3.selectAll(".gdp-marker").attr("visibility", "");
    d3.selectAll(".gdp-label").attr("visibility", "");
  });

  gdpActiveRegion.on("mouseout", function () {
    d3.selectAll(".gdp-marker").attr("visibility", "hidden");
    d3.selectAll(".gdp-label").attr("visibility", "hidden");
  });

  let findYear = d3.bisector((d) => d.Year).right;

  workingHourActiveRegion.on("mousemove", function (evt) {
    let location = d3.pointer(evt);
    let x = location[0];
    let xYear = workingHourYearScale.invert(x);
    let index = findYear(dataByYear, xYear);
    let d = dataByYear[index];

    continentsNotNA.forEach((c) => {
      let xPos = workingHourYearScale(d["Year"]);
      let yPos = workingHourScale(d[c + " Working Hours"]);

      d3.select("#" + c.replace(/ /g, "_") + "WorkingHourMarker")
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr("visibility", xYear <= sliderYear ? "" : "hidden");

      let txt = c + " : " + d[c + " Working Hours"].toFixed(2);

      d3.select("#" + c.replace(/ /g, "_") + "WorkingHourLabel")
        .text(txt)
        .attr("x", xPos < lineChartWidth1 / 2 ? xPos + 10 : xPos - 10)
        .attr("y", 20 + workingHourPosMap[c] * 25)
        .attr("visibility", xYear <= sliderYear ? "" : "hidden")
        .attr("text-anchor", xPos < lineChartWidth1 / 2 ? "start" : "end")
        .style("fill", continentScale(c))
        .style("font-weight", "bold")
        .style("font-family", "Arial")
        .style("font-size", "12px");
    });

    // Special case for Africa
    if (sliderYear < 2001) {
      d3.select("#AfricaWorkingHourMarker").attr("visibility", "hidden");
      d3.select("#AfricaWorkingHourLabel").attr("visibility", "hidden");
    } else {
      let xPos = workingHourYearScale(d["Year"]);
      let yPos = workingHourScale(d["Africa Working Hours"]);

      d3.select("#AfricaWorkingHourMarker")
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr(
          "visibility",
          (xYear >= 2001) & (xYear <= sliderYear) ? "" : "hidden"
        );

      let txt = "Africa : " + d["Africa Working Hours"].toFixed(2);

      d3.select("#AfricaWorkingHourLabel")
        .text(txt)
        .attr("x", xPos < lineChartWidth1 / 2 ? xPos + 10 : xPos - 10)
        .attr("y", 20 + workingHourPosMap["Africa"] * 25)
        .attr(
          "visibility",
          (xYear >= 2001) & (xYear <= sliderYear) ? "" : "hidden"
        )
        .attr("text-anchor", xPos < lineChartWidth1 / 2 ? "start" : "end")
        .style("fill", continentScale("Africa"))
        .style("font-weight", "bold")
        .style("font-family", "Arial")
        .style("font-size", "12px");
    }
  });

  gdpActiveRegion.on("mousemove", function (evt) {
    let location = d3.pointer(evt);
    let x = location[0];
    let xYear = GDPYearScale.invert(x);
    let index = findYear(dataByYear, xYear);
    let d = dataByYear[index];

    continentsNotNA.forEach((c) => {
      let xPos = GDPYearScale(d["Year"]);
      let yPos = GDPperCapScale(d[c + " GDP"]);

      d3.select("#" + c.replace(/ /g, "_") + "GDPMarker")
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr("visibility", xYear <= sliderYear ? "" : "hidden");

      let txt = c + " : " + d[c + " GDP"].toFixed(2);

      d3.select("#" + c.replace(/ /g, "_") + "GDPLabel")
        .text(txt)
        .attr("x", xPos < lineChartWidth2 / 2 ? xPos + 10 : xPos - 10)
        .attr("y", 20 + gdpPosMap[c] * 25)
        .attr("visibility", xYear <= sliderYear ? "" : "hidden")
        .attr("text-anchor", xPos < lineChartWidth2 / 2 ? "start" : "end")
        .style("fill", continentScale(c))
        .style("font-weight", "bold")
        .style("font-family", "Arial")
        .style("font-size", "12px");
    });

    // Special case for Africa
    if (sliderYear < 2001) {
      d3.select("#AfricaGDPMarker").attr("visibility", "hidden");
      d3.select("#AfricaGDPLabel").attr("visibility", "hidden");
    } else {
      let xPos = GDPYearScale(d["Year"]);
      let yPos = GDPperCapScale(d["Africa GDP"]);

      d3.select("#AfricaGDPMarker")
        .attr("cx", xPos)
        .attr("cy", yPos)
        .attr(
          "visibility",
          (xYear >= 2001) & (xYear <= sliderYear) ? "" : "hidden"
        );

      let txt = "Africa : " + d["Africa GDP"].toFixed(2);

      d3.select("#AfricaGDPLabel")
        .text(txt)
        .attr("x", xPos < lineChartWidth2 / 2 ? xPos + 10 : xPos - 10)
        .attr("y", 20 + gdpPosMap["Africa"] * 25)
        .attr(
          "visibility",
          (xYear >= 2001) & (xYear <= sliderYear) ? "" : "hidden"
        )
        .attr("text-anchor", xPos < lineChartWidth2 / 2 ? "start" : "end")
        .style("fill", continentScale("Africa"))
        .style("font-weight", "bold")
        .style("font-family", "Arial")
        .style("font-size", "12px");
    }
  });

  var sliderYear = 1980;

  const sliderYearScale = d3
    .scaleLinear()
    .domain([1950, 2017])
    .range([40, 760]);

  function loadYear(year) {
    let currentYear = year;

    year_bubble
      .selectAll("text")
      .join("text")
      .text(currentYear)
      .attr("x", (d) => sliderYearScale(currentYear))
      .attr("y", 20)
      .style("font-family", "Arial")
      .style("font-weight", "bold")
      .style("text-anchor", "middle");

    let yearData = dataByYear.filter(
      (dataByYear) => dataByYear["Year"] == currentYear
    );
    let data = yearData[0].Values;

    const hourExtent = d3.extent(data, (d) => d["Working_Hours"]);
    const hourScale = d3
      .scaleLinear()
      .domain(hourExtent)
      .range([0, chartWidth2]);

    const gdpExtent = d3.extent(data, (d) => d["GDP"]);
    const gdpScale = d3
      .scaleLinear()
      .domain(gdpExtent)
      .range([chartHeight2, 0]);

    const populationExtent = d3.extent(working_hour, (d) =>
      Math.sqrt(d["Population"])
    );
    const populationScale = d3
      .scaleLinear()
      .domain(populationExtent)
      .range([3, 22]);

    yAxis.scale(gdpScale);
    yAxisG.transition().call(yAxis);

    yGridlines.scale(gdpScale);
    yGridlinesG.transition().call(yGridlines);

    xAxis.scale(hourScale);
    xAxisG.transition().call(xAxis);

    xGridlines.scale(hourScale);
    xGridlinesG.transition().call(xGridlines);

    let circles = chartArea
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("id", (d) => d["Code"])
      .attr("class", "country-circle")
      .attr("cx", (d) => hourScale(d["Working_Hours"]))
      .attr("cy", (d) => gdpScale(d["GDP"]))
      .attr("r", (d) => populationScale(Math.sqrt(d["Population"])))
      .attr("continent", (d) => d["Continent"])
      .style("fill", (d) => continentScale(d["Continent"]))
      .style("stroke", "black")
      .style("stroke-width", 0.6)
      .attr("opacity", 0.6)
      .attr("visibility", (d) =>
        country_visibility[d["Code"]] ? "" : "hidden"
      );

    let labels = chartArea
      .selectAll("text")
      .data(data)
      .join("text")
      .text((d) => d["Entity"])
      .attr("id", (d) => d["Code"])
      .attr("class", "country-text")
      .attr("x", (d) =>
        hourScale(d["Working_Hours"]) < 600
          ? hourScale(d["Working_Hours"]) +
            0.75 * populationScale(Math.sqrt(d["Population"]))
          : hourScale(d["Working_Hours"]) -
            0.75 * populationScale(Math.sqrt(d["Population"]))
      )
      .attr(
        "y",
        (d) =>
          gdpScale(d["GDP"]) -
          0.75 * populationScale(Math.sqrt(d["Population"]))
      )
      .attr("continent", (d) => d["Continent"])
      .style("fill", (d) => continentScale(d["Continent"]))
      .style("font-family", "Arial")
      .style("font-size", "12px")
      .style("text-anchor", (d) =>
        hourScale(d["Working_Hours"]) < 600 ? "start" : "end"
      )
      .attr("visibility", (d) =>
        d["Text_Visibility"] && country_visibility[d["Code"]] ? "" : "hidden"
      );

    circles.on("mouseover", function () {
      let countryId = d3.select(this).attr("id");

      d3.selectAll(".country-circle").attr("opacity", 0.1);

      d3.select(this)
        .attr("opacity", 0.6)
        .attr("r", (d) => populationScale(Math.sqrt(d["Population"])) + 5);

      d3.selectAll(".country-text").attr("visibility", "hidden");

      d3.select("text#" + countryId)
        .attr(
          "x",
          (d) =>
            hourScale(d["Working_Hours"]) +
            0.75 * populationScale(Math.sqrt(d["Population"])) +
            5
        )
        .attr(
          "y",
          (d) =>
            gdpScale(d["GDP"]) -
            0.75 * populationScale(Math.sqrt(d["Population"])) -
            5
        )
        .style("font-size", "14px")
        .attr("visibility", "");

      let countryFact = d3.select(this).datum()["Entity"];
      let yearFact = d3.select(this).datum()["Year"];
      let Continent = d3.select(this).datum()["Continent"];
      let WorkingHourFact = d3.select(this).datum()["Working_Hours"].toFixed(2);
      let GDPFact = d3.select(this).datum()["GDP"].toFixed(2);
      let PopulationFact = d3.select(this).datum()["Population"].toFixed(2);

      d3.select("#countryLabel")
        .text(countryFact)
        .style("font-family", "Arial")
        .style("font-weight", "bold")
        .style("font-size", "15px");

      d3.select("#yearLabel")
        .text(yearFact)
        .style("font-family", "Arial")
        .style("font-weight", "bold")
        .style("font-size", "15px");

      d3.select("#continentLabel")
        .text("Continent: ")
        .style("font-family", "Arial")
        .style("font-weight", "bold")
        .style("font-size", "13px");

      d3.select("#continentFact")
        .text(Continent)
        .style("font-family", "Arial")
        .style("font-size", "12px");

      d3.select("#workingHourLabel")
        .text("Working Hours: ")
        .style("font-family", "Arial")
        .style("font-weight", "bold")
        .style("font-size", "13px");

      d3.select("#workingHourFact")
        .text(WorkingHourFact)
        .style("font-family", "Arial")
        .style("font-size", "13px");

      d3.select("#GDPLabel")
        .text("GDP per Capita: ")
        .style("font-family", "Arial")
        .style("font-weight", "bold")
        .style("font-size", "13px");

      d3.select("#GDPFact")
        .text(GDPFact)
        .style("font-family", "Arial")
        .style("font-size", "13px");

      d3.select("#PopulationLabel")
        .text("Population: ")
        .style("font-family", "Arial")
        .style("font-weight", "bold")
        .style("font-size", "13px");

      d3.select("#PopulationFact")
        .text(PopulationFact)
        .style("font-family", "Arial")
        .style("font-size", "13px");
    });

    circles.on("mouseout", function () {
      d3.selectAll(".country-circle").attr("opacity", 0.6);

      d3.select(this).attr("r", (d) =>
        populationScale(Math.sqrt(d["Population"]))
      );

      let countryId = d3.select(this).attr("id");
      let defaultVisibility = d3.select(this).datum()["Text_Visibility"];

      d3.select("text#" + countryId)
        .attr(
          "x",
          (d) =>
            hourScale(d["Working_Hours"]) +
            0.75 * populationScale(Math.sqrt(d["Population"]))
        )
        .attr(
          "y",
          (d) =>
            gdpScale(d["GDP"]) -
            0.75 * populationScale(Math.sqrt(d["Population"]))
        )
        .style("font-size", "12px");

      d3.selectAll(".country-text").each(function () {
        let target = d3.select(this);
        let visibility = target.datum()["Text_Visibility"];
        let id = target.attr("id");
        target.attr(
          "visibility",
          visibility && country_visibility[id] ? "" : "hidden"
        );
      });

      d3.select("#countryLabel").text("");

      d3.select("#yearLabel").text("");

      d3.select("#continentLabel").text("");

      d3.select("#continentFact").text("");

      d3.select("#workingHourLabel").text("");

      d3.select("#workingHourFact").text("");

      d3.select("#GDPLabel").text("");

      d3.select("#GDPFact").text("");

      d3.select("#PopulationLabel").text("");

      d3.select("#PopulationFact").text("");
    });

    d3.selectAll(".working-hours-line").each(function () {
      let target = d3.select(this);
      let year = target.attr("year");

      target.attr("visibility", (d) => (year < currentYear ? "" : "hidden"));
    });

    d3.selectAll(".gdp-line").each(function () {
      let target = d3.select(this);
      let year = target.attr("year");

      target.attr("visibility", (d) => (year < currentYear ? "" : "hidden"));
    });

    sliderYear = currentYear;
  }

  var all_selected = true;

  function updateAllSelected() {
    let numSelected = 0;
    d3.selectAll(".legend-circle").each(function () {
      let selected = d3.select(this).attr("selected");
      if (selected === "true") {
        numSelected += 1;
      }
    });

    all_selected = numSelected === 6 || numSelected === 0;

    if (numSelected === 0) {
      d3.selectAll(".legend-svg").each(function () {
        let target = d3.select(this);
        target.attr("selected", true);
      });

      d3.selectAll(".legend-circle").each(function () {
        let target = d3.select(this);
        let continent = d3.select(this).attr("continent");

        target.attr("selected", true);
        target.style("fill", continentScale(continent));
      });

      d3.selectAll(".legend-text").each(function () {
        let target = d3.select(this);
        let continent = d3.select(this).attr("continent");

        target.attr("selected", true);
        target.style("fill", continentScale(continent));
      });

      d3.selectAll(".country-circle").each(function () {
        let target = d3.select(this);
        target.attr("visibility", "");
      });

      for (const [code, value] of Object.entries(country_visibility)) {
        country_visibility[code] = true;
      }
    }
  }

  continents.forEach((d, i) => {
    let legendSVG = legend
      .append("svg")
      .attr("class", "legend-svg")
      .attr("height", 25)
      .attr("width", 120)
      .attr("continent", d)
      .attr("selected", true)
      .attr("continent", d);

    legendSVG
      .append("circle")
      .attr("class", "legend-circle")
      .attr("continent", d)
      .attr("selected", true)
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("r", 6)
      .style("fill", continentScale(d))
      .style("stroke", "black")
      .style("stroke-width", 0.6)
      .attr("opacity", 0.6);

    legendSVG
      .append("text")
      .text(d)
      .attr("class", "legend-text")
      .attr("continent", d)
      .attr("selected", true)
      .attr("x", 25)
      .attr("y", 10)
      .style("fill", continentScale(d))
      .style("alignment-baseline", "middle")
      .style("font-weight", "bold")
      .style("font-family", "Arial")
      .style("font-size", "13px");

    legendSVG
      .on("mouseover", function () {
        if (all_selected) {
          d3.selectAll(".country-circle").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            let id = target.attr("id");

            if (continent === d) {
              target.attr("opacity", 0.6);
              target.attr("visibility", "");
            } else {
              target.attr("opacity", 0.1);
            }
          });

          d3.selectAll(".country-text").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            let id = target.attr("id");

            if (continent === d) {
              target.attr("visibility", "");
            } else {
              target.attr("visibility", "hidden");
            }
          });
        } else {
          d3.selectAll(".country-circle").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            let id = target.attr("id");

            if (continent === d) {
              target.attr("opacity", 0.6);
              target.attr("visibility", "");
            }
          });

          d3.selectAll(".country-text").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            let id = target.attr("id");

            if (continent === d) {
              target.attr("visibility", "");
            }
          });
        }
      })

      .on("mouseout", function () {
        d3.selectAll(".country-circle").each(function () {
          let target = d3.select(this);
          let id = target.attr("id");

          if (country_visibility[id] === false) {
            target.attr("visibility", "hidden");
          } else {
            target.attr("opacity", 0.6);
          }
        });

        d3.selectAll(".country-text").each(function () {
          let target = d3.select(this);
          let visibility = target.datum()["Text_Visibility"];
          let id = target.attr("id");
          target
            .attr("opacity", 1)
            .attr(
              "visibility",
              visibility && country_visibility[id] ? "" : "hidden"
            );
        });
      })

      .on("click", function () {
        if (all_selected) {
          d3.selectAll(".legend-svg").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            if (continent === d) {
              target.attr("selected", true);
            } else {
              target.attr("selected", false);
            }
          });

          d3.selectAll(".legend-circle").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            if (continent === d) {
              target.attr("selected", true);
            } else {
              target.attr("selected", false);
              target.style("fill", "grey");
            }
          });

          d3.selectAll(".legend-text").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            if (continent === d) {
              target.attr("selected", true);
            } else {
              target.attr("selected", false);
              target.style("fill", "grey");
            }
          });

          d3.selectAll(".country-circle").each(function () {
            let target = d3.select(this);
            let continent = target.attr("continent");
            if (continent !== d) {
              target.attr("visibility", "hidden");
            }
          });

          country_to_continent.forEach((entry, i) => {
            let continent = entry["Continent"];
            let code = entry["Code"];
            if (continent === d) {
              country_visibility[code] = true;
            } else {
              country_visibility[code] = false;
            }
          });

          updateAllSelected();
        } else {
          let target = d3.select(this);
          let selected = target.attr("selected") === "true";

          if (!selected) {
            d3.selectAll(".legend-svg").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");
              if (continent === d) {
                target.attr("selected", true);
              }
            });

            d3.selectAll(".legend-circle").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");
              if (continent === d) {
                target.attr("selected", true);
                target.style("fill", continentScale(continent));
              }
            });

            d3.selectAll(".legend-text").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");
              if (continent === d) {
                target.attr("selected", true);
                target.style("fill", continentScale(continent));
              }
            });

            d3.selectAll(".country-circle").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");

              if (continent === d) {
                target.attr("visibility", "");
              }
            });

            country_to_continent.forEach((entry, i) => {
              let continent = entry["Continent"];
              let code = entry["Code"];
              if (continent === d) {
                country_visibility[code] = true;
              }
            });

            updateAllSelected();
          } else {
            d3.selectAll(".legend-svg").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");
              if (continent === d) {
                target.attr("selected", false);
              }
            });

            d3.selectAll(".legend-circle").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");
              if (continent === d) {
                target.attr("selected", false);
                target.style("fill", "grey");
              }
            });

            d3.selectAll(".legend-text").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");
              if (continent === d) {
                target.attr("selected", false);
                target.style("fill", "grey");
              }
            });

            d3.selectAll(".country-circle").each(function () {
              let target = d3.select(this);
              let continent = target.attr("continent");

              if (continent === d) {
                target.attr("visibility", "hidden");
              }
            });

            country_to_continent.forEach((entry, i) => {
              let continent = entry["Continent"];
              let code = entry["Code"];
              if (continent === d) {
                country_visibility[code] = false;
              }
            });

            updateAllSelected();
          }
        }
      });
  });

  d3.select("input#slider").on("input", function () {
    loadYear(this.value);
  });

  loadYear(1980);
};

loadData();
