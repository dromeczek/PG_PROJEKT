import { rows, scene } from './sceneData.js';
export const gameState = {
 status: 'playing', // playing, lost lub won
 score: 0,
 bestLane: 0,
 lives: 3, // liczba żyć gracza
 best: 0 // najlepszy wynik (nie jest zerowany przy restarcie)
};
const startPlayer = [...scene.player.position];
const startCars = scene.cars.map(car => [...car.position]);
const startSpeeds = scene.cars.map(car => car.speed); // prędkości początkowe
const lanes = rows.map(row => row.z).sort((a, b) => b - a);
export function checkCollision() {
 const player = scene.player.position;
 const halfPlayerX = 0.09;
 const halfCarX = 0.20;
 const halfPlayerZ = 0.09;
 const halfCarZ = 0.11;
 return scene.cars.some(car => {
 const dx = Math.abs(player[0] - car.position[0]);
 const dz = Math.abs(player[2] - car.position[2]);
 return dx < halfPlayerX + halfCarX &&
 dz < halfPlayerZ + halfCarZ;
 });
}
export function updateGameState() {
 if (gameState.status !== 'playing') return;
 if (checkCollision()) {
 gameState.lives -= 1; // kolizja zabiera jedno życie
 if (gameState.lives <= 0) {
 gameState.status = 'lost'; // koniec gry dopiero po utracie wszystkich żyć
 } else {
 scene.player.position.splice(0, 3, ...startPlayer); // powrót na start
 }
 return;
 }
 const lane = lanes.findIndex(z =>
 Math.abs(z - scene.player.position[2]) < 0.001
 );
 if (lane > gameState.bestLane) {
 gameState.score += (lane - gameState.bestLane) * 10;
 gameState.bestLane = lane;
 // Nowe punkty = samochody szybsze o 10% (znak, czyli kierunek, się nie zmienia).
 scene.cars.forEach(car => car.speed *= 1.1);
 // Nowy rekord tylko wtedy, gdy wynik jest większy niż dotychczasowy.
 if (gameState.score > gameState.best) {
 gameState.best = gameState.score;
 }
 }
 if (lane === lanes.length - 1) {
 gameState.status = 'won';
 }
}
export function restartGame() {
 scene.player.position.splice(0, 3, ...startPlayer);
 scene.cars.forEach((car, index) => {
 car.position.splice(0, 3, ...startCars[index]);
 car.speed = startSpeeds[index]; // powrót do prędkości początkowej
 });
 gameState.status = 'playing';
 gameState.score = 0;
 gameState.bestLane = 0;
 gameState.lives = 3;
}