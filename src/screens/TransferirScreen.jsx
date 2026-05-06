import { useState } from 'react';
import { Icon, fmtCOP, maskAcct, Screen, SubHeader } from '../components/primitives';

const BANCOS = [
  'Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA Colombia',
  'Banco Popular', 'Nequi', 'Daviplata', 'Banco Agrario', 'AV Villas',
  'Colpatria', 'Banco de Occidente', 'Caja Social', 'Lulo Bank',
  'Nu Colombia', 'Banco Caja Social', 'Itaú', 'Scotiabank Colpatria',
];

const TIPOS_DOC = ['CC', 'CE', 'NIT', 'Pasaporte', 'TI'];

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

const BancoToggle = ({ value, onChange }) => (
  <div style={{ padding: '0 20px 4px' }}>
    <div style={{ display: 'flex', background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 12, padding: 3, gap: 3 }}>
      {[
        { id: 'nexus', label: 'Banco Nexus' },
        { id: 'otro',  label: 'Otro banco'  },
      ].map(({ id, label }) => (
        <button key={id} onClick={() => onChange(id)} className="press" style={{
          flex: 1, height: 34, borderRadius: 9, border: 'none', cursor: 'pointer',
          background: value === id ? 'var(--accent)' : 'transparent',
          color: value === id ? '#fff' : 'var(--text-3)',
          fontSize: 12, fontWeight: value === id ? 600 : 400,
          fontFamily: 'var(--font-sans)', transition: 'background 0.15s, color 0.15s',
        }}>
          {label}
        </button>
      ))}
    </div>
  </div>
);

const TipoToggle = ({ value, onChange }) => (
  <div style={{ display: 'flex', background: 'var(--bg-3)', border: '1px solid var(--stroke-1)', borderRadius: 10, padding: 3, gap: 3 }}>
    {['AHORROS', 'CORRIENTE'].map(t => (
      <button key={t} onClick={() => onChange(t)} className="press" style={{
        flex: 1, height: 30, borderRadius: 7, border: 'none', cursor: 'pointer',
        background: value === t ? 'var(--bg-1)' : 'transparent',
        color: value === t ? 'var(--text-1)' : 'var(--text-3)',
        fontSize: 11, fontWeight: value === t ? 600 : 400,
        fontFamily: 'var(--font-sans)', transition: 'background 0.12s, color 0.12s',
        boxShadow: value === t ? '0 1px 0 rgba(255,255,255,0.06)' : 'none',
      }}>
        {t}
      </button>
    ))}
  </div>
);

