// Vertex shader to handle positions and UVs
export const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader for procedural texture generation
export const fragmentShader = `
  uniform float uTime;
  uniform float uScale;
  uniform float uComplexity;
  uniform float uSeed;
  uniform int uColorMode;
  uniform vec3 uLightColor; // Color for lighter parts
  uniform vec3 uDarkColor;  // Color for darker parts
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // ----- Noise functions -----
  
  // 2D pseudo random function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  // 2D value noise
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    // Smooth interpolation
    vec2 u = smoothstep(0.0, 1.0, f);
    
    // Mix 4 corners
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  
  // Fractal Brownian Motion (fBm) noise with improved octave control
  float fbm(vec2 st, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    // Add successive octaves of noise
    for (int i = 0; i < 10; i++) { // Loop up to a high number
      if(i >= octaves) break;      // Exit early based on passed octaves
      
      value += amplitude * noise(frequency * st + uSeed);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    
    return value;
  }
  
  void main() {
    // Scale the coordinates
    vec2 st = vUv * uScale;
    
    // Calculate number of octaves based on complexity
    // Map from range 0.5-3.0 to 1-6 octaves 
    int octaves = int(mix(1.0, 6.0, (uComplexity - 0.5) / 2.5));
    
    // Base noise with octave control
    float n = fbm(st, octaves);
    
    // Add detail layers based on continuous complexity
    float detailAmount = smoothstep(0.5, 3.0, uComplexity); // 0-1 factor based on complexity
    
    // Add increasing spatial frequency for detail
    if (detailAmount > 0.0) {
      // First detail layer - medium frequency
      n = mix(
        n,
        n * 0.6 + fbm(st * 2.0, octaves) * 0.4,
        detailAmount
      );
      
      // For higher complexity, add some warping distortion
      if (detailAmount > 0.5) {
        // Create distortion vector
        vec2 warp = vec2(
          fbm(st * 3.0 + vec2(uTime * 0.05, 0.0), octaves),
          fbm(st * 3.0 + vec2(0.0, uTime * 0.05), octaves)
        );
        
        // Apply warp distortion with strength based on complexity
        n = mix(
          n,
          n * 0.7 + fbm(st * 4.0 + warp, octaves) * 0.3,
          (detailAmount - 0.5) * 2.0
        );
      }
    }
    
    // Normalize noise consistently to avoid brightness shift
    n = n * 0.5 + 0.5;
    
    // Enhance contrast slightly as complexity increases
    if (detailAmount > 0.0) {
      float contrast = mix(1.0, 1.3, detailAmount);
      n = pow(n, contrast);
    }
    
    // Output color based on selected mode
    vec3 color;
    
    if (uColorMode == 0) { // Grayscale
      color = vec3(n);
    } 
    else if (uColorMode == 1) { // Red-Blue gradient
      color = mix(vec3(0.8, 0.0, 0.0), vec3(0.0, 0.0, 0.8), n);
    }
    else if (uColorMode == 2) { // Earth-like colors
      color = mix(
        mix(vec3(0.0, 0.2, 0.5), vec3(0.0, 0.5, 0.0), smoothstep(0.4, 0.5, n)),
        mix(vec3(0.0, 0.5, 0.0), vec3(0.8, 0.7, 0.4), smoothstep(0.5, 0.7, n)),
        smoothstep(0.45, 0.55, n)
      );
      
      // Add snow to peaks
      if (n > 0.8) {
        color = mix(color, vec3(1.0), smoothstep(0.8, 0.95, n));
      }
    }
    else if (uColorMode == 3) { // Rainbow
      color = 0.5 + 0.5 * cos(6.28318 * (n + vec3(0.0, 0.33, 0.67)));
    }
    else { // Custom color mode using dual colors for light and dark areas
      // Mix between the dark and light colors based on noise value
      color = mix(uDarkColor, uLightColor, n);
    }
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
