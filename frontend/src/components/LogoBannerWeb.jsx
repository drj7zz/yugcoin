import React from 'react';
import logo from '../assets/logo.webp';

/**
 * Web-only logo banner.
 * Rendered as a large, prominent brand strip for desktop layouts.
 * Hidden on mobile via CSS (.logo-banner-web).
 */
export default function LogoBannerWeb() {
  return (
    <div
      className="logo-banner-web"
      style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      role="banner"
      aria-label="YugCoin"
    >
      <img src={logo} alt="YugCoin logo" className="logo-transparent logo-banner-img" />
    </div>
  );
}
