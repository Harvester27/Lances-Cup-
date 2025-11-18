import * as THREE from 'three';

/**
 * 3D Perlin noise funkce pro procedurální mraky
 * Zjednodušená verze pro výkon
 */
class SimplexNoise {
  constructor() {
    this.grad3 = [
      [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
      [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
      [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];
    
    this.p = [];
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256);
    }
    
    this.perm = [];
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  }
  
  dot(g, x, y, z) {
    return g[0] * x + g[1] * y + g[2] * z;
  }
  
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  lerp(t, a, b) {
    return a + t * (b - a);
  }
  
  noise(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);
    
    const A = this.perm[X] + Y;
    const AA = this.perm[A] + Z;
    const AB = this.perm[A + 1] + Z;
    const B = this.perm[X + 1] + Y;
    const BA = this.perm[B] + Z;
    const BB = this.perm[B + 1] + Z;
    
    const gradAA = this.grad3[this.perm[AA] % 12];
    const gradBA = this.grad3[this.perm[BA] % 12];
    const gradAB = this.grad3[this.perm[AB] % 12];
    const gradBB = this.grad3[this.perm[BB] % 12];
    const gradAA1 = this.grad3[this.perm[AA + 1] % 12];
    const gradBA1 = this.grad3[this.perm[BA + 1] % 12];
    const gradAB1 = this.grad3[this.perm[AB + 1] % 12];
    const gradBB1 = this.grad3[this.perm[BB + 1] % 12];
    
    return this.lerp(w,
      this.lerp(v,
        this.lerp(u, this.dot(gradAA, x, y, z), this.dot(gradBA, x - 1, y, z)),
        this.lerp(u, this.dot(gradAB, x, y - 1, z), this.dot(gradBB, x - 1, y - 1, z))
      ),
      this.lerp(v,
        this.lerp(u, this.dot(gradAA1, x, y, z - 1), this.dot(gradBA1, x - 1, y, z - 1)),
        this.lerp(u, this.dot(gradAB1, x, y - 1, z - 1), this.dot(gradBB1, x - 1, y - 1, z - 1))
      )
    );
  }
  
  // Vrstvený noise pro komplexní cloud textury
  octaveNoise(x, y, z, octaves, persistence) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    
    return total / maxValue;
  }
}

/**
 * Cloud shader pro GLSL
 */
export const getCloudShaderChunk = () => {
  return `
    // Zjednodušená 3D noise funkce pro GLSL
    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 permute(vec4 x) {
      return mod289(((x * 34.0) + 1.0) * x);
    }
    
    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    // Vrstvený noise pro realistické mraky
    float fbm(vec3 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for (int i = 0; i < 4; i++) {
        if (i >= octaves) break;
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      
      return value;
    }
    
    // Funkce pro výpočet hustoty mraků v daném bodě
    float getCloudDensity(vec3 position, float time, float coverage, float scale) {
      // Animace mraků - pomalý pohyb větrem
      vec3 windOffset = vec3(time * 0.02, 0.0, time * 0.01);
      vec3 samplePos = (position + windOffset) * scale;
      
      // Základní vrstva mraků
      float baseNoise = fbm(samplePos, 3);
      
      // Detail vrstva
      float detailNoise = fbm(samplePos * 3.0, 2);
      
      // Kombinace vrstev
      float cloudNoise = baseNoise + detailNoise * 0.3;
      
      // Aplikace coverage (kolik oblohy je pokryto mraky)
      // Při vysokém coverage (>0.7) použít agresivnější mapování
      float threshold;
      if (coverage > 0.7) {
        // Při vysokém pokrytí jsou mraky hustší a pokrývají víc oblohy
        threshold = mix(0.3, -0.2, (coverage - 0.7) / 0.3);
      } else {
        threshold = 1.0 - coverage;
      }
      
      cloudNoise = smoothstep(threshold, threshold + 0.3, cloudNoise * 0.5 + 0.5);
      
      // Fade mraky na horizontu
      float horizonFade = smoothstep(-0.1, 0.3, position.y);
      cloudNoise *= horizonFade;
      
      return cloudNoise;
    }
  `;
};

