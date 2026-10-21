import { rows, scene } from './game/sceneData.js';
import {
    createProgram, vertexShaderSource, fragmentShaderSource,
    createMesh, planeGeometry, cubeGeometry,
    drawRow, drawPlayer, drawCar, drawTree
} from './webgl/index.js';
import {
 gameState, updateGameState, restartGame
} from './game/gameRules.js';

import { mat4 } from 'gl-matrix';
import { updateCars, movePlayer } from './game/gameLogic.js';
const scoreLabel = document.querySelector('#score');
const statusLabel = document.querySelector('#status');
const livesLabel = document.querySelector('#lives');
const bestLabel = document.querySelector('#best');

const canvas = document.querySelector('#gameCanvas');
const gl = canvas.getContext('webgl2');
if (!gl) throw new Error('Ta przeglądarka nie udostępnia WebGL2.');

const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
gl.useProgram(program);

const uniforms = {
 model: gl.getUniformLocation(program, 'uModel'),
 view: gl.getUniformLocation(program, 'uView'),
 projection: gl.getUniformLocation(program, 'uProjection'),
 color: gl.getUniformLocation(program, 'uColor')
};
const camera = {
 eye: [0.0, 2.6, 2.4], // Gdzie stoi kamera? 
 target: [0.0, -0.45, -0.1], // Na co patrzy? (środek planszy)
 up: [0, 1, 0], // Gdzie jest góra obrazu?
 zoom: 1.6 // Zakres pokazywanego obszaru (mniej = plansza większa)
};
// Każda geometria trafia do GPU tylko raz.
const planeMesh = createMesh(gl, program, planeGeometry);
const cubeMesh = createMesh(gl, program, cubeGeometry);

function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(canvas.clientWidth * ratio);
    const height = Math.round(canvas.clientHeight * ratio);
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function render() {
    resizeCanvas();
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.075, 0.10, 0.15, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    const aspect = canvas.width / canvas.height;
    const view = mat4.create();
    mat4.lookAt(view, camera.eye, camera.target, camera.up);
    const projection = mat4.create();
    mat4.ortho(projection,
 -camera.zoom * aspect, camera.zoom * aspect,
 -camera.zoom, camera.zoom, 0.1, 100);
    gl.uniformMatrix4fv(uniforms.view, false, view);
    gl.uniformMatrix4fv(uniforms.projection, false, projection);

    for (const row of rows) drawRow(gl, planeMesh, uniforms, row);
    drawPlayer(gl, cubeMesh, uniforms, scene.player);
    for (const car of scene.cars) drawCar(gl, cubeMesh, uniforms, car);
    for (const tree of scene.trees) drawTree(gl, cubeMesh, uniforms, tree);
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