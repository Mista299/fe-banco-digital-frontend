import { useState, useEffect } from 'react';
import { Icon, fmtCOP, Screen, SubHeader } from '../components/primitives';
import NexusCard from '../components/Card';
import { TxExpandable } from './Dashboard';
import * as api from '../api';

const StatTile = ({ label, value, delta, up }) => (
  <div className="nx-card" style={{ padding: '12px 14px' }}>
    <div className="eyebrow" style={{ fontSize: 9 }}>{label}</div>
    <div className="tnum" style={{ fontSize: 17, fontWeight: 500, marginTop: 6, letterSpacing: '-0.01em' }}>{value}</div>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, marginTop: 4, color: up === true ? 'var(--success)' : up === false ? 'var(--danger)' : 'var(--text-3)', letterSpacing: '0.06em' }}>{delta}</div>
  </div>
);

const DetalleScreen = ({ account, onBack, onAction }) => {
  const [txns, setTxns] = useState([]);
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (account?.idCuenta) {
      api.getMovimientos(account.idCuenta).then(setTxns).catch(() => {});
    }
  }, [account?.idCuenta]);

  if (!account) return null;

  const acctNum = account.numeroCuenta || account.number || '';
  const label = account.label || account.tipo || 'Cuenta';
  const tipo = account.tipo || account.type || 'AHORROS';
  const variant = account.finish || 'obsidian';

  const copyNum = () => {
    navigator.clipboard.writeText(acctNum).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Screen padTop={54} padBottom={40}>
      <SubHeader onBack={onBack} eyebrow={tipo} title={label}/>

      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 16px', gap: 12 }}>
        <NexusCard account={account} variant={variant} size="lg" hidden={hidden}/>
        <button
          onClick={() => setHidden(h => !h)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 20, padding: '6px 14px', color: 'var(--text-2)', fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', cursor: 'pointer', textTransform: 'uppercase' }}
        >
          <Icon name={hidden ? 'eye' : 'eye-off'} size={13}/>
          {hidden ? 'Mostrar datos' : 'Ocultar datos'}
        </button>
      </div>

      <div className="fade-up" style={{ padding: '0 20px', animationDelay: '0.04s' }}>
        <div className="nx-card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="eyebrow">Número de cuenta</div>
            <div className="mono" style={{ fontSize: 16, marginTop: 4 }}>
              {String(acctNum).match(/.{1,4}/g)?.join(' · ') || acctNum}
            </div>
          </div>
          <button className="press" onClick={copyNum} style={{ background: 'var(--bg-3)', border: '1px solid var(--stroke-1)', borderRadius: 10, padding: '8px 12px', color: copied ? 'var(--success)' : 'var(--text-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <Icon name={copied ? 'check' : 'copy'} size={14}/> {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      <div className="fade-up" style={{ padding: '16px 20px 0', animationDelay: '0.08s' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <StatTile label="Saldo disponible" value={fmtCOP(account.saldoDisponible ?? account.saldo)} delta="COP"/>
          <StatTile label="Saldo reservado" value={fmtCOP(account.saldoReservado ?? 0)} delta="COP"/>
          <StatTile label="Movimientos" value={String(txns.length)} delta="historial"/>
        </div>
      </div>

      <div className="fade-up" style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, animationDelay: '0.1s' }}>
        {[
          { id: 'transfer', icon: 'send', label: 'Enviar' },
          { id: 'deposit', icon: 'plus', label: 'Depositar' },
          { id: 'withdraw', icon: 'minus', label: 'Retirar' },
          { id: 'security', icon: 'shield', label: 'Seguridad' },
        ].map(act => (
          <button key={act.id} onClick={() => onAction(act.id)} className="press" style={{ background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 14, padding: '12px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--text-1)', cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(77,141,255,0.1)', color: 'var(--electric)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={act.icon} size={16}/>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 500 }}>{act.label}</span>
          </button>
        ))}
      </div>

      <div className="fade-up" style={{ padding: '12px 20px 0', animationDelay: '0.12s' }}>
        <button
          onClick={() => onAction('extractos')}
          className="press"
          style={{ width: '100%', padding: '14px 16px', borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(77,141,255,0.08)', color: 'var(--electric)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="list" size={16}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>Documentos y Extractos</div>
            <div className="eyebrow" style={{ marginTop: 2 }}>Descarga tu estado de cuenta en PDF</div>
          </div>
          <Icon name="chevron-right" size={16} color="var(--text-3)"/>
        </button>
      </div>

      {txns.length > 0 && (
        <>
          <div className="fade-up" style={{ padding: '24px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animationDelay: '0.14s' }}>
            <div className="eyebrow">Movimientos · {label}</div>
            <button onClick={() => onAction('history')} style={{ background: 'transparent', border: 'none', color: 'var(--electric)', fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', cursor: 'pointer', textTransform: 'uppercase' }}>Ver todo</button>
          </div>
          <div className="fade-up" style={{ margin: '0 20px', display: 'flex', flexDirection: 'column', gap: 6, animationDelay: '0.16s' }}>
            {txns.slice(0, 5).map((t, i) => (
              <TxExpandable key={t.idTransaccion || `idx-${i}`} t={t} i={i} expandedId={expandedId} setExpandedId={setExpandedId}/>
            ))}
          </div>
        </>
      )}
    </Screen>
  );
};

export default DetalleScreen;
