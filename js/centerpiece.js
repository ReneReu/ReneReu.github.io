import {delay} from "./utils.js"

// --- consts ---
const NUM_PARTICLES = 120;
const NUM_PARTICLES_MOBILE = 80;
const MAX_SPEED = 0.033;
const MAX_DELTA = 0.05; // limit delta to avoid large jumps

// --- swirl ---
const MAX_RADIUS_DESKTOP = 0.7;
const MAX_RADIUS_MOBILE = 0.5;
const SWIRL_STRENGTH = 0.0022;
const SWIRL_NOISE_STRENGTH = 0.001;
const AVOID_RADIUS = 0.3;

// --- comet ---
const MAX_HISTORY = 150; // max history -> trail length
const TRAIL_SPACING = 0.5;
const DISTRIBUTION_EXPONENT = 7.5; // particle distribution >1 -> more particles in front
const SEEK_STRENGTH = 0.006;
const COMET_NOISE_STRENGTH = 0.004;
const DAMPING_FACTOR = 0.93;

const clock = new THREE.Clock();
const particles = [];
const velocities = [];
let scene, camera, renderer;
let isAnimating = true;

let mouseHistory = [];
let cometMode = false;
let lastTouchTime = 0;

let numParticles;
let maxRadius;

// --- Raycasting for correct mouse position ---
const raycaster = new THREE.Raycaster();
// --- normalited mouse position and 3d after raycasting ---
const mouseNDC = new THREE.Vector2();
const mousePos = new THREE.Vector3();

const centerpieceDiv = document.querySelector(".centerPiece");

function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia("(max-width: 768px)").matches;
}

export function setupCenterpiece() {
    cometMode = false;    
    if (isMobile()) {
        maxRadius = MAX_RADIUS_MOBILE;
        removeDesktopListener();
        addMobileListener();
    } else {
        maxRadius = MAX_RADIUS_DESKTOP;
        removeMobileListener();
        addDesktopListener();
    }
    if (!isAnimating) {
        isAnimating = true;
        animate();
    }
}
export function closeCenterpiece() {
    removeDesktopListener();
    removeMobileListener();
    isAnimating = false;
}
function addDesktopListener() {
    window.addEventListener("pointermove", onPointerMove, { passive: true });    
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("resize", onWindowResize);
}
function removeDesktopListener() {
    window.removeEventListener("pointermove", onPointerMove); 
    window.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("resize", onWindowResize);
}
function addMobileListener() {
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", onWindowResize);
}
function removeMobileListener() {
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("resize", onWindowResize);
}
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    // --- in case desktop/mobile switch happened ---
    setupCenterpiece();
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
}
function onMouseDown(event) {
    cometMode = true;
}
function onMouseUp(event) {
    cometMode = false;
}
// --- touch control ---
function onTouchStart(event) {
    const currentTime = new Date().getTime();
    const timeSinceLastTouch = currentTime - lastTouchTime;
    // --- double tap to activate comet mode ---
    if (timeSinceLastTouch < 300 && timeSinceLastTouch > 50) {
        cometMode = true;
    }
    lastTouchTime = currentTime;
    
    updateMousePosition(event.touches[0].clientX, event.touches[0].clientY);
}
function onTouchMove(event) {
    updateMousePosition(event.touches[0].clientX, event.touches[0].clientY);
}
function onTouchEnd() {
    cometMode = false;
    resetMousePosition();
}
function updateMousePosition(clientX, clientY) {
    const rect = centerpieceDiv.getBoundingClientRect();
    mouseNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseNDC, camera);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    raycaster.ray.intersectPlane(planeZ, mousePos);
}
function resetMousePosition() {
    mousePos.set(0, 0, 0);
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
    //
    if (isMobile()) {
        numParticles = NUM_PARTICLES_MOBILE;
    } else {
        numParticles = NUM_PARTICLES;
    }
    for (let i = 0; i < numParticles; i++) {
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
    setupCenterpiece();
    animate();
}
function animate() {
    if (!isAnimating) return;
    requestAnimationFrame(animate);
    // --- frame independant speed -> time elapsed since last frame ---
    const deltaTime = clock.getDelta();
    const normalizedDelta = Math.min(deltaTime, MAX_DELTA);
    // --- mouseHistory with mouse pos for comet trail and length---
    mouseHistory.push(mousePos.clone());
    if (mouseHistory.length > MAX_HISTORY) {
        mouseHistory.shift();
    }
    const center = new THREE.Vector3(0, 0, 0);

    for (let i = 0; i < numParticles; i++) {
        const mesh = particles[i];
        const velocity = velocities[i];

        if (!cometMode) {
        //--- default circle mode ---
            // --- swirl around center ---
            const toCenter = center.clone().sub(mesh.position);
            const swirlForce = new THREE.Vector3(-toCenter.y, toCenter.x, 0).multiplyScalar(SWIRL_STRENGTH);
            const distFromCenter = mesh.position.length();
            // --- keep particle from flying away -> pull back ---
            velocity.add(swirlForce);            
            if (distFromCenter > maxRadius) {
                const pullBackStrength = 0.005 * (distFromCenter - maxRadius + 1);
                const pullForce = center.clone().sub(mesh.position).multiplyScalar(pullBackStrength);
                velocity.add(pullForce);
            }
            // --- movement noise ---            
            velocity.x += (Math.random() - 0.5) * SWIRL_NOISE_STRENGTH;
            velocity.y += (Math.random() - 0.5) * SWIRL_NOISE_STRENGTH;
            velocity.z += (Math.random() - 0.5) * SWIRL_NOISE_STRENGTH;
            // --- particles avoid mouse pos ---
            const toMouse = mesh.position.clone().sub(mousePos);
            const distanceToMouse = toMouse.length();            
            if (distanceToMouse < AVOID_RADIUS) {
                const avoidForceStrength = 0.01;
                const avoidForce = toMouse.normalize().multiplyScalar(avoidForceStrength);
                velocity.add(avoidForce);
            }
        } else {
        // --- comet trail mode ---
            // --- damp trail movements ---
            velocity.multiplyScalar(DAMPING_FACTOR);
            // --- more particles near the front ---
            const iNormalized = i / (numParticles - 1);
            const offset = Math.floor(TRAIL_SPACING * (mouseHistory.length - 1) * Math.pow(iNormalized, DISTRIBUTION_EXPONENT));
            let targetIndex = mouseHistory.length - 1 - offset;
            if (targetIndex < 0) targetIndex = 0;
            const targetPos = mouseHistory[targetIndex] || mousePos;
            // --- seek target mouse ---       
            const toTarget = targetPos.clone().sub(mesh.position);
            velocity.add(toTarget.multiplyScalar(SEEK_STRENGTH));
            // --- add movement noise ---            
            velocity.x += (Math.random() - 0.5) * COMET_NOISE_STRENGTH;
            velocity.y += (Math.random() - 0.5) * COMET_NOISE_STRENGTH;
            velocity.z += (Math.random() - 0.5) * COMET_NOISE_STRENGTH;
            // --- keep them from going away too far ---
            const distFromCenter = mesh.position.length();
            if (distFromCenter > maxRadius * 2) {
                const pullBackStrength = 0.0002 * (distFromCenter - maxRadius + 1);
                const pullForce = center.clone().sub(mesh.position).multiplyScalar(pullBackStrength);
                velocity.add(pullForce);
            }
        }
        // --- move particles and limit speed ---
        mesh.position.addScaledVector(velocity, normalizedDelta * 60);
        if (velocity.length() > MAX_SPEED) {
            velocity.setLength(MAX_SPEED);
        }
    }
    renderer.render(scene, camera);
}
init();
