import { useState } from 'react';
import { Icon, Screen, SubHeader, maskAcct, Spinner } from '../components/primitives';
import * as api from '../api';

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const ExtractosScreen = ({ accounts = [], defaultAccount, onBack }) => {
  const now = new Date();
  const options = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}` });
  }

  const defaultIdx = defaultAccount ? accounts.findIndex(a => a.idCuenta === defaultAccount.idCuenta) : 0;
  const [acctIdx, setAcctIdx] = useState(Math.max(0, defaultIdx));
  const [optIdx, setOptIdx] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const acct = accounts[acctIdx];
  const selected = options[optIdx];
  const isCurrent = optIdx === 0;

  const handleDownload = async () => {
    if (!acct || isCurrent || loading) return;
    setLoading(true); setError(''); setDone(false);
    try {
      const res = await api.descargarExtracto(acct.idCuenta, selected.year, selected.month);
      if (!res.ok) {
        const text = await res.text();
        let msg = 'No se pudo generar el extracto';
        try { msg = JSON.parse(text).mensaje || msg; } catch { /* keep default */ }
        throw new Error(msg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracto_${acct.numeroCuenta}_${selected.year}_${String(selected.month).padStart(2, '0')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen padTop={54} padBottom={40}>
      <SubHeader onBack={onBack} eyebrow="Cuenta" title="Documentos y Extractos"/>

      {accounts.length > 1 && (
        <div style={{ padding: '0 20px 12px' }}>
          <select
            className="nx-input"
            value={acctIdx}
            onChange={e => setAcctIdx(Number(e.target.value))}
            style={{ appearance: 'none', background: 'var(--bg-2)', color: 'var(--text-1)' }}
          >
            {accounts.map((a, i) => (
              <option key={a.idCuenta || i} value={i} style={{ background: 'var(--bg-2)', color: 'var(--text-1)' }}>
                {a.label || a.tipo} — {maskAcct(a.numeroCuenta || '')}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="fade-up" style={{ padding: '0 20px 16px' }}>
        <div className="nx-card" style={{ padding: '16px' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Período</div>
          <select
            className="nx-input"
            value={optIdx}
            onChange={e => { setOptIdx(Number(e.target.value)); setError(''); setDone(false); }}
            style={{ appearance: 'none', background: 'var(--bg-3)', color: 'var(--text-1)' }}
          >
            {options.map((o, i) => (
              <option key={`${o.year}-${o.month}`} value={i} style={{ background: 'var(--bg-2)', color: 'var(--text-1)' }}>
                {o.label}{i === 0 ? ' (período actual)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="fade-up" style={{ padding: '0 20px', animationDelay: '0.05s' }}>
        {isCurrent ? (
          <div className="nx-card" style={{ padding: '20px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(77,141,255,0.1)', color: 'var(--electric)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="info" size={18}/>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Período en curso</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
                El extracto oficial estará disponible al finalizar el período actual.
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleDownload}
            disabled={loading || !acct}
            className="press"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 14,
              background: done ? 'rgba(80,200,120,0.15)' : loading ? 'rgba(77,141,255,0.6)' : 'var(--electric)',
              border: done ? '1px solid var(--success)' : 'none',
              color: done ? 'var(--success)' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              transition: 'background 0.25s',
            }}
          >
            {loading ? (
              <><Spinner/> Generando extracto…</>
            ) : done ? (
              <><Icon name="check" size={16}/> Descarga iniciada</>
            ) : (
              <>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
                Descargar · {selected.label}
              </>
            )}
          </button>
        )}

        {error && (
          <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', color: 'var(--danger)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            {error}
          </div>
        )}
      </div>

      <div className="fade-up" style={{ padding: '24px 20px 0', animationDelay: '0.1s' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Sobre el extracto</div>
        <div className="nx-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['Formato', 'PDF / Adobe Acrobat'],
            ['Protección', 'Solo lectura · RC4-128'],
            ['Incluye', 'Saldo inicial · Movimientos · Saldo final'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="eyebrow" style={{ fontSize: 9 }}>{k}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-2)', textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
};

export default ExtractosScreen;
