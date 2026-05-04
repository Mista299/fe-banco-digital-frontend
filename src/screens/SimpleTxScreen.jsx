import { useState, useRef, useEffect, useMemo } from 'react';
import { fmtCOP, maskAcct, Screen, SubHeader, Spinner } from '../components/primitives';
import * as api from '../api';

const Numpad = ({ onKey }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, padding: '0 20px' }}>
    {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k => (
      <button key={k} onClick={() => onKey(k)} className="press" style={{ height: 52, borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', color: 'var(--text-1)', fontSize: 22, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
        {k}
      </button>
    ))}
  </div>
);

const fmtCountdown = (s) => {
  const m = Math.floor(s / 60);
  const seg = s % 60;
  return `${String(m).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
};

/* ─── Deposit ───────────────────────────────────────────────── */

const DepositScreen = ({ accounts, onBack, onGatewayDone }) => {
  const [srcIdx, setSrcIdx]       = useState(0);
  const [amount, setAmount]       = useState('');
  const [phase, setPhase]         = useState('enter'); // 'enter' | 'waiting' | 'expired'
  const [starting, setStarting]   = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [referencia, setReferencia] = useState('');

  const pollingRef   = useRef(null);
  const countdownRef = useRef(null);

  const src   = accounts[srcIdx] || null;
  const num   = parseInt(amount || '0', 10);
  const valid = num > 0 && src != null;

  const onKey = (k) => {
    if (k === '⌫') setAmount(a => a.slice(0, -1));
    else if (k === '.') {}
    else setAmount(a => (a + k).replace(/^0+/, '') || '0');
  };

  const limpiarIntervalos = () => {
    if (pollingRef.current)   clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const generarCodigo = async () => {
    if (!valid) return;
    setStarting(true);

    const ref = String(Math.floor(100000 + Math.random() * 900000));
    try {
      const resp = await api.registrarDepositoPendiente(src.numeroCuenta, num, ref);
      setReferencia(resp.referenciaGateway);
      setCountdown(Number(resp.segundosRestantes));
      setPhase('waiting');

      // countdown visual
      countdownRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(countdownRef.current); return 0; }
          return c - 1;
        });
      }, 1000);

      // polling de estado
      const capturedRef = resp.referenciaGateway;
      const capturedNum = num;
      pollingRef.current = setInterval(async () => {
        try {
          const estado = await api.consultarDepositoPendiente(capturedRef);
          if (estado.estado === 'COMPLETADO') {
            limpiarIntervalos();
            onGatewayDone({ kind: 'deposit', amount: capturedNum, result: { fecha: estado.fechaExpiracion, saldoResultante: null } });
          } else if (estado.estado === 'EXPIRADO') {
            limpiarIntervalos();
            setPhase('expired');
          }
        } catch {}
      }, 1500);

    } catch (e) {
      // referencia duplicada u otro error de registro
    } finally {
      setStarting(false);
    }
  };

  const cancelar = () => {
    limpiarIntervalos();
    setPhase('enter');
    setAmount('');
    setCountdown(0);
  };

  useEffect(() => () => limpiarIntervalos(), []);

  // color del countdown según tiempo restante
  const countdownColor = countdown > 300 ? 'var(--success)' : countdown > 60 ? '#F5A623' : 'var(--danger)';

  /* ── Fase: expirado ── */
  if (phase === 'expired') {
    return (
      <Screen padTop={54} padBottom={20}>
        <SubHeader onBack={onBack} eyebrow="Ingresar fondos" title="Depositar"/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(255,107,122,0.1)', border: '1px solid rgba(255,107,122,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>⏱</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 500 }}>Código expirado</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>El código venció sin recibir pago. Genera uno nuevo.</div>
          </div>
          <button className="nx-btn nx-btn-primary" style={{ width: '100%' }} onClick={cancelar}>
            Generar nuevo código
          </button>
        </div>
      </Screen>
    );
  }

  /* ── Fase: esperando confirmación ── */
  if (phase === 'waiting') {
    return (
      <Screen padTop={54} padBottom={20}>
        <SubHeader onBack={cancelar} eyebrow="Ingresar fondos" title="Depositar"/>

        <div className="fade-up" style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

          {/* Código + countdown */}
          <div style={{ width: '100%', padding: '20px', borderRadius: 20, background: 'linear-gradient(160deg, rgba(77,141,255,0.1), rgba(77,141,255,0.03))', border: '1px solid rgba(77,141,255,0.3)', textAlign: 'center' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Código de pago</div>
            <div className="mono" style={{ fontSize: 44, letterSpacing: '0.22em', color: 'var(--electric)', fontWeight: 400 }}>
              {referencia}
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="eyebrow" style={{ fontSize: 9 }}>Monto exacto</div>
                <div className="mono" style={{ fontSize: 15, marginTop: 3 }}>{fmtCOP(num)}</div>
              </div>
              <div style={{ width: 1, background: 'var(--stroke-2)' }}/>
              <div style={{ textAlign: 'center' }}>
                <div className="eyebrow" style={{ fontSize: 9 }}>Cuenta</div>
                <div className="mono" style={{ fontSize: 15, marginTop: 3 }}>{maskAcct(src?.numeroCuenta || '')}</div>
              </div>
              <div style={{ width: 1, background: 'var(--stroke-2)' }}/>
              <div style={{ textAlign: 'center' }}>
                <div className="eyebrow" style={{ fontSize: 9 }}>Expira en</div>
                <div className="mono" style={{ fontSize: 15, marginTop: 3, color: countdownColor, fontWeight: 500 }}>
                  {fmtCountdown(countdown)}
                </div>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div style={{ width: '100%', padding: '12px 14px', borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Dirígete a un <strong style={{ color: 'var(--text-1)' }}>punto físico aliado</strong>, presenta este código y paga el monto exacto. El sistema acreditará el saldo automáticamente.
            </div>
          </div>

          {/* Indicador de espera */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--electric)', animation: 'nx-pulse 1.4s ease-in-out infinite' }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-3)', textTransform: 'uppercase' }}>
              Esperando confirmación
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }}/>
        <div style={{ padding: '20px 20px 0' }}>
          <button className="nx-btn nx-btn-ghost" style={{ width: '100%' }} onClick={cancelar}>
            Cancelar
          </button>
        </div>
      </Screen>
    );
  }

  /* ── Fase: ingresar monto ── */
  return (
    <Screen padTop={54} padBottom={20}>
      <SubHeader onBack={onBack} eyebrow="Ingresar fondos" title="Depositar"/>

      <div style={{ textAlign: 'center', padding: '16px 20px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--text-3)', alignSelf: 'flex-start', marginTop: 12 }}>$</span>
          <span className="tnum" style={{ fontSize: 52, fontWeight: 400, letterSpacing: '-0.03em', color: num === 0 ? 'var(--text-4)' : 'var(--text-1)', lineHeight: 1 }}>
            {num.toLocaleString('es-CO')}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', marginLeft: 4, alignSelf: 'flex-end', marginBottom: 6 }}>COP</span>
        </div>
      </div>

      <div style={{ padding: '8px 20px 0' }}>
        {accounts.length > 1 ? (
          <div>
            <label className="nx-label">Depositar a</label>
            <select className="nx-input" value={srcIdx} onChange={e => setSrcIdx(Number(e.target.value))} style={{ appearance: 'none', background: 'var(--bg-2)', color: 'var(--text-1)' }}>
              {accounts.map((a, i) => (
                <option key={a.idCuenta || i} value={i} style={{ background: 'var(--bg-2)', color: 'var(--text-1)' }}>
                  {a.label || a.tipo} — {maskAcct(a.numeroCuenta || '')}
                </option>
              ))}
            </select>
          </div>
        ) : src ? (
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 12, padding: '10px 14px' }}>
            <div className="eyebrow" style={{ fontSize: 9 }}>Depositar a</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{src.label || src.tipo} · <span className="mono">{maskAcct(src.numeroCuenta || '')}</span></div>
          </div>
        ) : null}
      </div>

      <div style={{ padding: '10px 20px 0' }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Canal de pago</div>
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(77,141,255,0.08)', border: '1px solid rgba(77,141,255,0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(77,141,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏢</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--electric)' }}>Punto físico</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>Puntos aliados · Sin costo · Código válido 15 min</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 20px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[50000, 100000, 200000, 500000, 1000000].map(v => (
          <button key={v} onClick={() => setAmount(String(v))} className="press" style={{ flex: 1, minWidth: 52, height: 32, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer' }}>
            ${v / 1000}K
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 20px 0' }}>
        <Numpad onKey={onKey}/>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <button className="nx-btn nx-btn-primary" style={{ width: '100%', opacity: valid ? 1 : 0.5, pointerEvents: valid && !starting ? 'auto' : 'none' }}
          onClick={generarCodigo} disabled={starting}>
          {starting ? <Spinner /> : 'Generar código de pago'}
        </button>
      </div>
    </Screen>
  );
};

/* ─── Withdraw ──────────────────────────────────────────────── */

const WithdrawScreen = ({ accounts, onBack, onGatewayDone, defaultAccount }) => {
  const defaultIdx = defaultAccount
    ? Math.max(0, accounts.findIndex(a => a.idCuenta === defaultAccount.idCuenta))
    : 0;
  const [srcIdx, setSrcIdx] = useState(defaultIdx);
  const [amount, setAmount]       = useState('');
  const [phase, setPhase]         = useState('enter'); // 'enter' | 'waiting' | 'expired'
  const [starting, setStarting]   = useState(false);
  const [token, setToken]         = useState(null);
  const [countdown, setCountdown] = useState(0);

  const pollingRef   = useRef(null);
  const countdownRef = useRef(null);

  const src        = accounts[srcIdx] || null;
  const num        = parseInt(amount || '0', 10);
  const srcBalance = Number(src?.saldo ?? src?.balance ?? 0);
  const valid      = num > 0 && num <= srcBalance && src != null;

  const onKey = (k) => {
    if (k === '⌫') setAmount(a => a.slice(0, -1));
    else if (k === '.') {}
    else setAmount(a => (a + k).replace(/^0+/, '') || '0');
  };

  const limpiarIntervalos = () => {
    if (pollingRef.current)   clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const generarCodigo = async () => {
    if (!valid || starting) return;
    setStarting(true);
    try {
      const resp = await api.generarTokenRetiro(src.idCuenta, num);
      setToken(resp);
      setCountdown(Number(resp.segundosRestantes));
      setPhase('waiting');

      countdownRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(countdownRef.current); return 0; }
          return c - 1;
        });
      }, 1000);

      const capturedCodigo = resp.codigo;
      const capturedMonto  = num;
      pollingRef.current = setInterval(async () => {
        try {
          const estado = await api.consultarTokenRetiro(capturedCodigo);
          if (estado.estado === 'USADO') {
            limpiarIntervalos();
            onGatewayDone({ kind: 'withdraw', amount: capturedMonto });
          } else if (estado.estado === 'EXPIRADO' || estado.segundosRestantes <= 0) {
            limpiarIntervalos();
            setPhase('expired');
          }
        } catch {}
      }, 2000);

    } catch (e) {
      // el toast lo maneja el padre si quiere; aquí solo dejamos entrar
    } finally {
      setStarting(false);
    }
  };

  const cancelar = () => {
    limpiarIntervalos();
    setPhase('enter');
    setAmount('');
    setCountdown(0);
    setToken(null);
  };

  useEffect(() => () => limpiarIntervalos(), []);

  const countdownColor = countdown > 300 ? 'var(--success)' : countdown > 60 ? '#F5A623' : 'var(--danger)';

  /* ── Fase: expirado ── */
  if (phase === 'expired') {
    return (
      <Screen padTop={54} padBottom={20}>
        <SubHeader onBack={onBack} eyebrow="Salida de fondos" title="Retirar"/>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(255,107,122,0.1)', border: '1px solid rgba(255,107,122,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>⏱</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 500 }}>Código expirado</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>El código venció. El saldo fue devuelto a tu cuenta.</div>
          </div>
          <button className="nx-btn nx-btn-primary" style={{ width: '100%' }} onClick={cancelar}>
            Generar nuevo código
          </button>
        </div>
      </Screen>
    );
  }

  /* ── Fase: esperando cajero ── */
  if (phase === 'waiting') {
    return (
      <Screen padTop={54} padBottom={20}>
        <SubHeader onBack={cancelar} eyebrow="Salida de fondos" title="Retirar"/>

        <div className="fade-up" style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: '100%', padding: '20px', borderRadius: 20, background: 'linear-gradient(160deg, rgba(91,216,160,0.1), rgba(91,216,160,0.03))', border: '1px solid rgba(91,216,160,0.3)', textAlign: 'center' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Código de retiro</div>
            <div className="mono" style={{ fontSize: 48, letterSpacing: '0.22em', color: 'var(--success)', fontWeight: 400 }}>
              {token?.codigo}
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="eyebrow" style={{ fontSize: 9 }}>Monto exacto</div>
                <div className="mono" style={{ fontSize: 15, marginTop: 3 }}>{fmtCOP(num)}</div>
              </div>
              <div style={{ width: 1, background: 'var(--stroke-2)' }}/>
              <div style={{ textAlign: 'center' }}>
                <div className="eyebrow" style={{ fontSize: 9 }}>Cuenta</div>
                <div className="mono" style={{ fontSize: 15, marginTop: 3 }}>{maskAcct(src?.numeroCuenta || '')}</div>
              </div>
              <div style={{ width: 1, background: 'var(--stroke-2)' }}/>
              <div style={{ textAlign: 'center' }}>
                <div className="eyebrow" style={{ fontSize: 9 }}>Expira en</div>
                <div className="mono" style={{ fontSize: 15, marginTop: 3, color: countdownColor, fontWeight: 500 }}>
                  {fmtCountdown(countdown)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', padding: '12px 14px', borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Presenta este código en un <strong style={{ color: 'var(--text-1)' }}>cajero Nexus</strong> o punto aliado. El efectivo se entrega al validar el código.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'nx-pulse 1.4s ease-in-out infinite' }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-3)', textTransform: 'uppercase' }}>
              Esperando confirmación del cajero
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }}/>
        <div style={{ padding: '20px 20px 0' }}>
          <button className="nx-btn nx-btn-ghost" style={{ width: '100%' }} onClick={cancelar}>
            Cancelar
          </button>
        </div>
      </Screen>
    );
  }

  /* ── Fase: ingresar monto ── */
  return (
    <Screen padTop={54} padBottom={20}>
      <SubHeader onBack={onBack} eyebrow="Salida de fondos" title="Retirar"/>

      <div style={{ textAlign: 'center', padding: '24px 20px 16px' }}>
        <div className="eyebrow">Salida de fondos</div>
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

      <div style={{ padding: '8px 20px' }}>
        {accounts.length > 1 ? (
          <div>
            <label className="nx-label">Retirar de</label>
            <select className="nx-input" value={srcIdx} onChange={e => setSrcIdx(Number(e.target.value))} style={{ appearance: 'none', background: 'var(--bg-2)', color: 'var(--text-1)' }}>
              {accounts.map((a, i) => (
                <option key={a.idCuenta || i} value={i} style={{ background: 'var(--bg-2)', color: 'var(--text-1)' }}>
                  {a.label || a.tipo} — {maskAcct(a.numeroCuenta || '')} — {fmtCOP(a.saldo)}
                </option>
              ))}
            </select>
          </div>
        ) : src ? (
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #2A3147 0%, #0B0E16 100%)', border: '1px solid var(--stroke-2)', flexShrink: 0 }}/>
            <div>
              <div className="eyebrow" style={{ fontSize: 9 }}>Retirar de</div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{src.label || src.tipo} · <span className="mono">{maskAcct(src.numeroCuenta || '')}</span></div>
              <div className="tnum" style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{fmtCOP(srcBalance)} disponible</div>
            </div>
          </div>
        ) : null}
      </div>

      <div style={{ padding: '14px 20px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[50000, 100000, 200000, 500000, 1000000].map(v => (
          <button key={v} onClick={() => setAmount(String(v))} className="press" style={{ flex: 1, minWidth: 52, height: 36, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.04em', cursor: 'pointer' }}>
            ${v / 1000}K
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <Numpad onKey={onKey}/>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <button className="nx-btn nx-btn-primary" style={{ width: '100%', opacity: valid ? 1 : 0.5, pointerEvents: valid && !starting ? 'auto' : 'none' }}
          onClick={generarCodigo} disabled={starting}>
          {starting ? <Spinner /> : 'Generar código de retiro'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-4)', textTransform: 'uppercase' }}>
          Retiro sin tarjeta · Cajeros Nexus
        </div>
      </div>
    </Screen>
  );
};

/* ─── Wrapper ───────────────────────────────────────────────── */

const SimpleTxScreen = ({ kind, accounts = [], onBack, onGatewayDone, defaultAccount }) => {
  if (kind === 'deposit') return <DepositScreen accounts={accounts} onBack={onBack} onGatewayDone={onGatewayDone}/>;
  return <WithdrawScreen accounts={accounts} onBack={onBack} onGatewayDone={onGatewayDone} defaultAccount={defaultAccount}/>;
};

export default SimpleTxScreen;
