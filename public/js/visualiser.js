import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const container = document.querySelector(".threejs");
const output = document.querySelector(".output");
const playButton = document.getElementById("play-button");
const restartButton = document.getElementById("restart-button");

// Create renderer and append to DOM
const renderer = new THREE.WebGLRenderer({ antialias: true });
container.appendChild(renderer.domElement);

// Create label renderer and append to DOM
const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
container.appendChild(labelRenderer.domElement);

// Layers
const gridLayer = 1;
const goroutineIdLayer = 2;
const channelValueLayer = 3;

// Colours
const backgroundColour = 0x3c3c3d;
const goroutineColour = 0xbf4640;
const connectorColour = 0xd9d0d0;
const channelColour = 0xf4d950;

// Camera settings
const fov = 75;
const aspect = container.clientWidth / container.clientHeight;
const near = 0.01;
const far = 100;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.layers.enableAll();
camera.layers.disable(gridLayer);
camera.position.set(0, 2, 2);

// Control settings
const controls = new OrbitControls(camera, labelRenderer.domElement);

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(backgroundColour);

// Add grid to scene
const grid = new THREE.GridHelper(100, 100);
grid.layers.set(gridLayer);
scene.add(grid);

// Line materials

const goroutineMat = new LineMaterial({
    color: goroutineColour,
    linewidth: 3,
    dashed: false,
    alphaToCoverage: true
});

const connectorMat = new LineMaterial({
    color: connectorColour,
    linewidth: 0.5,
    dashed: false,
    alphaToCoverage: true
});

const quickSettings = {
    "Toggle Goroutine IDs": function () {
        camera.layers.toggle(goroutineIdLayer);
    },
    "Toggle Channel Values": function () {
        camera.layers.toggle(channelValueLayer);
    },
    "Toggle Grid": function () {
        camera.layers.toggle(gridLayer);
    },
    "Reset Camera": function () {
        controls.reset();
    },
    timeScale: 1,
};

const gui = new GUI({ container: container });
gui.title("Settings");
gui.add(quickSettings, "Toggle Goroutine IDs");
gui.add(quickSettings, "Toggle Channel Values");
gui.add(quickSettings, "Toggle Grid");
gui.add(quickSettings, "Reset Camera");
gui.add(quickSettings, "timeScale", 0.1, 10).name("Time Scale");
gui.open();

let goroutineMap = {};
let channelMap = {};

const direction = -1;
let duration;
let yOffset;
let distScale = 1 * direction;
let timeScale = 1;

let playing = false;
let currentTime = 0;
let startTime;

/**
 * Resizes renderer to fit current window size
 */
function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setSize(width, height);
    labelRenderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    goroutineMat.resolution.set(width, height);
    connectorMat.resolution.set(width, height);
}

window.addEventListener("resize", resize);
resize();

/**
 * Resets event data and removes all objects from the scene apart from the grid
 */
function resetScene() {
    goroutineMap = {};
    channelMap = {};

    playing = false;
    
    scene.remove.apply(scene, scene.children);
    scene.add(grid);

    labelRenderer.domElement.innerHTML = '';
}

/**
 * entry point for visualiser, takes in events data and sets up scene
 * @param {any} events - The events json data object
 */
export function init(events) {
    resetScene();

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
                    line: null, 
                    startConn: null, 
                    endConn: null, 
                    children: [] };
            }

            if (e.event === "create-goroutine") {                
                goroutineMap[e.id].start = e.time;
            }

            if (e.event === "end-goroutine") {
                goroutineMap[e.id].end = e.time;
            }
        }

        if (e.event === "send-channel" || e.event === "receive-channel") {
            if (!channelMap[e.id]) {
                channelMap[e.id] = {
                    id: e.id,
                    value: null,
                    receiveTime: null,
                    sendTime: null,
                    to: null,
                    from: null,
                    line: null, 
                };
            }

            if (e.event === "send-channel") {                
                channelMap[e.id].from = e.parentId;
                channelMap[e.id].sendTime = e.time;
                channelMap[e.id].value = e.value;
            }

            if (e.event === "receive-channel") {
                channelMap[e.id].to = e.parentId;
                channelMap[e.id].receiveTime = e.time;
            }
        }
    }    

    // Sort goroutine map by time, then add all children to each event
    Object.values(goroutineMap)
        .sort((a, b) => a.start - b.start)
        .forEach(e => {         
        if (e.parentId && goroutineMap[e.parentId]) {            
            goroutineMap[e.parentId].children.push(e.id);
        }
    });

    let mainGoroutine = goroutineMap[1]; // id of 1 is always main goroutine
    duration = mainGoroutine.end;
    yOffset = duration * direction;
    displayStats();
    drawGoroutine(mainGoroutine, 0, 0, 0);
    drawChannels();
    updateScene(0); 

    // Adjust camera to look at new main position   
    controls.reset();
    controls.target.set(0, -yOffset / 2, 0);
    camera.position.y = -yOffset + 1;
    camera.position.z = -yOffset;
    controls.update();

    playButton.disabled = false;
}

