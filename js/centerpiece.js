import {delay} from './utils.js'

let scene, camera, renderer;
//--- clock for framerate independent speed ---
const clock = new THREE.Clock();

const particles = [];
const velocities = [];

const NUM_PARTICLES = 140;
const MAX__RADIUS = 0.7;
//--- max history -> trail length ---
const MAX_HISTORY = 150;   
const TRAIL_SPACING = 0.5;
//--- particle distribution -> >1 -> more particles in front ---
let distributionExponent = 7.5;

let cometMode = false;
let mouseHistory = [];

// --- Raycasting for correct mouse position ---
const raycaster = new THREE.Raycaster();
// --- normalited mouse position and 3d after raycasting ---
const mouseNDC = new THREE.Vector2();
const mousePos = new THREE.Vector3();

const centerpieceDiv = document.querySelector(".centerPiece");

export function eventHandlerCenterPieceOn() {
    window.addEventListener("pointermove", onPointerMove, false);
    window.addEventListener("resize", onWindowResize, false);
    window.addEventListener("pointerover", onPointerOver, false);
}
export function eventHandlerCenterPieceOff() {
    window.removeEventListener("pointermove", onPointerMove, false);
    window.removeEventListener("resize", onWindowResize, false);
}
function onPointerMove(event) {
    // --- centerPiece bounding ---
    const rect = centerpieceDiv.getBoundingClientRect();
    // --- mouse positions relative to centerPiece ---
    mouseNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // --- raycast from camera to z=0 plane intersection -> mousePos ---
    raycaster.setFromCamera(mouseNDC, camera);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    raycaster.ray.intersectPlane(planeZ, mousePos);
    // --- default mouse position ---
    if (!mousePos) {
        mousePos.set(0, 0, 0);
    }
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function init() {
    // --- setup scene and camera ---
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 2;
    // --- setup renderer ---
    renderer = new THREE.WebGLRenderer({ antialias: true , alpha: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    centerpieceDiv.appendChild(renderer.domElement);
    // --- setup particles with random inital pos and velocity ---
    const planeGeom = new THREE.PlaneGeometry(0.03, 0.03);
    const planeMat = new THREE.MeshBasicMaterial({ color: 0x292828, side: THREE.DoubleSide });

    for (let i = 0; i < NUM_PARTICLES; i++) {
        const mesh = new THREE.Mesh(planeGeom, planeMat);
        mesh.position.set(
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 1.4
        );
        const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
        );
        particles.push(mesh);
        velocities.push(velocity);
        scene.add(mesh);
    }
    eventHandlerCenterPieceOn()
}
function animate() {
    requestAnimationFrame(animate);
    // --- frame independant speed -> time elapsed since last frame ---
    const deltaTime = clock.getDelta();
    // --- limit delta to avoid large jumps
    const maxDelta = 0.05;
    const normalizedDelta = Math.min(deltaTime, maxDelta);

    // --- mouseHistory with mouse pos for comet trail and length---
    mouseHistory.push(mousePos.clone());
    if (mouseHistory.length > MAX_HISTORY) {
        mouseHistory.shift();
    }
    const center = new THREE.Vector3(0, 0, 0);

    for (let i = 0; i < NUM_PARTICLES; i++) {
        const mesh = particles[i];
        const velocity = velocities[i];

        if (!cometMode) {
        //--- default circle mode ---
            // --- swirl around center ---
            const toCenter = center.clone().sub(mesh.position);
            const swirlStrength = 0.0022;
            const swirlForce = new THREE.Vector3(-toCenter.y, toCenter.x, 0).multiplyScalar(swirlStrength);
            const distFromCenter = mesh.position.length();
            // --- keep particle from flying away -> pull back ---
            velocity.add(swirlForce);            
            if (distFromCenter > MAX__RADIUS) {
                const pullBackStrength = 0.005 * (distFromCenter - MAX__RADIUS + 1);
                const pullForce = center.clone().sub(mesh.position).multiplyScalar(pullBackStrength);
                velocity.add(pullForce);
            }
            // --- movement noise ---
            const noiseStrength = 0.001;
            velocity.x += (Math.random() - 0.5) * noiseStrength;
            velocity.y += (Math.random() - 0.5) * noiseStrength;
            velocity.z += (Math.random() - 0.5) * noiseStrength;
            // --- particles avoid mouse pos ---
            const toMouse = mesh.position.clone().sub(mousePos);
            const distanceToMouse = toMouse.length();
            const avoidRadius = 0.3;
            if (distanceToMouse < avoidRadius) {
                const avoidForceStrength = 0.01;
                const avoidForce = toMouse.normalize().multiplyScalar(avoidForceStrength);
                velocity.add(avoidForce);
            }
        } else {
        // --- comet trail mode ---
            // --- damp trail movements ---
            const dampingFactor = 0.93;
            velocity.multiplyScalar(dampingFactor);
            // --- more particles near the front ---
            const iNormalized = i / (NUM_PARTICLES - 1);
            const offset = Math.floor(TRAIL_SPACING * (mouseHistory.length - 1) * Math.pow(iNormalized, distributionExponent));
            let targetIndex = mouseHistory.length - 1 - offset;
            if (targetIndex < 0) targetIndex = 0;
            const targetPos = mouseHistory[targetIndex] || mousePos;
            // --- seek target mouse ---
            const seekStrength = 0.006;
            const toTarget = targetPos.clone().sub(mesh.position);
            velocity.add(toTarget.multiplyScalar(seekStrength));
            // --- add movement noise ---
            const noiseStrength = 0.004;
            velocity.x += (Math.random() - 0.5) * noiseStrength;
            velocity.y += (Math.random() - 0.5) * noiseStrength;
            velocity.z += (Math.random() - 0.5) * noiseStrength;
            // --- keep them from going away too far ---
            const distFromCenter = mesh.position.length();
            if (distFromCenter > MAX__RADIUS * 2) {
                const pullBackStrength = 0.0002 * (distFromCenter - MAX__RADIUS + 1);
                const pullForce = center.clone().sub(mesh.position).multiplyScalar(pullBackStrength);
                velocity.add(pullForce);
            }
        }
        // --- move particles and limit speed ---
        mesh.position.addScaledVector(velocity, normalizedDelta * 60);
        const maxSpeed = 0.033;
        if (velocity.length() > maxSpeed) {
            velocity.setLength(maxSpeed);
        }
    }
    renderer.render(scene, camera);
}
// --- switch to comet mode when hovering nav zone -> menu/ new view sections ---
async function onPointerOver(event) {
    const navZoneElement = event.target.closest('[data-nav-zone]');
    if (navZoneElement) {
        cometMode = true;
    } else {
        await delay(3000);
        cometMode = false;
    }
}
init();
animate();