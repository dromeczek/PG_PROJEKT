import * as THREE from 'three';
import { rows, scene as gameScene } from '../game/sceneData.js';
import { makeInstance } from './modelLoader.js';
export const GROUND_Y = -0.45;
export const objects = {
playerRoot: null,
cars: [],
trees: []
};
export function createBasicObjects(scene3D) {
const rowGeometry = new THREE.BoxGeometry(1.8, 0.04, 0.65);
for (const row of rows) {
const color = row.type === 'road' ? 0x30323a : 0x2ba344;
const rowMesh = new THREE.Mesh(
rowGeometry,
new THREE.MeshBasicMaterial({ color })
);
rowMesh.position.set(0, GROUND_Y - 0.02, row.z);
scene3D.add(rowMesh);
}
const playerRoot = new THREE.Group();
const yellow = new THREE.MeshBasicMaterial({ color: 0xffbf20 });
const body = new THREE.Mesh(
new THREE.BoxGeometry(0.18, 0.24, 0.18), yellow
);
const head = new THREE.Mesh(
new THREE.BoxGeometry(0.13, 0.13, 0.13), yellow
);
body.position.y = 0.12;
head.position.y = 0.30;
playerRoot.add(body, head);
scene3D.add(playerRoot);
objects.playerRoot = playerRoot;
}
export function addModels(scene3D, carTemplate, treeTemplate) {
for (const car of gameScene.cars) {
const root = makeInstance(carTemplate, 0.40);
root.rotation.y = car.speed > 0
? Math.PI / 2
: -Math.PI / 2;
scene3D.add(root);
objects.cars.push(root);
}
for (const tree of gameScene.trees) {
const root = makeInstance(treeTemplate, 0.70);
scene3D.add(root);
objects.trees.push(root);
}
}
export function syncObjects() {
// Pozycja gracza
const p = gameScene.player.position;
objects.playerRoot.position.set(
p[0], GROUND_Y + p[1], p[2]
);
// Pozycje samochodów
gameScene.cars.forEach((car, i) => {
if (!objects.cars[i]) return;
const v = car.position;
objects.cars[i].position.set(
v[0], GROUND_Y + v[1], v[2]
);
});
// Pozycje drzew
gameScene.trees.forEach((tree, i) => {
if (!objects.trees[i]) return;
const v = tree.position;
objects.trees[i].position.set(
v[0], GROUND_Y + v[1], v[2]
);
});
}