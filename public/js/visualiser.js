import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

const container = document.querySelector(".threejs");
const output = document.querySelector(".output");
const playButton = document.getElementById("play-button");

// Create renderer and add to DOM
const renderer = new THREE.WebGLRenderer({ antialias: true });
container.appendChild(renderer.domElement);

// Camera settings
const fov = 75;
const aspect = container.clientWidth / container.clientHeight;
const near = 0.1;
const far = 100;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 2, 2);

// Control settings
const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.03;

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbebebe);

// Add grid to scene
const grid = new THREE.GridHelper(100, 100);
scene.add(grid);

// Goroutine line material
const material = new LineMaterial({
    color: 0x1c3471, // blue
    linewidth: 6,
    dashed: false,
    alphaToCoverage: true
});

const materialConnector = new LineMaterial({
    color: 0x1c3471, // blue
    linewidth: 1,
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
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Fix material glitch TODO do this for every new material for different line thicknesses
    material.resolution.set(width, height);
    materialConnector.resolution.set(width, height);
}

window.addEventListener("resize", resize);
resize();

let map = {};

let offset = 0; // later become depth

let duration;

/**
 * entry point for visualiser, takes in events data and sets up scene
 * @param {any} events - The events json data object
 */
export function init(events) {
    console.log("Init");

    output.textContent = "Click play to replay what happened in the program";

    // Reset everything, TODO move to separate func and do properly
    map = {}; // Currently only for goroutines, add separate threads one?
    offset = 0;
    scene.remove.apply(scene, scene.children);
    scene.add(grid);

    for (let i = 0; i < events.length; i++) {
        const e = events[i];

        // Pair goroutine events together, combining start and end times
        if (e.event === "create-goroutine" || e.event === "end-goroutine") {
            if (!map[e.id]) {
                map[e.id] = { id: e.id, parentId: e.parentId, start: null, end: null, line: null, startConn: null, endConn: null, children: [] };
            }

            if (e.event === "create-goroutine") {
                map[e.id].start = e.time;
            }

            if (e.event === "end-goroutine") {
                map[e.id].end   = e.time;
            }
        }
    }    

    // Add all children to each event
    Object.values(map).forEach(e => {
        if (e.parentId && map[e.parentId]) {            
            map[e.parentId].children.push(e.id);
        }
    });
    
    let mainGoroutine = map[1]; // 1 is always main goroutine
    duration = mainGoroutine.end;
    // TODO set main text here

    drawRecursive(mainGoroutine);    
}

// TODO comment
function drawRecursive(event) { // pass in some depth or something?
    console.log("Drawing line:", event);
    
    // 1. Draw line
    const startPoint = new THREE.Vector3(event.start, 0, offset); 
    // TODO dont even need these vector 3s
    const endPoint = new THREE.Vector3(event.end, 0, offset);

    const geometry = new LineGeometry();
    geometry.setPositions([
        startPoint.x, startPoint.y, startPoint.z,
        endPoint.x, endPoint.y, endPoint.z
    ]);

    const line = new Line2(geometry, material);
    line.computeLineDistances;

    event.line = line;
    scene.add(line);
    
    // Create and draw connector lines here?
    // draw connectors
    // store pair of connectors in map
    if (event.parentId !== "") {
        // It has a parent
        const parent = map[event.parentId];

        // Start connector
        const geometry = new LineGeometry();
        geometry.setPositions([
            event.start, 0, offset,
            // get parent line, not the best but rn it's guaranteed that the parent line is already set
            event.start, 0, parent.line.geometry.attributes.instanceStart.array[2]
        ]);

        const connectorLine = new Line2(geometry, materialConnector);
        connectorLine.computeLineDistances;

        event.startConn = connectorLine;
        scene.add(connectorLine);

        
        // End connectors
        const geometry2 = new LineGeometry();
        geometry2.setPositions([
            event.end, 0, offset,
            event.end, 0, parent.line.geometry.attributes.instanceStart.array[2]
        ]);

        const connectorLine2 = new Line2(geometry2, materialConnector);
        connectorLine2.computeLineDistances;

        event.endConn = connectorLine2;
        scene.add(connectorLine2);
    }

    offset++;

    // 2. loop through children
    const children = event.children;
    console.log("This even has children:", children);

    for (let i = 0; i < children.length; i++) {
        //event = map[children[i]];
        drawRecursive(map[children[i]]);
    }
}

let playing = false;
let startTime;
let currentTime = 0;

playButton.addEventListener("click", () => {
    // TODO disable button until they are allowed to play

    startTime = performance.now();
    currentTime = 0;
    playing = true;

    //updateScene(1.5); // testing hard coded time for now
});

function updateScene(t) {
    //console.log("setting to:", t);
    
    Object.values(map).forEach(e => {
        const g = e.line.geometry;
        const positions = g.attributes.instanceStart.array;

        //const startConnG = e.startConn.geometry;
        //const startConnPositions = startConnG.attributes.instanceStart.array;
        //const endConnG = e.endConn.geometry;

        if (t < e.start) {
            // hide whole line
            //e.line.visible = false; // Use this?
            positions[3] = e.start;

            // if its not null ie not main
            if (e.startConn) {
                e.startConn.visible = false;            
                e.endConn.visible = false;
            }
        }
        if (t > e.end) {
            // show whole line
            positions[3] = e.end;

            if (e.startConn) {
                e.endConn.visible = true;
                e.startConn.visible = true;
            }
        }

        if (t >= e.start && t < e.end) {
            positions[3] = t; // 3 = end point x;

            /*
            g.setPositions([
                e.start, 0, offset,
                t, 0,
            ]);*/
            if (e.startConn) {
                e.startConn.visible = true;
                e.endConn.visible = false;
            }
        }

        g.attributes.instanceStart.needsUpdate = true;
        g.attributes.instanceEnd.needsUpdate = true;
        e.line.computeLineDistances();
    });
}

function animate(t = 0) {
    requestAnimationFrame(animate);
    
    if (playing) {
        currentTime = (performance.now() - startTime) / 1000;

        if (currentTime >= duration) {
            currentTime = duration;
            playing = false;
        }

        //slider.value = currentTime;
        updateScene(currentTime);
    }

    //controls.update();
    renderer.render(scene, camera);
}

//updateScene(0);
animate();