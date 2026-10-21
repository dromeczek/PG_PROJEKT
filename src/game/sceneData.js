// Dane logiczne gry - niezależne od sposobu renderowania.
export const rows = [
    { type: 'grass', z: 1.40 },
    { type: 'road', z: 0.70, divider: true }, // pas ruchu w prawo + linia przerywana
    { type: 'road', z: 0.00 },                // pas ruchu w lewo
    { type: 'grass', z: -0.70 },
    
    { type: 'grass', z: -1.40, color: [0.55, 0.75, 0.20] }
];

export const scene = {
    player: { position: [0.0, 0.0, 1.40] },
    cars: [
        // Pas z = 0.70 - jazda w prawo
        { position: [-1.5, 0.0, 0.70], color: [0.92, 0.12, 0.13], speed: 0.32 },
        { position: [1.5, 0.0, 0.70], color: [1, 0, 1], speed: 0.30 },
        // Pas z = 0.00 - jazda w lewo
        { position: [1.5, 0.0, 0.0], color: [0.12, 0.30, 0.90], speed: -0.42 },
        { position: [-1.5, 0.0, 0.0], color: [0.95, 0.55, 0.10], speed: -0.40 }
    ],
    trees: [
        { position: [-0.66, 0.0, 1.40] },
        { position: [0.66, 0.0, 1.40] },
        
        { position: [-0.30, 0.0, -0.70], trunkHeight: 0.50, crownColor: [0.85, 0.15, 0.10] }
    ]
};