/**
 * Prints useful messages to the output window 
 */
function displayStats()
{
    output.textContent = "Click 'play animation' to replay the concurrent program.\n";
    output.textContent += "Use your mouse to move around the scene.\n";

    output.textContent += `\nPROGRAM STATS:\n`;

    output.textContent += `Your program lasted ${duration} seconds.\n`;

    const numGoroutines = Object.values(goroutineMap).length;
    output.textContent += `You created ${numGoroutines - 1} goroutine(s).\n`;

    // TODO other stats
}

/**
 * Spawns a goroutine line and it's parent connector lines, and stores the lines in the event object
 * @param {any} event - The goroutine event object
 * @param {integer} childNo - The child number of this event
 * @param {integer} noChildren - The number of children the parent has
 * @param {integer} depth - The depth from the main goroutine
 */
function drawGoroutine(event, childNo, noChildren, depth) { 
    if (event.end === null) // Assume main goroutine ended first
        event.end = duration;

    let startPos = new THREE.Vector3(0, (yOffset + event.start) * distScale, 0);
    let endPos = new THREE.Vector3(0, (yOffset + event.end) * distScale, 0);

    if (event.parentId !== "") {
        // Set spawn point radially around parent
        const parent = goroutineMap[event.parentId];
        // Assume parent already has line set, since this function would have been called before
        const parentLinePos = parent.line.geometry.attributes.instanceStart.array;
        
        if (noChildren == 2) noChildren = 3 // So they don't sit opposite
        const angle = (360 / noChildren) * childNo;
        const rad = angle * (Math.PI / 180);

        startPos = new THREE.Vector3(parentLinePos[0] + Math.cos(rad) * (1 / (depth*depth)), (yOffset + event.start) * distScale, parentLinePos[2] + Math.sin(rad) * (1 / (depth*depth)));
        endPos = new THREE.Vector3(parentLinePos[3] + Math.cos(rad) * (1 / (depth*depth)), (yOffset + event.end) * distScale, parentLinePos[5] + Math.sin(rad) * (1 / (depth*depth)));

        // Draw connector lines and store in goroutine map
        const startConnGeo = new LineGeometry();
        startConnGeo.setPositions([
            startPos.x, startPos.y, startPos.z,
            parentLinePos[0], startPos.y, parentLinePos[2]
        ]);
        const startConn = new Line2(startConnGeo, connectorMat);
        startConn.computeLineDistances;

        event.startConn = startConn;
        scene.add(startConn);

        // Check parent hasn't already ended before creating end connector
        if (parent.end >= event.end) {
            const endConnGeo = new LineGeometry();
            endConnGeo.setPositions([
                endPos.x, endPos.y, endPos.z,
                parentLinePos[3], endPos.y, parentLinePos[5]
            ]);
            const endConn = new Line2(endConnGeo, connectorMat);
            endConn.computeLineDistances;

            event.endConn = endConn;
            scene.add(endConn);
        }
    }

    // Draw goroutine line and store in goroutine map
    const goroutineGeo = new LineGeometry();
    goroutineGeo.setPositions([
        startPos.x, startPos.y, startPos.z,
        endPos.x, endPos.y, endPos.z
    ]);
    const line = new Line2(goroutineGeo, goroutineMat);
    line.computeLineDistances;
    
    event.line = line;
    scene.add(line);
    
    // Create label with goroutine Id above line
    const idDiv = document.createElement("div");
    idDiv.className = "label";
    idDiv.textContent = `id:${event.id}`;
    if (event.name !== "") 
        idDiv.textContent = event.name;
    
    const idLabel = new CSS2DObject(idDiv);
    idLabel.position.set(startPos.x, startPos.y, startPos.z);
    idLabel.center.set(0, 1);
    idLabel.layers.set(goroutineIdLayer);
    idLabel.name = "id";
    event.line.add(idLabel);

    // Recursively call for each child, increasing the depth
    depth++;
    const children = event.children;

    for (let i = 0; i < children.length; i++) {
        const child = goroutineMap[children[i]];
        drawGoroutine(child, i + 1, children.length, depth);
    }
}

