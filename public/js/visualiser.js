import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const container = document.querySelector(".threejs");
const output = document.querySelector(".output");
const playButton = document.getElementById("play-button");

// Create renderer and append to DOM
const renderer = new THREE.WebGLRenderer({ antialias: true });
container.appendChild(renderer.domElement);

// Create label renderer and append to DOM
const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
container.appendChild(labelRenderer.domElement);

// Camera settings
const fov = 75;
const aspect = container.clientWidth / window.innerHeight;
const near = 0.01;
const far = 100;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.layers.enableAll();
camera.position.set(0, 2, 2);

// Control settings
const controls = new OrbitControls(camera, labelRenderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.03;

// Colours
const backgroundColour = 0xf5f5f5;
const goroutineColour = 0x3347ff;

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(backgroundColour);

// Add grid to scene
const grid = new THREE.GridHelper(100, 100);
scene.add(grid);

// Line materials

const goroutineMat = new LineMaterial({
    color: goroutineColour,
    linewidth: 3,
    dashed: false,
    alphaToCoverage: true
});

const connectorMat = new LineMaterial({
    color: goroutineColour, // TODO add slightly different colour
    linewidth: 0.5,
    dashed: false,
    alphaToCoverage: true
});

/**
 * Resizes renderer to fix current window size
 */
function resize() {
    const width = container.clientWidth;
    const height = window.innerHeight;

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
    scene.remove.apply(scene, scene.children);
    scene.add(grid);
}

let goroutineMap = {}; // TODO add channels

let duration;

const direction = -1;
// TODO add controls for these
let yOffset;
let distScale = 10 * direction;
let timeScale = 1/10;

/**
 * entry point for visualiser, takes in events data and sets up scene
 * @param {any} events - The events json data object
 */
export function init(events) {
    resetScene();
    output.textContent = "Click play to replay what happened in the program";

    for (let i = 0; i < events.length; i++) {
        const e = events[i];

        // Pair goroutine events together, combining start and end times
        if (e.event === "create-goroutine" || e.event === "end-goroutine") {
            if (!goroutineMap[e.id]) {     
                // Create a new entry for each new Id           
                goroutineMap[e.id] = { 
                    id: e.id, // TODO need this? why is it breaking?
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
    }    

    // Add all children to each event
    Object.values(goroutineMap).forEach(e => {
        if (e.parentId && goroutineMap[e.parentId]) {            
            goroutineMap[e.parentId].children.push(e.id);
        }
    });
    
    let mainGoroutine = goroutineMap[1]; // id of 1 is always main goroutine
    duration = mainGoroutine.end;
    yOffset = duration * direction;
    drawGoroutine(mainGoroutine, 0, 0, 0);
}

/**
 * Spawns a goroutine line and it's parent connector lines, and stores the lines in the event object
 * @param {any} event - The goroutine event object
 * @param {integer} childNo - The child number of this event
 * @param {integer} noChildren - The number of children the parent has
 * @param {integer} depth - The depth from the main goroutine
 */
function drawGoroutine(event, childNo, noChildren, depth) { 
    // TODO Eventually set end y to 0 so it starts invisible, just store and let update draw

    let startPos = new THREE.Vector3(0, (yOffset + event.start) * distScale, 0);
    let endPos = new THREE.Vector3(0, (yOffset + event.end) * distScale, 0);

    if (event.parentId !== "") {
        // Set spawn point radially around parent
        const parent = goroutineMap[event.parentId];
        // Assume parent already has line set, since this function would have been called before
        const parentLinePos = parent.line.geometry.attributes.instanceStart.array;
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
    if (event.id === "1") idDiv.textContent = "main";
    
    /*idDiv.style.backgroundColor = "transparent";*/
    const idLabel = new CSS2DObject(idDiv);
    idLabel.position.set(startPos.x, startPos.y, startPos.z);
    idLabel.center.set(0, 1); // ?
    idLabel.layers.set(0); // ?
    event.line.add(idLabel);

    // Recursively call for each child, increasing the depth
    depth++;
    const children = event.children;

    for (let i = 0; i < children.length; i++) {
        const child = goroutineMap[children[i]];
        drawGoroutine(child, i + 1, children.length, depth);
    }
}

let playing = false;
let currentTime = 0;
let startTime;

playButton.addEventListener("click", () => {
    // TODO disable button until they are allowed to play

    // Start the time from 0
    playing = true;
    currentTime = 0;
    startTime = performance.now();
});

function updateScene(t) {    
    // Update goroutine line positions depending on t
    Object.values(goroutineMap).forEach(event => {
        const geo = event.line.geometry;
        const positions = geo.attributes.instanceStart.array;

        // 4 = end point y;

        if (t < event.start) {
            // Hide line
            positions[4] = (yOffset + event.start) * distScale; // TODO disable fully to avoid dot

            if (event.startConn) event.startConn.visible = false;
            if (event.endConn) event.endConn.visible = false;
        }
        if (t >= event.end) {
            // show line
            positions[4] = (yOffset + event.end) * distScale;

            if (event.startConn) event.startConn.visible = true;
            if (event.endConn) event.endConn.visible = true;
        }
        if (t >= event.start && t < event.end) {
            positions[4] = (yOffset + t) * distScale; 

            if (event.startConn) event.startConn.visible = true;
            if (event.endConn) event.endConn.visible = false;
        }

        geo.attributes.instanceStart.needsUpdate = true;
        geo.attributes.instanceEnd.needsUpdate = true;
        event.line.computeLineDistances();
    });
}

function animate(t = 0) {
    requestAnimationFrame(animate);
    
    if (playing) {
        currentTime = timeScale * ((performance.now() - startTime) / 1000);
                
        if (currentTime >= duration) {
            currentTime = duration;
            playing = false;
        }

        //slider.value = currentTime;
        updateScene(currentTime);
    }

    //controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

animate();