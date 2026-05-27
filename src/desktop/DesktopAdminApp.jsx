import { useState, useCallback, useEffect, useMemo } from 'react';
import { Icon, fmtCOP, NxLogo } from '../components/primitives';
import * as api from '../api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);
const firstOfMonthStr = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); };
const fmtMoney = (n) => fmtCOP(Number(n) || 0);
const fmtDateTime = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
};

// ── Design tokens (design-exact components) ──────────────────────────────────
const PageHeader = ({ crumb, title, subtitle, actions }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 20 }}>
    <div style={{ minWidth: 0 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>{crumb}</div>
      <div style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, maxWidth: 720 }}>{subtitle}</div>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>}
  </div>
);

const KpiTile = ({ label, value, sub, accent, big }) => (
  <div className="nx-card" style={{ padding: big ? 22 : 18, position: 'relative', overflow: 'hidden' }}>
    {accent && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 2, background: `var(--${accent})`, boxShadow: `0 0 12px var(--${accent})` }}/>}
    <div className="eyebrow">{label}</div>
    <div className="mono tnum" style={{ fontSize: big ? 28 : 22, fontWeight: 500, marginTop: 10, letterSpacing: '-0.02em' }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{sub}</div>}
  </div>
);

const Btn = ({ children, variant = 'ghost', icon, onClick, size = 'md', disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    height: size === 'sm' ? 32 : 38,
    padding: size === 'sm' ? '0 10px' : '0 14px',
    borderRadius: 8,
    background: variant === 'primary' ? 'linear-gradient(180deg, #5B98FF, #2E6BFF)'
              : variant === 'danger' ? 'rgba(255,107,122,0.10)'
              : 'var(--bg-3)',
    border: variant === 'danger' ? '1px solid rgba(255,107,122,0.3)' : variant === 'primary' ? 'none' : '1px solid var(--stroke-1)',
    color: variant === 'primary' ? '#fff' : variant === 'danger' ? 'var(--danger)' : 'var(--text-1)',
    fontSize: size === 'sm' ? 11.5 : 12.5, fontFamily: 'var(--font-sans)', fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
    display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
    boxShadow: variant === 'primary' ? '0 1px 0 rgba(255,255,255,0.2) inset, 0 4px 14px rgba(46,107,255,0.3)' : 'none',
  }}>
    {icon && <Icon name={icon} size={14}/>}
    {children}
  </button>
);

const StatusTag = ({ status }) => {
  const map = {
    EXITOSA: { c: 'success', dot: '●' }, ACTIVA: { c: 'success', dot: '●' }, CERRADO: { c: 'success', dot: '●' }, LOW: { c: 'text-3', dot: '○' },
    FALLIDA: { c: 'danger', dot: '○' }, RECHAZADA: { c: 'danger', dot: '×' }, BLOQUEADA: { c: 'danger', dot: '■' }, HIGH: { c: 'danger', dot: '●' },
    INACTIVA: { c: 'danger', dot: '○' }, PENDIENTE_APROBACION: { c: 'warn', dot: '◐' }, EN_CURSO: { c: 'warn', dot: '◐' }, MED: { c: 'warn', dot: '◐' },
    CERRADA: { c: 'text-3', dot: '×' },
  };
  const m = map[status] || { c: 'text-3', dot: '○' };
  const borderMap = { success: '91,216,160', danger: '255,107,122', warn: '245,181,68' };
  const rgb = borderMap[m.c];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, height: 20, padding: '0 8px', borderRadius: 4,
      background: m.c === 'text-3' ? 'rgba(255,255,255,0.04)' : `rgba(${borderMap[m.c]},0.10)`,
      border: `1px solid ${m.c === 'text-3' ? 'var(--stroke-2)' : `rgba(${rgb},0.3)`}`,
      fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em',
      color: `var(--${m.c})`, textTransform: 'uppercase', fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 8 }}>{m.dot}</span> {status}
    </span>
  );
};

const SelectChip = ({ label, value, options, onChange, width }) => (
  <div style={{ minWidth: 0 }}>
    {label && <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>{label}</div>}
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: width || 'auto', padding: '9px 28px 9px 12px',
      background: 'var(--bg-3)', border: '1px solid var(--stroke-1)',
      borderRadius: 8, color: 'var(--text-1)', fontSize: 12.5, outline: 'none',
      fontFamily: 'var(--font-sans)', cursor: 'pointer', appearance: 'none',
      backgroundImage: 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="%236B707D" stroke-width="1.4" stroke-linecap="round"/></svg>\')',
      backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
    }}>
      {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  </div>
);

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
    <div style={{ width: 22, height: 22, border: '2px solid var(--stroke-2)', borderTopColor: 'var(--electric)', borderRadius: '50%', animation: 'nx-spin 0.8s linear infinite' }}/>
  </div>
);

const ErrorBanner = ({ msg }) => (
  <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,107,122,0.08)', border: '1px solid rgba(255,107,122,0.25)', color: 'var(--danger)', fontSize: 12 }}>{msg}</div>
);

// ── Sidebar ───────────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { id: 'overview',  icon: 'home',   label: 'Resumen general',       section: 'Operación' },
  { id: 'reportes',  icon: 'list',   label: 'Reportes maestros',     section: 'Operación' },
  { id: 'saldos',    icon: 'wallet', label: 'Saldos consolidados',   section: 'Operación' },
  { id: 'actividad', icon: 'search', label: 'Actividad por cliente', section: 'Investigación' },
  { id: 'auditoria', icon: 'shield', label: 'Log de auditoría',      section: 'Cumplimiento' },
];

