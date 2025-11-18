import * as THREE from 'three';

// Konstanty pro střední Evropu (Praha), 21. června - letní slunovrat
// V tento den má slunce maximální deklinaci a nejdelší den v roce
const LATITUDE = 50.08;  // Praha
const LONGITUDE = 14.44; // Praha
const SUMMER_SOLSTICE = 172; // Den v roce (21. června)

/**
 * Výpočet pozice slunce pro daný čas
 * @param {number} hours - Hodiny od půlnoci (0-24)
 * @returns {Object} azimut a elevace v radiánech
 */
const calculateSunPosition = (hours) => {
  // Deklinace pro letní slunovrat (23.44°)
  const declination = 23.44 * Math.PI / 180;
  
  // Hodinový úhel (15° za hodinu od poledne)
  const hourAngle = (hours - 12) * 15 * Math.PI / 180;
  
  const lat = LATITUDE * Math.PI / 180;
  
  // Elevace (výška nad horizontem)
  const sinElevation = Math.sin(lat) * Math.sin(declination) + 
                       Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
  const elevation = Math.asin(sinElevation);
  
  // Azimut (směr od severu)
  const cosAzimuth = (Math.sin(declination) - Math.sin(lat) * sinElevation) / 
                     (Math.cos(lat) * Math.cos(elevation));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAzimuth)));
  
  if (hourAngle > 0) {
    azimuth = 2 * Math.PI - azimuth;
  }
  
  return { azimuth, elevation };
};

/**
 * Převede azimut a elevaci na 3D pozici slunce
 * @param {number} azimut - Azimut v radiánech (0 = sever, π/2 = východ, π = jih, 3π/2 = západ)
 * @param {number} elevation - Elevace v radiánech (výška nad horizontem)
 * @param {number} distance - Vzdálenost od středu
 * @returns {THREE.Vector3} 3D pozice slunce
 */
const getSunPosition3D = (azimut, elevation, distance = 300) => {
  // Převod astronomického azimutu na Three.js souřadnice
  // V Three.js: +X = východ, +Y = nahoru, -Z = sever
  // Azimut: 0° = sever, 90° = východ, 180° = jih, 270° = západ
  
  const x = distance * Math.cos(elevation) * Math.sin(azimut);
  const y = distance * Math.sin(elevation);
  const z = -distance * Math.cos(elevation) * Math.cos(azimut);
  
  return new THREE.Vector3(x, y, z);
};

/**
 * Výpočet barvy slunce podle elevace
 * @param {number} elevation - Elevace v radiánech
 * @returns {THREE.Color} Barva slunce
 */
const getSunColor = (elevation) => {
  const elevationDeg = elevation * 180 / Math.PI;
  
  if (elevationDeg < -15) {
    // Hluboká noc - minimální viditelná barva
    return new THREE.Color(0x332211);
  } else if (elevationDeg < -5) {
    // Pozdní noc/brzký úsvit - tmavě oranžová
    const t = (elevationDeg + 15) / 10;
    return new THREE.Color().lerpColors(
      new THREE.Color(0x332211),
      new THREE.Color(0xff4400),
      t
    );
  } else if (elevationDeg < 5) {
    // Východ/západ - oranžová až červená
    const t = (elevationDeg + 5) / 10;
    return new THREE.Color().lerpColors(
      new THREE.Color(0xff4400),
      new THREE.Color(0xff8833),
      t
    );
  } else if (elevationDeg < 15) {
    // Ranní/večerní - žlutooranžová
    const t = (elevationDeg - 5) / 10;
    return new THREE.Color().lerpColors(
      new THREE.Color(0xff8833),
      new THREE.Color(0xffcc66),
      t
    );
  } else {
    // Den - žlutobílá
    const t = Math.min((elevationDeg - 15) / 45, 1);
    return new THREE.Color().lerpColors(
      new THREE.Color(0xffcc66),
      new THREE.Color(0xffff99),
      t
    );
  }
};

