import { useState, useEffect } from 'react';
import { Icon, Screen, SubHeader, maskAcct, fmtCOP } from '../components/primitives';
import * as api from '../api';

const fmtDateTime = (raw) => {
  if (!raw) return '—';
  return new Date(raw).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const statusColor = (estado) => {
  if (!estado) return 'var(--text-3)';
  if (estado === 'EXITOSO' || estado === 'EXITOSA') return 'var(--success)';
  if (estado === 'FALLIDO' || estado === 'FALLIDA') return 'var(--danger)';
  return 'var(--warn)';
};

const HistorialScreen = ({ accounts = [], onBack }) => {
  const [acctIdx, setAcctIdx]     = useState(0);
  const [filter, setFilter]       = useState('mes');
  const [txns, setTxns]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filters = [
    { id: 'hoy',    label: 'Hoy' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes',    label: 'Mes' },
    { id: 'todo',   label: 'Todo' },
  ];

  const getDateRange = (f) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const hasta = fmt(now);
    if (f === 'hoy')    { const s = new Date(now); s.setHours(0,0,0,0); return { desde: fmt(s), hasta }; }
    if (f === 'semana') { const s = new Date(now); s.setDate(s.getDate() - 7); return { desde: fmt(s), hasta }; }
    if (f === 'mes')    { const s = new Date(now); s.setMonth(s.getMonth() - 1); return { desde: fmt(s), hasta }; }
    return null;
  };

  const load = async (idx, f) => {
    const acct = accounts[idx];
    if (!acct?.idCuenta) return;
    setLoading(true); setError(''); setExpandedId(null);
    try {
      const range = getDateRange(f);
      const data  = range
        ? await api.getMovimientosFiltro(acct.idCuenta, range.desde, range.hasta)
        : await api.getMovimientos(acct.idCuenta);
      setTxns(data);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(acctIdx, filter); }, [acctIdx, filter, accounts]);

  const grouped = txns.reduce((acc, t) => {
    const raw = t.fechaHora || t.fecha;
    const d = raw
      ? new Date(raw).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Sin fecha';
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {});

  const ingresos = txns.filter(t => Number(t.monto || 0) > 0).reduce((s, t) => s + Number(t.monto || 0), 0);
  const egresos  = txns.filter(t => Number(t.monto || 0) < 0).reduce((s, t) => s + Math.abs(Number(t.monto || 0)), 0);

  return (
    <Screen padTop={54} padBottom={120}>
      <SubHeader onBack={onBack} eyebrow="Histórico" title="Movimientos"
        right={<button className="press" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', color: 'var(--text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="search" size={18}/></button>}
      />

      {accounts.length > 1 && (
        <div style={{ padding: '0 20px 12px' }}>
          <select className="nx-input" value={acctIdx} onChange={e => setAcctIdx(Number(e.target.value))} style={{ appearance: 'none', background: 'var(--bg-2)', color: 'var(--text-1)' }}>
            {accounts.map((a, i) => (
              <option key={a.idCuenta || i} value={i} style={{ background: 'var(--bg-2)', color: 'var(--text-1)' }}>
                {a.label || a.tipo} — {maskAcct(a.numeroCuenta || '')}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 6 }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className="press" style={{ flex: 1, height: 36, borderRadius: 10, background: filter === f.id ? 'var(--bg-3)' : 'var(--bg-2)', border: `1px solid ${filter === f.id ? 'var(--stroke-3)' : 'var(--stroke-1)'}`, color: filter === f.id ? 'var(--text-1)' : 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {f.label}
          </button>
        ))}
      </div>

      {txns.length > 0 && (
        <div style={{ padding: '0 20px 20px' }}>
          <div className="nx-card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between' }}>
            <div><div className="eyebrow">Ingresos</div><div className="tnum" style={{ fontSize: 17, fontWeight: 500, marginTop: 4, color: 'var(--success)' }}>+ {fmtCOP(ingresos)}</div></div>
            <div style={{ width: 1, background: 'var(--stroke-1)' }}/>
            <div><div className="eyebrow">Egresos</div><div className="tnum" style={{ fontSize: 17, fontWeight: 500, marginTop: 4 }}>− {fmtCOP(egresos)}</div></div>
            <div style={{ width: 1, background: 'var(--stroke-1)' }}/>
            <div><div className="eyebrow">Neto</div><div className="tnum" style={{ fontSize: 17, fontWeight: 500, marginTop: 4, color: ingresos - egresos >= 0 ? 'var(--electric)' : 'var(--danger)' }}>{ingresos - egresos >= 0 ? '+' : '−'} {fmtCOP(Math.abs(ingresos - egresos))}</div></div>
          </div>
        </div>
      )}

      {loading && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Cargando…</div>}
      {error   && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{error}</div>}

      {!loading && !error && txns.length === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Sin movimientos en este período</div>
      )}

      {!loading && Object.entries(grouped).map(([day, items]) => (
        <div key={day} style={{ marginBottom: 16 }}>
          <div className="eyebrow" style={{ padding: '0 24px 6px' }}>{day}</div>
          <div style={{ margin: '0 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((t, i) => {
              const txId   = t.idTransaccion || `idx-${i}`;
              const isOpen = expandedId === txId;
              const monto  = Number(t.monto ?? 0);
              const isIn   = monto > 0;
              const tipo   = t.concepto || t.tipo || '';
              const label  = tipo === 'DEPOSITO' ? 'Depósito' : tipo === 'RETIRO' ? 'Retiro en cajero' : tipo === 'TRANSFERENCIA' ? 'Transferencia' : tipo || 'Movimiento';

              return (
                <div key={txId} className="nx-card" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Fila principal */}
                  <button
                    onClick={() => setExpandedId(isOpen ? null : txId)}
                    style={{ all: 'unset', boxSizing: 'border-box', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px' }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: isIn ? 'rgba(91,216,160,0.12)' : 'rgba(255,107,122,0.10)', color: isIn ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isIn ? 'rgba(91,216,160,0.22)' : 'rgba(255,107,122,0.28)'}` }}>
                      <Icon name={isIn ? 'arrow-down-left' : 'arrow-up-right'} size={16}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{fmtDateTime(t.fechaHora || t.fecha)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="tnum" style={{ fontSize: 13.5, fontWeight: 500, color: isIn ? 'var(--success)' : 'var(--danger)' }}>
                        {isIn ? '+' : '−'} {fmtCOP(Math.abs(monto))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        {t.estado && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: statusColor(t.estado) }}>
                            {t.estado}
                          </span>
                        )}
                        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={12} color="var(--text-3)"/>
                      </div>
                    </div>
                  </button>

                  {/* Detalle expandible */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--stroke-1)', padding: '12px 16px', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <div className="eyebrow" style={{ fontSize: 7.5, marginBottom: 3 }}>Cuenta origen</div>
                          <div className="mono" style={{ fontSize: 11, color: t.cuentaOrigen ? 'var(--text-1)' : 'var(--text-4)' }}>
                            {t.cuentaOrigen ? `#${maskAcct(t.cuentaOrigen)}` : '—'}
                          </div>
                        </div>
                        <div>
                          <div className="eyebrow" style={{ fontSize: 7.5, marginBottom: 3 }}>Cuenta destino</div>
                          <div className="mono" style={{ fontSize: 11, color: t.cuentaDestino ? 'var(--text-1)' : 'var(--text-4)' }}>
                            {t.cuentaDestino ? `#${maskAcct(t.cuentaDestino)}` : '—'}
                          </div>
                        </div>
                        {t.bancoDestino && (
                          <div>
                            <div className="eyebrow" style={{ fontSize: 7.5, marginBottom: 3 }}>Banco destino</div>
                            <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{t.bancoDestino}</div>
                          </div>
                        )}
                        {t.nombreReceptorExterno && (
                          <div>
                            <div className="eyebrow" style={{ fontSize: 7.5, marginBottom: 3 }}>Receptor</div>
                            <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>{t.nombreReceptorExterno}</div>
                          </div>
                        )}
                        {t.saldoResultante != null && (
                          <div>
                            <div className="eyebrow" style={{ fontSize: 7.5, marginBottom: 3 }}>Saldo resultante</div>
                            <div className="mono tnum" style={{ fontSize: 11, color: 'var(--text-2)' }}>{fmtCOP(Number(t.saldoResultante))}</div>
                          </div>
                        )}
                        <div>
                          <div className="eyebrow" style={{ fontSize: 7.5, marginBottom: 3 }}>Referencia</div>
                          <div className="mono" style={{ fontSize: 10, color: 'var(--electric)', letterSpacing: '0.04em' }}>{t.idTransaccion || '—'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </Screen>
  );
};

export default HistorialScreen;
