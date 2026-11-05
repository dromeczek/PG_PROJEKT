# Plan zmian: żółty ludzik → model słonia (`elephant.glb`)

Cel: zastąpić postać gracza (dwie żółte kostki) modelem 3D słonia oraz uporządkować
kolejność w `main.js`: **wczytanie modeli → budowa sceny → start gry**.

Logika gry (`gameLogic.js`, `gameRules.js`, `sceneData.js`) **nie jest zmieniana**.

---

## 1. `src/three/objects.js`

### 1a. Sygnatura `createBasicObjects` (linia 10)

**Przed:**
```js
export function createBasicObjects(scene3D) {
```

**Po:**
```js
export function createBasicObjects(scene3D, playerTemplate) {
```

### 1b. Tworzenie gracza (linie 21–34)

**Przed:**
```js
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
```

**Po:**
```js
const playerRoot = new THREE.Group();
playerRoot.add(makeInstance(playerTemplate, 0.35)); // słoń zamiast kostek
scene3D.add(playerRoot);
objects.playerRoot = playerRoot;
```

> `makeInstance` jest już zaimportowane w tym pliku — import nie wymaga zmian.

---

## 2. `src/main.js`

### 2a. Usunięcie wywołania na starcie (linia 20)

**Usunąć:**
```js
createBasicObjects(scene3D);
```
(wywołanie przechodzi niżej — po wczytaniu modeli)

### 2b. Usunięcie `testBox` (linie 28–31)

**Usunąć:**
```js
const testBox = new THREE.Mesh(
 new THREE.BoxGeometry(0.25, 0.25, 0.25),
 new THREE.MeshBasicMaterial({ color: 0xffbf20 })
);
```
(pozostałość po teście, nie jest już używana)

### 2c. Wczytanie modeli i start (linie 82–95)

**Przed:**
```js
const carTemplate = await loadTemplate('/models/car.glb');
const previewCar = makeInstance(carTemplate, 0.40);
previewCar.position.set(0, -0.45, 0);
scene3D.add(previewCar);
scene3D.remove(testBox);
const treeTemplate = await loadTemplate('/models/tree.glb');
const previewTree = makeInstance(treeTemplate, 0.70);
previewCar.position.x = -0.45;
previewTree.position.set(0.45, -0.45, 0);
scene3D.remove(previewCar, previewTree);
addModels(scene3D, carTemplate, treeTemplate);

scene3D.add(previewTree);
requestAnimationFrame(frame);
```

**Po:**
```js
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
```

---

## Efekt

| Co | Przed | Po |
|---|---|---|
| Postać gracza | 2 żółte kostki | model `elephant.glb` |
| Wczytywanie modeli | po kolei | równolegle (`Promise.all`) |
| Dodatkowe drzewo na środku planszy | jest (`previewTree`) | znika |
| `testBox`, `previewCar`, `previewTree` | w kodzie | usunięte |
| Ruch, kolizje, punkty | — | bez zmian |

## Możliwe poprawki po uruchomieniu

- **Rozmiar słonia** — zmienić `0.35` w `makeInstance(playerTemplate, 0.35)`.
- **Słoń patrzy w złą stronę** — w `createBasicObjects` po `playerRoot.add(...)` dopisać
  np. `playerRoot.rotation.y = Math.PI;` (lub `±Math.PI / 2`).