/**
 * Draws all channel lines
 */
function drawChannels() {
    Object.values(channelMap)
        .forEach(event => {
            // Skip if there were never a pair
            if (event.from === null || event.to === null) {
                return;
            }

            const from = goroutineMap[event.from];
            const to = goroutineMap[event.to];

            // For now, don't deal with it if parent doesn't have line for whatever reason
            if (from.line === null || to.line === null) {
                return;
            }

            const fromLine = from.line.geometry.attributes.instanceStart.array;
            const toLine = to.line.geometry.attributes.instanceStart.array;

            const startPos = new THREE.Vector3(fromLine[0], (yOffset + event.sendTime) * distScale, fromLine[2]);
            const endPos = new THREE.Vector3(toLine[0], (yOffset + event.receiveTime) * distScale, toLine[2]);

            // Draw channel line with arrow and store in channel map
            const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
            const length = startPos.distanceTo(endPos);
            const arrowedLine = new THREE.ArrowHelper(direction, startPos, length, channelColour, 0.1, 0.05);

            event.line = arrowedLine;
            scene.add(arrowedLine);

            // Create label with channel value between line
            if (event.value !== "") {
                const midpoint = new THREE.Vector3();
                midpoint.addVectors(startPos, endPos).divideScalar(2);

                const valueDiv = document.createElement("div");
                valueDiv.className = "label";
                valueDiv.textContent = event.value;
                
                const valueLabel = new CSS2DObject(valueDiv);
                valueLabel.position.set(0, length / 2, 0);
                valueLabel.center.set(0, 1);
                valueLabel.layers.set(channelValueLayer);
                valueLabel.name = "value";
                event.line.add(valueLabel);
            }
    });
}

playButton.addEventListener("click", () => {   
    playing = true;
    startTime = performance.now();
});

restartButton.addEventListener("click", () => {
    playing = false;
    updateScene(0);
});

/**
 * Redraws all lines depending on the time 
 * @param {integer} time - The time in seconds since user program started
 */
function updateScene(time) {    
    // Update goroutine line positions depending on t
    Object.values(goroutineMap).forEach(event => {
        const geo = event.line.geometry;
        const positions = geo.attributes.instanceStart.array;

        if (time < event.start) {
            // Hide line
            positions[4] = (yOffset + event.start) * distScale; 

            event.line.visible = false;
            event.line.getObjectByName("id").visible = false;

            if (event.startConn) event.startConn.visible = false;
            if (event.endConn) event.endConn.visible = false;
        }
        if (time >= event.end) {
            // Show line
            positions[4] = (yOffset + event.end) * distScale; 

            event.line.visible = true;
            event.line.getObjectByName("id").visible = true;

            if (event.startConn) event.startConn.visible = true;
            if (event.endConn) event.endConn.visible = true;
        }
        if (time >= event.start && time < event.end) {
            // Set end point y to time
            positions[4] = (yOffset + time) * distScale; 

            event.line.visible = true;
            event.line.getObjectByName("id").visible = true;

            if (event.startConn) event.startConn.visible = true;
            if (event.endConn) event.endConn.visible = false;
        }

        geo.attributes.instanceStart.needsUpdate = true;
        geo.attributes.instanceEnd.needsUpdate = true;
        event.line.computeLineDistances();
    });

    // Update channel visibility if t has passed send time
    Object.values(channelMap).forEach(event => {
        if (time < event.sendTime) {
            // Hide line
            if (event.line) {
                event.line.visible = false;
                if (event.value)
                    event.line.getObjectByName("value").visible = false;
            }
        }
        if (time >= event.sendTime) {
            // Show line
            if (event.line) {
                event.line.visible = true;
                if (event.value)
                    event.line.getObjectByName("value").visible = true;
            }
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    timeScale = quickSettings.timeScale;

    if (playing) {
        // Set current time in seconds based on when play button is clicked
        currentTime = timeScale * ((performance.now() - startTime) / 1000);

        if (currentTime >= duration) {
            playing = false;
        }

        updateScene(currentTime);
    }

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

animate();