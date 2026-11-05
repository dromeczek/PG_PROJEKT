import { rows, scene } from './game/sceneData.js';
import { loadTemplate, makeInstance } from './three/modelLoader.js';
import {
 gameState, updateGameState, restartGame
} from './game/gameRules.js';

import * as THREE from 'three';
import { updateCars, movePlayer } from './game/gameLogic.js';
import {createBasicObjects, addModels, syncObjects} from './three/objects.js';
const scoreLabel = document.querySelector('#score');
const statusLabel = document.querySelector('#status');
const livesLabel = document.querySelector('#lives');
const bestLabel = document.querySelector('#best');

const canvas = document.querySelector('#gameCanvas');


const scene3D = new THREE.Scene();
scene3D.background = new THREE.Color(0x141b26);
const renderer3D = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer3D.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const camera3D = new THREE.OrthographicCamera(-3, 3, 2.2, -2.2, 0.1, 100);
camera3D.position.set(0, 2.4, 3.2);
camera3D.lookAt(0, -0.2, -0.35);

scene3D.add(new THREE.AmbientLight(0xffffff, 1.5));
const light = new THREE.DirectionalLight(0xffffff, 2.0);
light.position.set(-2, 5, 4);
scene3D.add(light);

function render() {
 const w = Math.max(1, canvas.clientWidth);
 const h = Math.max(1, canvas.clientHeight);
 renderer3D.setSize(w, h, false);
 const zoom = 2.2, aspect = w / h;
 camera3D.left = -zoom * aspect; camera3D.right = zoom * aspect;
 camera3D.top = zoom; camera3D.bottom = -zoom;
 camera3D.updateProjectionMatrix();
syncObjects();
renderer3D.render(scene3D, camera3D);
} 




function updateHud() {
 scoreLabel.textContent = `Punkty: ${gameState.score}`;
 livesLabel.textContent = `Życia: ${gameState.lives}`;
 bestLabel.textContent = `Rekord: ${gameState.best}`;
 if (gameState.status === 'lost') {
 statusLabel.textContent = 'Kolizja! Naciśnij R.';
 } else if (gameState.status === 'won') {
 statusLabel.textContent = 'Meta! Naciśnij R.';
 } else {
 statusLabel.textContent = 'Dotrzyj do ostatniego pasa trawy.';
 }
}

let previousTime = null;
let paused = false; // czy ruch samochodów jest zatrzymany
function frame(time) {
 const dt = previousTime === null
 ? 0
 : Math.min((time - previousTime) / 1000, 0.05);
 previousTime = time;
if (gameState.status === 'playing' && !paused) {
 updateCars(dt);
 updateGameState();
}
render();
updateHud();

requestAnimationFrame(frame);
}
// 1. Wczytanie wszystkich modeli naraz
const [carTemplate, treeTemplate, elephantTemplate] = await Promise.all([
  loadTemplate('/models/car.glb'),
  loadTemplate('/models/tree.glb'),
  loadTemplate('/models/elephant.glb'),
]);

// 2. Budowa sceny
createBasicObjects(scene3D, elephantTemplate);
addModels(scene3D, carTemplate, treeTemplate);

// 3. Start gry
requestAnimationFrame(frame);
window.addEventListener('resize', render);
window.addEventListener('keydown', event => {
 // R restartuje grę.
 if (event.key.toLowerCase() === 'r') {
  if (!event.repeat) {
   restartGame();
   paused = false; // po restarcie gra rusza od razu
  }
  return;
 }
 // Spacja zatrzymuje / wznawia ruch samochodów.
 if (event.code === 'Space') {
  event.preventDefault();
  if (!event.repeat) paused = !paused;
  return;
 }
 if (!event.key.startsWith('Arrow')) return;
 event.preventDefault();
 if (event.repeat || gameState.status !== 'playing') return;
 if (paused) return; // podczas pauzy gracz nie może się ruszać
 movePlayer(event.key);
}); 