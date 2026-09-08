import React from 'react';
import logo from '../assets/logo.webp';

/**
 * Mobile-only logo banner.
 * Full-width brand strip tuned for small screens.
 * Hidden on desktop via CSS (.logo-banner-mobile).
 */
export default function LogoBannerMobile() {
  return (
    <div
      className="logo-banner-mobile"
      style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      role="banner"
      aria-label="YugCoin"
    >
      <img src={logo} alt="YugCoin logo" className="logo-transparent logo-banner-img" />
    </div>
  );
}
