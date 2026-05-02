import { useState, useEffect } from 'react';
import { Icon, Screen, SubHeader, maskAcct } from '../components/primitives';
import { TxRow } from './Dashboard';
import * as api from '../api';

const HistorialScreen = ({ accounts = [], onBack }) => {
  const [acctIdx, setAcctIdx] = useState(0);
  const [filter, setFilter] = useState('mes');
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filters = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mes' },
    { id: 'todo', label: 'Todo' },
  ];

  const getDateRange = (f) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const hasta = fmt(now);
    if (f === 'hoy') { const s = new Date(now); s.setHours(0,0,0,0); return { desde: fmt(s), hasta }; }
    if (f === 'semana') { const s = new Date(now); s.setDate(s.getDate() - 7); return { desde: fmt(s), hasta }; }
    if (f === 'mes') { const s = new Date(now); s.setMonth(s.getMonth() - 1); return { desde: fmt(s), hasta }; }
    return null;
  };

  const load = async (idx, f) => {
    const acct = accounts[idx];
    if (!acct?.idCuenta) return;
    setLoading(true); setError('');
    try {
      let data;
      const range = getDateRange(f);
      if (range) {
        data = await api.getMovimientosFiltro(acct.idCuenta, range.desde, range.hasta);
      } else {
        data = await api.getMovimientos(acct.idCuenta);
      }
      setTxns(data);
    } catch (e) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(acctIdx, filter); }, [acctIdx, filter, accounts]);

  const grouped = txns.reduce((acc, t) => {
    const raw = t.fechaHora || t.fecha;
    const d = raw ? new Date(raw).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha';
    if (!acc[d]) acc[d] = [];
    acc[d].push(t);
    return acc;
  }, {});

  const ingresos = txns.filter(t => Number(t.monto || 0) > 0).reduce((s, t) => s + Number(t.monto || 0), 0);
  const egresos  = txns.filter(t => Number(t.monto || 0) < 0).reduce((s, t) => s + Math.abs(Number(t.monto || 0)), 0);

  const { fmtCOP } = { fmtCOP: (n) => '$' + Math.abs(Number(n || 0)).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) };

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
      {error && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--danger)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{error}</div>}

      {!loading && !error && txns.length === 0 && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Sin movimientos en este período</div>
      )}

      {!loading && Object.entries(grouped).map(([day, items]) => (
        <div key={day} style={{ marginBottom: 16 }}>
          <div className="eyebrow" style={{ padding: '0 24px 6px' }}>{day}</div>
          <div className="nx-card" style={{ margin: '0 20px', overflow: 'hidden' }}>
            {items.map((t, i) => (
              <div key={t.idTransaccion || i}>
                <TxRow t={t}/>
                {i < items.length - 1 && <div style={{ height: 1, background: 'var(--stroke-1)', marginLeft: 60 }}/>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </Screen>
  );
};

export default HistorialScreen;
