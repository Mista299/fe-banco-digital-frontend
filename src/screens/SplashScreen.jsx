import { useEffect } from 'react';
import { NxLogo } from '../components/primitives';

const SplashScreen = ({ onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(120% 80% at 50% 30%, #0F1830 0%, #06080F 60%, #050608 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.15 }} width="100%" height="100%">
        <defs>
          <pattern id="splash-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0L0 0L0 32" fill="none" stroke="rgba(120,160,255,0.2)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#splash-grid)"/>
      </svg>
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(77,141,255,0.18), transparent)', animation: 'nx-pulse 3s ease-in-out infinite' }}/>

      <div className="fade-up" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <NxLogo size={64} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '0.04em', color: '#fff' }}>NEXUS</div>
          <div className="eyebrow" style={{ marginTop: 4 }}>Banca Privada Digital</div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)' }}>
          <span className="nx-dot"/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Conexión segura · TLS 1.3</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.24em', color: 'var(--text-4)', textTransform: 'uppercase' }}>Vigilado · Superfinanciera de Colombia</div>
      </div>
    </div>
  );
};

export default SplashScreen;
