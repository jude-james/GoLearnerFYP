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
const near = 0.01;
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

//let offset = 0; // later become depth

let duration;

// TODO this is distance scale, add time scale separately which actually scales t 
let timeScale = 2;

/**
 * entry point for visualiser, takes in events data and sets up scene
 * @param {any} events - The events json data object
 */
export function init(events) {
    console.log("Init");

    output.textContent = "Click play to replay what happened in the program";

    // Reset everything, TODO move to separate func and do properly
    map = {}; // Currently only for goroutines, add separate threads one?
    //offset = 0;
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

    drawRecursive(mainGoroutine, 0, 0, 0);    
}

// TODO comment + rename + don't actually draw to start with, just store and let update draw
function drawRecursive(event, childNo, noChildren, depth) { // pass in some depth or something?
    //console.log("Drawing line:", event);
    //console.log("depth:", depth);
    
    let startPos;
    let endPos;

    if (event.parentId !== "") {
        const parent = map[event.parentId];

        const angle = (360 / noChildren) * childNo;
        //console.log(angle);
            if (event.parentId === "1") console.log(angle);

        startPos = new THREE.Vector3(parent.line.geometry.attributes.instanceStart.array[0] + Math.cos(angle) * (1 / (depth*depth)), event.start * timeScale, parent.line.geometry.attributes.instanceStart.array[2] + Math.sin(angle) * (1 / (depth*depth)));
        endPos = new THREE.Vector3(parent.line.geometry.attributes.instanceStart.array[3] + Math.cos(angle) * (1 / (depth*depth)), event.end * timeScale, parent.line.geometry.attributes.instanceStart.array[5] + Math.sin(angle) * (1 / (depth*depth)));
    }
    else {
        startPos = new THREE.Vector3(0, event.start * timeScale, 0);
        endPos = new THREE.Vector3(0, event.end * timeScale, 0);
    }
    

    // 1. Draw line
    const geometry = new LineGeometry();
    geometry.setPositions([
        /*
        0, event.start * timeScale, offset,
        0, event.end * timeScale, offset*/
        startPos.x, startPos.y, startPos.z,
        endPos.x, endPos.y, endPos.z
    ]);

    const line = new Line2(geometry, material);
    line.computeLineDistances;
    
    event.line = line;
    scene.add(line);
    
    // draw connectors and store start and end connectors in map
    if (event.parentId !== "") {
        // It has a parent
        const parent = map[event.parentId];

        // Start connector
        const geometry = new LineGeometry();
        geometry.setPositions([
            /*
            0, event.start * timeScale, offset,
            // get parent line, not the best but rn it's guaranteed that the parent line is already set
            0, event.start * timeScale, parent.line.geometry.attributes.instanceStart.array[2]*/
            startPos.x, startPos.y, startPos.z,
            // pass parent line into function?
            parent.line.geometry.attributes.instanceStart.array[0], startPos.y, parent.line.geometry.attributes.instanceStart.array[2]
        ]);

        const startConn = new Line2(geometry, materialConnector);
        startConn.computeLineDistances;

        event.startConn = startConn;
        scene.add(startConn);

        // End connectors
        // check if parent has ended already, then don't show end connector
        if (parent.end >= event.end) {
            const geometry2 = new LineGeometry();
            geometry2.setPositions([
                /*
                0, event.end * timeScale, offset,
                0, event.end * timeScale, parent.line.geometry.attributes.instanceStart.array[2]
                */
                endPos.x, endPos.y, endPos.z,
                // pass parent line into function?
                parent.line.geometry.attributes.instanceStart.array[0], endPos.y, parent.line.geometry.attributes.instanceStart.array[2]
            ]);

            const endConn = new Line2(geometry2, materialConnector);
            endConn.computeLineDistances;

            event.endConn = endConn;
            scene.add(endConn);
        }
        
    }

    //offset++;

    // 2. loop through children
    const children = event.children;
    //console.log("This even has children:", children);

    depth++;
    for (let i = 0; i < children.length; i++) {
        drawRecursive(map[children[i]], i+1, children.length, depth);
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
    
    // For each t that passes, loop through event map and update the line completion depending on the time
    Object.values(map).forEach(e => {
        const g = e.line.geometry;
        const positions = g.attributes.instanceStart.array;

        if (t < e.start) {
            // hide whole line
            //e.line.visible = false; // Use this?
            positions[4] = e.start * timeScale;

            // if its not null ie not main
            if (e.startConn) {
                e.startConn.visible = false;            
            }
            if (e.endConn) {
                e.endConn.visible = false;
            }
        }
        if (t > e.end) {
            // show whole line
            positions[4] = e.end * timeScale;

            if (e.startConn) {
                e.startConn.visible = true;
            }
            if (e.endConn) {
                e.endConn.visible = true;
            }
        }

        if (t >= e.start && t < e.end) {
            positions[4] = t * timeScale; // 3 = end point x;

            /*
            g.setPositions([
                e.start, 0, offset,
                t, 0,
            ]);*/
            if (e.startConn) {
                e.startConn.visible = true;
            }
            if (e.endConn) {
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