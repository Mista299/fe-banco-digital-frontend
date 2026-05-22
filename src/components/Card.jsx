import { fmtCOP } from './primitives';

const finishes = {
  obsidian: {
    bg: `radial-gradient(120% 100% at 0% 0%, #2A3147 0%, #161A26 35%, #0B0E16 70%), linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%)`,
    glow: 'rgba(77,141,255,0.18)', accent: '#6FA0FF',
  },
  graphite: {
    bg: `radial-gradient(120% 100% at 100% 0%, #2D2F36 0%, #18191E 40%, #0A0B0E 80%), linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)`,
    glow: 'rgba(255,255,255,0.06)', accent: '#C8CCD6',
  },
  midnight: {
    bg: `radial-gradient(110% 90% at 20% 10%, #1E2D55 0%, #0D1B3D 40%, #050A1F 80%), linear-gradient(135deg, rgba(120,160,255,0.1) 0%, transparent 50%)`,
    glow: 'rgba(77,141,255,0.3)', accent: '#7AA8FF',
  },
};

const deriveCvc = (num) => {
  let h = 0;
  for (let i = 0; i < num.length; i++) h = (Math.imul(31, h) + num.charCodeAt(i)) | 0;
  return String(Math.abs(h) % 1000).padStart(3, '0');
};

const NexusCard = ({ account, variant = 'obsidian', size = 'md', tilt = false, onClick, hidden = false }) => {
  const W = size === 'lg' ? 340 : size === 'sm' ? 260 : 320;
  const H = size === 'lg' ? 215 : size === 'sm' ? 164 : 202;
  const f = finishes[variant] || finishes.obsidian;
  const acctNum = account?.numeroCuenta || account?.number || '0000000000';
  const balance = account?.saldo ?? account?.balance ?? 0;
  const tipo = account?.tipo || account?.type || 'AHORROS';
  const status = account?.estado || account?.status || 'ACTIVA';
  const cvc = account?.cvc ?? deriveCvc(acctNum);
  const rawName = account?.nombreCliente || account?.nombre || '';
  const cardName = rawName
    ? rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : 'Nexus Bank';

  return (
    <div onClick={onClick} className={tilt ? 'press' : ''} style={{
      width: W, height: H, borderRadius: 20,
      position: 'relative', overflow: 'hidden',
      background: f.bg,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04), 0 20px 50px rgba(0,0,0,0.6), 0 0 60px ${f.glow}`,
      cursor: onClick ? 'pointer' : 'default',
      flexShrink: 0, fontFamily: 'var(--font-sans)',
    }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18, mixBlendMode: 'overlay' }}>
        <defs>
          <pattern id={`grid-${variant}`} width="3" height="3" patternUnits="userSpaceOnUse">
            <path d="M0 0L3 0M0 0L0 3" stroke="#fff" strokeWidth="0.3" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${variant})`}/>
      </svg>
      <svg style={{ position: 'absolute', right: -20, bottom: -30, opacity: 0.08 }} width="200" height="200" viewBox="0 0 200 200" fill="none">
        <path d="M40 160V40L160 160V40" stroke="#fff" strokeWidth="6"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent 30%, ${f.accent}22 45%, transparent 60%)`, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}/>

      <div style={{ position: 'absolute', inset: 0, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
              Nexus · {tipo}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.9)', marginTop: 5, letterSpacing: '0.1em', fontWeight: 500 }}>{cardName}</div>
          </div>
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
            <path d="M2 5C2 3 4 1 7 1H15C18 1 20 3 20 5V9C20 11 18 13 15 13H7C4 13 2 11 2 9V5Z" stroke={f.accent} strokeWidth="0.8" opacity="0.7"/>
            <path d="M6 6H16M6 8H16" stroke={f.accent} strokeWidth="0.8" opacity="0.7"/>
            <path d="M8 1V13M14 1V13" stroke={f.accent} strokeWidth="0.6" opacity="0.5"/>
          </svg>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.92)', fontWeight: 400, whiteSpace: 'nowrap' }}>
          {hidden
            ? '••••  ••••  ••••  ••••'
            : String(acctNum).match(/.{1,4}/g)?.join('  ') || acctNum
          }
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>Saldo disponible</div>
            <div className="tnum" style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 500, color: '#fff', marginTop: 3, letterSpacing: '-0.02em' }}>
              {hidden ? <span style={{ letterSpacing: '0.12em' }}>••••••</span> : (account?.saldoDisponible === false ? 'No disponible' : fmtCOP(balance))}
              {!hidden && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 4, fontWeight: 400 }}>COP</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {!hidden && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>CVC</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, letterSpacing: '0.2em', color: '#fff', fontWeight: 600, marginTop: 1 }}>
                  {cvc ?? '···'}
                </div>
              </div>
            )}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em',
              color: status === 'ACTIVA' ? '#5BD8A0' : status === 'BLOQUEADA' ? '#FF6B7A' : 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: status === 'ACTIVA' ? '#5BD8A0' : status === 'BLOQUEADA' ? '#FF6B7A' : '#888', boxShadow: status === 'ACTIVA' ? '0 0 6px #5BD8A0' : 'none' }}/>
              {status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexusCard;
