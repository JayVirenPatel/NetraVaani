/**
 * Camera stream management and frame snapshotting.
 * Provides high-speed canvas capture downscaled to 768px for multimodal AI.
 */

let activeStream: MediaStream | null = null;

export async function initCamera(facingMode: 'environment' | 'user' = 'environment'): Promise<MediaStream> {
  // If we already have an active track of the desired facing mode, reuse it
  if (activeStream && activeStream.active) {
    return activeStream;
  }

  // Stop previous tracks if switching
  stopCamera();

  const constraints: MediaStreamConstraints = {
    video: {
      facingMode: { ideal: facingMode },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  };

  try {
    activeStream = await navigator.mediaDevices.getUserMedia(constraints);
    return activeStream;
  } catch (err) {
    console.warn('Could not get environment camera, falling back to any video device:', err);
    activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    return activeStream;
  }
}

export function stopCamera() {
  if (activeStream) {
    activeStream.getTracks().forEach((track) => track.stop());
    activeStream = null;
  }
}

/**
 * Toggle Camera Torch (Flashlight) on mobile devices for dark conditions
 */
export async function toggleTorch(forceState?: boolean): Promise<boolean> {
  if (!activeStream) return false;
  const track = activeStream.getVideoTracks()[0];
  if (!track) return false;

  try {
    const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
    if (!capabilities.torch) return false;

    const settings: any = track.getSettings ? track.getSettings() : {};
    const nextState = forceState !== undefined ? forceState : !settings.torch;

    await track.applyConstraints({
      advanced: [{ torch: nextState } as any],
    });
    return nextState;
  } catch (err) {
    console.warn('Torch toggle error:', err);
    return false;
  }
}

/**
 * Capture current frame from a video HTML element onto an offscreen canvas
 * Scaled to max width 768px as requested in specifications for optimal speed & bandwidth.
 */
export function captureFrame(videoElement: HTMLVideoElement): string | null {
  if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
    return null;
  }

  const canvas = document.createElement('canvas');
  const maxWidth = 768;
  const originalWidth = videoElement.videoWidth;
  const originalHeight = videoElement.videoHeight;

  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  if (originalWidth > maxWidth) {
    const scale = maxWidth / originalWidth;
    targetWidth = maxWidth;
    targetHeight = Math.round(originalHeight * scale);
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL('image/jpeg', 0.82);
}

/**
 * High-quality preset demo frames for hackathon judges / testing when camera is unavailable
 */
export const DEMO_PRESET_FRAMES = [
  {
    id: 'hallway_stairs',
    name: 'Hallway with Downward Stairs (Hazard)',
    description: 'Indoor corridor with steps 3 paces ahead, handrail on left.',
    // A clean SVG data URL depicting a hallway with stairs down
    dataUrl: createDemoSceneSvg('stairs'),
  },
  {
    id: 'currency_500',
    name: 'Indian Currency Note (₹500)',
    description: 'Mahatma Gandhi series ₹500 currency note on wooden desk.',
    dataUrl: createDemoSceneSvg('currency'),
  },
  {
    id: 'medicine_strip',
    name: 'Medicine Package with Label',
    description: 'Paracetamol 650mg tablet strip with instructions.',
    dataUrl: createDemoSceneSvg('medicine'),
  },
  {
    id: 'path_obstacle',
    name: 'Living Room with Chair Obstacle',
    description: 'A wooden chair positioned directly in the walking line at 12 o\'clock.',
    dataUrl: createDemoSceneSvg('chair'),
  },
];

function createDemoSceneSvg(type: 'stairs' | 'currency' | 'medicine' | 'chair'): string {
  let svgContent = '';

  if (type === 'stairs') {
    svgContent = `
      <rect width="768" height="512" fill="#1e293b"/>
      <rect x="180" y="80" width="408" height="432" fill="#334155"/>
      <path d="M180,300 L588,300 L588,340 L180,340 Z" fill="#0f172a"/>
      <path d="M180,340 L588,340 L588,380 L180,380 Z" fill="#090d16"/>
      <path d="M180,380 L588,380 L588,430 L180,430 Z" fill="#020617"/>
      <path d="M180,430 L588,430 L588,512 L180,512 Z" fill="#000000"/>
      <line x1="200" y1="80" x2="200" y2="512" stroke="#e2e8f0" stroke-width="8"/>
      <text x="384" y="270" fill="#facc15" font-size="28" font-family="sans-serif" font-weight="bold" text-anchor="middle">STEEP FLIGHT OF STAIRS DOWN (3 STEPS AHEAD)</text>
      <text x="384" y="470" fill="#f87171" font-size="22" font-family="sans-serif" text-anchor="middle">CAUTION: DROP-OFF AHEAD</text>
    `;
  } else if (type === 'currency') {
    svgContent = `
      <rect width="768" height="512" fill="#292524"/>
      <rect x="94" y="106" width="580" height="300" rx="16" fill="#e2e8f0" stroke="#94a3b8" stroke-width="4"/>
      <rect x="110" y="122" width="548" height="268" rx="8" fill="#d97706" opacity="0.85"/>
      <circle cx="210" cy="256" r="60" fill="#fef3c7" stroke="#78350f" stroke-width="3"/>
      <text x="210" y="265" font-size="22" font-family="sans-serif" font-weight="bold" fill="#78350f" text-anchor="middle">GANDHI</text>
      <text x="540" y="210" font-size="72" font-family="sans-serif" font-weight="bold" fill="#ffffff">₹500</text>
      <text x="540" y="270" font-size="28" font-family="sans-serif" font-weight="bold" fill="#fef3c7">RESERVE BANK OF INDIA</text>
      <text x="540" y="320" font-size="24" font-family="sans-serif" fill="#ffffff">FIVE HUNDRED RUPEES</text>
      <rect x="340" y="122" width="12" height="268" fill="#15803d"/>
    `;
  } else if (type === 'medicine') {
    svgContent = `
      <rect width="768" height="512" fill="#0f172a"/>
      <rect x="120" y="110" width="528" height="292" rx="12" fill="#f8fafc" stroke="#3b82f6" stroke-width="6"/>
      <rect x="120" y="110" width="528" height="60" fill="#dc2626"/>
      <text x="140" y="150" font-size="28" font-family="sans-serif" font-weight="bold" fill="#ffffff">PARACETAMOL TABLETS IP 650 MG</text>
      <text x="140" y="230" font-size="32" font-family="sans-serif" font-weight="bold" fill="#0f172a">DOLO 650</text>
      <text x="140" y="280" font-size="20" font-family="sans-serif" fill="#475569">Dosage: As directed by physician. For fever &amp; mild pain.</text>
      <text x="140" y="330" font-size="20" font-family="sans-serif" font-weight="bold" fill="#059669">Exp. Date: 12/2028 | Batch: DL-4921</text>
      <text x="140" y="375" font-size="22" font-family="sans-serif" font-weight="bold" fill="#dc2626">SCHEDULE H PRESCRIPTION DRUG</text>
    `;
  } else {
    // chair
    svgContent = `
      <rect width="768" height="512" fill="#18181b"/>
      <rect x="100" y="320" width="568" height="192" fill="#27272a"/>
      <rect x="290" y="140" width="188" height="220" rx="8" fill="#b45309" stroke="#78350f" stroke-width="6"/>
      <rect x="270" y="300" width="228" height="40" rx="6" fill="#92400e"/>
      <rect x="280" y="340" width="20" height="130" fill="#78350f"/>
      <rect x="468" y="340" width="20" height="130" fill="#78350f"/>
      <text x="384" y="100" fill="#facc15" font-size="28" font-family="sans-serif" font-weight="bold" text-anchor="middle">CHAIR AT 12 O'CLOCK (2 STEPS AHEAD)</text>
      <text x="384" y="490" fill="#4ade80" font-size="22" font-family="sans-serif" text-anchor="middle">Clear path on your left at 10 o'clock</text>
    `;
  }

  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="512" viewBox="0 0 768 512">${svgContent}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
}