/**
 * Inicializace cloud systému
 * @param {THREE.ShaderMaterial} skyMaterial - Sky shader material
 * @param {Object} options - Možnosti pro mraky
 * @returns {Object} Objekt s update funkcí a kontrolami
 */
export const initCloudSystem = (skyMaterial, options = {}) => {
  // Výchozí hodnoty
  const defaults = {
    coverage: 0.5,        // Pokrytí oblohy mraky (0-1)
    scale: 0.8,          // Velikost/měřítko mraků
    speed: 1.0,          // Rychlost pohybu mraků
    opacity: 0.7,        // Neprůhlednost mraků
    lightAbsorption: 0.3 // Kolik světla mraky pohlcují (0-1)
  };
  
  const settings = { ...defaults, ...options };
  let time = 0;
  
  // Přidání cloud uniforms do sky materiálu
  skyMaterial.uniforms.cloudTime = { value: 0.0 };
  skyMaterial.uniforms.cloudCoverage = { value: settings.coverage };
  skyMaterial.uniforms.cloudScale = { value: settings.scale };
  skyMaterial.uniforms.cloudOpacity = { value: settings.opacity };
  skyMaterial.uniforms.cloudLightAbsorption = { value: settings.lightAbsorption };
  
  // Přidání cloud shader kódu do fragment shaderu
  const cloudShaderChunk = getCloudShaderChunk();
  const originalFragmentShader = skyMaterial.fragmentShader;
  
  // Najít místo kde vložit cloud uniforms (za existing uniforms)
  const varyingIndex = originalFragmentShader.indexOf('varying vec3 vWorldPosition;');
  const beforeVarying = originalFragmentShader.substring(0, varyingIndex);
  const afterVarying = originalFragmentShader.substring(varyingIndex);
  
  // Přidat cloud uniforms a funkce
  const cloudUniforms = `
    uniform float cloudTime;
    uniform float cloudCoverage;
    uniform float cloudScale;
    uniform float cloudOpacity;
    uniform float cloudLightAbsorption;
    
  `;
  
  // Sestavit nový shader
  skyMaterial.fragmentShader = beforeVarying + cloudUniforms + afterVarying;
  
  // Nyní přidat cloud funkce před main()
  const mainIndex = skyMaterial.fragmentShader.indexOf('void main()');
  const beforeMain = skyMaterial.fragmentShader.substring(0, mainIndex);
  const mainFunction = skyMaterial.fragmentShader.substring(mainIndex);
  
  skyMaterial.fragmentShader = beforeMain + cloudShaderChunk + '\n' + mainFunction;
  
  // Upravit main funkci aby zahrnovala mraky - nahradit gl_FragColor
  skyMaterial.fragmentShader = skyMaterial.fragmentShader.replace(
    'gl_FragColor = vec4(finalColor, 1.0);',
    `
      // Výpočet hustoty mraků
      float cloudDensity = getCloudDensity(viewDirection, cloudTime, cloudCoverage, cloudScale);
      
      // Barva mraků - světlejší při slunci, tmavší v noci
      float dayFactor = max(sunDirection.y, 0.0);
      vec3 cloudColor = mix(
        vec3(0.15, 0.15, 0.2),  // Hodně tmavé mraky v noci (téměř neviditelné)
        vec3(0.9, 0.9, 0.95),   // Světlé mraky ve dne
        dayFactor
      );
      
      // Přidání červenožluté záře při východu/západu slunce
      if (sunElevation < 0.2 && sunElevation > -0.2) {
        float sunsetFactor = 1.0 - abs(sunElevation) / 0.2;
        float directionToSun = dot(viewDirection, sunDirection);
        if (directionToSun > 0.0) {
          vec3 sunsetGlow = mix(sunriseColor, sunColor, 0.5) * sunsetFactor * directionToSun;
          cloudColor = mix(cloudColor, cloudColor + sunsetGlow * 0.5, cloudDensity);
        }
      }
      
      // Vypočítat efektivní opacity - při vysokém pokrytí jsou mraky hustější
      float effectiveOpacity = cloudOpacity;
      if (cloudCoverage > 0.6) {
        // Při vysokém pokrytí zvýšit opacity aby se víc zakryla modrá obloha
        effectiveOpacity = mix(cloudOpacity, 1.0, (cloudCoverage - 0.6) / 0.4);
      }
      
      // Mraky zakrývají i slunce!
      float sunBlockage = cloudDensity * effectiveOpacity;
      vec3 finalColorWithSunBlockage = finalColor * (1.0 - sunBlockage * 0.8); // Mraky blokují 80% slunce
      
      // Mix oblohy a mraků
      vec3 finalColorWithClouds = mix(finalColorWithSunBlockage, cloudColor, cloudDensity * effectiveOpacity);
      
      gl_FragColor = vec4(finalColorWithClouds, 1.0);
    `
  );
  
  skyMaterial.needsUpdate = true;
  
  // Update funkce
  const update = (deltaTime = 0.016) => {
    time += deltaTime * settings.speed;
    skyMaterial.uniforms.cloudTime.value = time;
  };
  
  // API pro kontrolu mraků
  return {
    update,
    
    // Gettery a settery
    setCoverage: (value) => {
      settings.coverage = Math.max(0, Math.min(1, value));
      skyMaterial.uniforms.cloudCoverage.value = settings.coverage;
    },
    
    getCoverage: () => settings.coverage,
    
    setScale: (value) => {
      settings.scale = Math.max(0.1, Math.min(5, value));
      skyMaterial.uniforms.cloudScale.value = settings.scale;
    },
    
    getScale: () => settings.scale,
    
    setSpeed: (value) => {
      settings.speed = Math.max(0, Math.min(10, value));
    },
    
    getSpeed: () => settings.speed,
    
    setOpacity: (value) => {
      settings.opacity = Math.max(0, Math.min(1, value));
      skyMaterial.uniforms.cloudOpacity.value = settings.opacity;
    },
    
    getOpacity: () => settings.opacity,
    
    setLightAbsorption: (value) => {
      settings.lightAbsorption = Math.max(0, Math.min(1, value));
      skyMaterial.uniforms.cloudLightAbsorption.value = settings.lightAbsorption;
    },
    
    getLightAbsorption: () => settings.lightAbsorption,
    
    // Předdefinované presets
    presets: {
      clear: () => {
        settings.coverage = 0.1;
        settings.opacity = 0.3;
        settings.lightAbsorption = 0.1;
        skyMaterial.uniforms.cloudCoverage.value = settings.coverage;
        skyMaterial.uniforms.cloudOpacity.value = settings.opacity;
        skyMaterial.uniforms.cloudLightAbsorption.value = settings.lightAbsorption;
      },
      partlyCloudy: () => {
        settings.coverage = 0.4;
        settings.opacity = 0.65;
        settings.lightAbsorption = 0.25;
        skyMaterial.uniforms.cloudCoverage.value = settings.coverage;
        skyMaterial.uniforms.cloudOpacity.value = settings.opacity;
        skyMaterial.uniforms.cloudLightAbsorption.value = settings.lightAbsorption;
      },
      cloudy: () => {
        settings.coverage = 0.75;
        settings.opacity = 0.85;
        settings.lightAbsorption = 0.5;
        skyMaterial.uniforms.cloudCoverage.value = settings.coverage;
        skyMaterial.uniforms.cloudOpacity.value = settings.opacity;
        skyMaterial.uniforms.cloudLightAbsorption.value = settings.lightAbsorption;
      },
      overcast: () => {
        settings.coverage = 0.95;
        settings.opacity = 0.98; // Téměř úplně hustý
        settings.lightAbsorption = 0.7; // Hodně tlumí světlo
        skyMaterial.uniforms.cloudCoverage.value = settings.coverage;
        skyMaterial.uniforms.cloudOpacity.value = settings.opacity;
        skyMaterial.uniforms.cloudLightAbsorption.value = settings.lightAbsorption;
      }
    },
    
    // Reset na výchozí
    reset: () => {
      Object.assign(settings, defaults);
      skyMaterial.uniforms.cloudCoverage.value = settings.coverage;
      skyMaterial.uniforms.cloudScale.value = settings.scale;
      skyMaterial.uniforms.cloudOpacity.value = settings.opacity;
      skyMaterial.uniforms.cloudLightAbsorption.value = settings.lightAbsorption;
    }
  };
};
