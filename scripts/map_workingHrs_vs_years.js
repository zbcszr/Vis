const svg = d3.select("svg#worldMap");
const width = svg.attr("width");
const height = svg.attr("height");
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const mapWidth = width - margin.left - margin.right;
const mapHeight = height - margin.top - margin.bottom;
let mapArea = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const year_display = d3.select("svg#year_display");

const PlotMap = async function () {
  const worldMap = await d3.json(
    "dataset/processed_countries_110m.json",
    d3.autoType
  );

  function mouseEntersPlot() {
    //highlight selected area
    d3.select(this)
      .transition()
      .duration(50)
      .attr("stroke-width", 3)
      .attr("stroke", "gray");

    tooltip
      .style("visibility", "visible")
      .attr("fill", "white")
      .attr("opacity", 1);

    tooltip.raise();

    let country = d3.select(this);

    let countryName = d3.select(this).datum().properties.name;
    let hourOfYear = d3.select(this).datum().properties[givenYear];

    let hourText = "";
    if (isNaN(hourOfYear)) {
      hourText = "Hours Per Week: No Data";
    } else {
      hourText = "Hours Per Week: " + Math.round(hourOfYear);
    }

    txt.text("Country: " + countryName);
    txt2.text(hourText);

    txt3.text("Year: " + givenYear); // working hour

    let bounds = path.bounds(country.datum());
    let xPos = (bounds[0][0] + bounds[1][0]) / 2.0;
    let yPos = bounds[1][1] - 5;

    //adjust tooltip bar location when necessary
    if (yPos > 700 && xPos > 900) {
      tooltip.attr("transform", `translate(${xPos - 100},${yPos - 100})`);
    } else if (xPos > 900) {
      tooltip.attr("transform", `translate(${xPos - 100},${yPos})`);
    } else if (yPos > 700) {
      tooltip.attr("transform", `translate(${xPos},${yPos - 100})`);
    } else {
      tooltip.attr("transform", `translate(${xPos},${yPos})`);
    }
  }

  // convert string year to int year inside the object (eg. "1991.0" => 1991)
  worldMap.objects.countries.geometries.forEach((d, i) => {
    let object1 = d.properties;

    for (let key of Object.keys(object1)) {
      if (key != "name") {
        newKey = parseInt(key, 10);
        object1[newKey] = object1[key] / (365 / 7); //update hours from yearly to weekly
        delete object1[key];
      }
    }
  });

  console.log(worldMap);

  // process the year data
  const hoursPerWorker = await d3.csv(
    "dataset/hours_per_worker.csv",
    d3.autoType
  );
  hoursPerWorker.forEach((d, i) => {
    d["hours_per_week"] =
      d["Average annual working hours per worker"] / (365 / 7);
  });
  console.log("this is hours per worker");
  console.log(hoursPerWorker);

  var countries = topojson.feature(worldMap, worldMap.objects.countries);
  var countriesMesh = topojson.mesh(worldMap, worldMap.objects.countries);
  var landMesh = topojson.mesh(worldMap, worldMap.objects.land);
  var projection = d3.geoMercator().fitSize([mapWidth, mapHeight], countries);
  var path = d3.geoPath().projection(projection);

  //get working hours info
  // var givenYear = 2017; //assume given year is 2017
  const yearExtent = d3.extent(hoursPerWorker, (d) => d["Year"]);
  const hourExtent = d3.extent(hoursPerWorker, (d) => d["hours_per_week"]);
  var hoursAggregate = [];
  hoursPerWorker.forEach((d) => {
    hoursAggregate.push(d["hours_per_week"]);
  });

  // compute color scale
  const color = ["#C5E6F5", "#8BCEEA", "#50B5E0", "#2397C9", "#145571"];
  const colorScale = d3.scaleQuantile().domain(hoursAggregate).range(color);

  // draw country path and fill color
  updateMap(1980, countries, colorScale, countriesMesh, landMesh);
  // call chart update when slider changes
  d3.select("#yearSlider").on("input", function (d) {
    givenYear = this.value;
    updateMap(givenYear, countries, colorScale, countriesMesh, landMesh);
  });

  //update chart
  function updateMap(givenYear) {
    mapArea
      .selectAll("path.country")
      .data(countries.features)
      .join("path")
      .attr("class", function (d) {
        if (colorScale(d.properties[givenYear]) === undefined) {
          return "country " + "color-" + "D8D7D5";
        } else {
          return (
            "country " +
            "color-" +
            colorScale(d.properties[givenYear]).substring(1)
          );
        }
      })
      .attr("note", (d) => d.id)
      .attr("d", path)
      .style("fill", function (d) {
        if (colorScale(d.properties[givenYear]) === undefined) {
          return "#D8D7D5";
        } else {
          return colorScale(d.properties[givenYear]);
        }
      })
      .on("mouseover", mouseEntersPlot)
      .on("mouseout", mouseLeavesPlot);

    // update slider bar year
    const sliderYearScale = d3
      .scaleLinear()
      .domain([1950, 2017])
      .range([40, 760]);

    year_display
      .selectAll("text")
      .join("text")
      .text(givenYear)
      .attr("x", (d) => sliderYearScale(givenYear))
      .attr("y", 10)
      .style("font-family", "Arial")
      .style("font-weight", "bold")
      .style("text-anchor", "middle");

    year_display.selectAll("text").raise();
  }

  mapArea
    .append("path")
    .datum(countriesMesh)
    .attr("class", "mesh")
    .attr("d", path);
  mapArea
    .append("path")
    .datum(landMesh)
    .attr("class", "landMesh")
    .attr("d", path);

  //cover unrelated area
  mapArea
    .append("rect")
    .attr("x", 80)
    .attr("y", 780)
    .attr("width", 900)
    .attr("height", 100)
    .attr("stroke", "white")
    .attr("fill", "white");

  // Add legend
  var rx = 50;
  const fullColorScale = ["#D8D7D5"].concat(colorScale.range());
  fullColorScale.forEach((d, i) => {
    let legend = mapArea
      .append("rect")
      .attr("class", d.substring(1))
      .attr("fill", d)
      .attr("x", rx)
      .attr("y", 840)
      .attr("width", 150)
      .attr("height", 20)
      .on("mouseover", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", 1)
          .attr("stroke", "black");
        mapArea.selectAll("path").style("opacity", 0.1);
        mapArea
          .selectAll("path.color-" + d.substring(1))
          .style("opacity", 1)
          .style("stroke-width", "1px")
          .style("stroke", "black");
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("stroke", "none");
        mapArea.selectAll("path").style("opacity", 1);
      });
    if (d === "#D8D7D5") {
      rx += 170;
    } else {
      rx += 150;
    }
  });

  //add legend numbers
  var tx = 363;
  var cutoffs = colorScale.quantiles();
  cutoffs.forEach((d) => {
    mapArea.append("text").text(parseInt(d)).attr("x", tx).attr("y", 830);
    tx += 150;
  });

  // since cutoffs doesn't include 0 and 100 percentile
  mapArea.append("text").text("No Data").attr("x", 100).attr("y", 830);
  mapArea.append("text").text("26").attr("x", 213).attr("y", 830);
  mapArea
    .append("text")
    .text("67")
    .attr("x", 943 + 20)
    .attr("y", 830);

  // Plot area size when mouseOver
  let tooltipWidth = 245;
  let tooltipHeight = 70;

  let tooltip = mapArea
    .append("g")
    .attr("class", "tooltip")
    .attr("visibility", "hidden");
  let tooltip_rec = tooltip
    .append("rect")
    .attr("fill", "white")
    .attr("opacity", 1)
    .attr("x", -tooltipWidth / 2.0)
    .attr("y", 0)
    .attr("rx", 5)
    .attr("ry", 5)
    .style("stroke", "#222")
    .attr("width", tooltipWidth)
    .attr("height", tooltipHeight);
  let txt = tooltip
    .append("text")
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("font-weight", "bold")
    .attr("x", 0)
    .attr("y", 10);
  let txt2 = tooltip
    .append("text")
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 30);
  let txt3 = tooltip
    .append("text")
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 50);

  d3.selectAll(".country").on("mouseenter", mouseEntersPlot);
  d3.selectAll(".country").on("mouseout", mouseLeavesPlot);

  const mouseover = mapArea
    .append("g")
    .attr("class", "mouseover")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  function mouseLeavesPlot() {
    tooltip.style("visibility", "hidden");
    d3.select(this)
      .transition()
      .duration(200)
      .attr("stroke-width", 1)
      .attr("stroke", "none");
  }
};
PlotMap();
