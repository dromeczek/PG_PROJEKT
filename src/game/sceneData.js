// Dane logiczne gry - niezależne od sposobu renderowania.
export const rows = [
    { type: 'grass', z: 0.70 },
    { type: 'road', z: 0.00 },
    { type: 'grass', z: -0.70 }
];

export const scene = {
    player: { position: [0.0, 0.0, 0.70] },
    cars: [
        { position: [-0.45, 0.0, 0.0], color: [0.92, 0.12, 0.13] },
        { position: [0.48, 0.0, 0.0], color: [0.12, 0.30, 0.90] },
        { position: [0.03, 0.0, 0.0], color: [1, 0, 1] }
    ],
    trees: [
        { position: [-0.66, 0.0, 0.70] },
        { position: [0.66, 0.0, 0.70] },
        
        { position: [-0.30, 0.0, -0.70], trunkHeight: 0.50, crownColor: [0.85, 0.15, 0.10] }
    ]
};