const TransferirScreen = ({ accounts = [], onBack, onConfirm }) => {
  const [bancoType, setBancoType] = useState('nexus');
  const [srcIdx, setSrcIdx]       = useState(0);
  const [destAcct, setDestAcct]   = useState('');
  const [amount, setAmount]       = useState('');
  const [note, setNote]           = useState('');

  // ACH fields
  const [destBanco, setDestBanco]     = useState('');
  const [destTipo, setDestTipo]       = useState('AHORROS');
  const [destNum, setDestNum]         = useState('');
  const [nomReceptor, setNomReceptor] = useState('');
  const [tipoDoc, setTipoDoc]         = useState('CC');
  const [numDoc, setNumDoc]           = useState('');
  const [achAmount, setAchAmount]     = useState('');

  const src = accounts[srcIdx] || null;
  const num = parseInt(amount || '0', 10);
  const srcBalance = Number(src?.saldo ?? src?.balance ?? 0);

  const nexusValid = bancoType === 'nexus' && num > 0 && num <= srcBalance && destAcct.length >= 6 && src != null;

  const achNum = Number(achAmount) || 0;
  const achValid = bancoType === 'otro'
    && destBanco.trim()
    && destNum.length >= 6
    && nomReceptor.trim()
    && numDoc.trim()
    && achNum > 0
    && achNum <= srcBalance
    && src != null;

  const onKey = (k) => {
    if (k === '⌫') setAmount(a => a.slice(0, -1));
    else if (k === '.') {}
    else setAmount(a => (a + k).replace(/^0+/, '') || '0');
  };

  const handleNexusConfirm = () => {
    onConfirm({ kind: 'transfer', src, destAcct, amount: num, note, bancoType });
  };

  const handleAchConfirm = () => {
    onConfirm({
      kind: 'ach',
      src,
      destBanco,
      destTipoCuenta: destTipo,
      destNumCuenta: destNum,
      nombreReceptor: nomReceptor,
      tipoDocReceptor: tipoDoc,
      numDocReceptor: numDoc,
      amount: achNum,
      note,
    });
  };

  return (
    <Screen padTop={54} padBottom={24} bg="var(--bg-1)">
      <SubHeader onBack={onBack} eyebrow="Transacción" title="Transferir"/>

      <div style={{ paddingTop: 8 }}>
        <BancoToggle value={bancoType} onChange={t => { setBancoType(t); setAmount(''); setAchAmount(''); }}/>
      </div>

      {bancoType === 'nexus' ? (
        <>
          <div style={{ textAlign: 'center', padding: '16px 20px 12px' }}>
            <div className="eyebrow">Monto</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 6, marginTop: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--text-3)', alignSelf: 'flex-start', marginTop: 14 }}>$</span>
              <span className="tnum" style={{ fontSize: 56, fontWeight: 400, letterSpacing: '-0.03em', color: num > srcBalance ? 'var(--danger)' : num === 0 ? 'var(--text-4)' : 'var(--text-1)', lineHeight: 1 }}>
                {num.toLocaleString('es-CO')}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', marginLeft: 4, alignSelf: 'flex-end', marginBottom: 8 }}>COP</span>
            </div>
            {src && (
              <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: num > srcBalance ? 'var(--danger)' : 'var(--text-3)', textTransform: 'uppercase' }}>
                {num > srcBalance ? 'Excede saldo disponible' : `Disponible ${fmtCOP(srcBalance)}`}
              </div>
            )}
          </div>

          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
              <label className="nx-label">Cuenta destino · Banco Nexus</label>
              <input className="nx-input mono" placeholder="Número de cuenta Nexus"
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
            <button
              className="nx-btn nx-btn-primary"
              style={{ width: '100%', opacity: nexusValid ? 1 : 0.5, pointerEvents: nexusValid ? 'auto' : 'none' }}
              onClick={handleNexusConfirm}>
              Continuar &nbsp;<Icon name="arrow-up-right" size={18}/>
            </button>
            <div style={{ textAlign: 'center', marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-4)', textTransform: 'uppercase' }}>
              Transferencia segura · Sin costo · Banco Nexus
            </div>
          </div>
        </>
      ) : (
        /* ── formulario ACH ── */
        <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* cuenta origen */}
          {accounts.length > 1 ? (
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
          ) : src && (
            <AccountChip account={src} label="Cuenta origen"/>
          )}

          {/* banco destino */}
          <div>
            <label className="nx-label">Banco destino</label>
            <select className="nx-input" value={destBanco} onChange={e => setDestBanco(e.target.value)}
              style={{ appearance: 'none', background: 'var(--bg-2)', color: destBanco ? 'var(--text-1)' : 'var(--text-3)' }}>
              <option value="">Seleccionar banco…</option>
              {BANCOS.map(b => <option key={b} value={b} style={{ background: 'var(--bg-2)', color: 'var(--text-1)' }}>{b}</option>)}
            </select>
          </div>

          {/* tipo cuenta destino */}
          <div>
            <label className="nx-label" style={{ marginBottom: 8, display: 'block' }}>Tipo de cuenta destino</label>
            <TipoToggle value={destTipo} onChange={setDestTipo}/>
          </div>

          {/* número cuenta destino */}
          <div>
            <label className="nx-label">Número de cuenta destino</label>
            <input className="nx-input mono" placeholder="Número de cuenta"
              value={destNum} onChange={e => setDestNum(e.target.value.replace(/\D/g, ''))}
              style={{ letterSpacing: '0.12em' }}/>
          </div>

          {/* nombre receptor */}
          <div>
            <label className="nx-label">Nombre del receptor</label>
            <input className="nx-input" placeholder="Nombre completo"
              value={nomReceptor} onChange={e => setNomReceptor(e.target.value)}/>
          </div>

          {/* tipo + número documento */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flexBasis: 100, flexShrink: 0 }}>
              <label className="nx-label">Tipo doc.</label>
              <select className="nx-input" value={tipoDoc} onChange={e => setTipoDoc(e.target.value)}
                style={{ appearance: 'none', background: 'var(--bg-2)', color: 'var(--text-1)', padding: '10px 12px' }}>
                {TIPOS_DOC.map(t => <option key={t} value={t} style={{ background: 'var(--bg-2)' }}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="nx-label">Número de documento</label>
              <input className="nx-input mono" placeholder="Documento"
                value={numDoc} onChange={e => setNumDoc(e.target.value.replace(/\D/g, ''))}/>
            </div>
          </div>

          {/* monto */}
          <div>
            <label className="nx-label">Monto · COP</label>
            <div style={{ position: 'relative' }}>
              <input
                className="nx-input mono tnum"
                type="tel"
                inputMode="numeric"
                placeholder="0"
                value={achAmount}
                onChange={e => setAchAmount(e.target.value.replace(/\D/g, ''))}
                style={{ fontSize: 26, fontWeight: 500, paddingRight: 56 }}
              />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', pointerEvents: 'none' }}>COP</span>
            </div>
            {src && achNum > 0 && (
              <div style={{ marginTop: 6, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: achNum > srcBalance ? 'var(--danger)' : 'var(--text-3)', textTransform: 'uppercase' }}>
                {achNum > srcBalance ? 'Excede saldo disponible' : `Disponible ${fmtCOP(srcBalance)}`}
              </div>
            )}
          </div>

          {/* concepto */}
          <div>
            <label className="nx-label">Concepto · opcional</label>
            <input className="nx-input" placeholder="Ej. Pago factura servicios" value={note} onChange={e => setNote(e.target.value)}/>
          </div>

          {/* info ACH */}
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(77,141,255,0.06)', border: '1px solid rgba(77,141,255,0.18)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--electric)', flexShrink: 0, marginTop: 1 }}><Icon name="info" size={14}/></div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
              Las transferencias ACH se procesan en 1–2 días hábiles. Recibirás una notificación cuando el banco destino confirme la operación.
            </div>
          </div>

          <button
            className="nx-btn nx-btn-primary"
            style={{ width: '100%', opacity: achValid ? 1 : 0.5, pointerEvents: achValid ? 'auto' : 'none' }}
            onClick={handleAchConfirm}>
            Enviar transferencia ACH &nbsp;<Icon name="send" size={16}/>
          </button>

          <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-4)', textTransform: 'uppercase', paddingBottom: 8 }}>
            Red ACH Colombia · Cifrado TLS 1.3
          </div>
        </div>
      )}
    </Screen>
  );
};

export default TransferirScreen;
