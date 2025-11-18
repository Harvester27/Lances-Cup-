import * as THREE from 'three';
import { createMoonTexture } from './createMoonTexture';

// Konstanty pro střední Evropu (Praha), 21. června 2024
const LATITUDE = 50.08;
const LONGITUDE = 14.44;
const JUNE_21_2024 = 172;

// Lunární konstanty
const LUNAR_MONTH = 29.53059;
const NEW_MOON_REF = 6; // 6. června 2024 byl nov

/**
 * Výpočet fáze měsíce pro daný den v roce
 */
const calculateMoonPhase = (dayOfYear) => {
  const daysSinceNewMoon = dayOfYear - NEW_MOON_REF;
  const phase = (daysSinceNewMoon % LUNAR_MONTH) / LUNAR_MONTH;
  return phase < 0 ? phase + 1 : phase;
};

/**
 * Výpočet pozice měsíce pro daný čas
 */
const calculateMoonPosition = (hours, dayOfYear = JUNE_21_2024) => {
  const phase = calculateMoonPhase(dayOfYear);
  const moonDeclination = -18.0 * Math.PI / 180;
  const moonDelay = phase * 24;
  const moonHours = hours - moonDelay;
  const hourAngle = (moonHours - 12) * 15 * Math.PI / 180;
  const lat = LATITUDE * Math.PI / 180;
  
  const sinElevation = Math.sin(lat) * Math.sin(moonDeclination) + 
                       Math.cos(lat) * Math.cos(moonDeclination) * Math.cos(hourAngle);
  const elevation = Math.asin(sinElevation);
  
  const cosAzimuth = (Math.sin(moonDeclination) - Math.sin(lat) * sinElevation) / 
                     (Math.cos(lat) * Math.cos(elevation));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAzimuth)));
  
  if (hourAngle > 0) {
    azimuth = 2 * Math.PI - azimuth;
  }
  
  return { azimuth, elevation, phase };
};

/**
 * Převede azimut a elevaci na 3D pozici
 */
const getMoonPosition3D = (azimut, elevation, distance = 400) => {
  const x = distance * Math.cos(elevation) * Math.sin(azimut);
  const y = distance * Math.sin(elevation);
  const z = -distance * Math.cos(elevation) * Math.cos(azimut);
  return new THREE.Vector3(x, y, z);
};

/**
 * Inicializace měsíčního systému s mesh a texturou
 */
export const initMoonSystem = (scene, startHour = 12, startDay = JUNE_21_2024) => {
  let currentTime = startHour;
  let currentDay = startDay;
  
  // Vytvoření textury měsíce
  const moonCanvas = createMoonTexture();
  const moonTexture = new THREE.CanvasTexture(moonCanvas);
  moonTexture.needsUpdate = true;
  
  // Vytvoření sphere pro měsíc
  const moonGeometry = new THREE.SphereGeometry(8, 64, 64);
  const moonMaterial = new THREE.MeshStandardMaterial({
    map: moonTexture,
    emissive: 0xffffee,
    emissiveIntensity: 0.15, // Slabé vlastní svícení
    roughness: 1.0,
    metalness: 0.0
  });
  
  const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
  moonMesh.castShadow = false;
  moonMesh.receiveShadow = false;
  moonMesh.renderOrder = 1; // Vykreslovat před mraky (sky sphere má renderOrder 0)
  scene.add(moonMesh);
  
  // DirectionalLight pro osvětlení měsíce (simuluje slunce)
  const moonLight = new THREE.DirectionalLight(0xffffff, 1.5);
  const moonLightTarget = new THREE.Object3D();
  moonLight.target = moonLightTarget;
  scene.add(moonLight);
  scene.add(moonLightTarget);
  
  const updateMoon = (time, day, sunPosition = null) => {
    const { azimuth, elevation, phase } = calculateMoonPosition(time, day);
    const elevationDeg = elevation * 180 / Math.PI;
    const moonPosition = getMoonPosition3D(azimuth, elevation);
    
    // Umístit měsíc
    moonMesh.position.copy(moonPosition);
    
    // Měsíc vždy otočený stejnou stranou k Zemi (lookAt center)
    moonMesh.lookAt(0, 0, 0);
    
    // Osvětlení měsíce sluncem
    if (sunPosition) {
      // Světlo směřuje od slunce k měsíci
      const lightDirection = new THREE.Vector3().subVectors(moonPosition, sunPosition).normalize();
      moonLight.position.copy(sunPosition);
      moonLight.target.position.copy(moonPosition);
      moonLight.target.updateMatrixWorld();
    }
    
    // Viditelnost podle elevace
    if (elevationDeg > -5) {
      moonMesh.visible = true;
      
      // Fade podle elevace
      if (elevationDeg < 5) {
        const opacity = (elevationDeg + 5) / 10;
        moonMaterial.opacity = opacity;
        moonMaterial.transparent = true;
      } else {
        moonMaterial.opacity = 1.0;
        moonMaterial.transparent = false;
      }
      
      // Emissive intenzita podle výšky (vlastní svícení)
      const emissiveIntensity = Math.min(elevationDeg / 30, 1) * 0.15;
      moonMaterial.emissiveIntensity = Math.max(emissiveIntensity, 0.05);
    } else {
      moonMesh.visible = false;
    }
  };
  
  // Iniciální update
  updateMoon(currentTime, currentDay);
  
  return {
    update: (time, day = currentDay, sunPosition = null) => {
      currentTime = time;
      currentDay = day;
      updateMoon(time, day, sunPosition);
    },
    
    moonMesh,
    moonLight,
    
    getPhase: () => calculateMoonPhase(currentDay),
    
    getPhaseDescription: () => {
      const phase = calculateMoonPhase(currentDay);
      if (phase < 0.05 || phase > 0.95) return 'Nov (New Moon)';
      if (phase < 0.25) return 'Dorůstající srpek (Waxing Crescent)';
      if (phase < 0.30) return 'První čtvrť (First Quarter)';
      if (phase < 0.45) return 'Dorůstající měsíc (Waxing Gibbous)';
      if (phase < 0.55) return 'Úplněk (Full Moon)';
      if (phase < 0.70) return 'Ubývající měsíc (Waning Gibbous)';
      if (phase < 0.75) return 'Poslední čtvrť (Last Quarter)';
      return 'Ubývající srpek (Waning Crescent)';
    },
    
    setDay: (day) => {
      currentDay = day;
      updateMoon(currentTime, day);
    }
  };
};

// Pro zpětnou kompatibilitu - prázdné funkce
export const addMoonShaderCode = () => {};
export const addMoonUniforms = () => {};
