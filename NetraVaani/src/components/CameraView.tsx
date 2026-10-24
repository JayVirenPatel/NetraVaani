import React, { useRef, useEffect } from 'react';
import { Camera, SwitchCamera, AlertTriangle, ShieldCheck, Flashlight } from 'lucide-react';

interface CameraViewProps {
  stream: MediaStream | null;
  cameraFacingMode: 'environment' | 'user';
  onToggleFacingMode: () => void;
  mockFrameDataUrl: string | null;
  onClearMockFrame: () => void;
  isWalkingMode: boolean;
  cameraError: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isTorchOn?: boolean;
  onToggleTorch?: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  stream,
  cameraFacingMode,
  onToggleFacingMode,
  mockFrameDataUrl,
  onClearMockFrame,
  isWalkingMode,
  cameraError,
  videoRef,
  isTorchOn = false,
  onToggleTorch,
}) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Sync stream to video element
  useEffect(() => {
    const video = videoRef?.current || localVideoRef.current;
    if (video) {
      if (stream) {
        video.srcObject = stream;
        video.play().catch((err) => {
          console.warn('Video auto-play interrupted:', err);
        });
      } else {
        video.srcObject = null;
      }
    }
  }, [stream, videoRef]);

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden flex items-center justify-center">
      {/* 1. Live Video Stream */}
      {!mockFrameDataUrl && (
        <video
          ref={videoRef as any}
          playsInline
          muted
          autoPlay
          className="w-full h-full object-cover select-none"
          aria-label="Live camera preview feed"
        />
      )}

      {/* 2. Mock Scene Preview (if user or judge selected a preset demo frame) */}
      {mockFrameDataUrl && (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
          <img
            src={mockFrameDataUrl}
            alt="Demo Scene Preview"
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 left-4 bg-amber-400 text-black px-3 py-1.5 rounded-lg font-black text-xs flex items-center gap-1.5 shadow-lg">
            <span>DEMO TEST SCENE ACTIVE</span>
            <button
              onClick={onClearMockFrame}
              className="ml-2 underline font-bold bg-black text-yellow-300 px-2 py-0.5 rounded text-[11px]"
              aria-label="Switch back to live camera feed"
            >
              Use Live Camera
            </button>
          </div>
        </div>
      )}

      {/* Camera Blocked/Error Notice */}
      {cameraError && !mockFrameDataUrl && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-20">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mb-3 animate-bounce" />
          <h2 className="text-xl font-bold text-yellow-300 mb-2">Camera Unavailable</h2>
          <p className="text-zinc-300 text-sm max-w-sm mb-4">
            {cameraError}
          </p>
          <p className="text-yellow-400 text-xs">
            Tip: You can still select test scenes in the Judge Panel or use voice commands.
          </p>
        </div>
      )}

      {/* High-Contrast Framing Reticle for Low-Vision Navigation */}
      <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between">
        {/* Top Corners */}
        <div className="flex justify-between w-full">
          <div className="w-10 h-10 border-t-4 border-l-4 border-yellow-400 rounded-tl-xl shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
          <div className="w-10 h-10 border-t-4 border-r-4 border-yellow-400 rounded-tr-xl shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
        </div>

        {/* Center Orientation Guide Crosshairs */}
        <div className="self-center flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-12 h-0.5 bg-yellow-400" />
          <div className="w-4 h-4 rounded-full border-2 border-yellow-400" />
          <div className="w-12 h-0.5 bg-yellow-400" />
        </div>

        {/* Bottom Corners */}
        <div className="flex justify-between w-full">
          <div className="w-10 h-10 border-b-4 border-l-4 border-yellow-400 rounded-bl-xl shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
          <div className="w-10 h-10 border-b-4 border-r-4 border-yellow-400 rounded-br-xl shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
        </div>
      </div>

      {/* Top Floating Controls on Video */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
        {/* Flashlight Torch Toggle */}
        {onToggleTorch && (
          <button
            onClick={onToggleTorch}
            className={`p-2.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
              isTorchOn
                ? 'bg-yellow-400 text-black border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                : 'bg-black/80 hover:bg-black border-yellow-400 text-yellow-300'
            }`}
            aria-label={`Toggle camera light. Currently ${isTorchOn ? 'ON' : 'OFF'}`}
            title="Toggle Flashlight / Torch"
          >
            <Flashlight className="w-5 h-5" />
          </button>
        )}

        {/* Rear/Front Camera Switch */}
        <button
          onClick={onToggleFacingMode}
          className="p-2.5 bg-black/80 hover:bg-black border-2 border-yellow-400 text-yellow-300 rounded-xl backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-yellow-300"
          aria-label={`Switch camera. Current is ${cameraFacingMode === 'environment' ? 'Rear' : 'Front'}`}
          title="Switch Camera (Front/Rear)"
        >
          <SwitchCamera className="w-5 h-5" />
        </button>
      </div>

      {/* Walking Mode Guardian Banner Overlay */}
      {isWalkingMode && (
        <div className="absolute top-3 left-3 bg-black/85 border-2 border-amber-400 px-3 py-1.5 rounded-xl flex items-center gap-2 z-20 backdrop-blur-md">
          <ShieldCheck className="w-5 h-5 text-amber-400 animate-pulse" />
          <div>
            <div className="text-[11px] font-black tracking-wider text-amber-400">
              WALKING GUARDIAN ACTIVE
            </div>
            <div className="text-[10px] text-zinc-300">
              Scanning path every 6 seconds
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
