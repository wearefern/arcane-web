import { useEffect, useState } from 'react';
import QRCodeLib from 'qrcode';

/** Renders a real QR (from the token) on a warm-white tile — reads as a true
 *  ticket against the dark credential. Placeholder data only; never validated. */
export function QRCode({ value, size = 120, label = 'Entry QR code' }: { value: string; size?: number; label?: string }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let active = true;
    QRCodeLib.toDataURL(value, {
      margin: 0,
      width: size * 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0a0a0bff', light: '#f4f2edff' },
    })
      .then((url) => active && setSrc(url))
      .catch(() => active && setSrc(''));
    return () => {
      active = false;
    };
  }, [value, size]);

  return (
    <div className="qr" style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={label} width={size} height={size} />
      ) : (
        <div className="qr--placeholder" aria-label={label} />
      )}
    </div>
  );
}
