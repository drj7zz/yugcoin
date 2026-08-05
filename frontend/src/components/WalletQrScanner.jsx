import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, LoaderCircle, Upload, X } from 'lucide-react';

function recipientFromQr(value) {
  const [prefix, username] = String(value || '').split('|');
  return prefix === 'YUGCOIN' && username ? `@${username}` : value;
}

export default function WalletQrScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState('Starting camera…');
  const [uploading, setUploading] = useState(false);

  const readUploadedQr = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!('BarcodeDetector' in window)) {
      setStatus('QR image upload is not supported by this browser. Enter the address manually.');
      return;
    }

    setUploading(true);
    setStatus('Reading QR image…');
    try {
      const image = await createImageBitmap(file);
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const codes = await detector.detect(image);
      image.close?.();
      const value = codes[0]?.rawValue?.trim();
      if (!value) {
        setStatus('No QR code was found in that image. Try another image or use the camera.');
        return;
      }
      onScan(recipientFromQr(value));
    } catch {
      setStatus('That image could not be read. Try a clear PNG or JPG QR image.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const stopCamera = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const startScanner = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('Camera access is unavailable in this browser. Enter the address manually.');
        return;
      }

      if (!('BarcodeDetector' in window)) {
        setStatus('QR scanning is not supported by this browser. Enter the address manually.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        setStatus('Point your camera at a YugCoin wallet QR code.');

        const scan = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const value = codes[0]?.rawValue?.trim();
            if (value) {
              stopCamera();
              onScan(recipientFromQr(value));
              return;
            }
          } catch {
            // Frame may not be ready yet; continue scanning.
          }
          timerRef.current = setTimeout(scan, 180);
        };
        scan();
      } catch (error) {
        setStatus(error.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow access or enter the address manually.'
          : 'Unable to open the camera. Enter the address manually.');
      }
    };

    startScanner();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [onScan]);

  return (
    <div className="scanner-panel animate-slide-in" aria-live="polite">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2" style={{ fontWeight: 700 }}>
          <Camera size={18} color="var(--primary)" /> Scan recipient QR
        </div>
        <button type="button" className="scanner-close" onClick={onClose} aria-label="Close QR scanner">
          <X size={16} />
        </button>
      </div>
      <div className="scanner-preview">
        <video ref={videoRef} muted playsInline aria-label="Camera preview for QR scanning" />
        <div className="scanner-target" aria-hidden="true" />
      </div>
      <p className="scanner-status">
        {status.startsWith('Starting') && <LoaderCircle className="scanner-spinner" size={15} />}
        {status.includes('unavailable') || status.includes('not supported') || status.includes('Unable') ? <CameraOff size={15} /> : null}
        {status}
      </p>
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={readUploadedQr} hidden />
      <button type="button" className="scanner-upload" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
        {uploading ? <LoaderCircle className="scanner-spinner" size={16} /> : <Upload size={16} />}
        {uploading ? 'Reading QR image…' : 'Upload QR image'}
      </button>
    </div>
  );
}
