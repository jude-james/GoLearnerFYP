import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const container = document.querySelector(".right-panel");

const width = container.clientWidth;
const height = container.clientHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);

container.appendChild(renderer.domElement);

const fov = 75;
const aspect = width / height;
const near = 0.1;
const far = 10;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

function resize() {
    const width = container.clientWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const controls = new OrbitControls(camera, renderer.domElement);
//controls.enableDamping = true;
controls.dampingFactor = 0.03;

const geo = new THREE.IcosahedronGeometry(1.0, 2);
const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true });
const mesh = new THREE.Mesh(geo, mat);

scene.add(mesh);

const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true});
const wireMesh = new THREE.Mesh(geo, wireMat);
wireMesh.scale.setScalar(1.001);
mesh.add(wireMesh);

const hemiLight = new THREE.HemisphereLight(0x0099ff, 0xaa5500);
scene.add(hemiLight);

// Line
const startPoint = new THREE.Vector3(-2, 0, 0);
const endPoint = new THREE.Vector3(2, 2, 1);
const duration = 5;
const positions = new Float32Array(6);
const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const material = new THREE.LineBasicMaterial({ color: 0x00ffcc });
const line = new THREE.Line(geometry, material);
scene.add(line);

// Sphere
const sphereGeo = new THREE.SphereGeometry(0.1, 16, 16);
const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
const movingSphere = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(movingSphere);

let startTime = null;
let playing = false;
let currentTime = 0;

const playBtn = document.getElementById("play");

playBtn.addEventListener("click", () => {
    console.log("Play");
  startTime = performance.now() - currentTime * 1000;
  playing = true;
});

function updateScene(t) {
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

  geometry.attributes.position.needsUpdate = true;

  // Move sphere
  movingSphere.position.copy(currentPoint);

  //timeLabel.textContent = currentTime.toFixed(2) + "s";
}

function animate(t = 0) {
    requestAnimationFrame(animate);
    mesh.rotation.y = t * 0.0001;

    if (playing) {
        currentTime = (performance.now() - startTime) / 1000;

        if (currentTime >= duration) {
        currentTime = duration;
        playing = false;
        }

        //slider.value = currentTime;
        updateScene(currentTime / duration);
    }

    controls.update();
    renderer.render(scene, camera);
}

updateScene(0);
animate();