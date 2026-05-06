import { useState } from 'react';
import { Icon, Spinner, fmtCOP } from './primitives';

const ConfirmModal = ({ data, onCancel, onConfirm }) => {
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);

  if (!data) return null;

  const summary = (() => {
    if (data.kind === 'transfer') return { title: 'Confirmar transferencia', detail: `${fmtCOP(data.amount)} → cuenta ${data.destAcct}`, sub: 'Banco Nexus · Transferencia interna' };
    if (data.kind === 'ach') return { title: 'Confirmar transferencia ACH', detail: `${fmtCOP(data.amount)} → ${data.nombreReceptor}`, sub: `${data.destBanco} · ${data.destTipoCuenta}` };
    if (data.kind === 'withdraw') return { title: 'Confirmar retiro',         detail: `${fmtCOP(data.amount)} de ${data.src?.label || 'su cuenta'}` };
    if (data.act === 'block')     return { title: 'Bloquear cuenta',          detail: data.acct?.label, needsPwd: true };
    if (data.act === 'unblock')   return { title: 'Desbloquear cuenta',       detail: data.acct?.label, needsPwd: true };
    if (data.act === 'close')     return { title: 'Cerrar cuenta',            detail: data.acct?.label, danger: true, needsPwd: true };
    return { title: 'Confirmar', detail: '' };
  })();

  const submit = async () => {
    setLoading(true);
    try {
      await onConfirm({ ...data, password: pwd });
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !summary.needsPwd || pwd.length > 0;

  return (
    <div className="fade-in" style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(5,6,8,0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div className="fade-up" style={{
        width: '100%', background: 'var(--bg-2)',
        borderTop: '1px solid var(--stroke-2)', borderRadius: '24px 24px 0 0',
        padding: '12px 20px 28px',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--stroke-3)', margin: '4px auto 18px' }}/>
        <div className="eyebrow">{summary.needsPwd ? 'Verificación requerida' : 'Confirmar operación'}</div>
        <div style={{ fontSize: 22, fontWeight: 500, marginTop: 6, letterSpacing: '-0.015em' }}>{summary.title}</div>
        <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginTop: 6 }}>{summary.detail}</div>
        {summary.sub && (
          <div className="mono" style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{summary.sub}</div>
        )}

        {summary.needsPwd && (
          <div style={{ marginTop: 20 }}>
            <label className="nx-label">Confirme su contraseña</label>
            <input className="nx-input" type="password" value={pwd} onChange={e => setPwd(e.target.value)}
              placeholder="••••••••" autoFocus onKeyDown={e => e.key === 'Enter' && canSubmit && submit()}/>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="nx-btn nx-btn-ghost" style={{ flex: 1 }} onClick={onCancel} disabled={loading}>Cancelar</button>
          <button className={`nx-btn ${summary.danger ? 'nx-btn-danger' : 'nx-btn-primary'}`}
            style={{ flex: 1.4, opacity: canSubmit ? 1 : 0.5 }}
            onClick={submit} disabled={loading || !canSubmit}>
            {loading ? <Spinner /> : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
