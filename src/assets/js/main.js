import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// scene
const scene = new THREE.Scene();

const bgTexture = new THREE.TextureLoader().load("./src/assets/images/bg.jpg");
bgTexture.colorSpace = THREE.SRGBColorSpace;

scene.background = bgTexture;

// camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 8);
camera.position.z = 32;

// renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#webgl"),
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const composer = new EffectComposer(renderer);

composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.4, 0.85);

composer.addPass(bloom);

// LIGHTS (important for metal)
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(3, 3, 3);
scene.add(light);

const light2 = new THREE.PointLight(0x88ccff, 0.6, 30);
light2.position.set(-3, -2, 2);
scene.add(light2);

const shineLight = new THREE.PointLight(0xffffff, 1.5, 40);
shineLight.position.set(-10, 2, 8);
scene.add(shineLight);

const sweepLight = new THREE.PointLight(0xffffff, 2.5, 60);
scene.add(sweepLight);

// ENVIRONMENT (fake HDR reflection)
const envTexture = new THREE.CubeTextureLoader().load([
    "https://threejs.org/examples/textures/cube/Bridge2/posx.jpg",
    "https://threejs.org/examples/textures/cube/Bridge2/negx.jpg",
    "https://threejs.org/examples/textures/cube/Bridge2/posy.jpg",
    "https://threejs.org/examples/textures/cube/Bridge2/negy.jpg",
    "https://threejs.org/examples/textures/cube/Bridge2/posz.jpg",
    "https://threejs.org/examples/textures/cube/Bridge2/negz.jpg",
]);

scene.environment = envTexture;

// MATERIAL (metal core)
const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,

    metalness: 1,
    roughness: 0.02,

    envMapIntensity: 6,

    clearcoat: 1,
    clearcoatRoughness: 0,

    reflectivity: 1,
});

// TEXT
let textMesh;

const loader = new FontLoader();

// IMPORTANT: use a font json (see note below)
loader.load("https://threejs.org/examples/fonts/helvetiker_bold.typeface.json", (font) => {
    const geometry = new TextGeometry("LIQUID METAL", {
        font: font,
        size: 0.9,
        height: 0.25,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5,
    });

    geometry.center();

    textMesh = new THREE.Mesh(geometry, material);
    scene.add(textMesh);
});

// mouse interaction
let mouseX = 0;
let mouseY = 0;

let targetRotX = 0;
let targetRotY = 0;

window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;

    targetRotY = mouseX * 0.2;
    targetRotX = mouseY * 0.1;
});

// animation loop
function animate() {
    requestAnimationFrame(animate);

    if (textMesh) {
        // liquid motion
        textMesh.rotation.y += 0.003;

        textMesh.rotation.x += (targetRotX - textMesh.rotation.x) * 0.08;
        textMesh.rotation.y += (targetRotY - textMesh.rotation.y) * 0.08;

        textMesh.position.y = Math.sin(performance.now() * 0.001) * 0.15;

        const time = performance.now() * 0.001;

        shineLight.position.x = Math.sin(time * 0.8) * 12;
        shineLight.position.y = Math.cos(time * 0.4) * 4;
        shineLight.position.z = 8;

        sweepLight.position.x = -15 + ((time * 6) % 30);
        sweepLight.position.y = 1;
        sweepLight.position.z = 6;
    }

    composer.render();
}

animate();

// resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
