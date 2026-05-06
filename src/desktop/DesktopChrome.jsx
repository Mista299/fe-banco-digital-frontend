import { useState, useEffect } from 'react';
import { Icon, fmtCOP, maskAcct, NxLogo } from '../components/primitives';

const NAV = [
  { id: 'home',     icon: 'home',   label: 'Inicio' },
  { id: 'cuentas',  icon: 'card',   label: 'Cuentas' },
  { id: 'transfer', icon: 'send',   label: 'Transferir' },
  { id: 'history',  icon: 'list',   label: 'Historial' },
  { id: 'security', icon: 'shield', label: 'Seguridad' },
  { id: 'profile',  icon: 'user',   label: 'Perfil' },
];

export const Sidebar = ({ active, onNav, collapsed }) => {
  const w = collapsed ? 72 : 240;
  return (
    <div style={{ width: w, flexShrink: 0, height: '100%', background: 'var(--bg-0)', borderRight: '1px solid var(--stroke-1)', display: 'flex', flexDirection: 'column', transition: 'width .2s ease', overflow: 'hidden' }}>
      <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: collapsed ? '0' : '0 20px', justifyContent: collapsed ? 'center' : 'flex-start', borderBottom: '1px solid var(--stroke-1)', flexShrink: 0 }}>
        <NxLogo size={26}/>
        {!collapsed && <div style={{ marginLeft: 10, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>NEXUS<span style={{ color: 'var(--electric)' }}>·</span></div>}
      </div>
      <div style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!collapsed && <div className="eyebrow" style={{ padding: '6px 12px 8px' }}>Workspace</div>}
        {NAV.map(item => {
          const on = item.id === active;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '11px 0' : '11px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%',
              background: on ? 'rgba(77,141,255,0.10)' : 'transparent',
              color: on ? 'var(--text-1)' : 'var(--text-2)',
              fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: on ? 500 : 400,
              position: 'relative', transition: 'background .12s ease',
            }}
            onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--bg-2)'; }}
            onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
            >
              {on && <div style={{ position: 'absolute', left: collapsed ? 8 : 0, top: 8, bottom: 8, width: 2, borderRadius: 2, background: 'var(--electric)' }}/>}
              <Icon name={item.icon} size={17} color={on ? 'var(--electric)' : 'currentColor'}/>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1 }}/>
      {!collapsed && (
        <div style={{ margin: 10, padding: 14, borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div className="nx-dot pulse"/>
            <span className="eyebrow" style={{ color: 'var(--success)' }}>Sesión segura</span>
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.5 }}>
            <div>NXS-NEXUS-BANK</div>
            <div>TLS 1.3 · AES-256</div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Topbar = ({ user = 'Usuario', onLogout, notifCount = 0, onBell }) => {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const t = time.toTimeString().slice(0, 8);
  const initials = user.split(/[\s.@]/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'US';

  return (
    <div style={{ height: 60, flexShrink: 0, borderBottom: '1px solid var(--stroke-1)', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
      <div style={{ flex: '0 1 480px', height: 36, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10, cursor: 'default' }}>
        <Icon name="search" size={15} color="var(--text-3)"/>
        <span style={{ flex: 1, color: 'var(--text-3)', fontSize: 13 }}>Buscar movimiento, beneficiario…</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-3)', padding: '3px 7px', borderRadius: 4, border: '1px solid var(--stroke-2)', background: 'var(--bg-3)' }}>⌘K</span>
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{ display: 'flex', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-3)' }}>USD/COP</span>
        <span style={{ color: 'var(--text-1)' }}>4,128.50</span>
        <span style={{ color: 'var(--success)' }}>+0.34%</span>
        <span style={{ width: 1, height: 16, background: 'var(--stroke-2)', margin: '0 4px', display: 'block' }}/>
        <span style={{ color: 'var(--text-3)' }}>IBR 1M</span>
        <span style={{ color: 'var(--text-1)' }}>9.142%</span>
        <span style={{ color: 'var(--danger)' }}>−0.012</span>
      </div>
      <div style={{ width: 1, height: 24, background: 'var(--stroke-2)' }}/>
      <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-2)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{t} <span style={{ color: 'var(--text-3)' }}>BOG</span></div>
      <div style={{ width: 1, height: 24, background: 'var(--stroke-2)' }}/>
      <button onClick={onBell} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', color: 'var(--text-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
        <Icon name="bell" size={16}/>
        {notifCount > 0 && (
          <div style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: 4, background: 'var(--electric)', border: '1.5px solid var(--bg-0)', boxShadow: '0 0 6px var(--electric-glow)' }}/>
        )}
      </button>
      <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px 6px 6px', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', color: 'var(--text-1)', cursor: 'pointer', flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #2E6BFF, #142659)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{initials}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.25, minWidth: 0 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap' }}>{user}</span>
          <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>BANCA DIGITAL</span>
        </div>
      </button>
    </div>
  );
};

export const StatCard = ({ label, value, sub, delta, up, sparkline }) => (
  <div className="nx-card" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
    <div className="eyebrow">{label}</div>
    <div className="mono" style={{ fontSize: 26, fontWeight: 500, marginTop: 10, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>{value}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
      {delta !== undefined && (
        <span className="mono" style={{ fontSize: 11, color: up ? 'var(--success)' : 'var(--danger)', letterSpacing: '0.04em' }}>
          {up ? '▲' : '▼'} {delta}
        </span>
      )}
      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>
    </div>
    {sparkline && (
      <svg width="100%" height="32" viewBox="0 0 200 32" preserveAspectRatio="none" style={{ marginTop: 10, opacity: 0.9 }}>
        <path d={sparkline} fill="none" stroke={up ? 'var(--success)' : 'var(--danger)'} strokeWidth="1.4"/>
      </svg>
    )}
  </div>
);

const PATRIMONIO_DATA = {
  '1D':  [40,42,41,44,46,45,48,50,49,52,51,54,56,55,58,60,59,62,61,64,66,65,68,70],
  '1W':  [30,33,32,38,40,42,46,48,52,50,55,58,62,60,65,68,66,70,72,75,78,76,80,82],
  '1M':  [20,25,28,26,32,35,40,42,38,45,48,52,55,50,58,62,60,68,70,72,75,72,78,82],
  '3M':  [10,15,20,18,25,30,32,28,35,40,42,45,40,48,52,55,50,58,62,65,68,64,72,78],
  '1Y':  [5,12,18,22,20,28,35,40,38,45,50,55,52,58,62,68,65,70,75,72,78,82,88,92],
  'MAX': [2,8,12,18,25,32,28,35,42,48,52,55,62,68,72,75,78,82,85,82,88,92,95,98],
};

export const PatrimonioChart = ({ value = 0, prev = 0, range, onRange }) => {
  const ranges = ['1D', '1W', '1M', '3M', '1Y', 'MAX'];
  const data = PATRIMONIO_DATA[range] || PATRIMONIO_DATA['1M'];
  const W = 1100, H = 280, P = { l: 8, r: 8, t: 30, b: 20 };
  const max = Math.max(...data), min = Math.min(...data);
  const xStep = (W - P.l - P.r) / (data.length - 1);
  const y = v => P.t + (1 - (v - min) / (max - min || 1)) * (H - P.t - P.b);
  const path = data.map((v, i) => `${i ? 'L' : 'M'}${P.l + i * xStep} ${y(v)}`).join(' ');
  const area = `${path} L${P.l + (data.length - 1) * xStep} ${H - P.b} L${P.l} ${H - P.b} Z`;
  const lastX = P.l + (data.length - 1) * xStep;
  const lastY = y(data[data.length - 1]);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => min + (max - min) * t);
  const delta = prev > 0 ? ((value - prev) / prev) * 100 : 0;
  const up = delta >= 0;

  return (
    <div className="nx-card" style={{ padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div className="eyebrow">Patrimonio total · COP</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
            <div className="mono tnum" style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.025em' }}>{fmtCOP(value)}</div>
            {prev > 0 && (
              <div className="mono" style={{ fontSize: 13, color: up ? 'var(--success)' : 'var(--danger)', letterSpacing: '0.02em' }}>
                {up ? '▲' : '▼'} {fmtCOP(Math.abs(value - prev))} ({Math.abs(delta).toFixed(2)}%)
              </div>
            )}
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{range}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--stroke-1)', flexShrink: 0 }}>
          {ranges.map(r => (
            <button key={r} onClick={() => onRange(r)} style={{
              padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em',
              background: r === range ? 'var(--bg-1)' : 'transparent',
              color: r === range ? 'var(--text-1)' : 'var(--text-3)',
              boxShadow: r === range ? '0 1px 0 rgba(255,255,255,0.06)' : 'none',
            }}>{r}</button>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', marginTop: 4 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="nxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--electric)" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="var(--electric)" stopOpacity="0"/>
            </linearGradient>
            <filter id="nxGlow"><feGaussianBlur stdDeviation="2.4"/></filter>
          </defs>
          {ticks.map((tv, i) => (
            <line key={i} x1={P.l} y1={y(tv)} x2={W - P.r} y2={y(tv)} stroke="var(--stroke-1)" strokeDasharray="2 4"/>
          ))}
          <path d={area} fill="url(#nxGrad)"/>
          <path d={path} fill="none" stroke="var(--electric)" strokeWidth="2" opacity="0.5" filter="url(#nxGlow)"/>
          <path d={path} fill="none" stroke="var(--electric)" strokeWidth="1.6"/>
          <circle cx={lastX} cy={lastY} r="6" fill="var(--electric)" opacity="0.25"/>
          <circle cx={lastX} cy={lastY} r="3" fill="var(--electric)"/>
          <line x1={lastX} y1={lastY} x2={lastX} y2={H - P.b} stroke="var(--electric)" strokeDasharray="2 3" strokeWidth="1" opacity="0.4"/>
        </svg>
        <div style={{ position: 'absolute', right: 8, top: 30, bottom: 20, display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {ticks.map((tv, i) => (
            <span key={i} className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.05em', background: 'var(--bg-2)', padding: '0 4px' }}>
              {max > 0 ? fmtCOP(value * (tv / max), { decimals: 0 }).replace('$', '') : '0'}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginTop: 16, background: 'var(--stroke-1)', border: '1px solid var(--stroke-1)', borderRadius: 10, overflow: 'hidden' }}>
        {[
          { l: 'Apertura',   v: fmtCOP(prev || value) },
          { l: 'Actual',     v: fmtCOP(value) },
          { l: 'Variación',  v: prev > 0 ? `${up ? '+' : ''}${delta.toFixed(2)}%` : '—' },
          { l: 'Período',    v: range },
        ].map(s => (
          <div key={s.l} style={{ background: 'var(--bg-2)', padding: '10px 14px' }}>
            <div className="eyebrow" style={{ fontSize: 9 }}>{s.l}</div>
            <div className="mono tnum" style={{ fontSize: 14, marginTop: 4 }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Watchlist = ({ accounts = [], onAccount }) => (
  <div className="nx-card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--stroke-1)' }}>
      <div className="eyebrow">Mis cuentas · {accounts.length}</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 0.9fr', padding: '10px 16px', borderBottom: '1px solid var(--stroke-1)' }}>
      <span className="eyebrow" style={{ fontSize: 9 }}>Cuenta</span>
      <span className="eyebrow" style={{ fontSize: 9, textAlign: 'right' }}>Saldo</span>
      <span className="eyebrow" style={{ fontSize: 9, textAlign: 'right' }}>Estado</span>
    </div>
    {accounts.length === 0 && (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Sin cuentas disponibles</div>
    )}
    {accounts.map((a, i) => {
      const st = a.status || a.estado;
      const tagClass = st === 'ACTIVA' ? 'active' : st === 'BLOQUEADA' ? 'blocked' : 'inactive';
      return (
        <button key={a.id || a.idCuenta} onClick={() => onAccount(a)} style={{
          all: 'unset', cursor: 'pointer', display: 'block', width: '100%',
          borderBottom: i < accounts.length - 1 ? '1px solid var(--stroke-1)' : 'none',
          transition: 'background .12s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 0.9fr', padding: '14px 16px', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: a.finish === 'midnight' ? 'linear-gradient(135deg, #142659, #0D1B3D)' : a.finish === 'graphite' ? '#2A2D38' : '#0F1218', border: '1px solid var(--stroke-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <NxLogo size={12}/>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.label}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em', marginTop: 2 }}>{a.tipo || a.type} · {maskAcct(a.numeroCuenta || a.number)}</div>
              </div>
            </div>
            <div className="mono tnum" style={{ fontSize: 13.5, fontWeight: 500, textAlign: 'right' }}>
              {fmtCOP(a.saldo ?? a.balance ?? 0)}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`nx-tag nx-tag-${tagClass}`} style={{ height: 16, fontSize: 8.5 }}>{st}</span>
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

export const QuickActions = ({ onAction }) => {
  const items = [
    { id: 'transfer', icon: 'send',  label: 'Transferir',     sub: 'A cuentas Nexus',   primary: true },
    { id: 'deposit',  icon: 'plus',  label: 'Depositar',      sub: 'Recargar saldo' },
    { id: 'withdraw', icon: 'minus', label: 'Retirar',        sub: 'A efectivo' },
    { id: 'pay',      icon: 'card',  label: 'Pagar servicio', sub: 'Facturadores' },
    { id: 'request',  icon: 'mail',  label: 'Solicitar',      sub: 'Generar cobro' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
      {items.map(it => (
        <button key={it.id} onClick={() => onAction(it.id)} className="press" style={{
          all: 'unset', cursor: 'pointer', padding: 16, borderRadius: 14,
          background: it.primary ? 'linear-gradient(180deg, rgba(77,141,255,0.16), rgba(77,141,255,0.04))' : 'var(--bg-2)',
          border: `1px solid ${it.primary ? 'rgba(77,141,255,0.35)' : 'var(--stroke-1)'}`,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: it.primary ? 'rgba(77,141,255,0.22)' : 'var(--bg-3)', color: it.primary ? 'var(--electric)' : 'var(--text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={it.icon} size={17}/>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>{it.label}</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em', marginTop: 2 }}>{it.sub}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

export const ActivityTable = ({ rows = [], dense = false, withHeader = true, onHistory }) => {
  const cols = '40px 1.6fr 1.4fr 1fr 100px 1fr';
  return (
    <div className="nx-card" style={{ padding: 0, overflow: 'hidden' }}>
      {withHeader && (
        <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--stroke-1)' }}>
          <div className="eyebrow">Movimientos recientes</div>
          {onHistory && (
            <button onClick={onHistory} style={{ background: 'transparent', border: 'none', color: 'var(--electric)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer' }}>VER TODO →</button>
          )}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '10px 18px', borderBottom: '1px solid var(--stroke-1)', background: 'var(--bg-1)' }}>
        <span className="eyebrow" style={{ fontSize: 9 }}/>
        <span className="eyebrow" style={{ fontSize: 9 }}>Concepto</span>
        <span className="eyebrow" style={{ fontSize: 9 }}>Fecha</span>
        <span className="eyebrow" style={{ fontSize: 9 }}>Saldo resultante</span>
        <span className="eyebrow" style={{ fontSize: 9 }}>Estado</span>
        <span className="eyebrow" style={{ fontSize: 9, textAlign: 'right' }}>Monto</span>
      </div>
      {rows.length === 0 && (
        <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Sin movimientos disponibles</div>
      )}
      {rows.map((t, i) => {
        const inc = t.kind === 'in';
        return (
          <div key={t.id || i} style={{
            display: 'grid', gridTemplateColumns: cols,
            padding: dense ? '10px 18px' : '14px 18px',
            borderBottom: i < rows.length - 1 ? '1px solid var(--stroke-1)' : 'none',
            alignItems: 'center', gap: 8, transition: 'background .1s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 28, height: 28, borderRadius: 8, background: inc ? 'rgba(91,216,160,0.10)' : 'rgba(245,181,68,0.10)', color: inc ? 'var(--success)' : 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={inc ? 'arrow-down-left' : 'arrow-up-right'} size={13}/>
            </div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{t.label}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.04em' }}>{t.date}</span>
            <span className="mono tnum" style={{ fontSize: 11, color: 'var(--text-2)' }}>{t.saldoResultante != null ? fmtCOP(t.saldoResultante) : '—'}</span>
            <span className={`nx-tag nx-tag-${t.status === 'EXITOSA' ? 'active' : t.status === 'PENDIENTE' ? 'inactive' : 'blocked'}`} style={{ height: 18, fontSize: 9 }}>{t.status || 'EXITOSA'}</span>
            <span className="mono tnum" style={{ fontSize: 13.5, textAlign: 'right', color: inc ? 'var(--success)' : 'var(--text-1)', fontWeight: 500 }}>
              {inc ? '+' : '−'}{fmtCOP(t.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