/**
 * Výpočet barvy oblohy podle elevace
 * @param {number} elevation - Elevace v radiánech
 * @returns {Object} topColor a bottomColor
 */
const getSkyColors = (elevation) => {
  const elevationDeg = elevation * 180 / Math.PI;
  
  if (elevationDeg < 0) {
    // Před východem - obloha zůstává TMAVÁ
    // Červená/oranžová se přidá jen přes shader ve směru slunce
    const t = Math.max((elevationDeg + 10) / 10, 0); // Postupné zesvětlení
    return {
      topColor: new THREE.Color().lerpColors(
        new THREE.Color(0x000033),
        new THREE.Color(0x0a0a1a), // Trochu světlejší než úplná tma
        t
      ),
      bottomColor: new THREE.Color().lerpColors(
        new THREE.Color(0x000011),
        new THREE.Color(0x0a0a15), // Trochu světlejší než úplná tma
        t
      )
    };
  } else if (elevationDeg < 5) {
    // Východ slunce (5:00-5:30) - přechod z tmy do světla
    const t = elevationDeg / 5;
    return {
      topColor: new THREE.Color().lerpColors(
        new THREE.Color(0x0a0a1a),
        new THREE.Color(0x3a4a6c), // Modrofialová
        t
      ),
      bottomColor: new THREE.Color().lerpColors(
        new THREE.Color(0x0a0a15),
        new THREE.Color(0x5a7a9c), // Světle modrofialová
        t
      )
    };
  } else if (elevationDeg < 15) {
    // Brzké ráno (5:30-7:00) - přechod do plného dne
    const t = (elevationDeg - 5) / 10;
    return {
      topColor: new THREE.Color().lerpColors(
        new THREE.Color(0x3a4a6c),
        new THREE.Color(0x5588cc),
        t
      ),
      bottomColor: new THREE.Color().lerpColors(
        new THREE.Color(0x5a7a9c),
        new THREE.Color(0x89cff0), // Světle modrá
        t
      )
    };
  } else {
    // Den
    const t = Math.min((elevationDeg - 15) / 45, 1);
    return {
      topColor: new THREE.Color().lerpColors(
        new THREE.Color(0x5588cc),
        new THREE.Color(0x0077ff),
        t
      ),
      bottomColor: new THREE.Color().lerpColors(
        new THREE.Color(0x89cff0),
        new THREE.Color(0x89cff0),
        t
      )
    };
  }
};

/**
 * Inicializace slunečního systému
 * @param {THREE.Scene} scene - Scéna
 * @param {Object} lights - Objekt s odkazy na světla
 * @param {THREE.ShaderMaterial} skyMaterial - Materiál oblohy
 * @param {number} startHour - Počáteční hodina (0-24)
 * @param {Object} cloudSystem - Cloud system pro ovlivnění světla (optional)
 * @returns {Object} Objekt s update a setTime funkcemi
 */
