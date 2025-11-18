// Vytvoření procedurální textury měsíce
export const createMoonTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Základní šedá barva měsíce
  ctx.fillStyle = '#d4d4d4';
  ctx.fillRect(0, 0, 1024, 1024);
  
  // Simplex noise pro krátery (zjednodušená verze)
  const noise = (x, y, scale) => {
    const X = Math.floor(x * scale) & 255;
    const Y = Math.floor(y * scale) & 255;
    const seed = X * 374761393 + Y * 668265263;
    return ((seed ^ (seed >> 13)) & 0xFF) / 255;
  };
  
  // Vrstvené krátery
  for (let y = 0; y < 1024; y++) {
    for (let x = 0; x < 1024; x++) {
      let n = 0;
      n += noise(x, y, 0.003) * 0.5;
      n += noise(x, y, 0.007) * 0.25;
      n += noise(x, y, 0.015) * 0.125;
      n += noise(x, y, 0.03) * 0.0625;
      
      const brightness = Math.floor(180 + n * 75);
      const imageData = ctx.getImageData(x, y, 1, 1);
      imageData.data[0] = brightness;
      imageData.data[1] = brightness;
      imageData.data[2] = brightness;
      ctx.putImageData(imageData, x, y);
    }
  }
  
  // Velké tmavé oblasti (maria)
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
  
  // Několik velkých tmavých ploch
  ctx.beginPath();
  ctx.arc(300, 400, 180, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(650, 300, 150, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(500, 600, 120, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalCompositeOperation = 'source-over';
  
  // Velké krátery (tmavé kruhy)
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const r = 10 + Math.random() * 40;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, 'rgba(80, 80, 80, 0.4)');
    gradient.addColorStop(0.7, 'rgba(120, 120, 120, 0.2)');
    gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return canvas;
};
