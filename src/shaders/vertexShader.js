// Kod GLSL jest tekstem, który WebGL przekazuje do kompilatora GPU.
export const vertexShaderSource = `#version 300 es

in vec3 aPosition;
uniform vec3 uPosition;
uniform vec3 uScale;
uniform float uAspect;

void main() {
    vec3 p = aPosition * uScale + uPosition;
    // Tymczasowy rzut ukośny: bez macierzy MVP (omówimy je na Lab 2).
    float screenX = p.x - p.z * 0.35;
    float screenY = p.y + p.z * 0.22 + 0.15;
    float depth = p.z * 0.20 - p.y * 0.05;
    gl_Position = vec4(screenX / uAspect, screenY, depth, 1.0);
}
`;
