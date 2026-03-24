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
scene.background = new THREE.Color(0xEBB1A4);

// Add grid to scene
const grid = new THREE.GridHelper(100, 100);
scene.add(grid);

// Goroutine line material
const material = new LineMaterial({
    color: 0xffffff,
    linewidth: 5,
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

    output.textContent = "...";

    // Reset everything TODO move to separate func and do properly
    map = {}; // Currently only for goroutines, add separate threads one?
    offset = 0;
    scene.remove.apply(scene, scene.children);
    scene.add(grid);

    for (let i = 0; i < events.length; i++) {
        const e = events[i];

        // Pair goroutine events together, combining start and end times
        if (e.event === "create-goroutine" || e.event === "end-goroutine") {
            if (!map[e.id]) {
                map[e.id] = { id: e.id, parentId: e.parentId, start: null, end: null, line: null, children: [] };
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
    
    offset++;

    // 2. loop through children
    const children = event.children;
    console.log("This even has children:", children);

    for (let i = 0; i < children.length; i++) {
        //event = map[children[i]];
        drawRecursive(map[children[i]]);
    }
}

// Line
//const startPoint = new THREE.Vector3(0, 0, 0);
//const endPoint = new THREE.Vector3(10, 0, 0);
//const duration = 5; // will become main goroutine end time, full length of program
//const positions = new Float32Array(6);

// Sphere
//const sphereGeo = new THREE.SphereGeometry(0.1, 16, 16);
//const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
//const movingSphere = new THREE.Mesh(sphereGeo, sphereMat);
//scene.add(movingSphere);

let playing = false;
let startTime;
let currentTime = 0;

playButton.addEventListener("click", () => {
    // TODO disable button until they are allowed to play

    startTime = performance.now();
    playing = true;

    updateScene(1.5); // testing hard coded time for now
});

function updateScene(t) {
    console.log("setting to:", t);
    
    Object.values(map).forEach(e => {
        const g = e.line.geometry;
        const positions = g.attributes.instanceStart.array;

        if (t < e.start) {
            // hide whole line
            //e.line.visible = false; // Use this?
            positions[3] = e.start;
        }
        if (t > e.end) {
            // show whole line
            positions[3] = e.end;
        }

        if (t >= e.start && t < e.end) {
            positions[3] = t; // 3 = end point x;

            /*
            g.setPositions([
                e.start, 0, offset,
                t, 0,
            ]);*/
        }

        g.attributes.instanceStart.needsUpdate = true;
        g.attributes.instanceEnd.needsUpdate = true;
        e.line.computeLineDistances();
    });
    /*
    t = THREE.MathUtils.clamp(t, 0, 1);

    const currentPoint = new THREE.Vector3().lerpVectors(
        startPoint,
        endPoint,
        t
    );

    // Update line positions
    positions[0] = startPoint.x;
    positions[1] = startPoint.y;
    positions[2] = startPoint.z;

    positions[3] = currentPoint.x;
    positions[4] = currentPoint.y;
    positions[5] = currentPoint.z;

    //geometry.attributes.position.needsUpdate = true;

    //timeLabel.textContent = currentTime.toFixed(2) + "s";
    */
}

function animate(t = 0) {
    requestAnimationFrame(animate);
    
    if (playing) {
        currentTime = (performance.now() - startTime) / 1000;

        if (currentTime >= duration) {
            currentTime = 0;
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