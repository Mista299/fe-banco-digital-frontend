export const Icon = ({ name, size = 22, color = 'currentColor', stroke = 1.6 }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home':       return <svg {...p}><path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-3v-7h-8v7H5a2 2 0 01-2-2v-9z"/></svg>;
    case 'arrows':     return <svg {...p}><path d="M7 3v14M7 17l-3-3M7 17l3-3M17 21V7M17 7l-3 3M17 7l3 3"/></svg>;
    case 'send':       return <svg {...p}><path d="M4 12l16-8-5 18-3-7-8-3z"/></svg>;
    case 'shield':     return <svg {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>;
    case 'user':       return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>;
    case 'list':       return <svg {...p}><path d="M3 6h18M3 12h18M3 18h12"/></svg>;
    case 'plus':       return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus':      return <svg {...p}><path d="M5 12h14"/></svg>;
    case 'arrow-up-right': return <svg {...p}><path d="M7 17L17 7M7 7h10v10"/></svg>;
    case 'arrow-down-left': return <svg {...p}><path d="M17 7L7 17M17 17H7V7"/></svg>;
    case 'chevron-right': return <svg {...p}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-left': return <svg {...p}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'chevron-down': return <svg {...p}><path d="M6 9l6 6 6-6"/></svg>;
    case 'eye':        return <svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'eye-off':    return <svg {...p}><path d="M3 3l18 18M10.6 6.1A10 10 0 0112 6c6.5 0 10 7 10 7-.5 1-1.4 2.3-2.6 3.5M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.3 4.4-.9M9.9 9.9a3 3 0 004.2 4.2"/></svg>;
    case 'lock':       return <svg {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>;
    case 'unlock':     return <svg {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 017.5-2"/></svg>;
    case 'fingerprint': return <svg {...p}><path d="M12 11c0 4 0 6-1 8M8 12c0 5-1 7-2 8M16 12c0 4-1 8-2 9M5 9a8 8 0 0114 0M9 19a18 18 0 002-7 1 1 0 012 0c0 2-.5 5-1 7"/></svg>;
    case 'check':      return <svg {...p}><path d="M5 12l5 5L20 7"/></svg>;
    case 'check-circle': return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>;
    case 'x':          return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'x-circle':   return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M9 9l6 6M15 9l-6 6"/></svg>;
    case 'alert':      return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16v.5"/></svg>;
    case 'info':       return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 8v.5"/></svg>;
    case 'card':       return <svg {...p}><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg>;
    case 'wallet':     return <svg {...p}><path d="M3 7a2 2 0 012-2h14v4H5a2 2 0 01-2-2zM3 7v10a2 2 0 002 2h15a1 1 0 001-1V9H5"/><circle cx="17" cy="14" r="1.2" fill="currentColor"/></svg>;
    case 'bell':       return <svg {...p}><path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6zM10 19a2 2 0 004 0"/></svg>;
    case 'settings':   return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.6 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h0a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v0a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>;
    case 'logout':     return <svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
    case 'search':     return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>;
    case 'filter':     return <svg {...p}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/></svg>;
    case 'qr':         return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v7M17 21h4M14 17v4"/></svg>;
    case 'copy':       return <svg {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
    case 'mail':       return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case 'phone':      return <svg {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>;
    case 'pin':        return <svg {...p}><path d="M12 21s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case 'sparkle':    return <svg {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 17l.6 1.6L21 19l-1.4.4L19 21l-.6-1.6L17 19l1.4-.4L19 17z"/></svg>;
    case 'reload':     return <svg {...p}><path d="M21 12a9 9 0 11-3-6.7L21 8M21 3v5h-5"/></svg>;
    case 'tx':         return <svg {...p}><path d="M3 7h14l-3-3M21 17H7l3 3"/></svg>;
    case 'edit':       return <svg {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    default: return null;
  }
};

export const fmtCOP = (n, opts = {}) => {
  const { sign = false, decimals = 0 } = opts;
  if (n == null || isNaN(n)) return '$0';
  const abs = Math.abs(Number(n));
  const s = abs.toLocaleString('es-CO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  if (sign) return (n < 0 ? '−' : '+') + ' $' + s;
  return '$' + s;
};

export const maskAcct = (n) => '•••• ' + String(n).slice(-4);

export const NxLogo = ({ size = 28, color = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M8 24V8L24 24V8" stroke={color} strokeWidth="2.2" strokeLinecap="square"/>
    <circle cx="8" cy="8" r="1.5" fill={color}/>
    <circle cx="24" cy="24" r="1.5" fill={color}/>
  </svg>
);

export const NxWordmark = ({ color = '#fff' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <NxLogo size={22} color={color} />
    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16, letterSpacing: '0.02em', color }}>NEXUS</span>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color, opacity: 0.5, marginLeft: 2, marginTop: 2 }}>BANK</span>
  </div>
);

export const BottomNav = ({ active, onChange }) => {
  const items = [
    { id: 'home', icon: 'home', label: 'Inicio' },
    { id: 'history', icon: 'list', label: 'Movimientos' },
    { id: 'transfer', icon: 'send', label: 'Transferir' },
    { id: 'security', icon: 'shield', label: 'Seguridad' },
    { id: 'profile', icon: 'user', label: 'Perfil' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 10, paddingLeft: 8, paddingRight: 8,
      background: 'linear-gradient(180deg, rgba(7,8,11,0) 0%, rgba(7,8,11,0.85) 30%, rgba(7,8,11,1) 70%)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      zIndex: 40,
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        background: 'rgba(17,20,27,0.85)', border: '1px solid var(--stroke-2)',
        borderRadius: 22, padding: 6,
      }}>
        {items.map(it => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => onChange(it.id)} className="press" style={{
              background: 'transparent', border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '8px 4px', borderRadius: 14, cursor: 'pointer',
              color: on ? 'var(--text-1)' : 'var(--text-3)',
              position: 'relative',
            }}>
              {on && <div style={{ position: 'absolute', top: 2, left: '50%', width: 4, height: 4, borderRadius: 2, background: 'var(--electric)', transform: 'translateX(-50%)', boxShadow: '0 0 8px var(--electric-glow)' }}/>}
              <Icon name={it.icon} size={20}/>
              <span style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: '0.02em' }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Screen = ({ children, scroll = true, padTop = 54, padBottom = 0, bg = 'var(--bg-1)' }) => (
  <div style={{
    position: 'absolute', inset: 0, background: bg,
    overflow: scroll ? 'auto' : 'hidden',
    paddingTop: padTop, paddingBottom: padBottom,
    color: 'var(--text-1)',
  }}>
    {children}
  </div>
);

export const Toast = ({ toast }) => {
  if (!toast) return null;
  const colors = {
    success: { bg: 'rgba(91,216,160,0.12)', border: 'rgba(91,216,160,0.3)', icon: 'check-circle', c: 'var(--success)' },
    error:   { bg: 'rgba(255,107,122,0.12)', border: 'rgba(255,107,122,0.3)', icon: 'alert', c: 'var(--danger)' },
    info:    { bg: 'rgba(77,141,255,0.12)', border: 'rgba(77,141,255,0.3)', icon: 'info', c: 'var(--electric)' },
  };
  const c = colors[toast.kind] || colors.info;
  return (
    <div className="fade-up" style={{
      position: 'absolute', top: 64, left: 16, right: 16, zIndex: 100,
      background: 'rgba(17,20,27,0.92)', backdropFilter: 'blur(20px)',
      border: `1px solid ${c.border}`, borderRadius: 14, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{ color: c.c }}><Icon name={c.icon} size={18}/></div>
      <span style={{ fontSize: 13, color: 'var(--text-1)', flex: 1 }}>{toast.msg}</span>
    </div>
  );
};

export const SubHeader = ({ onBack, title, eyebrow, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
    <button onClick={onBack} className="press" style={{
      width: 40, height: 40, borderRadius: 12,
      background: 'var(--bg-2)', border: '1px solid var(--stroke-1)',
      color: 'var(--text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    }}>
      <Icon name="chevron-left" size={20}/>
    </button>
    <div style={{ textAlign: 'center', flex: 1 }}>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 2 }}>{eyebrow}</div>}
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)' }}>{title}</div>
    </div>
    <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      {right || null}
    </div>
  </div>
);

export const Spinner = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" style={{ animation: 'nx-spin 0.8s linear infinite' }}>
    <circle cx="9" cy="9" r="7" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
    <path d="M9 2a7 7 0 017 7" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