const AdminSidebar = ({ active, onNav, role, hasClientAccounts, onSwitchToClient, onLogout }) => {
  const visibleNav = ADMIN_NAV;
  const sections = [...new Set(visibleNav.map(n => n.section))];

  return (
    <div style={{
      width: 248, flexShrink: 0, height: '100%',
      background: 'var(--bg-0)', borderRight: '1px solid var(--stroke-1)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--stroke-1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NxLogo size={26}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
              NEXUS<span style={{ color: 'var(--electric)' }}>·</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.16em',
                padding: '2px 6px', borderRadius: 3,
                background: role === 'GERENTE' ? 'rgba(245,181,68,0.10)' : 'rgba(255,107,122,0.10)',
                color: role === 'GERENTE' ? 'var(--warn)' : 'var(--danger)',
                border: `1px solid ${role === 'GERENTE' ? 'rgba(245,181,68,0.25)' : 'rgba(255,107,122,0.25)'}`,
              }}>{role}</span>
            </div>
            <div className="mono" style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2, letterSpacing: '0.1em' }}>Consola de Cumplimiento</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '14px 10px', flex: 1, overflow: 'auto' }}>
        {sections.map(sec => (
          <div key={sec} style={{ marginBottom: 18 }}>
            <div className="eyebrow" style={{ padding: '4px 12px 8px', fontSize: 9 }}>{sec}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {visibleNav.filter(n => n.section === sec).map(item => {
                const on = item.id === active;
                return (
                  <button key={item.id} onClick={() => onNav(item.id)} style={{
                    all: 'unset', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                    borderRadius: 9, position: 'relative',
                    background: on ? 'rgba(77,141,255,0.10)' : 'transparent',
                    color: on ? 'var(--text-1)' : 'var(--text-2)',
                    fontSize: 13, fontWeight: on ? 500 : 400,
                    transition: 'background .12s ease',
                  }}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--bg-2)'; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                    {on && <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, borderRadius: 2, background: 'var(--electric)' }}/>}
                    <Icon name={item.icon} size={15} color={on ? 'var(--electric)' : 'currentColor'}/>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: 10, borderTop: '1px solid var(--stroke-1)' }}>
        <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div className="nx-dot pulse" style={{ background: role === 'GERENTE' ? 'var(--warn)' : 'var(--danger)', boxShadow: `0 0 8px ${role === 'GERENTE' ? 'var(--warn)' : 'var(--danger)'}` }}/>
            <span className="eyebrow" style={{ color: role === 'GERENTE' ? 'var(--warn)' : 'var(--danger)' }}>Rol activo</span>
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-1)', letterSpacing: '0.06em' }}>{role}</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.5 }}>
            Acceso completo al sistema
          </div>
        </div>

        {hasClientAccounts && (
          <button onClick={onSwitchToClient} style={{
            all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '10px 12px', marginTop: 8, borderRadius: 9,
            background: 'rgba(77,141,255,0.06)', border: '1px solid rgba(77,141,255,0.2)',
            color: 'var(--electric)', fontSize: 12, fontWeight: 500, boxSizing: 'border-box',
            transition: 'background .12s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(77,141,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(77,141,255,0.06)'}>
            <Icon name="card" size={14}/>
            <span>Ver mis cuentas</span>
          </button>
        )}

        <button onClick={onLogout} style={{
          all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '10px 12px', marginTop: 6, borderRadius: 9,
          color: 'var(--text-3)', fontSize: 12, boxSizing: 'border-box',
          transition: 'color .12s ease, background .12s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(255,107,122,0.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}>
          <Icon name="logout" size={14}/>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

// ── Topbar ────────────────────────────────────────────────────────────────────
const AdminTopbar = ({ username, role }) => {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const t = time.toTimeString().slice(0, 8);
  const initials = username ? username.slice(0, 2).toUpperCase() : 'AD';

  return (
    <div style={{
      height: 60, flexShrink: 0, borderBottom: '1px solid var(--stroke-1)',
      background: 'var(--bg-0)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14,
    }}>
      {/* Search bar */}
      <div style={{
        flex: '0 1 440px', height: 36, borderRadius: 10,
        background: 'var(--bg-2)', border: '1px solid var(--stroke-1)',
        display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10, cursor: 'pointer',
      }}>
        <Icon name="search" size={14} color="var(--text-3)"/>
        <span style={{ flex: 1, color: 'var(--text-3)', fontSize: 12.5 }}>Buscar reporte, cliente, transacción…</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
          color: 'var(--text-3)', padding: '3px 7px', borderRadius: 4,
          border: '1px solid var(--stroke-2)', background: 'var(--bg-3)',
        }}>⌘K</span>
      </div>
      <div style={{ flex: 1 }}/>

      {/* Status pills */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em' }}>
        <span style={{ padding: '5px 10px', borderRadius: 5, background: 'rgba(91,216,160,0.10)', border: '1px solid rgba(91,216,160,0.3)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="nx-dot pulse"/> SISTEMAS · ONLINE
        </span>
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--stroke-2)' }}/>

      {/* Role badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 7,
        background: role === 'GERENTE' ? 'rgba(245,181,68,0.10)' : 'rgba(255,107,122,0.10)',
        border: `1px solid ${role === 'GERENTE' ? 'rgba(245,181,68,0.3)' : 'rgba(255,107,122,0.3)'}`,
        color: role === 'GERENTE' ? 'var(--warn)' : 'var(--danger)',
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
      }}>
        <span className="nx-dot" style={{ background: role === 'GERENTE' ? 'var(--warn)' : 'var(--danger)', boxShadow: `0 0 6px ${role === 'GERENTE' ? 'var(--warn)' : 'var(--danger)'}` }}/>
        {role}
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--stroke-2)' }}/>
      <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-2)', letterSpacing: '0.06em' }}>{t} <span style={{ color: 'var(--text-3)' }}>BOG</span></div>

      {/* User pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px 6px 6px', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)' }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #FF6B7A, #4D8DFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600 }}>{initials}</div>
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap' }}>{username}</div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{role} · CUMPLIMIENTO</div>
        </div>
      </div>
    </div>
  );
};

// ── Screen: Overview ─────────────────────────────────────────────────────────
const AdminOverviewScreen = ({ onNav, auditLog, role }) => {
  const [pendientes, setPendientes] = useState([]);
  const [loadingP, setLoadingP] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [localToast, setLocalToast] = useState(null);

  const showLocalToast = (msg, ok = true) => { setLocalToast({ msg, ok }); setTimeout(() => setLocalToast(null), 2600); };

  const cargarPendientes = useCallback(async () => {
    setLoadingP(true);
    try { setPendientes(await api.getSolicitudesPendientes()); }
    catch { setPendientes([]); }
    finally { setLoadingP(false); }
  }, []);

  useEffect(() => { cargarPendientes(); }, [cargarPendientes]);

  const handleDecision = async (id, accion) => {
    setProcesando(id);
    try {
      const fn = accion === 'APROBAR' ? api.aprobarCuenta : api.rechazarCuenta;
      const r = await fn(id);
      showLocalToast(`${accion === 'APROBAR' ? 'Aprobada' : 'Rechazada'}: ${r.numeroCuenta}`, accion === 'APROBAR');
      cargarPendientes();
    } catch (e) {
      showLocalToast(e.message || 'Error al procesar', false);
    } finally {
      setProcesando(null);
    }
  };

  const modules = [
    { id: 'reportes',  icon: 'list',   title: 'Reportes maestros',     sub: 'Auditoría de transacciones · CSV' },
    { id: 'saldos',    icon: 'wallet', title: 'Saldos consolidados',   sub: 'Liquidez global · encaje legal' },
    { id: 'actividad', icon: 'search', title: 'Actividad por cliente', sub: 'Búsqueda por documento o cuenta' },
    { id: 'auditoria', icon: 'shield', title: 'Log de auditoría',      sub: 'Registro inmutable de sesión' },
  ];

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {localToast && (
        <div style={{
          position: 'fixed', top: 80, right: 28, zIndex: 200, padding: '12px 18px', borderRadius: 12,
          background: localToast.ok ? 'rgba(91,216,160,0.15)' : 'rgba(255,107,122,0.15)',
          border: `1px solid ${localToast.ok ? 'rgba(91,216,160,0.3)' : 'rgba(255,107,122,0.3)'}`,
          color: localToast.ok ? 'var(--success)' : 'var(--danger)', fontSize: 13, fontWeight: 500,
        }}>{localToast.msg}</div>
      )}

      <PageHeader
        crumb="Inicio / Consola de Cumplimiento"
        title="Resumen general del sistema"
        subtitle="Vista consolidada para auditoría y monitoreo del banco."
        actions={
          <>
            <Btn icon="reload" onClick={cargarPendientes}>Actualizar</Btn>
            <Btn variant="primary" icon="arrow-up-right" onClick={() => onNav('reportes')}>Abrir reportes</Btn>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <KpiTile label="Solicitudes pendientes" value={pendientes.length.toString()} sub="cuentas en espera" accent={pendientes.length > 0 ? 'warn' : 'success'} big/>
        <KpiTile label="Log auditoría sesión" value={auditLog.length.toString()} sub="eventos registrados" big/>
        <KpiTile label="Módulos activos" value={modules.length.toString()} sub="Acceso completo" big/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Solicitudes pendientes */}
        <div className="nx-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--stroke-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="eyebrow">Solicitudes de apertura · Gestión de Cuentas</div>
            <Btn size="sm" icon="reload" onClick={cargarPendientes}>Refrescar</Btn>
          </div>
          {loadingP ? <div style={{ padding: 24 }}><Loading/></div> : pendientes.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Sin solicitudes pendientes</div>
          ) : (
            pendientes.slice(0, 6).map((s, i, arr) => (
              <div key={s.idCuenta} style={{ padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--stroke-1)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.nombreCliente}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--electric)', marginTop: 2 }}>{s.numeroCuenta} · {s.tipo}</div>
                  </div>
                  <StatusTag status={s.estado}/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button onClick={() => handleDecision(s.idCuenta, 'APROBAR')} disabled={procesando === s.idCuenta} style={{
                    padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'rgba(91,216,160,0.12)', color: 'var(--success)', fontSize: 12, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <Icon name="check" size={13}/> Aprobar
                  </button>
                  <button onClick={() => handleDecision(s.idCuenta, 'RECHAZAR')} disabled={procesando === s.idCuenta} style={{
                    padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'rgba(255,107,122,0.10)', color: 'var(--danger)', fontSize: 12, fontWeight: 500,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <Icon name="x" size={13}/> Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Módulos + mini audit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="nx-card" style={{ padding: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Módulos de cumplimiento</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {modules.map(m => (
                <button key={m.id} onClick={() => onNav(m.id)} style={{
                  all: 'unset', cursor: 'pointer', padding: 14, borderRadius: 10,
                  background: 'var(--bg-3)', border: '1px solid var(--stroke-1)',
                  display: 'flex', alignItems: 'flex-start', gap: 10, transition: 'background .12s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-4)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-3)'}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(77,141,255,0.10)', color: 'var(--electric)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={m.icon} size={15}/>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{m.title}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3, letterSpacing: '0.02em' }}>{m.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="nx-card" style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--stroke-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="eyebrow">Actividad reciente</div>
              <button onClick={() => onNav('auditoria')} style={{ background: 'transparent', border: 'none', color: 'var(--electric)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', cursor: 'pointer' }}>VER TODO →</button>
            </div>
            {auditLog.slice(0, 5).map((e, i, arr) => (
              <div key={e.id} style={{ padding: '10px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--stroke-1)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.action}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2 }}>{e.target}</div>
                </div>
                <StatusTag status={e.risk}/>
              </div>
            ))}
            {auditLog.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>Sin actividad registrada aún</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Screen: Reportes Maestros ─────────────────────────────────────────────────
const AdminReportesScreen = ({ role, onAudit }) => {
  const [desde, setDesde] = useState(firstOfMonthStr());
  const [hasta, setHasta] = useState(todayStr());
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState('TODOS');
  const [error, setError] = useState(null);

  const buscar = async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.getReporteMaestro(`${desde}T00:00:00`, `${hasta}T23:59:59`);
      setReporte(data);
      onAudit({ action: 'Consulta reporte maestro', target: `${desde} – ${hasta} · ${data.totalTransacciones} tx`, risk: 'LOW' });
    } catch (e) { setError(e.message || 'Error al cargar reporte'); }
    finally { setLoading(false); }
  };

  const exportarCSV = async () => {
    setExportando(true);
    try {
      const res = await api.exportarReporteCSV(`${desde}T00:00:00`, `${hasta}T23:59:59`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `reporte_${desde}_${hasta}.csv`; a.click();
      URL.revokeObjectURL(url);
      onAudit({ action: 'Export CSV transacciones', target: `${desde} – ${hasta}`, risk: 'LOW' });
    } catch (e) { setError(e.message || 'Error al exportar'); }
    finally { setExportando(false); }
  };

  const txFiltradas = useMemo(() => {
    if (!reporte?.transacciones) return [];
    if (estadoFilter === 'TODOS') return reporte.transacciones;
    return reporte.transacciones.filter(t => t.estado === estadoFilter);
  }, [reporte, estadoFilter]);

  const volumen = useMemo(() => txFiltradas.filter(t => t.estado === 'EXITOSA').reduce((s, t) => s + Number(t.monto), 0), [txFiltradas]);
  const fallidas = txFiltradas.filter(t => t.estado !== 'EXITOSA').length;
  const tasaExito = txFiltradas.length ? ((txFiltradas.length - fallidas) / txFiltradas.length * 100) : 100;

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        crumb="Auditoría / Reportes Maestros"
        title="Reportes Maestros de Transacciones"
        subtitle="Extracción detallada de todas las transacciones del sistema en el rango seleccionado."
        actions={
          <>
            <Btn icon="reload" onClick={buscar}>Actualizar</Btn>
            <Btn variant="primary" icon="arrow-up-right" onClick={exportarCSV} disabled={exportando || !reporte}>{exportando ? 'Exportando…' : 'Exportar CSV'}</Btn>
          </>
        }
      />

      {/* Filtros */}
      <div className="nx-card" style={{ padding: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Parámetros del reporte</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 180px 1fr', gap: 12, alignItems: 'flex-end' }}>
          {[['Fecha inicio', desde, setDesde], ['Fecha fin', hasta, setHasta]].map(([l, v, set]) => (
            <div key={l}>
              <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>{l}</div>
              <input type="date" value={v} onChange={e => set(e.target.value)} style={{
                width: '100%', padding: '9px 12px', background: 'var(--bg-3)',
                border: '1px solid var(--stroke-1)', borderRadius: 8, color: 'var(--text-1)',
                fontSize: 13, outline: 'none', colorScheme: 'dark', boxSizing: 'border-box',
              }}/>
            </div>
          ))}
          <SelectChip label="Estado" value={estadoFilter} onChange={setEstadoFilter}
            options={['TODOS','EXITOSA','FALLIDA','RECHAZADA']} width="100%"/>
          <Btn variant="primary" icon="search" onClick={buscar} disabled={loading}>{loading ? 'Cargando…' : 'Generar reporte'}</Btn>
        </div>
      </div>

      {error && <ErrorBanner msg={error}/>}

      {reporte && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 14 }}>
            <KpiTile label="Volumen transaccionado" value={fmtMoney(volumen)} sub={`${txFiltradas.filter(t => t.estado === 'EXITOSA').length} transacciones exitosas`} accent="success" big/>
            <KpiTile label="Total movimientos" value={txFiltradas.length.toString()} sub={`${tasaExito.toFixed(1)}% tasa de éxito`}/>
            <KpiTile label="Fallidas / rechazadas" value={fallidas.toString()} sub="requieren revisión" accent={fallidas > 0 ? 'danger' : undefined}/>
            <KpiTile label="Periodo" value={`${desde.slice(8)}/${desde.slice(5,7)} → ${hasta.slice(8)}/${hasta.slice(5,7)}`} sub="rango seleccionado"/>
          </div>

          {/* Tabla */}
          <div className="nx-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--stroke-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="eyebrow">Registro de transacciones · {txFiltradas.length} resultados</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>ORDENADO POR FECHA · DESC</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 130px 120px 120px 1fr 130px 130px', padding: '10px 18px', borderBottom: '1px solid var(--stroke-1)', background: 'var(--bg-1)', gap: 8 }}>
              {['ID Transacción','Fecha','Origen','Destino','Tipo','Estado','Monto'].map((h, i) => (
                <span key={h} className="eyebrow" style={{ fontSize: 9, textAlign: i === 6 ? 'right' : 'left' }}>{h}</span>
              ))}
            </div>
            {txFiltradas.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Sin transacciones en este rango</div>
            ) : txFiltradas.map((t, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '110px 130px 120px 120px 1fr 130px 130px',
                padding: '11px 18px', borderBottom: i < txFiltradas.length - 1 ? '1px solid var(--stroke-1)' : 'none',
                alignItems: 'center', gap: 8, fontSize: 12.5, transition: 'background .1s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span className="mono" style={{ color: 'var(--electric)', fontSize: 11.5 }}>TX-{t.idTransaccion}</span>
                <span className="mono" style={{ color: 'var(--text-2)', fontSize: 11 }}>{fmtDateTime(t.fecha)}</span>
                <span className="mono" style={{ fontSize: 11.5 }}>#{t.cuentaOrigen || '—'}</span>
                <span className="mono" style={{ fontSize: 11.5 }}>#{t.cuentaDestino || '—'}</span>
                <span style={{ color: 'var(--text-2)' }}>{t.tipo || 'TRANSACCIÓN'}</span>
                <StatusTag status={t.estado}/>
                <span className="mono tnum" style={{ textAlign: 'right', color: t.estado === 'EXITOSA' ? 'var(--text-1)' : 'var(--text-4)', textDecoration: t.estado !== 'EXITOSA' ? 'line-through' : 'none', fontWeight: 500 }}>
                  {fmtMoney(t.monto)}
                </span>
              </div>
            ))}
            {txFiltradas.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '110px 130px 120px 120px 1fr 130px 130px', padding: '14px 18px', background: 'var(--bg-0)', borderTop: '1px solid var(--stroke-2)', alignItems: 'center', gap: 8 }}>
                <span className="eyebrow" style={{ gridColumn: '1 / 6', fontSize: 10 }}>TOTAL EXITOSAS · {txFiltradas.filter(t => t.estado === 'EXITOSA').length} de {txFiltradas.length}</span>
                <span/>
                <span className="mono tnum" style={{ textAlign: 'right', fontSize: 15, fontWeight: 500, color: 'var(--success)' }}>{fmtMoney(volumen)}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ── Screen: Saldos Consolidados ───────────────────────────────────────────────
const AdminSaldosScreen = ({ role }) => {
  const [consolidado, setConsolidado] = useState(null);
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState('TODOS');
  const [tipoFilter, setTipoFilter] = useState('TODOS');
  const [minSaldo, setMinSaldo] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true); setError(null);
      try {
        const [cons, tiempoReal] = await Promise.all([api.getConsolidadoSaldos(), api.getSaldosTiempoReal()]);
        setConsolidado(cons);
        setCuentas(tiempoReal);
      } catch (e) { setError(e.message || 'Error al cargar saldos'); }
      finally { setLoading(false); }
    };
    cargar();
  }, []);

  const cuentasFiltradas = useMemo(() => {
    return cuentas.filter(c => {
      if (estadoFilter !== 'TODOS' && c.estado !== estadoFilter) return false;
      if (tipoFilter !== 'TODOS' && c.tipoCuenta !== tipoFilter) return false;
      if (Number(c.saldoDisponible ?? c.saldo ?? 0) < minSaldo * 1_000_000) return false;
      return true;
    });
  }, [cuentas, estadoFilter, tipoFilter, minSaldo]);

  const total = consolidado ? Number(consolidado.totalSistema) : 0;
  const ahorros = consolidado ? Number(consolidado.totalAhorros) : 0;
  const corriente = consolidado ? Number(consolidado.totalCorriente) : 0;
  const ahPct = total > 0 ? (ahorros / total) * 100 : 50;
  const coPct = 100 - ahPct;
  const encaje = total * 0.085;

  const exportarCSV = () => {
    const hoy = new Date().toISOString().slice(0, 10);
    const filas = [
      'NRO_CUENTA,TIPO,ESTADO,SALDO_DISPONIBLE,SALDO_CONTABLE',
      ...cuentasFiltradas.map(c => [
        c.idCuenta ?? '',
        c.tipoCuenta ?? '',
        c.estado ?? '',
        Number(c.saldoDisponible ?? c.saldo ?? 0).toFixed(4),
        Number(c.saldoContable ?? c.saldo ?? 0).toFixed(4),
      ].join(',')),
    ];
    const blob = new Blob([filas.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saldos_consolidados_${hoy}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const actualizarEstado = async (estado) => {
    setEstadoFilter(estado);
    if (estado !== 'TODOS') {
      try {
        const data = await api.getSaldosPorEstado(estado);
        setCuentas(data.map(d => ({
          idCuenta: d.numeroCuenta,
          saldoDisponible: Number(d.saldo),
          saldoContable: Number(d.saldo),
          estado: d.estado,
          tipoCuenta: d.tipoCuenta || '—',
        })));
      } catch { /* mantener lista */ }
    } else {
      try { setCuentas(await api.getSaldosTiempoReal()); } catch { /* ok */ }
    }
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        crumb="Tesorería / Reportes de Saldos"
        title="Saldos Consolidados del Sistema"
        subtitle="Liquidez agregada del banco. Verificación de encaje legal y monitoreo de cuentas."
        actions={<Btn variant="primary" icon="arrow-up-right" onClick={exportarCSV} disabled={cuentasFiltradas.length === 0}>Exportar CSV</Btn>}
      />

      {loading ? <Loading/> : error ? <ErrorBanner msg={error}/> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 14 }}>
            <KpiTile label="Liquidez total · global" value={fmtMoney(total)} sub={`${cuentas.length} cuentas en sistema`} accent="electric" big/>
            <KpiTile label="Encaje legal (8.5%)" value={fmtMoney(encaje)} sub="requerido vs disponible OK"/>
            <KpiTile label="Cuentas de ahorros" value={fmtMoney(ahorros)} sub={`${ahPct.toFixed(1)}%`}/>
            <KpiTile label="Cuentas corrientes" value={fmtMoney(corriente)} sub={`${coPct.toFixed(1)}%`}/>
          </div>

          {/* Breakdown bar */}
          <div className="nx-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div className="eyebrow">Desglose por tipo de cuenta</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>ACTUALIZADO · LIVE</div>
            </div>
            <div style={{ height: 12, borderRadius: 6, display: 'flex', gap: 3, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ width: `${ahPct}%`, background: 'linear-gradient(90deg, #2E6BFF, #4D8DFF)', boxShadow: '0 0 12px rgba(77,141,255,0.4)' }}/>
              <div style={{ width: `${coPct}%`, background: 'linear-gradient(90deg, #5BD8A0, #8AEFC0)' }}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Cuentas de ahorros', color: 'var(--electric)', shadow: 'var(--electric)', pct: ahPct, value: ahorros, count: cuentas.filter(c => c.tipoCuenta === 'AHORROS').length },
                { label: 'Cuentas corrientes', color: 'var(--success)', shadow: 'var(--success)', pct: coPct, value: corriente, count: cuentas.filter(c => c.tipoCuenta === 'CORRIENTE').length },
              ].map(s => (
                <div key={s.label} style={{ padding: '14px 16px', background: 'var(--bg-3)', borderRadius: 10, border: '1px solid var(--stroke-1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, boxShadow: `0 0 6px ${s.shadow}` }}/>
                      <span className="eyebrow" style={{ fontSize: 9 }}>{s.label}</span>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.pct.toFixed(1)}%</span>
                  </div>
                  <div className="mono tnum" style={{ fontSize: 20, fontWeight: 500, marginTop: 8 }}>{fmtMoney(s.value)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{s.count} cuentas</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="nx-card" style={{ padding: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Filtros</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <SelectChip label="Estado" value={estadoFilter} onChange={actualizarEstado}
                options={['TODOS','ACTIVA','BLOQUEADA','INACTIVA','PENDIENTE_APROBACION']} width="180px"/>
              <SelectChip label="Tipo" value={tipoFilter} onChange={setTipoFilter}
                options={['TODOS','AHORROS','CORRIENTE']} width="160px"/>
              <div>
                <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>Saldo mínimo</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 1, 50, 100].map(v => (
                    <button key={v} onClick={() => setMinSaldo(v)} style={{
                      padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11,
                      background: minSaldo === v ? 'rgba(77,141,255,0.12)' : 'var(--bg-3)',
                      border: `1px solid ${minSaldo === v ? 'rgba(77,141,255,0.4)' : 'var(--stroke-1)'}`,
                      color: minSaldo === v ? 'var(--electric)' : 'var(--text-2)',
                    }}>{v === 0 ? 'TODOS' : `≥${v}M`}</button>
                  ))}
                </div>
              </div>
              <Btn size="sm" icon="x" onClick={() => { setEstadoFilter('TODOS'); setTipoFilter('TODOS'); setMinSaldo(0); }}>Limpiar</Btn>
            </div>
          </div>

          {/* Tabla cuentas */}
          <div className="nx-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--stroke-1)' }}>
              <div className="eyebrow">Cuentas · {cuentasFiltradas.length} resultados</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 120px 1fr 1fr 120px', padding: '10px 18px', borderBottom: '1px solid var(--stroke-1)', background: 'var(--bg-1)', gap: 8 }}>
              {['ID Cuenta','Tipo','Saldo disponible','Saldo contable','Estado'].map((h, i) => (
                <span key={h} className="eyebrow" style={{ fontSize: 9, textAlign: i >= 2 && i <= 3 ? 'right' : 'left' }}>{h}</span>
              ))}
            </div>
            {cuentasFiltradas.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Sin cuentas con estos filtros</div>
            ) : cuentasFiltradas.map((c, i) => {
              const saldoDisp = Number(c.saldoDisponible ?? c.saldo ?? 0);
              const saldoCont = Number(c.saldoContable ?? c.saldo ?? 0);
              const critical = saldoCont >= 50_000_000;
              return (
                <div key={`cta-${c.idCuenta ?? i}`} style={{
                  display: 'grid', gridTemplateColumns: '160px 120px 1fr 1fr 120px',
                  padding: '11px 18px', borderBottom: i < cuentasFiltradas.length - 1 ? '1px solid var(--stroke-1)' : 'none',
                  alignItems: 'center', gap: 8, fontSize: 12.5, transition: 'background .1s ease',
                  background: critical ? 'rgba(77,141,255,0.03)' : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                onMouseLeave={e => e.currentTarget.style.background = critical ? 'rgba(77,141,255,0.03)' : 'transparent'}>
                  <span className="mono" style={{ color: critical ? 'var(--electric)' : 'var(--text-1)', fontSize: 12 }}>#{c.idCuenta}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-2)', letterSpacing: '0.08em' }}>{c.tipoCuenta || '—'}</span>
                  <span className="mono tnum" style={{ textAlign: 'right', fontWeight: 500 }}>{fmtMoney(saldoDisp)}</span>
                  <span className="mono tnum" style={{ textAlign: 'right', color: 'var(--text-2)' }}>{fmtMoney(saldoCont)}</span>
                  <StatusTag status={c.estado}/>
                </div>
              );
            })}
            {cuentasFiltradas.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '160px 120px 1fr 1fr 120px', padding: '14px 18px', background: 'var(--bg-0)', borderTop: '1px solid var(--stroke-2)', alignItems: 'center', gap: 8 }}>
                <span className="eyebrow" style={{ gridColumn: '1 / 3', fontSize: 10 }}>TOTAL FILTRADO</span>
                <span className="mono tnum" style={{ textAlign: 'right', fontSize: 14, fontWeight: 500, color: 'var(--success)' }}>{fmtMoney(cuentasFiltradas.reduce((s, c) => s + Number(c.saldoDisponible ?? c.saldo ?? 0), 0))}</span>
                <span className="mono tnum" style={{ textAlign: 'right', fontSize: 14, fontWeight: 500 }}>{fmtMoney(cuentasFiltradas.reduce((s, c) => s + Number(c.saldoContable ?? c.saldo ?? 0), 0))}</span>
                <span/>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ── Screen: Actividad por Cliente ─────────────────────────────────────────────
const AdminActividadScreen = ({ role, onAudit }) => {
  const [searchType, setSearchType] = useState('documento');
  const [query, setQuery] = useState('');
  const [desde, setDesde] = useState(firstOfMonthStr());
  const [hasta, setHasta] = useState(todayStr());
  const [tipoFilter, setTipoFilter] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buscar = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(null);
    try {
      const fechaInicio = `${desde}T00:00:00`;
      const fechaFin = `${hasta}T23:59:59`;
      const data = searchType === 'documento'
        ? await api.buscarActividadPorDocumento(query.trim(), fechaInicio, fechaFin, tipoFilter || undefined)
        : await api.buscarActividadPorCuenta(query.trim(), fechaInicio, fechaFin, tipoFilter || undefined);
      setResultado(data);
      onAudit({ action: `Consulta actividad · ${searchType}`, target: query.trim(), risk: 'LOW' });
    } catch (e) {
      setError(e.message || 'No se encontraron resultados');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const txns = resultado?.transacciones || resultado?.movimientos || [];
  const cliente = resultado?.cliente || {};

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        crumb="Auditoría / Actividad por Cliente"
        title="Búsqueda Avanzada de Actividad"
        subtitle="Consulta de historial financiero detallado por documento o cuenta. Toda búsqueda queda registrada en el Log de Auditoría."
        actions={null}
      />

      {/* Buscador */}
      <div className="nx-card" style={{ padding: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Identificador del cliente</div>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 140px 140px 1fr auto', gap: 12, alignItems: 'flex-end' }}>
          <SelectChip label="Buscar por" value={searchType} onChange={setSearchType}
            options={[{ value: 'documento', label: 'Documento' }, { value: 'cuenta', label: 'N° Cuenta' }]} width="100%"/>
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>{searchType === 'documento' ? 'Número de documento' : 'Número de cuenta'}</div>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && buscar()}
              placeholder={searchType === 'documento' ? 'Ej. 123456789' : 'Ej. 00010001'}
              style={{
                width: '100%', padding: '9px 12px', background: 'var(--bg-3)', border: '1px solid var(--stroke-1)',
                borderRadius: 8, color: 'var(--text-1)', fontSize: 13.5, outline: 'none',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.02em', boxSizing: 'border-box',
              }}/>
          </div>
          {[['Desde', desde, setDesde], ['Hasta', hasta, setHasta]].map(([l, v, set]) => (
            <div key={l}>
              <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6 }}>{l}</div>
              <input type="date" value={v} onChange={e => set(e.target.value)} style={{
                width: '100%', padding: '9px 10px', background: 'var(--bg-3)', border: '1px solid var(--stroke-1)',
                borderRadius: 8, color: 'var(--text-1)', fontSize: 12, outline: 'none', colorScheme: 'dark', boxSizing: 'border-box',
              }}/>
            </div>
          ))}
          <SelectChip label="Tipo de mov." value={tipoFilter} onChange={setTipoFilter}
            options={[{ value: '', label: 'TODOS' }, 'DEPOSITO', 'RETIRO', 'TRANSFERENCIA']} width="100%"/>
          <Btn variant="primary" icon="search" onClick={buscar} disabled={loading || !query.trim()}>{loading ? 'Buscando…' : 'Consultar'}</Btn>
        </div>
      </div>

      {error && <ErrorBanner msg={error}/>}

      {/* Audit notice */}
      {resultado && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(245,181,68,0.08)', border: '1px solid rgba(245,181,68,0.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="shield" size={16} color="var(--warn)"/>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
            Consulta registrada en Log de Auditoría. Rol: <span className="mono" style={{ color: 'var(--warn)' }}>{role}</span>
          </span>
        </div>
      )}

      {/* Resumen cliente */}
      {resultado && (cliente.nombre || cliente.nombreCliente) && (
        <div className="nx-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, #142659, #0D1B3D)', border: '1px solid var(--stroke-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, flexShrink: 0 }}>
            {(cliente.nombre || cliente.nombreCliente || '??').split(' ').slice(0,2).map(s => s[0]).join('')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>{cliente.nombre || cliente.nombreCliente}</div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-2)' }}>
              {cliente.documento && <span><span className="eyebrow" style={{ fontSize: 8.5, marginRight: 6 }}>DOC</span><span className="mono">{cliente.documento}</span></span>}
              {cliente.email && <span><span className="eyebrow" style={{ fontSize: 8.5, marginRight: 6 }}>EMAIL</span><span className="mono">{cliente.email}</span></span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="eyebrow" style={{ fontSize: 8 }}>Transacciones</div>
              <div className="mono tnum" style={{ fontSize: 20, fontWeight: 500, marginTop: 4 }}>{txns.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla actividad */}
      {resultado && (
        <div className="nx-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--stroke-1)', display: 'flex', justifyContent: 'space-between' }}>
            <div className="eyebrow">Actividad financiera · {txns.length} movimientos</div>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>ORDEN CRONOLÓGICO ↓</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 120px 120px 130px 140px', padding: '10px 18px', borderBottom: '1px solid var(--stroke-1)', background: 'var(--bg-1)', gap: 8 }}>
            {['Fecha','Tipo / Concepto','Origen','Destino','Estado','Monto'].map((h, i) => (
              <span key={h} className="eyebrow" style={{ fontSize: 9, textAlign: i === 5 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
          {txns.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Sin movimientos en este periodo</div>
          ) : txns.map((t, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '130px 1fr 120px 120px 130px 140px',
              padding: '11px 18px', borderBottom: i < txns.length - 1 ? '1px solid var(--stroke-1)' : 'none',
              alignItems: 'center', gap: 8, fontSize: 12.5, transition: 'background .1s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="mono" style={{ color: 'var(--text-2)', fontSize: 11 }}>{fmtDateTime(t.fecha || t.fechaHora)}</span>
              <span style={{ color: 'var(--text-1)' }}>{t.tipo || t.concepto || 'TRANSACCIÓN'}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>#{t.cuentaOrigen || '—'}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>#{t.cuentaDestino || '—'}</span>
              <StatusTag status={t.estado || 'EXITOSA'}/>
              <span className="mono tnum" style={{ textAlign: 'right', fontWeight: 500, color: t.estado === 'EXITOSA' || !t.estado ? 'var(--text-1)' : 'var(--text-4)', textDecoration: t.estado && t.estado !== 'EXITOSA' ? 'line-through' : 'none' }}>
                {fmtMoney(t.monto)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Screen: Log de Auditoría ──────────────────────────────────────────────────
const AdminAuditoriaScreen = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true); setError(null);
    try { setEntries(await api.getAuditoriaLog()); }
    catch (e) { setError(e.message || 'Error al cargar log'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const consultasActividad = entries.filter(e => e.accion === 'CONSULTA_ACTIVIDAD_ADMIN').length;

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        crumb="Sistema / Auditoría"
        title="Log de Auditoría Interno"
        subtitle="Registro inmutable de todas las consultas y operaciones realizadas por administradores sobre datos de clientes."
        actions={<Btn icon="reload" onClick={cargar}>Actualizar</Btn>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <KpiTile label="Eventos totales" value={entries.length.toString()} sub="todas las sesiones" big/>
        <KpiTile label="Consultas de actividad" value={consultasActividad.toString()} sub="accesos a datos de clientes" accent={consultasActividad > 0 ? 'warn' : undefined} big/>
        <KpiTile label="Administradores activos" value={[...new Set(entries.map(e => e.usuarioUsername))].length.toString()} sub="usuarios con actividad" big/>
      </div>

      <div className="nx-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}/>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.08em', alignSelf: 'center' }}>LOG PERSISTENTE · SOLO LECTURA</span>
      </div>

      <div className="nx-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--stroke-1)' }}>
          <div className="eyebrow">Eventos · {entries.length}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '90px 130px 140px 1fr 180px', padding: '10px 18px', borderBottom: '1px solid var(--stroke-1)', background: 'var(--bg-1)', gap: 8 }}>
          {['ID','Usuario','Rol','Detalle','Fecha · hora'].map(h => (
            <span key={h} className="eyebrow" style={{ fontSize: 9 }}>{h}</span>
          ))}
        </div>
        {loading ? <div style={{ padding: 24 }}><Loading/></div>
        : error ? <div style={{ padding: 16 }}><ErrorBanner msg={error}/></div>
        : entries.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Sin eventos registrados</div>
        ) : entries.map((e, i) => (
          <div key={e.idAuditoria} style={{
            display: 'grid', gridTemplateColumns: '90px 130px 140px 1fr 180px',
            padding: '12px 18px', borderBottom: i < entries.length - 1 ? '1px solid var(--stroke-1)' : 'none',
            alignItems: 'center', gap: 8, fontSize: 12.5, transition: 'background .1s ease',
          }}
          onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg-3)'}
          onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
            <span className="mono" style={{ color: 'var(--electric)', fontSize: 11.5 }}>#{e.idAuditoria}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-1)' }}>{e.usuarioUsername}</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.12em',
              padding: '3px 8px', borderRadius: 4, background: 'var(--bg-3)', border: '1px solid var(--stroke-1)',
              color: e.usuarioRol === 'GERENTE' ? 'var(--warn)' : 'var(--danger)',
              display: 'inline-block', width: 'fit-content',
            }}>{e.usuarioRol}</span>
            <span style={{ color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12 }}>{e.detalle || e.accion}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{fmtDateTime(e.fecha)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────
const DesktopAdminApp = ({ username, userRole = 'ADMIN', hasClientAccounts = false, onSwitchToClient, onLogout }) => {
  const [adminRoute, setAdminRoute] = useState('overview');
  const [auditLog, setAuditLog] = useState([]);

  const recordAudit = useCallback((entry) => {
    const now = new Date();
    const date = now.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/,/g, ' ·');
    setAuditLog(l => [{
      id: `L-${Date.now()}`,
      role: userRole,
      action: entry.action,
      target: entry.target || '—',
      date,
      risk: entry.risk || 'LOW',
    }, ...l]);
  }, [userRole]);

  let screen;
  switch (adminRoute) {
    case 'overview':  screen = <AdminOverviewScreen onNav={setAdminRoute} auditLog={auditLog} role={userRole}/>; break;
    case 'reportes':  screen = <AdminReportesScreen role={userRole} onAudit={recordAudit}/>; break;
    case 'saldos':    screen = <AdminSaldosScreen role={userRole}/>; break;
    case 'actividad': screen = <AdminActividadScreen role={userRole} onAudit={recordAudit}/>; break;
    case 'auditoria': screen = <AdminAuditoriaScreen/>; break;
    default:          screen = <AdminOverviewScreen onNav={setAdminRoute} auditLog={auditLog} role={userRole}/>;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-1)' }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <AdminSidebar
          active={adminRoute}
          onNav={setAdminRoute}
          role={userRole}
          hasClientAccounts={hasClientAccounts}
          onSwitchToClient={onSwitchToClient}
          onLogout={onLogout}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <AdminTopbar username={username} role={userRole}/>
          <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-1)' }}>
            {screen}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopAdminApp;
