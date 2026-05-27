import { useState } from 'react';
import { Icon, fmtCOP, maskAcct, NxLogo } from '../components/primitives';
import NexusCard from '../components/Card';
import { PatrimonioChart, Watchlist, StatCard, QuickActions, ActivityTable } from './DesktopChrome';

export const DesktopLogin = ({ onLogin, loading = false }) => {
  const [user, setU] = useState('');
  const [pwd, setP] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!user || !pwd) return;
    setErr('');
    try {
      await onLogin(user, pwd);
    } catch (e) {
      setErr(e.message || 'Credenciales inválidas');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-1)' }}>
      {/* Left — brand */}
      <div style={{ flex: 1.1, position: 'relative', overflow: 'hidden', background: 'radial-gradient(80% 60% at 30% 30%, rgba(20,38,89,0.6) 0%, var(--bg-0) 65%)', padding: 56, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '32px 32px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <NxLogo size={32}/>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>NEXUS<span style={{ color: 'var(--electric)' }}>·</span> Banca Digital</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', maxWidth: 580 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Acceso institucional · v1.0</div>
          <div style={{ fontSize: 56, fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Su capital,<br/><span style={{ fontWeight: 500 }}>bajo control</span> <span style={{ color: 'var(--electric)' }}>absoluto.</span>
          </div>
          <div style={{ marginTop: 28, color: 'var(--text-2)', fontSize: 15, lineHeight: 1.5, maxWidth: 480 }}>
            Plataforma de banca digital con cifrado de extremo a extremo, supervisada por la Superintendencia Financiera de Colombia.
          </div>
          <div style={{ marginTop: 56, display: 'flex', gap: 28, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-3)' }}>
            <div><span style={{ color: 'var(--success)' }}>●</span> SISTEMAS · ONLINE</div>
            <div>TLS 1.3</div>
            <div>AES-256</div>
          </div>
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.1em', position: 'relative' }}>© 2026 NEXUS BANK · VIGILADO SUPERFINANCIERA</div>
      </div>

      {/* Right — form */}
      <div style={{ flex: 0.9, padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg-1)', borderLeft: '1px solid var(--stroke-1)', maxWidth: 540 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Bienvenido de vuelta</div>
        <div style={{ fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 36 }}>Acceso a su <span style={{ fontWeight: 500 }}>cuenta</span></div>

        <label className="nx-label">Usuario</label>
        <input
          className="nx-input"
          placeholder="usuario o número de documento"
          value={user}
          onChange={e => setU(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ marginBottom: 16 }}
          autoComplete="username"
        />

        <label className="nx-label">Contraseña</label>
        <div style={{ position: 'relative', marginBottom: err ? 12 : 24 }}>
          <input
            className="nx-input"
            type={showPwd ? 'text' : 'password'}
            placeholder="••••••••••"
            value={pwd}
            onChange={e => setP(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete="current-password"
          />
          <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 6, display: 'flex' }}>
            <Icon name={showPwd ? 'eye-off' : 'eye'} size={16}/>
          </button>
        </div>

        {err && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,107,122,0.08)', border: '1px solid rgba(255,107,122,0.25)', color: 'var(--danger)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="alert" size={14}/>
            {err}
          </div>
        )}

        <button
          className="nx-btn nx-btn-primary"
          onClick={handleSubmit}
          disabled={loading || !user || !pwd}
          style={{ width: '100%', marginBottom: 12, opacity: loading || !user || !pwd ? 0.6 : 1 }}
        >
          {loading ? 'Ingresando…' : 'Ingresar a Nexus'}
          {!loading && <Icon name="arrow-up-right" size={16}/>}
        </button>

        <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="shield" size={18} color="var(--electric)"/>
          <div style={{ fontSize: 12, color: 'var(--text-2)', flex: 1 }}>Conexión cifrada extremo a extremo · Sesión segura.</div>
        </div>
      </div>
    </div>
  );
};

export const DesktopDashboard = ({ accounts = [], txns = [], onAccount, onAction }) => {
  const [range, setRange] = useState('1M');
  const total = accounts.reduce((s, a) => s + (a.saldo ?? a.balance ?? 0), 0);
  const prev = total * 0.946;
  const ingresos = txns.filter(t => t.kind === 'in').reduce((s, t) => s + t.amount, 0);
  const egresos  = txns.filter(t => t.kind === 'out').reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        <PatrimonioChart value={total} prev={prev} range={range} onRange={setRange}/>
        <Watchlist accounts={accounts} onAccount={onAccount}/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard label="Ingresos · recientes" value={`+${fmtCOP(ingresos)}`} sub={`${txns.filter(t=>t.kind==='in').length} entradas`} up sparkline="M0 22 L20 18 L40 20 L60 14 L80 16 L100 10 L120 12 L140 8 L160 10 L180 5 L200 7"/>
        <StatCard label="Egresos · recientes"  value={`−${fmtCOP(egresos)}`}  sub={`${txns.filter(t=>t.kind==='out').length} salidas`}  up={false} sparkline="M0 8 L20 12 L40 10 L60 16 L80 14 L100 18 L120 16 L140 22 L160 20 L180 24 L200 22"/>
        <StatCard label="Ahorro neto"          value={fmtCOP(total)} sub="patrimonio total" up sparkline="M0 26 L20 22 L40 24 L60 16 L80 18 L100 12 L120 14 L140 8 L160 10 L180 4 L200 6"/>
        <StatCard label="Cuentas activas"      value={String(accounts.filter(a => (a.estado || a.status) === 'ACTIVA').length)} sub={`de ${accounts.length} totales`}/>
      </div>
      <QuickActions onAction={onAction}/>
      <ActivityTable rows={txns.slice(0, 8)} onHistory={() => onAction('history')}/>
    </div>
  );
};

export const DesktopDetalle = ({ account, txns = [], onBack, onAction }) => {
  const [hidden, setHidden] = useState(false);
  if (!account) return null;
  const st = account.status || account.estado;
  const tagClass = st === 'ACTIVA' ? 'active' : st === 'BLOQUEADA' ? 'blocked' : 'inactive';

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} className="press" style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', color: 'var(--text-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevron-left" size={16}/>
        </button>
        <div className="eyebrow">Cuentas / {account.label}</div>
        <span className={`nx-tag nx-tag-${tagClass}`}>{st}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 20 }}>
        <div className="nx-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <NexusCard account={account} variant={account.finish} size="lg" hidden={hidden}/>
          <button
            onClick={() => setHidden(h => !h)}
            className="press"
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg-3)', border: '1px solid var(--stroke-1)', borderRadius: 20, padding: '7px 16px', color: 'var(--text-2)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', cursor: 'pointer', textTransform: 'uppercase', width: '100%', justifyContent: 'center' }}
          >
            <Icon name={hidden ? 'eye' : 'eye-off'} size={13}/>
            {hidden ? 'Mostrar datos' : 'Ocultar datos'}
          </button>
          <div style={{ width: '100%', padding: '14px 16px', background: 'var(--bg-3)', borderRadius: 12, border: '1px solid var(--stroke-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ fontSize: 9 }}>Número de cuenta</div>
              <div className="mono" style={{ fontSize: 14, marginTop: 4 }}>{account.numeroCuenta || account.number}</div>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(account.numeroCuenta || account.number)}
              className="press"
              style={{ background: 'var(--bg-2)', border: '1px solid var(--stroke-2)', color: 'var(--electric)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
            >
              <Icon name="copy" size={12}/> COPIAR
            </button>
          </div>
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => onAction('transfer')} className="nx-btn nx-btn-primary" style={{ height: 44, fontSize: 13 }}><Icon name="send" size={14}/> Enviar</button>
            <button onClick={() => onAction('security')} className="nx-btn nx-btn-ghost" style={{ height: 44, fontSize: 13 }}><Icon name="shield" size={14}/> Seguridad</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
            <div className="nx-card" style={{ padding: 24 }}>
              <div className="eyebrow">Saldo disponible</div>
              <div className="mono tnum" style={{ fontSize: 44, fontWeight: 500, marginTop: 12, letterSpacing: '-0.025em' }}>{fmtCOP(account.saldo ?? account.balance ?? 0)}</div>
              <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
                <div><span className="eyebrow" style={{ fontSize: 9 }}>Tipo</span><div className="mono" style={{ fontSize: 13, marginTop: 4, color: 'var(--text-2)' }}>{account.tipo || account.type}</div></div>
                <div><span className="eyebrow" style={{ fontSize: 9 }}>Estado</span><div className="mono" style={{ fontSize: 13, marginTop: 4, color: st === 'ACTIVA' ? 'var(--success)' : 'var(--danger)' }}>{st}</div></div>
              </div>
            </div>
            <StatCard label="Entradas" value={`+${fmtCOP(txns.filter(t=>t.kind==='in').reduce((s,t)=>s+t.amount,0))}`}  sub={`${txns.filter(t=>t.kind==='in').length} entradas`}  up/>
            <StatCard label="Salidas"  value={`−${fmtCOP(txns.filter(t=>t.kind==='out').reduce((s,t)=>s+t.amount,0))}`} sub={`${txns.filter(t=>t.kind==='out').length} salidas`} up={false}/>
          </div>
          <ActivityTable rows={txns.slice(0, 10)} dense/>
        </div>
      </div>
    </div>
  );
};

