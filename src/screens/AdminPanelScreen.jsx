import { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon, fmtCOP, NxLogo } from '../components/primitives';
import * as api from '../api';

// ── Helpers ──────────────────────────────────────────────────────────────
const toISO = (dateStr, end = false) =>
  dateStr ? `${dateStr}T${end ? '23:59:59' : '00:00:00'}` : undefined;

const todayStr = () => new Date().toISOString().slice(0, 10);
const firstOfMonthStr = () => {
  const d = new Date(); d.setDate(1);
  return d.toISOString().slice(0, 10);
};

const fmtDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

const MESES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ── Status Tag ───────────────────────────────────────────────────────────
const AStatusTag = ({ status }) => {
  const s = {
    ACTIVA:              { bg: 'rgba(91,216,160,0.12)',  color: 'var(--success)', label: 'ACTIVA' },
    EXITOSA:             { bg: 'rgba(91,216,160,0.12)',  color: 'var(--success)', label: 'EXITOSA' },
    CERRADO:             { bg: 'rgba(91,216,160,0.12)',  color: 'var(--success)', label: 'CERRADO' },
    LOW:                 { bg: 'rgba(91,216,160,0.12)',  color: 'var(--success)', label: 'LOW' },
    BLOQUEADA:           { bg: 'rgba(255,107,122,0.12)', color: 'var(--danger)',  label: 'BLOQUEADA' },
    FALLIDA:             { bg: 'rgba(255,107,122,0.12)', color: 'var(--danger)',  label: 'FALLIDA' },
    RECHAZADA:           { bg: 'rgba(255,107,122,0.12)', color: 'var(--danger)',  label: 'RECHAZADA' },
    INACTIVA:            { bg: 'rgba(255,107,122,0.12)', color: 'var(--danger)',  label: 'INACTIVA' },
    HIGH:                { bg: 'rgba(255,107,122,0.12)', color: 'var(--danger)',  label: 'HIGH' },
    PENDIENTE_APROBACION:{ bg: 'rgba(245,181,68,0.12)',  color: 'var(--warn)',    label: 'PENDIENTE' },
    EN_CURSO:            { bg: 'rgba(245,181,68,0.12)',  color: 'var(--warn)',    label: 'EN CURSO' },
    MED:                 { bg: 'rgba(245,181,68,0.12)',  color: 'var(--warn)',    label: 'MED' },
    CERRADA:             { bg: 'rgba(164,169,181,0.1)',  color: 'var(--text-3)', label: 'CERRADA' },
  }[status] || { bg: 'rgba(164,169,181,0.1)', color: 'var(--text-3)', label: status || '—' };

  return (
    <span style={{
      padding: '3px 8px', borderRadius: 6, background: s.bg, color: s.color,
      fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.12em',
      fontWeight: 500, whiteSpace: 'nowrap',
    }}>{s.label}</span>
  );
};

// ── KPI Card ─────────────────────────────────────────────────────────────
const AKpi = ({ label, value, sub, accent }) => (
  <div className="nx-card" style={{ padding: 14, position: 'relative', overflow: 'hidden' }}>
    {accent && (
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 2,
        background: `var(--${accent})`, boxShadow: `0 0 10px var(--${accent})`,
      }}/>
    )}
    <div className="eyebrow" style={{ fontSize: 8.5 }}>{label}</div>
    <div className="mono tnum" style={{ fontSize: 18, fontWeight: 500, marginTop: 8, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>{sub}</div>}
  </div>
);

// ── Filter Chip ──────────────────────────────────────────────────────────
const AFilterChip = ({ active, onClick, children }) => (
  <button onClick={onClick} className="press" style={{
    height: 30, padding: '0 12px', borderRadius: 8,
    background: active ? 'rgba(77,141,255,0.12)' : 'var(--bg-2)',
    border: `1px solid ${active ? 'rgba(77,141,255,0.4)' : 'var(--stroke-1)'}`,
    color: active ? 'var(--electric)' : 'var(--text-2)',
    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
  }}>{children}</button>
);

// ── Screen container ─────────────────────────────────────────────────────
const AScreen = ({ children, padTop = 66, padBottom = 110 }) => (
  <div style={{
    position: 'absolute', inset: 0, overflow: 'auto',
    background: 'var(--bg-1)', paddingTop: padTop, paddingBottom: padBottom,
  }}>{children}</div>
);

// ── Header ───────────────────────────────────────────────────────────────
const AHeader = ({ title, eyebrow, role, onMenu }) => {
  const isGerente = role === 'GERENTE';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
      padding: '12px 18px 10px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 10,
      background: 'linear-gradient(180deg, var(--bg-1) 75%, transparent)',
    }}>
      <button onClick={onMenu} className="press" style={{
        width: 38, height: 38, borderRadius: 10, background: 'var(--bg-2)',
        border: '1px solid var(--stroke-1)', color: 'var(--text-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        <Icon name="list" size={16}/>
      </button>
      <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
        {eyebrow && <div className="eyebrow" style={{ fontSize: 8.5, marginBottom: 2 }}>{eyebrow}</div>}
        <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
      </div>
      <div style={{
        height: 38, padding: '0 10px', borderRadius: 10,
        background: isGerente ? 'rgba(245,181,68,0.08)' : 'rgba(255,107,122,0.08)',
        border: `1px solid ${isGerente ? 'rgba(245,181,68,0.25)' : 'rgba(255,107,122,0.25)'}`,
        display: 'flex', alignItems: 'center', gap: 6,
        color: isGerente ? 'var(--warn)' : 'var(--danger)',
        fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.14em',
        flexShrink: 0,
      }}>
        <span className="nx-dot" style={{ background: isGerente ? 'var(--warn)' : 'var(--danger)', boxShadow: `0 0 6px ${isGerente ? 'var(--warn)' : 'var(--danger)'}` }}/>
        {role}
      </div>
    </div>
  );
};

