import * as THREE from 'three';

/**
 * Vytvoří Three.js materiál podle zadaného typu
 * @param {string} materialType - Typ materiálu ('standard', 'metallic', 'matte', 'glass', 'neon', 'wood', 'plastic', 'ice')
 * @param {number} color - Barva v hexadecimálním formátu
 * @param {boolean} forGhost - Zda je materiál pro ghost objekt (průhledný)
 * @returns {THREE.Material} Three.js materiál
 */
export const createMaterial = (materialType, color, forGhost = false) => {
  const baseOptions = {
    color: color,
  };
  
  if (forGhost) {
    baseOptions.transparent = true;
    baseOptions.opacity = 0.5;
  }
  
  switch (materialType) {
    case 'metallic':
      return new THREE.MeshStandardMaterial({
        ...baseOptions,
        metalness: 0.9,
        roughness: 0.2
      });
    case 'matte':
      return new THREE.MeshLambertMaterial(baseOptions);
    case 'glass':
      return new THREE.MeshPhysicalMaterial({
        ...baseOptions,
        transparent: true,
        opacity: forGhost ? 0.3 : 0.4,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 0.5
      });
    case 'neon':
      return new THREE.MeshStandardMaterial({
        ...baseOptions,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.3
      });
    case 'wood':
      return new THREE.MeshStandardMaterial({
        ...baseOptions,
        roughness: 0.8,
        metalness: 0.1
      });
    case 'plastic':
      return new THREE.MeshPhongMaterial({
        ...baseOptions,
        shininess: 120,
        specular: 0x444444
      });
    case 'ice':
      return new THREE.MeshPhysicalMaterial({
        color: forGhost ? color : new THREE.Color(color).lerp(new THREE.Color(0xaaddff), 0.3),
        transparent: true,
        opacity: forGhost ? 0.4 : 0.7,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.6,
        thickness: 0.8,
        ior: 1.31,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });
    case 'standard':
    default:
      return new THREE.MeshPhongMaterial({
        ...baseOptions,
        shininess: 100
      });
  }
};
