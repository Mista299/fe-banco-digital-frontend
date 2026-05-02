import { useState } from 'react';
import { Icon, fmtCOP, maskAcct, NxWordmark, Screen } from '../components/primitives';
import NexusCard from '../components/Card';

const FINISHES = ['obsidian', 'midnight', 'graphite'];

const accountWithMeta = (a, i) => ({
  ...a,
  label: a.label || (a.tipo === 'CORRIENTE' ? 'Cuenta Corriente' : 'Cuenta de Ahorros'),
  finish: FINISHES[i % FINISHES.length],
});

export const TxRow = ({ t, dense = false, onClick }) => {
  const tipo     = t.concepto || t.tipo || '';
  const fechaRaw = t.fechaHora || t.fecha;
  const monto    = Number(t.monto ?? t.amount ?? 0);

  // El mapper del backend ya firma el monto: negativo = egreso, positivo = ingreso.
  // Para datos estáticos (mock) usamos tipo/kind como fallback.
  const isIn = t.kind === 'in'
    || monto > 0
    || (monto === 0 && (tipo === 'DEPOSITO' || (tipo === 'TRANSFERENCIA' && !t.numeroCuentaOrigen)));

  const label   = t.label || (tipo === 'DEPOSITO' ? 'Depósito' : tipo === 'RETIRO' ? 'Retiro' : tipo === 'TRANSFERENCIA' ? 'Transferencia' : 'Movimiento');
  const dateStr = t.date || (fechaRaw ? new Date(fechaRaw).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
  const amount  = Math.abs(monto);
  const pending = t.status === 'PENDIENTE' || t.estado === 'FALLIDA';

  const iconBg     = isIn ? 'rgba(91,216,160,0.12)'   : 'rgba(255,107,122,0.10)';
  const iconBorder = isIn ? 'rgba(91,216,160,0.22)'   : 'rgba(255,107,122,0.28)';
  const iconColor  = isIn ? 'var(--success)'           : 'var(--danger)';
  const amountColor = isIn ? 'var(--success)'          : 'var(--danger)';

  return (
    <div onClick={onClick} className={onClick ? 'press' : ''} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: dense ? '12px 14px' : '14px 16px' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${iconBorder}` }}>
        <Icon name={isIn ? 'arrow-down-left' : 'arrow-up-right'} size={16}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', display: 'flex', gap: 8 }}>
          <span>{dateStr}</span>
          {pending && <span style={{ color: 'var(--danger)' }}>· FALLIDA</span>}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="tnum" style={{ fontSize: 13.5, fontWeight: 500, color: amountColor }}>
          {isIn ? '+' : '−'} {fmtCOP(amount)}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>COP</div>
      </div>
    </div>
  );
};

// Dashboard A — Wallet stack
export const DashboardA = ({ accounts = [], recentTxns = [], onAccount, onAction, username }) => {
  const [selIdx, setSelIdx] = useState(0);
  const total = accounts.reduce((s, a) => s + Number(a.saldo || 0), 0);
  const name = username ? username.charAt(0).toUpperCase() + username.slice(1) : 'Cliente';

  return (
    <Screen padTop={56} padBottom={120}>
      <div className="fade-up" style={{ padding: '8px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow">Buenos días</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4, letterSpacing: '-0.01em' }}>Sr. {name}</div>
        </div>
        <button className="press" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', color: 'var(--text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="bell" size={18}/>
        </button>
      </div>

      <div className="fade-up" style={{ padding: '20px 24px 0', animationDelay: '0.04s' }}>
        <div style={{ padding: '14px 16px', borderRadius: 16, background: 'linear-gradient(180deg, rgba(77,141,255,0.06), rgba(77,141,255,0.01))', border: '1px solid rgba(77,141,255,0.18)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="eyebrow">Patrimonio total · {accounts.length} cuentas</div>
          </div>
          <div className="tnum" style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 500, marginTop: 4, letterSpacing: '-0.025em' }}>
            {fmtCOP(total)}
            <span style={{ fontSize: 13, color: 'var(--text-3)', marginLeft: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>COP</span>
          </div>
        </div>
      </div>

      <div className="fade-up" style={{ marginTop: 24, animationDelay: '0.08s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 12px' }}>
          <div className="eyebrow">Mis cuentas</div>
        </div>
        {accounts.length === 0 ? (
          <div style={{ padding: '20px 24px', color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>Sin cuentas disponibles</div>
        ) : (
          <div style={{ display: 'flex', gap: 12, padding: '0 24px 8px', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
            {accounts.map((a, i) => (
              <div key={a.idCuenta || i} style={{ scrollSnapAlign: 'start' }}>
                <NexusCard account={accountWithMeta(a, i)} variant={FINISHES[i % FINISHES.length]} tilt onClick={() => onAccount(accountWithMeta(a, i))}/>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 14 }}>
          {accounts.map((_, i) => (
            <div key={i} style={{ width: i === selIdx ? 16 : 4, height: 4, borderRadius: 2, background: i === selIdx ? 'var(--electric)' : 'var(--stroke-3)', transition: 'all 0.3s ease' }}/>
          ))}
        </div>
      </div>

      <div className="fade-up" style={{ padding: '24px 24px 0', animationDelay: '0.12s' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { id: 'transfer', icon: 'send', label: 'Transferir' },
            { id: 'deposit', icon: 'arrow-down-left', label: 'Depositar' },
            { id: 'withdraw', icon: 'arrow-up-right', label: 'Retirar' },
            { id: 'history', icon: 'list', label: 'Movimientos' },
          ].map(a => (
            <button key={a.id} onClick={() => onAction(a.id)} className="press" style={{ background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 16, padding: '14px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--text-1)', cursor: 'pointer' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(77,141,255,0.1)', color: 'var(--electric)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={a.icon} size={18}/>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {recentTxns.length > 0 && (
        <div className="fade-up" style={{ padding: '28px 24px 0', animationDelay: '0.16s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="eyebrow">Actividad reciente</div>
            <button onClick={() => onAction('history')} style={{ background: 'transparent', border: 'none', color: 'var(--electric)', fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', cursor: 'pointer', textTransform: 'uppercase' }}>Ver todo</button>
          </div>
          <div className="nx-card" style={{ overflow: 'hidden' }}>
            {recentTxns.slice(0, 4).map((t, i) => (
              <div key={t.idTransaccion || i}>
                <TxRow t={t}/>
                {i < Math.min(recentTxns.length, 4) - 1 && <div style={{ height: 1, background: 'var(--stroke-1)', marginLeft: 60 }}/>}
              </div>
            ))}
          </div>
        </div>
      )}
    </Screen>
  );
};

// Dashboard B — Terminal style
export const DashboardB = ({ accounts = [], recentTxns = [], onAccount, onAction, username }) => {
  const [selIdx, setSelIdx] = useState(0);
  const acct = accounts[selIdx] ? accountWithMeta(accounts[selIdx], selIdx) : null;
  const total = accounts.reduce((s, a) => s + Number(a.saldo || 0), 0);
  const name = username ? username.charAt(0).toUpperCase() + username.slice(1) : 'Cliente';

  return (
    <Screen padTop={56} padBottom={120}>
      <div className="fade-up" style={{ padding: '8px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <NxWordmark />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-3)' }}>
          <span>{new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase()}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="nx-dot"/>LIVE</span>
        </div>
      </div>

      {acct ? (
        <div className="fade-up" style={{ padding: '24px 20px 16px', animationDelay: '0.04s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div className="eyebrow">{acct.label} · {maskAcct(acct.numeroCuenta || acct.number)}</div>
            <span className={`nx-tag nx-tag-${acct.estado === 'ACTIVA' ? 'active' : acct.estado === 'BLOQUEADA' ? 'blocked' : 'inactive'}`}>{acct.estado}</span>
          </div>
          <div className="tnum" style={{ fontSize: 44, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 8 }}>{fmtCOP(acct.saldo)}</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em' }}>
            <span style={{ color: 'var(--text-3)' }}>COP</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 18 }}>
            {accounts.map((a, i) => (
              <button key={a.idCuenta || i} onClick={() => setSelIdx(i)} className="press" style={{ flex: 1, padding: '10px 8px', borderRadius: 10, background: i === selIdx ? 'var(--bg-3)' : 'var(--bg-2)', border: `1px solid ${i === selIdx ? 'var(--stroke-3)' : 'var(--stroke-1)'}`, color: 'var(--text-1)', cursor: 'pointer', textAlign: 'left' }}>
                <div className="mono" style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em' }}>{a.tipo}</div>
                <div className="tnum" style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{fmtCOP(Number(a.saldo) / 1000, { decimals: 0 })}<span style={{ fontSize: 10, color: 'var(--text-3)' }}>K</span></div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '24px 20px', color: 'var(--text-3)', fontSize: 13 }}>Sin cuentas</div>
      )}

      {acct && (
        <div className="fade-up" style={{ padding: '8px 20px 0', display: 'flex', justifyContent: 'center', animationDelay: '0.08s' }}>
          <NexusCard account={acct} variant={acct.finish} size="lg" tilt onClick={() => onAccount(acct)}/>
        </div>
      )}

      <div className="fade-up" style={{ padding: '20px 20px 0', animationDelay: '0.12s' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { id: 'transfer', icon: 'send', label: 'Transferir', sub: 'Entre cuentas o a terceros' },
            { id: 'deposit', icon: 'arrow-down-left', label: 'Depositar', sub: 'Agregar fondos' },
            { id: 'withdraw', icon: 'arrow-up-right', label: 'Retirar', sub: 'Cajero o ventanilla' },
            { id: 'history', icon: 'list', label: 'Movimientos', sub: 'Historial completo' },
          ].map(a => (
            <button key={a.id} onClick={() => onAction(a.id)} className="press" style={{ background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, color: 'var(--text-1)', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(77,141,255,0.1)', color: 'var(--electric)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={a.icon} size={18}/>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{a.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {recentTxns.length > 0 && (
        <div className="fade-up" style={{ padding: '24px 20px 0', animationDelay: '0.16s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div className="eyebrow">Últimos movimientos</div>
          </div>
          <div className="nx-card" style={{ overflow: 'hidden' }}>
            {recentTxns.slice(0, 5).map((t, i) => (
              <div key={t.idTransaccion || i}>
                <TxRow t={t} dense/>
                {i < Math.min(recentTxns.length, 5) - 1 && <div style={{ height: 1, background: 'var(--stroke-1)', marginLeft: 60 }}/>}
              </div>
            ))}
          </div>
        </div>
      )}
    </Screen>
  );
};