const BANCOS_DESKTOP = [
  'Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA Colombia',
  'Banco Popular', 'Nequi', 'Daviplata', 'Banco Agrario', 'AV Villas',
  'Colpatria', 'Banco de Occidente', 'Caja Social', 'Lulo Bank',
  'Nu Colombia', 'Itaú', 'Scotiabank Colpatria',
];
const TIPOS_DOC_D = ['CC', 'CE', 'NIT', 'Pasaporte', 'TI'];

export const DesktopTransfer = ({ accounts = [], onConfirm }) => {
  const [bancoType, setBancoType]   = useState('nexus');
  const [srcId, setSrcId]           = useState(() => accounts[0]?.idCuenta ?? accounts[0]?.id ?? null);
  const [amount, setAmount]         = useState('250000');
  const [dest, setDest]             = useState('');
  // ACH fields
  const [destBanco, setDestBanco]   = useState('');
  const [destTipo, setDestTipo]     = useState('AHORROS');
  const [destNum, setDestNum]       = useState('');
  const [nomRec, setNomRec]         = useState('');
  const [tipoDoc, setTipoDoc]       = useState('CC');
  const [numDoc, setNumDoc]         = useState('');

  const srcAcct  = accounts.find(a => (a.idCuenta || a.id) === srcId) || accounts[0];
  const amountNum = Number(amount) || 0;
  const balance   = srcAcct ? (srcAcct.saldo ?? srcAcct.balance ?? 0) : 0;

  const nexusValid = dest.length >= 6 && amountNum > 0 && amountNum <= balance && !!srcAcct;
  const achValid   = destBanco && destNum.length >= 6 && nomRec && numDoc
                      && amountNum > 0 && amountNum <= balance && !!srcAcct;
  const valid = bancoType === 'nexus' ? nexusValid : achValid;

  const handleConfirm = () => {
    if (!valid) return;
    if (bancoType === 'nexus') {
      onConfirm({ kind: 'transfer', amount: amountNum, destAcct: dest, srcId });
    } else {
      onConfirm({
        kind: 'ach', srcId,
        destBanco, destTipoCuenta: destTipo, destNumCuenta: destNum,
        nombreReceptor: nomRec, tipoDocReceptor: tipoDoc, numDocReceptor: numDoc,
        amount: amountNum,
      });
    }
  };

  const tabStyle = (active) => ({
    flex: 1, height: 34, borderRadius: 9, border: 'none', cursor: 'pointer',
    background: active ? 'var(--bg-1)' : 'transparent',
    color: active ? 'var(--text-1)' : 'var(--text-3)',
    fontSize: 12.5, fontWeight: active ? 600 : 400,
    fontFamily: 'var(--font-sans)', transition: 'background 0.15s, color 0.15s',
    boxShadow: active ? '0 1px 0 rgba(255,255,255,0.06)' : 'none',
  });

  return (
    <div style={{ padding: 28 }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>Operación / Transferir</div>
      <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 28 }}>Nueva transferencia</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 440px', gap: 24, maxWidth: 1320 }}>
        <div className="nx-card" style={{ padding: 28 }}>

          {/* banco type toggle */}
          <div style={{ marginBottom: 28 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Tipo de transferencia</div>
            <div style={{ display: 'flex', background: 'var(--bg-3)', border: '1px solid var(--stroke-1)', borderRadius: 12, padding: 4, gap: 4 }}>
              <button onClick={() => setBancoType('nexus')} style={tabStyle(bancoType === 'nexus')}>Banco Nexus · Interna</button>
              <button onClick={() => setBancoType('otro')} style={tabStyle(bancoType === 'otro')}>Otro banco · ACH</button>
            </div>
          </div>

          <div className="eyebrow" style={{ marginBottom: 8 }}>01 · Cuenta origen</div>
          {accounts.length === 0 && (
            <div style={{ padding: 24, color: 'var(--text-3)', fontSize: 13 }}>No hay cuentas disponibles</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24 }}>
            {accounts.map(a => {
              const aid = a.idCuenta || a.id;
              const sel = aid === srcId;
              return (
                <button key={aid} onClick={() => setSrcId(aid)} className="press" style={{
                  padding: 14, borderRadius: 12, textAlign: 'left',
                  background: sel ? 'rgba(77,141,255,0.10)' : 'var(--bg-3)',
                  border: `1px solid ${sel ? 'rgba(77,141,255,0.4)' : 'var(--stroke-1)'}`,
                  color: 'var(--text-1)', cursor: 'pointer',
                }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.label}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>{maskAcct(a.numeroCuenta || a.number)}</div>
                  <div className="mono tnum" style={{ fontSize: 14, marginTop: 8 }}>{fmtCOP(a.saldo ?? a.balance ?? 0)}</div>
                </button>
              );
            })}
          </div>

          {bancoType === 'nexus' ? (
            <>
              <div className="eyebrow" style={{ marginBottom: 8 }}>02 · Cuenta destino · Banco Nexus</div>
              <div style={{ marginBottom: 24 }}>
                <label className="nx-label">Número de cuenta destino</label>
                <input className="nx-input" value={dest} onChange={e => setDest(e.target.value)} placeholder="Número de cuenta Nexus"/>
              </div>
            </>
          ) : (
            <>
              <div className="eyebrow" style={{ marginBottom: 8 }}>02 · Datos del destinatario</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label className="nx-label">Banco destino</label>
                  <select className="nx-input" value={destBanco} onChange={e => setDestBanco(e.target.value)}
                    style={{ appearance: 'none', background: 'var(--bg-2)', color: destBanco ? 'var(--text-1)' : 'var(--text-3)' }}>
                    <option value="">Seleccionar banco…</option>
                    {BANCOS_DESKTOP.map(b => <option key={b} value={b} style={{ background: 'var(--bg-2)', color: 'var(--text-1)' }}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="nx-label">Tipo de cuenta</label>
                  <div style={{ display: 'flex', background: 'var(--bg-3)', border: '1px solid var(--stroke-1)', borderRadius: 10, padding: 3, gap: 3, height: 44 }}>
                    {['AHORROS', 'CORRIENTE'].map(t => (
                      <button key={t} onClick={() => setDestTipo(t)} style={{
                        flex: 1, borderRadius: 7, border: 'none', cursor: 'pointer',
                        background: destTipo === t ? 'var(--bg-1)' : 'transparent',
                        color: destTipo === t ? 'var(--text-1)' : 'var(--text-3)',
                        fontSize: 11, fontWeight: destTipo === t ? 600 : 400,
                        fontFamily: 'var(--font-sans)',
                      }}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="nx-label">Número de cuenta</label>
                  <input className="nx-input mono" value={destNum} onChange={e => setDestNum(e.target.value.replace(/\D/g,''))} placeholder="Número de cuenta"/>
                </div>
                <div>
                  <label className="nx-label">Nombre del receptor</label>
                  <input className="nx-input" value={nomRec} onChange={e => setNomRec(e.target.value)} placeholder="Nombre completo"/>
                </div>
                <div>
                  <label className="nx-label">Tipo de documento</label>
                  <select className="nx-input" value={tipoDoc} onChange={e => setTipoDoc(e.target.value)}
                    style={{ appearance: 'none', background: 'var(--bg-2)', color: 'var(--text-1)' }}>
                    {TIPOS_DOC_D.map(t => <option key={t} value={t} style={{ background: 'var(--bg-2)' }}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="nx-label">Número de documento</label>
                  <input className="nx-input mono" value={numDoc} onChange={e => setNumDoc(e.target.value.replace(/\D/g,''))} placeholder="Documento"/>
                </div>
              </div>
            </>
          )}

          <div className="eyebrow" style={{ marginBottom: 8 }}>{bancoType === 'nexus' ? '03' : '03'} · Monto</div>
          <div>
            <label className="nx-label">Monto · COP</label>
            <div style={{ position: 'relative' }}>
              <input
                className="nx-input mono tnum"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
                style={{ fontSize: 28, paddingRight: 80, fontWeight: 500 }}
              />
              <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em' }}>COP</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[100000, 500000, 1000000, 5000000].map(v => (
                <button key={v} onClick={() => setAmount(String(v))} style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--stroke-1)', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer' }}>
                  {fmtCOP(v)}
                </button>
              ))}
            </div>
            {amountNum > balance && balance > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="alert" size={13}/> Saldo insuficiente. Disponible: {fmtCOP(balance)}
              </div>
            )}
          </div>
        </div>

        <div className="nx-card" style={{ padding: 28, alignSelf: 'start', position: 'sticky', top: 20 }}>
          <div className="eyebrow">Resumen</div>
          <div className="mono tnum" style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 12 }}>{fmtCOP(amountNum)}</div>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(bancoType === 'nexus' ? [
              ['Desde',        srcAcct?.label || '—'],
              ['Cuenta origen',  maskAcct(srcAcct?.numeroCuenta || srcAcct?.number || '0000')],
              ['Hacia',        dest.length >= 4 ? maskAcct(dest) : '—'],
              ['Banco destino', 'Banco Nexus'],
              ['Comisión',     'Sin costo'],
              ['Tipo',         'Inmediata · Interna'],
            ] : [
              ['Desde',        srcAcct?.label || '—'],
              ['Banco destino', destBanco || '—'],
              ['Cuenta destino', destNum.length >= 4 ? maskAcct(destNum) : '—'],
              ['Tipo cuenta',  destTipo],
              ['Receptor',     nomRec || '—'],
              ['Plazo',        '1–2 días hábiles'],
            ]).map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{l}</span>
                <span style={{ color: 'var(--text-1)', fontFamily: 'inherit', textAlign: 'right', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="nx-divider" style={{ margin: '20px 0' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 500 }}>
            <span>Total a debitar</span>
            <span className="mono tnum">{fmtCOP(amountNum)}</span>
          </div>
          <button
            onClick={handleConfirm}
            className="nx-btn nx-btn-primary"
            disabled={!valid}
            style={{ width: '100%', marginTop: 24, opacity: valid ? 1 : 0.5 }}
          >
            {bancoType === 'nexus' ? 'Confirmar transferencia' : 'Enviar orden ACH'} <Icon name="arrow-up-right" size={16}/>
          </button>
          <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, background: bancoType === 'nexus' ? 'rgba(77,141,255,0.06)' : 'rgba(245,181,68,0.06)', border: `1px solid ${bancoType === 'nexus' ? 'rgba(77,141,255,0.2)' : 'rgba(245,181,68,0.2)'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="shield" size={14} color={bancoType === 'nexus' ? 'var(--electric)' : 'var(--warn)'}/>
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
              {bancoType === 'nexus' ? 'Transferencia segura · Banco Nexus · Sin costo.' : 'Red ACH Colombia · Se notifica al confirmarse · 1–2 días hábiles.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DesktopHistory = ({ txns = [] }) => {
  const [search, setSearch] = useState('');
  const filtered = txns.filter(t =>
    !search || t.label?.toLowerCase().includes(search.toLowerCase()) || t.date?.includes(search)
  );

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Historial / Movimientos</div>
          <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>Todos los movimientos</div>
        </div>
      </div>

      <div className="nx-card" style={{ padding: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1, height: 36, borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--stroke-1)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10 }}>
          <Icon name="search" size={14} color="var(--text-3)"/>
          <input
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: 13, fontFamily: 'var(--font-sans)' }}
            placeholder="Buscar por concepto, fecha…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ActivityTable rows={filtered} dense withHeader={false}/>
    </div>
  );
};

export const DesktopProfile = ({ username = '', accounts = [], onLogout }) => {
  const initials = username.split(/[\s.@]/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'US';

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="eyebrow">Cuenta / Perfil</div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        <div className="nx-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 100, height: 100, borderRadius: 50, background: 'linear-gradient(135deg, #2E6BFF, #142659)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 500, border: '1px solid var(--stroke-2)' }}>{initials}</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 500 }}>{username}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.08em' }}>CLIENTE · NEXUS</div>
          </div>
          <div style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--stroke-1)', textAlign: 'center' }}>
            <div className="eyebrow" style={{ fontSize: 9 }}>Cuentas activas</div>
            <div style={{ fontSize: 14, marginTop: 4, color: 'var(--electric)' }}>{accounts.filter(a => (a.estado || a.status) === 'ACTIVA').length} de {accounts.length}</div>
          </div>
          <button onClick={onLogout} className="nx-btn nx-btn-danger" style={{ width: '100%' }}>
            <Icon name="logout" size={14}/> Cerrar sesión
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="nx-card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Resumen de cuentas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {accounts.map((a, i) => {
                const st = a.estado || a.status;
                const tagClass = st === 'ACTIVA' ? 'active' : st === 'BLOQUEADA' ? 'blocked' : 'inactive';
                return (
                  <div key={a.idCuenta || a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < accounts.length - 1 ? '1px solid var(--stroke-1)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{a.label}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{a.tipo || a.type} · {a.numeroCuenta || a.number}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="mono tnum" style={{ fontSize: 14, fontWeight: 500 }}>{fmtCOP(a.saldo ?? a.balance ?? 0)}</span>
                      <span className={`nx-tag nx-tag-${tagClass}`}>{st}</span>
                    </div>
                  </div>
                );
              })}
              {accounts.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 13, padding: '8px 0' }}>Sin cuentas cargadas</div>}
            </div>
          </div>
          <div className="nx-card" style={{ padding: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Patrimonio total</div>
            <div className="mono tnum" style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em' }}>
              {fmtCOP(accounts.reduce((s, a) => s + (a.saldo ?? a.balance ?? 0), 0))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>COP · suma de todas las cuentas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DesktopSecurity = ({ accounts = [], onToast, onToggleLock }) => {
  const [locking, setLocking] = useState(null);
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);

  const openForm = (acct) => {
    const id = acct.idCuenta || acct.id;
    if (locking === id) { setLocking(null); setPwd(''); return; }
    setLocking(id); setPwd('');
  };

  const confirm = async (acct) => {
    if (!pwd || busy) return;
    setBusy(true);
    try {
      await onToggleLock(acct, pwd);
      setLocking(null); setPwd('');
    } catch (e) {
      onToast(e.message || 'Contraseña incorrecta', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="eyebrow">Seguridad / Centro de control</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="nx-card" style={{ padding: 28, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(77,141,255,0.10), rgba(77,141,255,0.02))', border: '1px solid rgba(77,141,255,0.25)' }}>
          <svg style={{ position: 'absolute', right: -60, top: -60, opacity: 0.2 }} width="300" height="300" viewBox="0 0 300 300" fill="none">
            {[40, 70, 100, 140, 180].map(r => <circle key={r} cx="150" cy="150" r={r} stroke="#4D8DFF" strokeWidth="0.6"/>)}
          </svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(77,141,255,0.18)', color: 'var(--electric)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="shield" size={22}/>
            </div>
            <div>
              <div className="eyebrow" style={{ color: 'var(--electric)' }}>Centro de seguridad</div>
              <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4, letterSpacing: '-0.01em' }}>Sus cuentas están protegidas</div>
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, position: 'relative' }}>
            {[
              ['Contraseña', 'ACTIVA', 'success'],
              ['Sesión', 'SEGURA', 'success'],
              ['Cifrado', 'TLS 1.3', 'success'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--stroke-1)' }}>
                <div className="eyebrow" style={{ fontSize: 9 }}>{l}</div>
                <div className="mono" style={{ fontSize: 11, marginTop: 6, color: `var(--${c})`, letterSpacing: '0.1em' }}>● {v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="nx-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--stroke-1)' }}>
            <div className="eyebrow">Estado por cuenta</div>
          </div>
          {accounts.length === 0 && (
            <div style={{ padding: 24, color: 'var(--text-3)', fontSize: 13, textAlign: 'center' }}>Sin cuentas disponibles</div>
          )}
          {accounts.map((a, i) => {
            const st = a.estado || a.status;
            const tagClass = st === 'ACTIVA' ? 'active' : st === 'BLOQUEADA' ? 'blocked' : 'inactive';
            const aid = a.idCuenta || a.id;
            const isOpen = locking === aid;
            const canToggle = st === 'ACTIVA' || st === 'BLOQUEADA';
            return (
              <div key={aid} style={{ borderBottom: i < accounts.length - 1 ? '1px solid var(--stroke-1)' : 'none' }}>
                <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.label}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 2 }}>{maskAcct(a.numeroCuenta || a.number)}</div>
                  </div>
                  <span className={`nx-tag nx-tag-${tagClass}`}>{st}</span>
                  {canToggle && (
                    <button
                      onClick={() => openForm(a)}
                      className="press"
                      style={{ padding: '7px 12px', borderRadius: 8, background: isOpen ? 'rgba(255,107,122,0.10)' : 'var(--bg-3)', border: `1px solid ${isOpen ? 'rgba(255,107,122,0.3)' : 'var(--stroke-1)'}`, color: isOpen ? 'var(--danger)' : 'var(--text-2)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Icon name={st === 'ACTIVA' ? 'lock' : 'unlock'} size={12}/> {st === 'ACTIVA' ? 'Bloquear' : 'Desbloquear'}
                    </button>
                  )}
                </div>
                {isOpen && (
                  <div style={{ padding: '0 18px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="password"
                      className="nx-input"
                      placeholder="Contraseña para confirmar"
                      value={pwd}
                      onChange={e => setPwd(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && confirm(a)}
                      autoFocus
                      style={{ flex: 1, height: 36, fontSize: 13 }}
                    />
                    <button
                      onClick={() => confirm(a)}
                      disabled={!pwd || busy}
                      className="nx-btn nx-btn-primary"
                      style={{ height: 36, padding: '0 16px', fontSize: 12, opacity: !pwd || busy ? 0.5 : 1 }}
                    >
                      {busy ? '…' : 'Confirmar'}
                    </button>
                    <button
                      onClick={() => { setLocking(null); setPwd(''); }}
                      className="nx-btn nx-btn-ghost"
                      style={{ height: 36, padding: '0 12px', fontSize: 12 }}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const DesktopSuccess = ({ data, onDone }) => {
  const isAch = data?.kind === 'ach';
  const ringColor = isAch ? 'rgba(245,181,68,0.3)' : 'rgba(91,216,160,0.3)';
  const iconBg    = isAch ? 'rgba(245,181,68,0.12)' : 'rgba(91,216,160,0.12)';
  const iconBorder = isAch ? '1.5px solid var(--warn)' : '1.5px solid var(--success)';
  const iconColor  = isAch ? 'var(--warn)' : 'var(--success)';
  const rows = isAch ? [
    ['Receptor',  data?.nombreReceptor || '—'],
    ['Banco',     data?.destBanco || '—'],
    ['Monto',     fmtCOP(data?.amount || 0)],
    ['Estado',    'PENDIENTE ACH'],
  ] : [
    ['Destino',   maskAcct(data?.destAcct || '0000')],
    ['Monto',     fmtCOP(data?.amount || 0)],
    ['Banco',     'Nexus Bank'],
    ['Estado',    'EXITOSA'],
  ];

  return (
    <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 32 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: 60, border: `1px solid ${ringColor}`, transform: `scale(${1 + i * 0.3})`, opacity: 1 - i * 0.3 }}/>
        ))}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 60, background: iconBg, border: iconBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>
          <Icon name={isAch ? 'alert' : 'check'} size={48} stroke={2}/>
        </div>
      </div>
      <div className="eyebrow">{isAch ? 'Enviada' : 'Confirmado'}</div>
      <div style={{ fontSize: 32, fontWeight: 500, marginTop: 12, letterSpacing: '-0.02em' }}>
        {isAch ? 'Orden ACH enviada' : 'Transferencia exitosa'}
      </div>
      <div className="mono tnum" style={{ fontSize: 24, marginTop: 14, color: 'var(--text-2)' }}>{fmtCOP(data?.amount || 0)}</div>
      {isAch && (
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-3)', textAlign: 'center', maxWidth: 360 }}>
          Recibirás una notificación en la campanita cuando el banco confirme la operación.
        </div>
      )}
      <div className="nx-card" style={{ padding: 20, marginTop: 28, width: 420 }}>
        {rows.map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, borderBottom: '1px solid var(--stroke-1)' }}>
            <span style={{ color: 'var(--text-3)' }}>{l}</span>
            <span className="mono" style={{ color: l === 'Estado' ? (isAch ? 'var(--warn)' : 'var(--success)') : 'var(--text-1)' }}>{v}</span>
          </div>
        ))}
      </div>
      <button onClick={onDone} className="nx-btn nx-btn-primary" style={{ marginTop: 24, width: 280 }}>Volver al inicio</button>
    </div>
  );
};