export const initSunSystem = (scene, lights, skyMaterial, startHour = 12, cloudSystem = null) => {
  let currentTime = startHour;
  
  const updateSun = (time) => {
    // Výpočet pozice slunce
    const { azimuth, elevation } = calculateSunPosition(time);
    const elevationDeg = elevation * 180 / Math.PI;
    const sunPosition = getSunPosition3D(azimuth, elevation);
    
    // Update directional light
    lights.directionalLight.position.copy(sunPosition);
    
    // Výpočet faktoru pro oslabení světla mraky
    let cloudAbsorption = 1.0; // Bez mraků = plné světlo
    if (cloudSystem) {
      // Mraky snižují světlo podle coverage a lightAbsorption
      const coverage = cloudSystem.getCoverage();
      const absorption = cloudSystem.getLightAbsorption();
      cloudAbsorption = 1.0 - (coverage * absorption);
    }
    
    // Intenzita světla podle elevace a mraků
    if (elevationDeg > 0) {
      lights.directionalLight.intensity = 1.2 * Math.min(elevationDeg / 30, 1) * cloudAbsorption;
    } else {
      lights.directionalLight.intensity = 0;
    }
    
    // Update ambient light (také ovlivněné mraky)
    if (elevationDeg > 0) {
      lights.ambientLight.intensity = 0.4 * Math.min(elevationDeg / 30, 1) * cloudAbsorption;
    } else if (elevationDeg > -10) {
      lights.ambientLight.intensity = 0.1 * (1 + elevationDeg / 10) * cloudAbsorption;
    } else {
      lights.ambientLight.intensity = 0.05;
    }
    
    // Update oblohy
    const sunColor = getSunColor(elevation);
    const { topColor, bottomColor } = getSkyColors(elevation);
    
    // Barva červené záře při východu/západu
    let sunriseColor = new THREE.Color(0x000000); // Žádná záře ve dne
    let sunriseIntensity = 0;
    
    if (elevationDeg < 0 && elevationDeg > -10) {
      // Při východu/západu - červená/oranžová záře
      const t = (elevationDeg + 10) / 10;
      sunriseColor = new THREE.Color().lerpColors(
        new THREE.Color(0x000000),
        new THREE.Color(0xff4400), // Oranžová záře
        t
      );
      sunriseIntensity = t;
    } else if (elevationDeg >= 0 && elevationDeg < 5) {
      // Těsně po východu - světlejší oranžová
      const t = 1.0 - (elevationDeg / 5);
      sunriseColor = new THREE.Color().lerpColors(
        new THREE.Color(0xff9944),
        new THREE.Color(0xffbb66),
        1 - t
      );
      sunriseIntensity = t * 0.5;
    }
    
    skyMaterial.uniforms.sunDirection.value = sunPosition.clone().normalize();
    skyMaterial.uniforms.sunColor.value = sunColor;
    skyMaterial.uniforms.topColor.value = topColor;
    skyMaterial.uniforms.bottomColor.value = bottomColor;
    skyMaterial.uniforms.sunElevation.value = elevation;
    skyMaterial.uniforms.sunriseColor.value = sunriseColor;
    skyMaterial.uniforms.sunriseIntensity.value = sunriseIntensity;
    
    // Intenzita slunečního disku
    if (elevationDeg > 0) {
      skyMaterial.uniforms.sunIntensity.value = 1.5;
    } else if (elevationDeg > -5) {
      skyMaterial.uniforms.sunIntensity.value = 1.5 * (1 + elevationDeg / 5);
    } else {
      skyMaterial.uniforms.sunIntensity.value = 0;
    }
  };
  
  let timeSpeed = 0.0002; // 1 reálná sekunda = ~5 minut
  let isPaused = false;
  
  const update = () => {
    if (!isPaused) {
      currentTime += timeSpeed;
      if (currentTime >= 24) currentTime -= 24;
      if (currentTime < 0) currentTime += 24;
    }
    updateSun(currentTime);
    return currentTime;
  };
  
  const setTime = (newTime) => {
    currentTime = newTime;
    updateSun(currentTime);
  };
  
  const getSunPosition = () => {
    const { azimuth, elevation } = calculateSunPosition(currentTime);
    return getSunPosition3D(azimuth, elevation);
  };
  
  // Iniciální update
  updateSun(currentTime);
  
  return { 
    update, 
    setTime,
    getTime: () => currentTime,
    getSunPosition,
    speedUp: () => {
      timeSpeed = Math.min(timeSpeed * 2, 0.01);
    },
    slowDown: () => {
      timeSpeed = Math.max(timeSpeed / 2, 0.00005);
    },
    togglePause: () => {
      isPaused = !isPaused;
      return isPaused;
    },
    isPaused: () => isPaused,
    getSpeed: () => timeSpeed
  };
};