// ── Loading inline ───────────────────────────────────────────────────────
const ALoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
    <div style={{ width: 20, height: 20, border: '2px solid var(--stroke-2)', borderTopColor: 'var(--electric)', borderRadius: '50%', animation: 'nx-spin 0.8s linear infinite' }}/>
  </div>
);

// ── Primary button ───────────────────────────────────────────────────────
const APrimaryBtn = ({ onClick, disabled, loading, children }) => (
  <button onClick={onClick} disabled={disabled || loading} className="press" style={{
    width: '100%', height: 44, borderRadius: 12,
    background: disabled || loading ? 'var(--bg-3)' : 'linear-gradient(180deg, #5B98FF, #2E6BFF)',
    color: disabled || loading ? 'var(--text-3)' : '#fff',
    border: disabled || loading ? '1px solid var(--stroke-2)' : 'none',
    fontSize: 13, fontWeight: 500, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: disabled || loading ? 'none' : '0 1px 0 rgba(255,255,255,0.2) inset, 0 6px 18px rgba(46,107,255,0.3)',
  }}>
    {loading
      ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'nx-spin 0.8s linear infinite' }}/>
      : children}
  </button>
);

// ═══════════════════════════════════════════════════════════════════════════
// PANTALLA: Inicio / Overview  (HU-16: Admin Cuentas)
// ═══════════════════════════════════════════════════════════════════════════
const AdminOverview = ({ role, onMenu, onNav, auditLog }) => {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2600);
  };

  const cargarPendientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getSolicitudesPendientes();
      setPendientes(data);
    } catch {
      setPendientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarPendientes(); }, [cargarPendientes]);

  const handleDecision = async (id, accion) => {
    setProcesando(id);
    try {
      const fn = accion === 'APROBAR' ? api.aprobarCuenta : api.rechazarCuenta;
      const r = await fn(id);
      showToast(`${accion === 'APROBAR' ? 'Aprobada' : 'Rechazada'}: ${r.numeroCuenta}`, accion === 'APROBAR');
      cargarPendientes();
    } catch (e) {
      showToast(e.message || 'Error al procesar', false);
    } finally {
      setProcesando(null);
    }
  };

  // Extractos eliminado del panel admin — es función de cliente
  const modules = [
    { id: 'reportes',  icon: 'list',   t: 'Reportes maestros',     s: 'Auditoría de transacciones' },
    { id: 'saldos',    icon: 'wallet', t: 'Saldos consolidados',   s: 'Liquidez global · encaje' },
    { id: 'actividad', icon: 'search', t: 'Actividad por cliente', s: 'Búsqueda y reclamos' },
    { id: 'auditoria', icon: 'shield', t: 'Log de auditoría',      s: 'Registro de sesión' },
  ];

  return (
    <>
      <AHeader role={role} onMenu={onMenu} eyebrow="Inicio" title="Consola de Cumplimiento"/>
      <AScreen padTop={70}>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <AKpi label="Solicitudes pendientes" value={pendientes.length.toString()} sub="cuentas en espera" accent={pendientes.length > 0 ? 'warn' : 'success'}/>
            <AKpi label="Log auditoría sesión" value={auditLog.length.toString()} sub="eventos registrados"/>
          </div>

          {/* Solicitudes pendientes HU-16 */}
          <div>
            <div className="eyebrow" style={{ padding: '0 4px', marginBottom: 8 }}>Solicitudes de apertura · pendientes</div>
            {loading ? <ALoading/> : pendientes.length === 0 ? (
              <div className="nx-card" style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
                No hay solicitudes pendientes
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendientes.map(s => (
                  <div key={s.idCuenta} className="nx-card" style={{ padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.nombreCliente}</div>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--electric)', marginTop: 2 }}>{s.numeroCuenta}</div>
                      </div>
                      <AStatusTag status={s.estado}/>
                    </div>
                    <div style={{ marginBottom: 10, padding: '8px 10px', background: 'var(--bg-3)', borderRadius: 8 }}>
                      <div className="eyebrow" style={{ fontSize: 8 }}>Tipo · ID cuenta</div>
                      <div className="mono" style={{ fontSize: 11, marginTop: 3 }}>{s.tipo} · #{s.idCuenta}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <button
                        onClick={() => handleDecision(s.idCuenta, 'APROBAR')}
                        disabled={procesando === s.idCuenta}
                        className="press"
                        style={{
                          padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: 'rgba(91,216,160,0.12)', color: 'var(--success)',
                          fontSize: 12, fontWeight: 500,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}>
                        <Icon name="check" size={13}/> Aprobar
                      </button>
                      <button
                        onClick={() => handleDecision(s.idCuenta, 'RECHAZAR')}
                        disabled={procesando === s.idCuenta}
                        className="press"
                        style={{
                          padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: 'rgba(255,107,122,0.10)', color: 'var(--danger)',
                          fontSize: 12, fontWeight: 500,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}>
                        <Icon name="x" size={13}/> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Módulos */}
          <div className="eyebrow" style={{ padding: '0 4px', marginTop: 4 }}>Módulos</div>
          <div className="nx-card" style={{ padding: 0, overflow: 'hidden' }}>
            {modules.map((m, i) => (
              <button key={m.id} onClick={() => onNav(m.id)} className="press" style={{
                all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '14px 16px',
                borderBottom: i < modules.length - 1 ? '1px solid var(--stroke-1)' : 'none',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(77,141,255,0.10)', color: 'var(--electric)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={m.icon} size={15}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{m.t}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2, letterSpacing: '0.02em' }}>{m.s}</div>
                </div>
                <Icon name="chevron-right" size={14} color="var(--text-3)"/>
              </button>
            ))}
          </div>
        </div>
      </AScreen>

      {/* Toast inline */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 120, left: 16, right: 16, zIndex: 200,
          padding: '12px 16px', borderRadius: 12,
          background: toast.ok ? 'rgba(91,216,160,0.15)' : 'rgba(255,107,122,0.15)',
          border: `1px solid ${toast.ok ? 'rgba(91,216,160,0.3)' : 'rgba(255,107,122,0.3)'}`,
          color: toast.ok ? 'var(--success)' : 'var(--danger)',
          fontSize: 13, fontWeight: 500, textAlign: 'center',
        }}>{toast.msg}</div>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PANTALLA: Reportes Maestros
// ═══════════════════════════════════════════════════════════════════════════
const AdminReportes = ({ role, onMenu, onAudit }) => {
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
      const data = await api.getReporteMaestro(toISO(desde), toISO(hasta, true));
      setReporte(data);
      onAudit({ action: `Export reporte maestro`, target: `${desde} – ${hasta} · ${data.totalTransacciones} tx`, risk: 'LOW' });
    } catch (e) {
      setError(e.message || 'Error al cargar reporte');
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = async () => {
    setExportando(true);
    try {
      const res = await api.exportarReporteCSV(toISO(desde), toISO(hasta, true));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `reporte_${desde}_${hasta}.csv`; a.click();
      URL.revokeObjectURL(url);
      onAudit({ action: 'Export CSV transacciones', target: `${desde} – ${hasta}`, risk: 'LOW' });
    } catch (e) {
      setError(e.message || 'Error al exportar');
    } finally {
      setExportando(false);
    }
  };

  const txFiltradas = useMemo(() => {
    if (!reporte?.transacciones) return [];
    if (estadoFilter === 'TODOS') return reporte.transacciones;
    return reporte.transacciones.filter(t => t.estado === estadoFilter);
  }, [reporte, estadoFilter]);

  const volumenFiltrado = useMemo(() =>
    txFiltradas.filter(t => t.estado === 'EXITOSA').reduce((s, t) => s + Number(t.monto), 0),
  [txFiltradas]);

  return (
    <>
      <AHeader role={role} onMenu={onMenu} eyebrow="Auditoría" title="Reportes Maestros"/>
      <AScreen padTop={70}>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Rango de fechas */}
          <div className="nx-card" style={{ padding: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Periodo de análisis</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {[['Desde', desde, setDesde], ['Hasta', hasta, setHasta]].map(([l, v, set]) => (
                <div key={l}>
                  <div className="eyebrow" style={{ fontSize: 8.5, marginBottom: 4 }}>{l}</div>
                  <input type="date" value={v} onChange={e => set(e.target.value)} style={{
                    width: '100%', padding: '9px 10px', background: 'var(--bg-3)',
                    border: '1px solid var(--stroke-1)', borderRadius: 8, color: 'var(--text-1)',
                    fontSize: 12, outline: 'none', boxSizing: 'border-box',
                    colorScheme: 'dark',
                  }}/>
                </div>
              ))}
            </div>
            <APrimaryBtn onClick={buscar} loading={loading}>
              <Icon name="search" size={14}/> Generar reporte
            </APrimaryBtn>
          </div>

          {error && (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,107,122,0.08)', border: '1px solid rgba(255,107,122,0.25)', color: 'var(--danger)', fontSize: 12 }}>
              {error}
            </div>
          )}

          {reporte && (
            <>
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <AKpi label="Volumen exitosas" value={fmtCOP(volumenFiltrado)} sub={`${txFiltradas.filter(t => t.estado === 'EXITOSA').length} tx`} accent="success"/>
                <AKpi label="Total tx" value={reporte.totalTransacciones.toString()} sub={`${txFiltradas.filter(t => t.estado !== 'EXITOSA').length} fallidas`} accent={txFiltradas.some(t => t.estado !== 'EXITOSA') ? 'warn' : 'success'}/>
              </div>

              {/* Exportar */}
              <button onClick={exportarCSV} disabled={exportando} className="press" style={{
                background: 'linear-gradient(180deg, #5B98FF, #2E6BFF)', color: '#fff',
                border: 'none', borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 13, fontWeight: 500,
                boxShadow: '0 1px 0 rgba(255,255,255,0.2) inset, 0 6px 18px rgba(46,107,255,0.3)',
                opacity: exportando ? 0.7 : 1,
              }}>
                <Icon name="arrow-up-right" size={15}/> {exportando ? 'Exportando…' : 'Exportar CSV / Excel'}
              </button>

              {/* Filtros estado */}
              <div>
                <div className="eyebrow" style={{ marginBottom: 8, padding: '0 4px' }}>Filtrar por estado</div>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                  {['TODOS', 'EXITOSA', 'FALLIDA', 'RECHAZADA'].map(s => (
                    <AFilterChip key={s} active={estadoFilter === s} onClick={() => setEstadoFilter(s)}>{s}</AFilterChip>
                  ))}
                </div>
              </div>

              {/* Lista de transacciones */}
              <div className="eyebrow" style={{ padding: '0 4px' }}>Transacciones · {txFiltradas.length}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {txFiltradas.map((t, i) => (
                  <div key={i} className="nx-card" style={{ padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="mono" style={{ fontSize: 10.5, color: 'var(--electric)', letterSpacing: '0.04em' }}>TX-{t.idTransaccion}</div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{t.tipo || 'TRANSACCIÓN'}</div>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{fmtDateTime(t.fecha)}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="mono tnum" style={{ fontSize: 14, fontWeight: 500, color: t.estado === 'EXITOSA' ? 'var(--text-1)' : 'var(--text-4)', textDecoration: t.estado !== 'EXITOSA' ? 'line-through' : 'none' }}>
                          {fmtCOP(Number(t.monto))}
                        </div>
                        <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
                          <AStatusTag status={t.estado}/>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, padding: '8px 10px', background: 'var(--bg-3)', borderRadius: 8 }}>
                      <div>
                        <div className="eyebrow" style={{ fontSize: 7.5 }}>Origen</div>
                        <div className="mono" style={{ fontSize: 10.5, marginTop: 3 }}>#{t.cuentaOrigen || '—'}</div>
                      </div>
                      <div>
                        <div className="eyebrow" style={{ fontSize: 7.5 }}>Destino</div>
                        <div className="mono" style={{ fontSize: 10.5, marginTop: 3 }}>#{t.cuentaDestino || '—'}</div>
                      </div>
                      <div>
                        <div className="eyebrow" style={{ fontSize: 7.5 }}>Canal</div>
                        <div className="mono" style={{ fontSize: 10.5, marginTop: 3 }}>{t.canal || '—'}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {txFiltradas.length === 0 && (
                  <div className="nx-card" style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
                    Sin transacciones en este rango
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </AScreen>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PANTALLA: Saldos Consolidados  (HU-17)
// ═══════════════════════════════════════════════════════════════════════════
const AdminSaldos = ({ role, onMenu }) => {
  const [consolidado, setConsolidado] = useState(null);
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState('ACTIVA');
  const [minSaldo, setMinSaldo] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true); setError(null);
      try {
        const [cons, tiempoReal] = await Promise.all([
          api.getConsolidadoSaldos(),
          api.getSaldosTiempoReal(),
        ]);
        setConsolidado(cons);
        setCuentas(tiempoReal);
      } catch (e) {
        setError(e.message || 'Error al cargar saldos');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const actualizarFiltro = async (estado) => {
    setEstadoFilter(estado);
    try {
      const data = await api.getSaldosPorEstado(estado);
      setCuentas(data.map(d => ({
        idCuenta: d.numeroCuenta,
        saldoDisponible: Number(d.saldo),
        saldoContable: Number(d.saldo),
        estado: d.estado,
        tipoCuenta: '—',
        titular: d.titular,
      })));
    } catch { /* mantener lista actual */ }
  };

  const cuentasFiltradas = useMemo(() =>
    cuentas.filter(c => Number(c.saldoDisponible ?? c.saldo ?? 0) >= minSaldo * 1_000_000),
  [cuentas, minSaldo]);

  const total = consolidado ? Number(consolidado.totalSistema) : 0;
  const ahorros = consolidado ? Number(consolidado.totalAhorros) : 0;
  const corriente = consolidado ? Number(consolidado.totalCorriente) : 0;
  const ahPct = total > 0 ? (ahorros / total) * 100 : 50;
  const coPct = 100 - ahPct;
  const encaje = total * 0.085;

  return (
    <>
      <AHeader role={role} onMenu={onMenu} eyebrow="Tesorería" title="Saldos Consolidados"/>
      <AScreen padTop={70}>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {loading ? <ALoading/> : error ? (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255,107,122,0.08)', border: '1px solid rgba(255,107,122,0.25)', color: 'var(--danger)', fontSize: 12 }}>{error}</div>
          ) : (
            <>
              {/* Hero consolidado */}
              <div className="nx-card" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 2, background: 'var(--electric)', boxShadow: '0 0 14px var(--electric)' }}/>
                <div className="eyebrow">Liquidez total · global</div>
                <div className="mono tnum" style={{ fontSize: 28, fontWeight: 500, marginTop: 10, letterSpacing: '-0.025em' }}>{fmtCOP(total)}</div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 6, letterSpacing: '0.05em' }}>{cuentas.length} cuentas en sistema</div>
                <div style={{ marginTop: 14, height: 8, borderRadius: 4, display: 'flex', gap: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${ahPct}%`, background: 'linear-gradient(90deg, #2E6BFF, #4D8DFF)', boxShadow: '0 0 8px rgba(77,141,255,0.4)' }}/>
                  <div style={{ width: `${coPct}%`, background: 'linear-gradient(90deg, #5BD8A0, #8AEFC0)' }}/>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>
                  <span><span style={{ color: 'var(--electric)' }}>●</span> Ahorros {ahPct.toFixed(0)}%</span>
                  <span><span style={{ color: 'var(--success)' }}>●</span> Corriente {coPct.toFixed(0)}%</span>
                </div>
              </div>

              {/* KPIs desglose */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <AKpi label="Ahorros" value={fmtCOP(ahorros)} sub={`${ahPct.toFixed(0)}% del total`}/>
                <AKpi label="Corriente" value={fmtCOP(corriente)} sub={`${coPct.toFixed(0)}% del total`}/>
                <AKpi label="Encaje 8.5%" value={fmtCOP(encaje)} sub="requerido legal" accent="warn"/>
                <AKpi label="Cuentas" value={cuentas.length.toString()} sub="en sistema"/>
              </div>

              {/* Filtros */}
              <div>
                <div className="eyebrow" style={{ marginBottom: 8, padding: '0 4px' }}>Estado</div>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                  {['ACTIVA', 'BLOQUEADA', 'INACTIVA'].map(s => (
                    <AFilterChip key={s} active={estadoFilter === s} onClick={() => actualizarFiltro(s)}>{s}</AFilterChip>
                  ))}
                </div>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 8, padding: '0 4px' }}>Saldo mínimo</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 1, 50, 100].map(v => (
                    <AFilterChip key={v} active={minSaldo === v} onClick={() => setMinSaldo(v)}>{v === 0 ? 'TODOS' : `≥${v}M`}</AFilterChip>
                  ))}
                </div>
              </div>

              {/* Lista cuentas */}
              <div className="eyebrow" style={{ padding: '0 4px' }}>Cuentas · {cuentasFiltradas.length}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cuentasFiltradas.map((c, i) => {
                  const saldoDisp = Number(c.saldoDisponible ?? c.saldo ?? 0);
                  const saldoCont = Number(c.saldoContable ?? c.saldo ?? 0);
                  const critical = saldoCont >= 50_000_000;
                  return (
                    <div key={`cta-${c.idCuenta ?? i}`} className="nx-card" style={{ padding: 14, borderColor: critical ? 'rgba(77,141,255,0.25)' : undefined, background: critical ? 'rgba(77,141,255,0.04)' : undefined }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="mono" style={{ fontSize: 11, color: critical ? 'var(--electric)' : 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.titular || c.idCuenta}
                          </div>
                          <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, letterSpacing: '0.04em' }}>
                            #{c.idCuenta} · {c.tipoCuenta || '—'}
                          </div>
                        </div>
                        <AStatusTag status={c.estado}/>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '10px 12px', background: 'var(--bg-3)', borderRadius: 8 }}>
                        <div>
                          <div className="eyebrow" style={{ fontSize: 8 }}>Disponible</div>
                          <div className="mono tnum" style={{ fontSize: 12.5, marginTop: 3, fontWeight: 500 }}>{fmtCOP(saldoDisp)}</div>
                        </div>
                        <div>
                          <div className="eyebrow" style={{ fontSize: 8 }}>Contable</div>
                          <div className="mono tnum" style={{ fontSize: 12.5, marginTop: 3, color: 'var(--text-2)' }}>{fmtCOP(saldoCont)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {cuentasFiltradas.length === 0 && (
                  <div className="nx-card" style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>Sin cuentas en este filtro</div>
                )}
              </div>
            </>
          )}
        </div>
      </AScreen>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PANTALLA: Actividad por Cliente  (HU-18)
// ═══════════════════════════════════════════════════════════════════════════
const AdminActividad = ({ role, onMenu, onAudit }) => {
  const [modo, setModo] = useState('documento');
  const [query, setQuery] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tipoFilter, setTipoFilter] = useState('TODOS');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const buscar = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(null); setExpandedId(null);
    try {
      const fn = modo === 'documento' ? api.buscarActividadPorDocumento : api.buscarActividadPorCuenta;
      // Bug fix: tipoFilter ('INGRESOS'/'EGRESOS') son filtros locales del frontend,
      // no se pasan al backend para evitar que retorne lista vacía.
      const data = await fn(
        query.trim(),
        desde ? toISO(desde) : undefined,
        hasta ? toISO(hasta, true) : undefined,
        undefined,
      );
      setResultado(data);
      onAudit({
        action: `Consulta cliente · ${modo}`,
        target: query.trim(),
        risk: data.cliente?.estadoCuenta === 'BLOQUEADA' ? 'HIGH' : 'LOW',
      });
    } catch (e) {
      setError(e.message || 'Cliente no encontrado');
      setResultado(null);
    } finally {
      setLoading(false);
    }
  };

  const movsFiltrados = useMemo(() => {
    if (!resultado?.movimientos) return [];
    if (tipoFilter === 'TODOS') return resultado.movimientos;
    if (tipoFilter === 'INGRESOS') return resultado.movimientos.filter(m => Number(m.monto) > 0);
    if (tipoFilter === 'EGRESOS') return resultado.movimientos.filter(m => Number(m.monto) < 0);
    return resultado.movimientos;
  }, [resultado, tipoFilter]);

  const c = resultado?.cliente;

  return (
    <>
      <AHeader role={role} onMenu={onMenu} eyebrow="Investigación" title="Actividad por Cliente"/>
      <AScreen padTop={70}>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Buscador */}
          <div className="nx-card" style={{ padding: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Buscar por</div>
            {/* Toggle modo */}
            <div style={{ display: 'flex', gap: 0, padding: 3, borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--stroke-1)', marginBottom: 10 }}>
              {[['documento', 'Documento'], ['cuenta', 'N° Cuenta']].map(([m, l]) => (
                <button key={m} onClick={() => setModo(m)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 5, border: 'none', cursor: 'pointer',
                  background: modo === m ? 'var(--bg-1)' : 'transparent',
                  color: modo === m ? 'var(--text-1)' : 'var(--text-3)',
                  fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: modo === m ? 500 : 400,
                }}>{l}</button>
              ))}
            </div>
            {/* Input */}
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <Icon name="search" size={14} color="var(--text-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscar()}
                placeholder={modo === 'documento' ? 'CC, NIT…' : 'N° de cuenta'}
                className="mono"
                style={{
                  width: '100%', padding: '10px 12px 10px 36px', background: 'var(--bg-3)',
                  border: '1px solid var(--stroke-1)', borderRadius: 8, color: 'var(--text-1)',
                  fontSize: 12.5, outline: 'none', fontFamily: 'var(--font-mono)', boxSizing: 'border-box',
                }}/>
            </div>
            {/* Fechas opcionales */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {[['Desde', desde, setDesde], ['Hasta', hasta, setHasta]].map(([l, v, set]) => (
                <div key={l}>
                  <div className="eyebrow" style={{ fontSize: 8, marginBottom: 3 }}>{l} (opcional)</div>
                  <input type="date" value={v} onChange={e => set(e.target.value)} style={{
                    width: '100%', padding: '8px 10px', background: 'var(--bg-3)',
                    border: '1px solid var(--stroke-1)', borderRadius: 8, color: 'var(--text-1)',
                    fontSize: 11, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark',
                  }}/>
                </div>
              ))}
            </div>
            <APrimaryBtn onClick={buscar} loading={loading}>
              <Icon name="search" size={14}/> Consultar cliente
            </APrimaryBtn>
          </div>

          {error && (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,107,122,0.08)', border: '1px solid rgba(255,107,122,0.25)', color: 'var(--danger)', fontSize: 12 }}>
              {error}
            </div>
          )}

          {/* Banner auditoría */}
          {c && (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(245,181,68,0.08)', border: '1px solid rgba(245,181,68,0.25)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Icon name="shield" size={14} color="var(--warn)" style={{ flexShrink: 0, marginTop: 1 }}/>
              <span style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.4 }}>
                Consulta registrada en log de auditoría · Rol <span className="mono" style={{ color: 'var(--warn)' }}>{role}</span>
              </span>
            </div>
          )}

          {c && (
            <>
              {/* Ficha cliente */}
              <div className="nx-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #142659, #0D1B3D)', border: '1px solid var(--stroke-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, flexShrink: 0 }}>
                    {(c.nombre || '?').split(' ').slice(0, 2).map(s => s[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                      <AStatusTag status={c.estadoCuenta}/>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['DOC', c.documento],
                    ['N° CUENTA', c.numeroCuenta || '—'],
                    ['VINCULADO', c.fechaVinculacion ? fmtDateTime(c.fechaVinculacion) : '—'],
                    ['ID CLIENTE', `#${c.idCliente}`],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div className="eyebrow" style={{ fontSize: 8 }}>{l}</div>
                      <div className="mono" style={{ fontSize: 11, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <AKpi label="Total movimientos" value={resultado.totalMovimientos.toString()} sub={`${(resultado.movimientos || []).filter(m => m.estado === 'EXITOSA' || m.estado === 'EXITOSO').length} exitosos`}/>
                <AKpi label="Ingresos" value={fmtCOP((resultado.movimientos || []).filter(m => Number(m.monto) > 0 && m.estado !== 'FALLIDA').reduce((s, m) => s + Number(m.monto), 0))} accent="success"/>
              </div>

              {/* Filtro tipo */}
              <div>
                <div className="eyebrow" style={{ marginBottom: 8, padding: '0 4px' }}>Tipo de movimiento</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['TODOS', 'INGRESOS', 'EGRESOS'].map(t => (
                    <AFilterChip key={t} active={tipoFilter === t} onClick={() => setTipoFilter(t)}>{t}</AFilterChip>
                  ))}
                </div>
              </div>

              {/* Lista movimientos */}
              <div className="eyebrow" style={{ padding: '0 4px' }}>Actividad · {movsFiltrados.length} movimientos</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {movsFiltrados.map((m, i) => {
                  const monto = Number(m.monto);
                  const esIngreso = monto > 0;
                  const txId = m.idTransaccion || `idx-${i}`;
                  const isOpen = expandedId === txId;
                  return (
                    <div key={txId} className="nx-card" style={{ padding: 0, overflow: 'hidden' }}>
                      {/* Fila principal — clickable */}
                      <button
                        onClick={() => setExpandedId(isOpen ? null : txId)}
                        style={{
                          all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                          padding: 12,
                        }}
                      >
                        <div style={{
                          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                          background: esIngreso ? 'rgba(91,216,160,0.12)' : 'rgba(255,255,255,0.04)',
                          color: esIngreso ? 'var(--success)' : 'var(--text-2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `1px solid ${esIngreso ? 'rgba(91,216,160,0.2)' : 'var(--stroke-1)'}`,
                        }}>
                          <Icon name={esIngreso ? 'arrow-down-left' : 'arrow-up-right'} size={13}/>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.concepto || 'Movimiento'}</div>
                          <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{fmtDateTime(m.fechaHora)}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="mono tnum" style={{ fontSize: 12.5, fontWeight: 500, color: esIngreso ? 'var(--success)' : 'var(--text-1)' }}>
                            {esIngreso ? '+' : '−'}{fmtCOP(Math.abs(monto))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 3 }}>
                            <AStatusTag status={m.estado}/>
                            <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={12} color="var(--text-3)"/>
                          </div>
                        </div>
                      </button>

                      {/* Detalle expandible */}
                      {isOpen && (
                        <div style={{ borderTop: '1px solid var(--stroke-1)', padding: '10px 12px', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div>
                              <div className="eyebrow" style={{ fontSize: 7.5, marginBottom: 3 }}>Cuenta origen</div>
                              <div className="mono" style={{ fontSize: 11, color: m.cuentaOrigen ? 'var(--text-1)' : 'var(--text-4)' }}>
                                {m.cuentaOrigen ? `#${m.cuentaOrigen}` : '—'}
                              </div>
                            </div>
                            <div>
                              <div className="eyebrow" style={{ fontSize: 7.5, marginBottom: 3 }}>Cuenta destino</div>
                              <div className="mono" style={{ fontSize: 11, color: m.cuentaDestino ? 'var(--text-1)' : 'var(--text-4)' }}>
                                {m.cuentaDestino ? `#${m.cuentaDestino}` : '—'}
                              </div>
                            </div>
                            {m.bancoDestino && (
                              <div>
                                <div className="eyebrow" style={{ fontSize: 7.5, marginBottom: 3 }}>Banco destino</div>
                                <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{m.bancoDestino}</div>
                              </div>
                            )}
                            {m.nombreReceptorExterno && (
                              <div>
                                <div className="eyebrow" style={{ fontSize: 7.5, marginBottom: 3 }}>Receptor</div>
                                <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{m.nombreReceptorExterno}</div>
                              </div>
                            )}
                            {m.saldoResultante != null && (
                              <div>
                                <div className="eyebrow" style={{ fontSize: 7.5, marginBottom: 3 }}>Saldo resultante</div>
                                <div className="mono tnum" style={{ fontSize: 11, color: 'var(--text-2)' }}>{fmtCOP(Number(m.saldoResultante))}</div>
                              </div>
                            )}
                            <div>
                              <div className="eyebrow" style={{ fontSize: 7.5, marginBottom: 3 }}>ID transacción</div>
                              <div className="mono" style={{ fontSize: 10, color: 'var(--electric)', letterSpacing: '0.04em' }}>{m.idTransaccion || '—'}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {movsFiltrados.length === 0 && (
                  <div className="nx-card" style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>Sin movimientos en este filtro</div>
                )}
              </div>
            </>
          )}
        </div>
      </AScreen>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PANTALLA: Log de Auditoría — carga desde backend
// ═══════════════════════════════════════════════════════════════════════════
const AdminAuditoria = ({ role, onMenu }) => {
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
    <>
      <AHeader role={role} onMenu={onMenu} eyebrow="Cumplimiento" title="Log de Auditoría"/>
      <AScreen padTop={70}>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <AKpi label="Eventos totales" value={entries.length.toString()} sub="todas las sesiones"/>
            <AKpi label="Consultas de clientes" value={consultasActividad.toString()} sub="accesos a datos privados" accent={consultasActividad > 0 ? 'warn' : undefined}/>
          </div>

          <button onClick={cargar} className="press" style={{
            background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 10,
            padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: 'var(--text-2)', fontSize: 12,
          }}>
            <Icon name="reload" size={14}/> Actualizar log
          </button>

          {loading ? <ALoading/> : error ? (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,107,122,0.08)', border: '1px solid rgba(255,107,122,0.25)', color: 'var(--danger)', fontSize: 12 }}>{error}</div>
          ) : entries.length === 0 ? (
            <div className="nx-card" style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
              No hay eventos registrados
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entries.map(e => (
                <div key={e.idAuditoria} className="nx-card" style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--electric)' }}>#{e.idAuditoria}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, marginTop: 3, lineHeight: 1.3 }}>{e.accion}</div>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em',
                      padding: '3px 7px', borderRadius: 4,
                      background: e.usuarioRol === 'GERENTE' ? 'rgba(245,181,68,0.10)' : 'rgba(255,107,122,0.10)',
                      border: `1px solid ${e.usuarioRol === 'GERENTE' ? 'rgba(245,181,68,0.3)' : 'rgba(255,107,122,0.3)'}`,
                      color: e.usuarioRol === 'GERENTE' ? 'var(--warn)' : 'var(--danger)',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>{e.usuarioRol}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '8px 10px', background: 'var(--bg-3)', borderRadius: 6 }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="eyebrow" style={{ fontSize: 7.5 }}>Usuario</div>
                      <div className="mono" style={{ fontSize: 10, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.usuarioUsername}</div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="eyebrow" style={{ fontSize: 7.5 }}>Fecha</div>
                      <div className="mono" style={{ fontSize: 10, marginTop: 2, color: 'var(--text-3)' }}>{fmtDateTime(e.fecha)}</div>
                    </div>
                    {e.detalle && (
                      <div style={{ gridColumn: '1 / -1', minWidth: 0 }}>
                        <div className="eyebrow" style={{ fontSize: 7.5 }}>Detalle</div>
                        <div className="mono" style={{ fontSize: 10, marginTop: 2, color: 'var(--text-2)', lineHeight: 1.4 }}>{e.detalle}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AScreen>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DRAWER LATERAL
// ═══════════════════════════════════════════════════════════════════════════
const AdminDrawer = ({ open, onClose, role, hasClientAccounts, onSwitchToClient, active, onNav, onLogout, username }) => {
  if (!open) return null;

  const isGerente = role === 'GERENTE';
  const sections = [
    { sec: 'Operación', items: [
      { id: 'overview',  icon: 'home',   label: 'Resumen general' },
      { id: 'reportes',  icon: 'list',   label: 'Reportes maestros' },
      { id: 'saldos',    icon: 'wallet', label: 'Saldos consolidados' },
    ]},
    { sec: 'Investigación', items: [
      { id: 'actividad', icon: 'search', label: 'Actividad cliente' },
    ]},
    { sec: 'Cumplimiento', items: [
      { id: 'auditoria', icon: 'shield', label: 'Log de auditoría' },
    ]},
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(5,6,8,0.6)', backdropFilter: 'blur(6px)' }}/>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 300, zIndex: 210,
        background: 'var(--bg-0)', borderRight: '1px solid var(--stroke-2)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header drawer */}
        <div style={{ padding: '68px 16px 14px', borderBottom: '1px solid var(--stroke-1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <NxLogo size={22}/>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em' }}>
                NEXUS
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.16em',
                  padding: '2px 6px', borderRadius: 3, marginLeft: 4,
                  background: isGerente ? 'rgba(245,181,68,0.10)' : 'rgba(255,107,122,0.10)',
                  color: isGerente ? 'var(--warn)' : 'var(--danger)',
                  border: `1px solid ${isGerente ? 'rgba(245,181,68,0.25)' : 'rgba(255,107,122,0.25)'}`,
                }}>{role}</span>
              </div>
              <div className="mono" style={{ fontSize: 8.5, color: 'var(--text-3)', marginTop: 2, letterSpacing: '0.1em' }}>Consola de Cumplimiento</div>
            </div>
          </div>
        </div>

        {/* Rol activo */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--stroke-1)' }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Rol activo</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 8,
            background: isGerente ? 'rgba(245,181,68,0.10)' : 'rgba(255,107,122,0.10)',
            border: `1px solid ${isGerente ? 'rgba(245,181,68,0.3)' : 'rgba(255,107,122,0.3)'}`,
            color: isGerente ? 'var(--warn)' : 'var(--danger)',
            fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.12em',
          }}>
            <span className="nx-dot" style={{ background: isGerente ? 'var(--warn)' : 'var(--danger)', boxShadow: `0 0 6px ${isGerente ? 'var(--warn)' : 'var(--danger)'}` }}/>
            {role}
          </div>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.5 }}>
            Acceso completo al sistema
          </div>
          {hasClientAccounts && onSwitchToClient && (
            <button onClick={() => { onSwitchToClient(); onClose(); }} className="press" style={{
              marginTop: 10, width: '100%', padding: '9px 0', borderRadius: 8,
              background: 'rgba(77,141,255,0.08)', border: '1px solid rgba(77,141,255,0.25)',
              color: 'var(--electric)', fontFamily: 'var(--font-mono)', fontSize: 10,
              letterSpacing: '0.1em', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Icon name="wallet" size={13}/> Ver mis cuentas
            </button>
          )}
        </div>

        {/* Nav */}
        <div style={{ padding: '10px', flex: 1, overflow: 'auto' }}>
          {sections.map(({ sec, items }) => (
            <div key={sec} style={{ marginBottom: 14 }}>
              <div className="eyebrow" style={{ padding: '4px 10px 6px', fontSize: 9 }}>{sec}</div>
              {items.map(it => {
                const on = it.id === active;
                return (
                  <button key={it.id} onClick={() => { onNav(it.id); onClose(); }} style={{
                    all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
                    width: '100%', padding: '10px', borderRadius: 8,
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: on ? 'rgba(77,141,255,0.10)' : 'transparent',
                    color: on ? 'var(--text-1)' : 'var(--text-2)',
                    fontSize: 13, fontWeight: on ? 500 : 400, marginBottom: 2,
                  }}>
                    <Icon name={it.icon} size={15} color={on ? 'var(--electric)' : 'currentColor'}/>
                    <span>{it.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--stroke-1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--danger), var(--electric))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
              {(username || 'A').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{username}</div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.08em' }}>{role} · CUMPLIMIENTO</div>
            </div>
            <button onClick={onLogout} className="press" style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid var(--stroke-2)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="logout" size={13}/>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOT: AdminPanelScreen
// ═══════════════════════════════════════════════════════════════════════════
const AdminPanelScreen = ({ username, userRole = 'ADMIN', hasClientAccounts = false, onSwitchToClient, onLogout }) => {
  const role = userRole;
  const [adminRoute, setAdminRoute] = useState('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [auditLog, setAuditLog] = useState([]);

  const addAudit = useCallback((entry) => {
    setAuditLog(prev => [{
      id: `A-${Date.now()}`,
      user: username,
      role: userRole,
      action: entry.action,
      target: entry.target,
      date: new Date().toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      risk: entry.risk || 'LOW',
    }, ...prev]);
  }, [username, userRole]);

  const navItems = [
    { id: 'overview',  icon: 'home',   label: 'Inicio' },
    { id: 'reportes',  icon: 'list',   label: 'Reportes' },
    { id: 'saldos',    icon: 'wallet', label: 'Saldos' },
    { id: 'actividad', icon: 'search', label: 'Cliente' },
    { id: 'auditoria', icon: 'shield', label: 'Auditoría' },
  ];

  let content;
  switch (adminRoute) {
    case 'overview':  content = <AdminOverview  role={role} onMenu={() => setDrawerOpen(true)} onNav={setAdminRoute} auditLog={auditLog}/>; break;
    case 'reportes':  content = <AdminReportes  role={role} onMenu={() => setDrawerOpen(true)} onAudit={addAudit}/>; break;
    case 'saldos':    content = <AdminSaldos    role={role} onMenu={() => setDrawerOpen(true)}/>; break;
    case 'actividad': content = <AdminActividad role={role} onMenu={() => setDrawerOpen(true)} onAudit={addAudit}/>; break;
    case 'auditoria': content = <AdminAuditoria role={role} onMenu={() => setDrawerOpen(true)}/>; break;
    default:          content = <AdminOverview  role={role} onMenu={() => setDrawerOpen(true)} onNav={setAdminRoute} auditLog={auditLog}/>;
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-1)', overflow: 'hidden' }}>
      {/* Screen content */}
      {content}

      {/* Bottom nav */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingBottom: 28, paddingTop: 8, paddingLeft: 10, paddingRight: 10, zIndex: 40,
        background: 'linear-gradient(180deg, rgba(11,13,18,0) 0%, rgba(11,13,18,0.85) 30%, rgba(7,8,11,1) 70%)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          background: 'rgba(17,20,27,0.85)', border: '1px solid var(--stroke-2)',
          borderRadius: 20, padding: 5,
        }}>
          {navItems.map(it => {
            const on = it.id === adminRoute;
            return (
              <button key={it.id} onClick={() => setAdminRoute(it.id)} className="press" style={{
                all: 'unset', boxSizing: 'border-box', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '7px 4px', borderRadius: 13,
                color: on ? 'var(--text-1)' : 'var(--text-3)',
                position: 'relative',
              }}>
                {on && <div style={{ position: 'absolute', top: 1, left: '50%', width: 4, height: 4, borderRadius: 2, background: 'var(--electric)', transform: 'translateX(-50%)', boxShadow: '0 0 8px var(--electric)' }}/>}
                <Icon name={it.icon} size={18}/>
                <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.02em' }}>{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drawer */}
      <AdminDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        role={role}
        hasClientAccounts={hasClientAccounts}
        onSwitchToClient={onSwitchToClient}
        active={adminRoute}
        onNav={setAdminRoute}
        onLogout={onLogout}
        username={username}
      />
    </div>
  );
};

export default AdminPanelScreen;
