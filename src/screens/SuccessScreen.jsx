import { Icon, fmtCOP } from '../components/primitives';

const SuccessScreen = ({ data, onDone }) => {
  const txt = (() => {
    if (!data) return { t: 'Operación exitosa', s: '' };
    if (data.kind === 'transfer') return { t: 'Transferencia realizada', s: `${fmtCOP(data.amount)} enviados a cuenta ${data.destAcct} · Banco Nexus` };
    if (data.kind === 'deposit')  return { t: 'Depósito confirmado', s: `${fmtCOP(data.amount)} acreditados` };
    if (data.kind === 'withdraw') return { t: 'Retiro autorizado', s: `${fmtCOP(data.amount)} procesados` };
    if (data.act === 'block')     return { t: 'Cuenta bloqueada', s: data.acct?.label || '' };
    if (data.act === 'unblock')   return { t: 'Cuenta reactivada', s: data.acct?.label || '' };
    if (data.act === 'close')     return { t: 'Cuenta cerrada', s: data.acct?.label || '' };
    return { t: 'Operación exitosa', s: '' };
  })();

  const apiResult = data?.result;
  const ref = apiResult?.idTransaccion ? `NX-${String(apiResult.idTransaccion).padStart(7, '0')}` : 'NX-' + String(Math.floor(Math.random() * 9999999)).padStart(7, '0');
  const fecha = apiResult?.fecha ? new Date(apiResult.fecha).toLocaleString('es-CO') : new Date().toLocaleString('es-CO');
  const saldoRes = apiResult?.saldoResultante;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-1)', display: 'flex', flexDirection: 'column', padding: '90px 24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: 160 }}>
        {[80, 64, 48].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: s + 60, height: s + 60, borderRadius: '50%', border: '1px solid rgba(91,216,160,0.15)', animation: `nx-pulse 2s ease-in-out ${i * 0.3}s infinite` }}/>
        ))}
        <div className="fade-up" style={{ width: 80, height: 80, borderRadius: 40, background: 'rgba(91,216,160,0.12)', border: '1px solid rgba(91,216,160,0.4)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(91,216,160,0.3)' }}>
          <Icon name="check" size={36} stroke={2.4}/>
        </div>
      </div>

      <div className="fade-up" style={{ textAlign: 'center', marginTop: 32, animationDelay: '0.1s' }}>
        <div className="eyebrow">Confirmado</div>
        <div style={{ fontSize: 26, fontWeight: 500, marginTop: 8, letterSpacing: '-0.02em' }}>{txt.t}</div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 8, lineHeight: 1.5 }}>{txt.s}</div>
      </div>

      <div className="fade-up" style={{ marginTop: 28, animationDelay: '0.18s' }}>
        <div className="nx-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="eyebrow">Referencia</span>
            <span className="mono" style={{ fontSize: 12 }}>{ref}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="eyebrow">Fecha · hora</span>
            <span className="mono" style={{ fontSize: 12 }}>{fecha}</span>
          </div>
          {saldoRes != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span className="eyebrow">Saldo resultante</span>
              <span className="mono" style={{ fontSize: 12 }}>{fmtCOP(saldoRes)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="eyebrow">Estado</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--success)' }}>EXITOSA</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}/>
      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 8, animationDelay: '0.24s' }}>
        <button className="nx-btn nx-btn-primary" onClick={onDone}>Volver al inicio</button>
      </div>
    </div>
  );
};

export default SuccessScreen;
