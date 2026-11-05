# Sprawozdanie: zastąpienie postaci gracza modelem 3D

## Cel

Postać gracza, zbudowaną z dwóch żółtych prostopadłościanów, zastąpiono modelem słonia
(`elephant.glb`). Zmiany objęły pliki `src/three/objects.js` i `src/main.js`.
Logika gry (`gameLogic.js`, `gameRules.js`, `sceneData.js`) pozostała bez zmian.

---

## Zmiana 1: nowy parametr `playerTemplate` w `createBasicObjects()`

**Plik:** `src/three/objects.js`

**Przed:**
```js
export function createBasicObjects(scene3D) {
```

**Po:**
```js
export function createBasicObjects(scene3D, playerTemplate) {
```

**Co zmieniono:** funkcja tworząca planszę i gracza przyjmuje dodatkowy parametr:
wczytany szablon modelu słonia.

**Po co:** funkcja sama nie wczytuje plików, bo wczytywanie jest asynchroniczne i odbywa się
w `main.js`. Model trzeba więc do niej przekazać z zewnątrz. Dzięki temu `objects.js`
odpowiada tylko za budowę obiektów, a `main.js` za wczytywanie zasobów.

---

## Zmiana 2: słoń zamiast żółtych kostek

**Plik:** `src/three/objects.js`, funkcja `createBasicObjects()`

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
const playerModel = makeInstance(playerTemplate, 0.35);
playerRoot.add(playerModel);
scene3D.add(playerRoot);
objects.playerRoot = playerRoot;
```

**Co usunięto:**
- materiał `yellow` (żółty kolor),
- dwa prostopadłościany `body` i `head` oraz ich ustawienie w pionie (`position.y`).

**Co dodano:**
- `makeInstance(playerTemplate, 0.35)` tworzy kopię modelu słonia, przeskalowaną do
  0.35 jednostki, wyśrodkowaną i postawioną na ziemi,
- `playerRoot.add(playerModel)` wkłada słonia do grupy gracza.

**Co zostało bez zmian:** grupa `playerRoot`, jej dodanie do sceny i zapisanie w `objects.playerRoot`.

**Po co:** `playerRoot` to „uchwyt” gracza, czyli grupa, którą gra przesuwa w każdej klatce
(funkcja `syncObjects()`). Wymieniono tylko to, co jest w środku grupy. Uchwyt pozostał ten sam,
więc ruch, kolizje i restart działają bez żadnych zmian w logice gry.
Wartość `0.35` dobrano tak, żeby słoń miał podobną wielkość jak dawny ludzik i mieścił się na pasie.

---

## Zmiana 3: obrót słonia o 180°

**Plik:** `src/three/objects.js`, funkcja `createBasicObjects()`

**Dodano:**
```js
playerModel.rotation.y = Math.PI; // obrót o 180°
```

**Co zmieniono:** model jest obrócony o 180° wokół osi pionowej Y
(`Math.PI` radianów = 180°).

**Po co:** w pliku `elephant.glb` słoń był zwrócony tyłem do kierunku ruchu gracza.
Obrót ustawia go przodem do mety.

**Dlaczego obrót modelu, a nie grupy `playerRoot`:** grupa odpowiada za **położenie** gracza
w grze, a model w jej wnętrzu za **wygląd**. Obrót modelu to korekta samego pliku 3D,
która nie miesza się z logiką ruchu. Gdyby w przyszłości gra obracała gracza
w stronę ruchu (przez `playerRoot.rotation`), oba obroty nie będą się nadpisywać.

---

## Zmiana 4: usunięcie `createBasicObjects()` ze startu pliku

**Plik:** `src/main.js`

**Usunięto:**
```js
createBasicObjects(scene3D);
```

**Po co:** to wywołanie było na samym początku pliku, kiedy model słonia nie był jeszcze wczytany.
Funkcja potrzebuje teraz gotowego modelu, więc jej wywołanie przeniesiono niżej (zmiana 6).

---

## Zmiana 5: usunięcie obiektu testowego `testBox`

**Plik:** `src/main.js`

**Usunięto:**
```js
const testBox = new THREE.Mesh(
 new THREE.BoxGeometry(0.25, 0.25, 0.25),
 new THREE.MeshBasicMaterial({ color: 0xffbf20 })
);
```

**Po co:** była to żółta kostka z wcześniejszego etapu, służąca do sprawdzenia,
czy Three.js w ogóle rysuje. Nie była już dodawana do sceny i nic nie robiła.

---

## Zmiana 6: nowa kolejność wczytywania i startu gry

**Plik:** `src/main.js`

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

**Co usunięto:**
- `previewCar` i `previewTree`, podglądowe modele z poprzedniego zadania,
  używane tylko do obejrzenia, czy model się wczytuje,
- `scene3D.remove(testBox)`, bo `testBox` już nie istnieje,
- `scene3D.add(previewTree)`, która ponownie dodawała podglądowe drzewo do sceny.

**Co dodano:**
- wczytanie `elephant.glb`,
- `Promise.all`, które wczytuje trzy modele jednocześnie,
- wywołanie `createBasicObjects(scene3D, elephantTemplate)` przeniesione ze zmiany 4.

**Po co:**
- **Słoń musi być wczytany przed utworzeniem gracza.** `loadTemplate()` jest asynchroniczne
  (trwa, zanim plik się pobierze), więc gracz może powstać dopiero po `await`.
- **`Promise.all` przyspiesza start.** Wcześniej każdy `await` czekał na poprzedni plik.
  Teraz trzy pliki pobierają się równolegle, a kod czeka tylko raz, aż wszystkie będą gotowe.
- **Pętla gry startuje na końcu.** `requestAnimationFrame(frame)` uruchamia rysowanie,
  które w każdej klatce woła `syncObjects()` i odwołuje się do `objects.playerRoot`.
  Gdyby pętla ruszyła wcześniej, gracz jeszcze by nie istniał i gra zgłosiłaby błąd.
- **Usunięcie podglądów naprawia błąd wizualny.** Linia `scene3D.add(previewTree)` zostawiała
  dodatkowe drzewo na środku planszy, które nie było częścią gry (nie miało kolizji).

---

## Elementy bez zmian, ale potrzebne do działania

### Synchronizacja z logiką gry: `syncObjects()` (`src/three/objects.js`)

```js
const p = gameScene.player.position;
objects.playerRoot.position.set(p[0], GROUND_Y + p[1], p[2]);
```

**Rola:** logika gry trzyma pozycję gracza jako tablicę liczb. Ta funkcja w każdej klatce
przepisuje ją na grupę `playerRoot`. Słoń jest w tej grupie, więc porusza się razem z nią.
Właśnie dlatego zmiana wyglądu nie wymagała zmian w logice.

### Oświetlenie (`src/main.js`)

```js
scene3D.add(new THREE.AmbientLight(0xffffff, 1.5));
const light = new THREE.DirectionalLight(0xffffff, 2.0);
light.position.set(-2, 5, 4);
scene3D.add(light);
```

**Rola:** modele `.glb` mają materiały `MeshStandardMaterial`, które reagują na światło.
Bez świateł słoń byłby czarny. `AmbientLight` rozjaśnia wszystko równomiernie, a
`DirectionalLight` daje cieniowanie, dzięki któremu widać kształt modelu.

---

## Podsumowanie

| Zmiana | Co | Po co |
|---|---|---|
| 1 | parametr `playerTemplate` | przekazanie wczytanego modelu do funkcji budującej gracza |
| 2 | słoń zamiast kostek | nowy wygląd postaci przy zachowaniu tej samej grupy `playerRoot` |
| 3 | obrót o 180° | słoń patrzy w stronę mety |
| 4 | usunięte wczesne `createBasicObjects` | model nie był jeszcze wczytany |
| 5 | usunięty `testBox` | nieużywany obiekt testowy |
| 6 | `Promise.all` i nowa kolejność | szybsze wczytywanie, gracz istnieje przed startem pętli, brak zbędnego drzewa |

## Wnioski

- Grupa `playerRoot` jako „uchwyt” gracza pozwoliła wymienić wygląd postaci bez zmiany logiki gry.
- Rozdzielenie grupy (położenie) i modelu w jej wnętrzu (wygląd, orientacja) pozwala korygować model niezależnie od ruchu.
- Przy zasobach wczytywanych asynchronicznie najważniejsza jest kolejność: najpierw modele, potem scena, na końcu pętla gry.
