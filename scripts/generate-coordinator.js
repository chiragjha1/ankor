const sharp = require('sharp');

const svg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="halftone" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="12" r="3.5" fill="#161716" opacity="0.18"/>
    </pattern>
    <radialGradient id="bgGrad" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#CCFBF1"/>
      <stop offset="70%" stop-color="#99F6E4"/>
      <stop offset="100%" stop-color="#5EEAD4"/>
    </radialGradient>
  </defs>

  <!-- Background Canvas -->
  <rect width="1024" height="1024" fill="url(#bgGrad)"/>
  <rect width="1024" height="1024" fill="url(#halftone)"/>

  <!-- Heavy Comic Ink Border -->
  <rect x="24" y="24" width="976" height="976" fill="none" stroke="#161716" stroke-width="24"/>
  <rect x="44" y="44" width="936" height="936" fill="none" stroke="#161716" stroke-width="6" stroke-dasharray="12,12"/>

  <!-- Shadow Aura -->
  <ellipse cx="512" cy="780" rx="340" ry="160" fill="#161716" opacity="0.15"/>

  <!-- Shoulders & Coat -->
  <path d="M210 1000 C210 740 330 660 420 640 L450 720 L512 840 L574 720 L604 640 C694 660 814 740 814 1000 Z" fill="#FFFFFF" stroke="#161716" stroke-width="16" stroke-linejoin="round"/>
  <path d="M420 640 L512 760 L604 640" fill="#0F766E" stroke="#161716" stroke-width="16"/>
  
  <!-- Coat Lapels -->
  <path d="M420 640 L450 900 L512 1000 L574 900 L604 640" fill="none" stroke="#161716" stroke-width="14"/>
  
  <!-- Neck -->
  <rect x="460" y="500" width="104" height="160" rx="20" fill="#FCE7D0" stroke="#161716" stroke-width="16"/>
  <path d="M460 580 C485 620 539 620 564 580" fill="#E0BA98" opacity="0.4"/>

  <!-- Head & Face -->
  <ellipse cx="512" cy="430" rx="170" ry="200" fill="#FDEFD9" stroke="#161716" stroke-width="18"/>

  <!-- Hair: Sophisticated Bob with Bold Comic Inking -->
  <path d="M320 400 C310 240 400 170 512 170 C624 170 714 240 704 400 C680 340 640 290 512 290 C384 290 344 340 320 400 Z" fill="#1E293B" stroke="#161716" stroke-width="18"/>
  <path d="M320 400 C310 470 330 550 360 590 L390 510 C360 470 350 430 350 400 Z" fill="#1E293B" stroke="#161716" stroke-width="14"/>
  <path d="M704 400 C714 470 694 550 664 590 L634 510 C664 470 674 430 674 400 Z" fill="#1E293B" stroke="#161716" stroke-width="14"/>

  <!-- Glasses / Eyewear -->
  <rect x="380" y="380" width="100" height="70" rx="16" fill="#FFFFFF" opacity="0.85" stroke="#0F766E" stroke-width="14"/>
  <rect x="544" y="380" width="100" height="70" rx="16" fill="#FFFFFF" opacity="0.85" stroke="#0F766E" stroke-width="14"/>
  <line x1="480" y1="415" x2="544" y2="415" stroke="#0F766E" stroke-width="14"/>
  <!-- Eyes behind glasses -->
  <circle cx="430" cy="415" r="12" fill="#161716"/>
  <circle cx="594" cy="415" r="12" fill="#161716"/>
  <circle cx="434" cy="411" r="4" fill="#FFFFFF"/>
  <circle cx="598" cy="411" r="4" fill="#FFFFFF"/>

  <!-- Eyebrows -->
  <path d="M380 360 Q430 345 475 365" fill="none" stroke="#161716" stroke-width="10" stroke-linecap="round"/>
  <path d="M549 365 Q594 345 644 360" fill="none" stroke="#161716" stroke-width="10" stroke-linecap="round"/>

  <!-- Nose & Smile -->
  <path d="M512 435 L500 480 L524 480" fill="none" stroke="#161716" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M465 525 Q512 555 559 525" fill="none" stroke="#161716" stroke-width="12" stroke-linecap="round"/>

  <!-- Communication Headset (Simulation Coordinator Feature) -->
  <path d="M320 400 C320 220 704 220 704 400" fill="none" stroke="#475569" stroke-width="18" stroke-linecap="round"/>
  <!-- Earpiece -->
  <rect x="684" y="360" width="44" height="80" rx="14" fill="#0F766E" stroke="#161716" stroke-width="12"/>
  <rect x="296" y="360" width="44" height="80" rx="14" fill="#0F766E" stroke="#161716" stroke-width="12"/>
  <!-- Mic Boom -->
  <path d="M684 420 Q640 500 550 510" fill="none" stroke="#161716" stroke-width="12" stroke-linecap="round"/>
  <circle cx="540" cy="510" r="14" fill="#FEF08A" stroke="#161716" stroke-width="8"/>

  <!-- Coffee Mug (Bottom Corner Accent) -->
  <rect x="260" y="820" width="120" height="150" rx="16" fill="#0F766E" stroke="#161716" stroke-width="14"/>
  <path d="M380 850 C430 850 430 930 380 930" fill="none" stroke="#161716" stroke-width="14"/>
  <!-- Steam from coffee -->
  <path d="M300 800 Q315 760 300 730" fill="none" stroke="#161716" stroke-width="8" stroke-linecap="round"/>
  <path d="M340 800 Q355 750 340 720" fill="none" stroke="#161716" stroke-width="8" stroke-linecap="round"/>
</svg>
`;

sharp(Buffer.from(svg))
  .jpeg({ quality: 95 })
  .toFile('public/brand/agents/simulation_coordinator.jpg')
  .then(() => {
    console.log('Successfully generated simulation_coordinator.jpg');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error generating image:', err);
    process.exit(1);
  });
