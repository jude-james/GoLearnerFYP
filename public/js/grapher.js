import * as d3 from "d3";

const container = document.querySelector(".d3js");
const output = document.querySelector(".output");

// A random bar colour for each depth
const barColours = [
    "#a31f18", "#1a4675", "#1a7538", "#d4a017",
    "#7a2f97", "#b95a07", "#107964", "#e91e8c",
    "#5dade2", "#a3e048", "#f36f3a", "#7d6ee7",
];

const labelColour = "#e2e2e2";
const axisColour = "#000000";

const leftPadding = 20;
const rightPadding = 20;
const topPadding = 20;
const bottomPadding = 50;

const barHeight = 20;
const rowGap = 8;
const rowStride = barHeight + rowGap;

let goroutineMap = {};
let sortedRows = []; 

let duration;

let svg;
let xScale;
let xAxis;
let barsG;

window.addEventListener("resize", () => {
    buildSVG();
});

/**
 * entry point for grapher, takes in events data and sets up svg
 * @param {any} events - The events json data object
 */
export function init(events) {
    goroutineMap = {};
    sortedRows = [];
    
    for (let i = 0; i < events.length; i++) {
        const e = events[i];

        // Pair goroutine events together, combining start and end times
        if (e.event === "create-goroutine" || e.event === "end-goroutine") {
            if (!goroutineMap[e.id]) {     
                // Create a new entry for each new Id           
                goroutineMap[e.id] = { 
                    id: e.id,
                    name: e.name,
                    parentId: e.parentId, 
                    start: null, 
                    end: null, 
                    depth: null, 
                    children: [] };
            }

            if (e.event === "create-goroutine") {                
                goroutineMap[e.id].start = e.time;
            }

            if (e.event === "end-goroutine") {
                goroutineMap[e.id].end = e.time;
            }
        }
    }    

    let mainGoroutine = goroutineMap[1]; // id of 1 is always main goroutine
    const mainEnd = mainGoroutine.end;

    // Sort goroutine map by time, then add all children to each event
    Object.values(goroutineMap)
    .sort((a, b) => a.start - b.start)
    .forEach(e => {                    
        if (e.parentId && goroutineMap[e.parentId]) {            
            goroutineMap[e.parentId].children.push(e.id);
        }
        if (e.end === null) {
            e.end = mainEnd;
        }
    });

    // Set duration to the goroutine with latest end
    duration = Math.max(...Object.values(goroutineMap).map(e => e.end ?? 0));

    displayStats();
    assignRows(mainGoroutine, 0);
    buildSVG();
}

/**
 * Prints useful messages to the output window 
 */
function displayStats()
{
    output.textContent = `PROGRAM INFO:\n`;

    output.textContent += `Your program lasted ${duration} seconds.\n`;

    const numGoroutines = Object.values(goroutineMap).length;
    output.textContent += `You created ${numGoroutines - 1} goroutine(s).\n`;
}

/**
 * Adds each goroutine to sorted rows depth-first to keep parent-child relationship
 * Assigns a depth level to each goroutine to differentiate by colour 
 */
function assignRows(event, depth) {
    event.depth = depth;
    depth++

    sortedRows.push(event.id);

    for (const child of event.children) {        
        assignRows(goroutineMap[child], depth);
    }
}

/**
 * Creates the grid and the bars with labels
 */
function buildSVG() {
    d3.select(container).select("svg").remove();

    const totalHeight = topPadding + bottomPadding + (sortedRows.length * rowStride);
    const width = container.clientWidth;
    const height = Math.max(totalHeight, container.clientHeight);
 
    svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("display", "block");
 
    // x-scale
    xScale = d3.scaleLinear()
    .domain([0, duration])
    .range([leftPadding, width - rightPadding]);

    // Tick label and format
    const useMs = duration < 0.5;
    const labelWidth = useMs ? 60 : 45;
    const tickCount = Math.max(2, Math.floor((width - leftPadding - rightPadding) / labelWidth));
    const format = t => useMs ? `${(t * 1000).toFixed(2)}ms` : `${t.toFixed(3)}s`;

    // x-axis
    xAxis = d3.axisBottom(xScale)
    .ticks(tickCount)
    .tickFormat(format);

    // Axis sits just below the last bar
    const axisY = topPadding + (sortedRows.length * rowStride) + 6;
 
    svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${axisY})`)
    .call(xAxis)
    .call(g => {
        g.select(".domain").attr("stroke", axisColour);
        g.selectAll(".tick line").attr("stroke", axisColour);
        g.selectAll(".tick text").attr("fill", axisColour).style("font-size", "10px");
    });

    // Bars group
    barsG = svg.append("g").attr("class", "bars");
 
    const barGroups = barsG.selectAll("g.bar-group")
        .data(sortedRows)
        .join("g")
        .attr("class", "bar-group");
 
    // Drop shadow
    const defs = svg.append("defs");

    defs.append("filter")
        .attr("id", "bar-shadow")
        .append("feDropShadow")
        .attr("dx", 2)
        .attr("dy", 2)
        .attr("stdDeviation", 0)
        .attr("flood-color", "#000000")
        .attr("flood-opacity", 1);

    // Rect
    barGroups.append("rect")
    .attr("class", "bar-rect")
    .attr("x", id => xScale(goroutineMap[id].start))
    .attr("y", (_, i) => rowCentreY(i) - barHeight / 2)
    .attr("width", id => {
        const e = goroutineMap[id];
        // Avoid negative width
        return xScale(Math.max(e.start, e.end)) - xScale(e.start);
    })
    .attr("height", barHeight)
    .attr("fill", id => barColours[goroutineMap[id].depth])
    .attr("filter", "url(#bar-shadow)")

    // Labels
    barGroups.append("text")
    .attr("class", "bar-label")
    .attr("x", id => {
        const e = goroutineMap[id];
        return (xScale(e.start) + xScale(e.end)) / 2;
    })
    .attr("y", (_, i) => rowCentreY(i))
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill", labelColour)
    .attr("font-size", "11px")
    .attr("pointer-events", "none")
    .attr("paint-order", "stroke")
    .attr("stroke", "#00000066")
    .attr("stroke-width", 2)
    .text(id => {
        const event = goroutineMap[id];

        // Add the goroutine duration to the label
        const duration = event.end - event.start;
        const durStr = duration < 0.000001 ? `${(duration * 1e9).toFixed(0)}ns`
            : duration < 0.001 ? `${(duration * 1e6).toFixed(1)}µs`
            : duration < 1 ? `${(duration * 1000).toFixed(2)}ms`
            : `${duration.toFixed(3)}s`;

        const name = event.name !== "" ? event.name : `id:${event.id}`;

        return `${name} (${durStr})`;
    });
}

/**
 * Calculates Y coordinate of the vertical centre  
 */
function rowCentreY(rowIndex) {
    return topPadding + rowIndex * rowStride + barHeight / 2;
}