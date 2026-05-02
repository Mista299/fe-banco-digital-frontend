import { useState } from 'react';
import { Icon, fmtCOP, maskAcct, Screen, SubHeader } from '../components/primitives';

const Numpad = ({ onKey }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, padding: '0 20px' }}>
    {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k => (
      <button key={k} onClick={() => onKey(k)} className="press" style={{ height: 56, borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', color: 'var(--text-1)', fontSize: 22, fontWeight: 400, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
        {k}
      </button>
    ))}
  </div>
);

const AccountChip = ({ account, label = 'Desde' }) => {
  if (!account) return null;
  const acctNum = account.numeroCuenta || account.number || '';
  return (
    <div style={{ width: '100%', textAlign: 'left', background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-1)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #2A3147 0%, #0B0E16 100%)', border: '1px solid var(--stroke-2)', flexShrink: 0 }}/>
      <div style={{ flex: 1 }}>
        <div className="eyebrow" style={{ fontSize: 9 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>
          {account.label || account.tipo} · <span className="mono">{maskAcct(acctNum)}</span>
        </div>
        <div className="tnum" style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
          {fmtCOP(account.saldo ?? account.balance ?? 0)} disponible
        </div>
      </div>
    </div>
  );
};

const TransferirScreen = ({ accounts = [], onBack, onConfirm }) => {
  const [srcIdx, setSrcIdx] = useState(0);
  const [destAcct, setDestAcct] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const src = accounts[srcIdx] || null;
  const num = parseInt(amount || '0', 10);
  const srcBalance = Number(src?.saldo ?? src?.balance ?? 0);
  const valid = num > 0 && num <= srcBalance && destAcct.length >= 6 && src != null;

  const onKey = (k) => {
    if (k === '⌫') setAmount(a => a.slice(0, -1));
    else if (k === '.') {}
    else setAmount(a => (a + k).replace(/^0+/, '') || '0');
  };

  return (
    <Screen padTop={54} padBottom={20} bg="var(--bg-1)">
      <SubHeader onBack={onBack} eyebrow="Transacción" title="Transferir"/>

      <div style={{ textAlign: 'center', padding: '24px 20px 16px' }}>
        <div className="eyebrow">Monto</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 6, marginTop: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--text-3)', alignSelf: 'flex-start', marginTop: 14 }}>$</span>
          <span className="tnum" style={{ fontSize: 56, fontWeight: 400, letterSpacing: '-0.03em', color: num > srcBalance ? 'var(--danger)' : num === 0 ? 'var(--text-4)' : 'var(--text-1)', lineHeight: 1 }}>
            {num.toLocaleString('es-CO')}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', marginLeft: 4, alignSelf: 'flex-end', marginBottom: 8 }}>COP</span>
        </div>
        {src && <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: num > srcBalance ? 'var(--danger)' : 'var(--text-3)', textTransform: 'uppercase' }}>
          {num > srcBalance ? 'Excede saldo disponible' : `Disponible ${fmtCOP(srcBalance)}`}
        </div>}
      </div>

      <div style={{ padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {accounts.length > 1 && (
          <div>
            <label className="nx-label">Cuenta origen</label>
            <select className="nx-input" value={srcIdx} onChange={e => setSrcIdx(Number(e.target.value))} style={{ appearance: 'none', background: 'var(--bg-2)', color: 'var(--text-1)' }}>
              {accounts.map((a, i) => (
                <option key={a.idCuenta || i} value={i} style={{ background: 'var(--bg-2)', color: 'var(--text-1)' }}>
                  {a.label || a.tipo} — {maskAcct(a.numeroCuenta || '')} — {fmtCOP(a.saldo)}
                </option>
              ))}
            </select>
          </div>
        )}
        {accounts.length === 1 && src && <AccountChip account={src} label="Cuenta origen"/>}

        <div>
          <label className="nx-label">Cuenta destino</label>
          <input className="nx-input mono" placeholder="Número de cuenta destino"
            value={destAcct} onChange={e => setDestAcct(e.target.value.replace(/\D/g, ''))}
            style={{ letterSpacing: '0.12em' }}/>
        </div>
        <div>
          <label className="nx-label">Concepto · opcional</label>
          <input className="nx-input" placeholder="Ej. Pago arriendo mayo" value={note} onChange={e => setNote(e.target.value)}/>
        </div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <Numpad onKey={onKey}/>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <button className="nx-btn nx-btn-primary" style={{ width: '100%', opacity: valid ? 1 : 0.5, pointerEvents: valid ? 'auto' : 'none' }}
          onClick={() => onConfirm({ kind: 'transfer', src, destAcct, amount: num, note })}>
          Continuar &nbsp;<Icon name="arrow-up-right" size={18}/>
        </button>
        <div style={{ textAlign: 'center', marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-4)', textTransform: 'uppercase' }}>
          Transferencia segura · Sin costo
        </div>
      </div>
    </Screen>
  );
};

export default TransferirScreen;
