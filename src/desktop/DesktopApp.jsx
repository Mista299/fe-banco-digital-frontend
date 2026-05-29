import { useState, useCallback, useEffect, useRef } from 'react';
import * as api from '../api';
import { Sidebar, Topbar } from './DesktopChrome';
import {
  DesktopLogin, DesktopDashboard, DesktopDetalle, DesktopTransfer,
  DesktopHistory, DesktopProfile, DesktopSecurity, DesktopSuccess,
} from './DesktopScreens';
import { Icon, fmtCOP } from '../components/primitives';
import NotificacionPanel from '../components/NotificacionPanel';
import DesktopAdminApp from './DesktopAdminApp';

const FINISHES = ['obsidian', 'midnight', 'graphite'];

const enrichAccount = (a, i) => ({
  ...a,
  id: a.idCuenta,
  label: a.label || (a.tipo === 'CORRIENTE' ? 'Cuenta Corriente' : 'Cuenta de Ahorros'),
  number: a.numeroCuenta,
  balance: a.saldo ?? 0,
  status: a.estado,
  type: a.tipo,
  finish: FINISHES[i % FINISHES.length],
});

const CONCEPTO_LABELS = {
  TRANSFERENCIA: 'Transferencia enviada',
  TRANSFERENCIA_RECIBIDA: 'Transferencia recibida',
  DEPOSITO: 'Depósito',
  RETIRO: 'Retiro',
  DEPOSITO_PENDIENTE: 'Depósito pendiente',
};

const formatTxDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return iso;
  }
};

const mapTxn = (t, i) => {
  const monto = t.monto ?? 0;
  return {
    id: `tx-${i}-${t.fechaHora || ''}`,
    kind: monto >= 0 ? 'in' : 'out',
    label: CONCEPTO_LABELS[t.concepto] || t.concepto || 'Movimiento',
    party: '—',
    date: formatTxDate(t.fechaHora),
    amount: Math.abs(monto),
    saldoResultante: t.saldoResultante,
    status: 'EXITOSA',
  };
};

const Toast = ({ toast }) => {
  if (!toast) return null;
  const colors = {
    success: { bg: 'rgba(91,216,160,0.12)', border: 'rgba(91,216,160,0.3)', icon: 'check-circle', c: 'var(--success)' },
    error:   { bg: 'rgba(255,107,122,0.12)', border: 'rgba(255,107,122,0.3)', icon: 'alert',       c: 'var(--danger)' },
    info:    { bg: 'rgba(77,141,255,0.12)',  border: 'rgba(77,141,255,0.3)', icon: 'info',         c: 'var(--electric)' },
  };
  const c = colors[toast.kind] || colors.info;
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 200,
      background: 'rgba(17,20,27,0.95)', backdropFilter: 'blur(20px)',
      border: `1px solid ${c.border}`, borderRadius: 14, padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12, maxWidth: 400,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ color: c.c, flexShrink: 0 }}><Icon name={c.icon} size={18}/></div>
      <span style={{ fontSize: 13.5, color: 'var(--text-1)', flex: 1 }}>{toast.msg}</span>
    </div>
  );
};

const fmtCountdown = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const OpModal = ({ kind, initialSrcId, accounts, onClose, onSuccess, showToast }) => {
  const isDeposit = kind === 'deposit';
  const [phase, setPhase]       = useState('enter');
  const [srcId, setSrcId]       = useState(initialSrcId);
  const [amount, setAmount]     = useState('');
  const [starting, setStarting] = useState(false);
  const [token, setToken]       = useState(null);
  const [referencia, setRef]    = useState('');
  const [countdown, setCountdown] = useState(0);
  const pollingRef   = useRef(null);
  const countdownRef = useRef(null);

  const src        = accounts.find(a => (a.idCuenta || a.id) === srcId) || accounts[0];
  const num        = Number(amount) || 0;
  const srcBalance = Number(src?.saldo ?? src?.balance ?? 0);
  const overBalance = !isDeposit && num > srcBalance;
  const valid      = num > 0 && !overBalance && !!src;
  const codeColor  = isDeposit ? 'var(--electric)' : 'var(--success)';
  const codeBg     = isDeposit ? 'linear-gradient(160deg,rgba(77,141,255,0.10),rgba(77,141,255,0.03))' : 'linear-gradient(160deg,rgba(91,216,160,0.10),rgba(91,216,160,0.03))';
  const codeBorder = isDeposit ? 'rgba(77,141,255,0.3)' : 'rgba(91,216,160,0.3)';
  const countdownColor = countdown > 300 ? 'var(--success)' : countdown > 60 ? '#F5A623' : 'var(--danger)';

  useEffect(() => () => { clearInterval(pollingRef.current); clearInterval(countdownRef.current); }, []);

  const limpiar = () => { clearInterval(pollingRef.current); clearInterval(countdownRef.current); };

  const generarCodigo = async () => {
    if (!valid || starting) return;
    setStarting(true);
    try {
      if (isDeposit) {
        const ref = String(Math.floor(100000 + Math.random() * 900000));
        const resp = await api.registrarDepositoPendiente(src.numeroCuenta, num, ref);
        setRef(resp.referenciaGateway);
        setCountdown(Number(resp.segundosRestantes));
        setPhase('waiting');
        countdownRef.current = setInterval(() => setCountdown(c => c > 1 ? c - 1 : 0), 1000);
        const capturedRef = resp.referenciaGateway;
        pollingRef.current = setInterval(async () => {
          try {
            const est = await api.consultarDepositoPendiente(capturedRef);
            if (est.estado === 'COMPLETADO') { limpiar(); onSuccess({ kind: 'deposit', amount: num }); }
            else if (est.estado === 'EXPIRADO') { limpiar(); setPhase('expired'); }
          } catch { /* ignorar errores de red en el polling */ }
        }, 1500);
      } else {
        const resp = await api.generarTokenRetiro(src.idCuenta, num);
        setToken(resp);
        setCountdown(Number(resp.segundosRestantes));
        setPhase('waiting');
        countdownRef.current = setInterval(() => setCountdown(c => c > 1 ? c - 1 : 0), 1000);
        const capturedCodigo = resp.codigo;
        pollingRef.current = setInterval(async () => {
          try {
            const est = await api.consultarTokenRetiro(capturedCodigo);
            if (est.estado === 'USADO') { limpiar(); onSuccess({ kind: 'withdraw', amount: num }); }
            else if (est.estado === 'EXPIRADO' || est.segundosRestantes <= 0) { limpiar(); setPhase('expired'); }
          } catch { /* ignorar errores de red en el polling */ }
        }, 2000);
      }
    } catch (e) {
      showToast(e.message || 'Error al generar código', 'error');
    } finally {
      setStarting(false);
    }
  };

  const reintentar = () => { limpiar(); setPhase('enter'); setAmount(''); setCountdown(0); setToken(null); setRef(''); };
  const handleClose = () => { limpiar(); onClose(); };

  if (phase === 'expired') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} onClick={handleClose}>
        <div className="nx-card" style={{ width: 400, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: 'rgba(255,107,122,0.1)', border: '1px solid rgba(255,107,122,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="alert" size={28} color="var(--danger)"/>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>Código expirado</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>
              {isDeposit ? 'El código venció sin recibir pago.' : 'El código venció. El saldo fue devuelto a tu cuenta.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button onClick={reintentar} className="nx-btn nx-btn-primary" style={{ flex: 1 }}>Generar nuevo código</button>
            <button onClick={handleClose} className="nx-btn nx-btn-ghost" style={{ width: 100 }}>Cerrar</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'waiting') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}>
        <div className="nx-card" style={{ width: 480, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div className="eyebrow">{isDeposit ? 'Depósito' : 'Retiro'} · Código generado</div>
            <div style={{ fontSize: 20, fontWeight: 500, marginTop: 4 }}>{isDeposit ? 'Código de pago' : 'Código de retiro'}</div>
          </div>

          <div style={{ padding: 20, borderRadius: 16, background: codeBg, border: `1px solid ${codeBorder}`, textAlign: 'center' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>{isDeposit ? 'Código de pago' : 'Código de retiro'}</div>
            <div className="mono" style={{ fontSize: 48, letterSpacing: '0.22em', color: codeColor, fontWeight: 400 }}>
              {isDeposit ? referencia : token?.codigo}
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 24 }}>
              <div><div className="eyebrow" style={{ fontSize: 9 }}>Monto exacto</div><div className="mono" style={{ fontSize: 14, marginTop: 3 }}>{fmtCOP(num)}</div></div>
              <div style={{ width: 1, background: 'var(--stroke-2)' }}/>
              <div><div className="eyebrow" style={{ fontSize: 9 }}>Cuenta</div><div className="mono" style={{ fontSize: 14, marginTop: 3 }}>{maskAcct(src?.numeroCuenta || src?.number || '')}</div></div>
              <div style={{ width: 1, background: 'var(--stroke-2)' }}/>
              <div><div className="eyebrow" style={{ fontSize: 9 }}>Expira en</div><div className="mono" style={{ fontSize: 14, marginTop: 3, color: countdownColor, fontWeight: 500 }}>{fmtCountdown(countdown)}</div></div>
            </div>
          </div>

          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {isDeposit
              ? 'Dirígete a un punto físico aliado, presenta este código y paga el monto exacto. El saldo se acreditará automáticamente.'
              : 'Presenta este código en un cajero Nexus o punto aliado. El efectivo se entrega al validar el código.'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: codeColor, animation: 'nx-pulse 1.4s ease-in-out infinite' }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-3)', textTransform: 'uppercase' }}>
              Esperando confirmación {isDeposit ? 'del punto' : 'del cajero'}
            </span>
          </div>

          <button onClick={reintentar} className="nx-btn nx-btn-ghost" style={{ width: '100%' }}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} onClick={handleClose}>
      <div className="nx-card" style={{ width: 440, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow">{isDeposit ? 'Depósito' : 'Retiro'}</div>
            <div style={{ fontSize: 22, fontWeight: 500, marginTop: 4, letterSpacing: '-0.01em' }}>{isDeposit ? 'Depositar fondos' : 'Retirar fondos'}</div>
          </div>
          <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-3)', border: '1px solid var(--stroke-1)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={14}/>
          </button>
        </div>

        <div>
          <label className="nx-label">Cuenta</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {accounts.filter(a => (a.estado || a.status) === 'ACTIVA').map(a => {
              const aid = a.idCuenta || a.id;
              const sel = aid === srcId;
              return (
                <button key={aid} onClick={() => setSrcId(aid)} className="press" style={{ padding: '10px 14px', borderRadius: 10, textAlign: 'left', background: sel ? 'rgba(77,141,255,0.10)' : 'var(--bg-3)', border: `1px solid ${sel ? 'rgba(77,141,255,0.4)' : 'var(--stroke-1)'}`, color: 'var(--text-1)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{a.label}</div>
                  <div className="mono" style={{ fontSize: 12 }}>{fmtCOP(a.saldo ?? a.balance ?? 0)}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="nx-label">Monto · COP</label>
          <input
            className="nx-input mono tnum"
            value={amount}
            onChange={e => setAmount(e.target.value.replace(/\D/g, ''))}
            style={{ fontSize: 24, fontWeight: 500 }}
            placeholder="0"
            autoFocus
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {[50000, 100000, 500000, 1000000].map(v => (
              <button key={v} onClick={() => setAmount(String(v))} style={{ padding: '5px 10px', borderRadius: 7, background: 'var(--bg-3)', border: '1px solid var(--stroke-1)', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: 10.5, cursor: 'pointer' }}>
                {fmtCOP(v)}
              </button>
            ))}
          </div>
          {overBalance && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="alert" size={13}/> Saldo insuficiente. Disponible: {fmtCOP(srcBalance)}
            </div>
          )}
        </div>

        <div style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="info" size={14} color="var(--electric)"/>
          <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
            {isDeposit
              ? 'Se generará un código de pago para presentar en un punto físico aliado.'
              : 'Se generará un código de retiro para usar en un cajero Nexus o punto aliado.'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={generarCodigo} disabled={!valid || starting} className="nx-btn nx-btn-primary" style={{ flex: 1, opacity: valid && !starting ? 1 : 0.5 }}>
            <Icon name={isDeposit ? 'plus' : 'minus'} size={15}/>
            {starting ? 'Generando…' : `Generar código de ${isDeposit ? 'pago' : 'retiro'}`}
          </button>
          <button onClick={handleClose} className="nx-btn nx-btn-ghost" style={{ width: 100 }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const DesktopApp = () => {
  const [route, setRoute] = useState('login');
  const [nav, setNav] = useState('home');
  const [collapsed] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [txns, setTxns] = useState([]);
  const [selectedAcct, setSelectedAcct] = useState(null);
  const [selectedAcctTxns, setSelectedAcctTxns] = useState([]);
  const [successData, setSuccessData] = useState(null);
  const [username, setUsername] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [notifPanel, setNotifPanel] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [hasClientAccounts, setHasClientAccounts] = useState(false);
  const [opModal, setOpModal] = useState(null);

  const notifCount = notifs.filter(n => !n.leida).length;

  const showToast = useCallback((msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await api.getDashboard();
      const enriched = data.map(enrichAccount);
      setAccounts(enriched);
      const active = enriched.find(a => a.estado === 'ACTIVA');
      if (active?.idCuenta) {
        api.getMovimientos(active.idCuenta)
          .then(raw => setTxns(raw.map(mapTxn)))
          .catch(() => {});
      }
    } catch (e) {
      if (e.status === 401) setRoute('login');
    }
  }, []);

  useEffect(() => {
    if (route === 'app') loadDashboard();
  }, [route, loadDashboard]);

  useEffect(() => {
    const hasPending = notifs.some(n => n.estado === 'PENDIENTE_PROCESAMIENTO');
    if (!hasPending) return;

    const id = setInterval(async () => {
      const pendientes = notifs.filter(n => n.estado === 'PENDIENTE_PROCESAMIENTO');
      for (const n of pendientes) {
        try {
          const d = await api.consultarTransferenciaACH(n.idTransaccion);
          if (d.estado !== 'PENDIENTE_PROCESAMIENTO') {
            setNotifs(prev => prev.map(x =>
              x.idTransaccion === n.idTransaccion ? { ...x, estado: d.estado, leida: false } : x
            ));
            if (d.estado === 'EXITOSA') {
              showToast(`ACH confirmada · ${n.banco}`, 'success');
            } else if (d.estado === 'REVERSADA') {
              showToast(`ACH rechazada · Saldo devuelto · ${n.banco}`, 'error');
            }
            loadDashboard();
          }
        } catch { /* ignorar errores de red en el polling */ }
      }
    }, 8000);

    return () => clearInterval(id);
  }, [notifs, showToast, loadDashboard]);

  const handleLogin = async (user, pwd) => {
    setLoginLoading(true);
    try {
      await api.login(user, pwd);
      setUsername(user);

      const adminFlag = await api.isAdmin().catch(() => false);
      if (adminFlag) {
        setUserRole('ADMIN');
        const cuentas = await api.getDashboard().catch(() => []);
        const enriched = Array.isArray(cuentas) ? cuentas.map(enrichAccount) : [];
        if (enriched.length > 0) {
          setAccounts(enriched);
          setHasClientAccounts(true);
          const active = enriched.find(a => a.estado === 'ACTIVA');
          if (active?.idCuenta) api.getMovimientos(active.idCuenta).then(raw => setTxns(raw.map(mapTxn))).catch(() => {});
        }
        setRoute('admin');
        setLoginLoading(false);
        return;
      }

      const gerenteFlag = await api.isGerente().catch(() => false);
      if (gerenteFlag) {
        setUserRole('GERENTE');
        setRoute('admin');
        setLoginLoading(false);
        return;
      }

      setRoute('app');
    } catch (e) {
      setLoginLoading(false);
      throw e;
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    setRoute('login');
    setAccounts([]);
    setTxns([]);
    setUsername('');
    setNav('home');
    setNotifs([]);
    setUserRole(null);
    setHasClientAccounts(false);
  };

  const handleNav = (id) => {
    setNav(id);
    if (id !== 'detalle') setSelectedAcct(null);
  };

  const handleAccount = async (acct) => {
    setSelectedAcct(acct);
    setNav('detalle');
    try {
      const raw = await api.getMovimientos(acct.idCuenta || acct.id);
      setSelectedAcctTxns(raw.map(mapTxn));
    } catch {
      setSelectedAcctTxns([]);
    }
  };

  const handleAction = (id) => {
    if (id === 'transfer') setNav('transfer');
    else if (id === 'history') setNav('history');
    else if (id === 'deposit' || id === 'withdraw') {
      const active = accounts.find(a => (a.estado || a.status) === 'ACTIVA') || accounts[0];
      setOpModal({ kind: id, srcId: active?.idCuenta || active?.id || null });
    }
    else showToast('Función disponible próximamente', 'info');
  };

  const handleToggleLock = async (account, password) => {
    const st = account.estado || account.status;
    if (st === 'ACTIVA') {
      await api.bloquearCuenta(password);
      showToast('Cuenta bloqueada exitosamente', 'success');
    } else {
      await api.desbloquearCuenta(password);
      showToast('Cuenta desbloqueada exitosamente', 'success');
    }
    await loadDashboard();
  };

  const handleTransferConfirm = async (data) => {
    const { kind, amount, srcId } = data;
    const src = accounts.find(a => (a.idCuenta || a.id) === srcId);
    if (!src) return;
    try {
      if (kind === 'transfer') {
        await api.transferirMismoBanco(src.idCuenta, src.numeroCuenta, data.destAcct, amount);
        await loadDashboard();
        setSuccessData({ kind, amount, destAcct: data.destAcct });
      } else if (kind === 'ach') {
        const result = await api.iniciarTransferenciaInterbancaria({
          idCuentaOrigen:          src.idCuenta,
          bancoDestino:            data.destBanco,
          tipoCuentaDestino:       data.destTipoCuenta,
          numeroCuentaDestino:     data.destNumCuenta,
          nombreReceptor:          data.nombreReceptor,
          tipoDocumentoReceptor:   data.tipoDocReceptor,
          numeroDocumentoReceptor: data.numDocReceptor,
          monto:                   amount,
        });
        setNotifs(ns => [{
          idTransaccion: result.idTransaccion,
          monto:         amount,
          banco:         data.destBanco,
          destinatario:  data.nombreReceptor,
          estado:        result.estado,
          leida:         false,
        }, ...ns]);
        await loadDashboard();
        setSuccessData({ kind, amount, nombreReceptor: data.nombreReceptor, destBanco: data.destBanco, result });
      }
      setNav('success');
    } catch (e) {
      showToast(e.message || 'Error en la transferencia', 'error');
    }
  };

  const switchToClient = () => { setRoute('app'); setNav('home'); };
  const switchToAdmin  = () => setRoute('admin');

  if (route === 'login') {
    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
        <DesktopLogin onLogin={handleLogin} loading={loginLoading}/>
        <Toast toast={toast}/>
      </div>
    );
  }

  if (route === 'admin') {
    return (
      <DesktopAdminApp
        username={username}
        userRole={userRole ?? 'ADMIN'}
        hasClientAccounts={hasClientAccounts}
        onSwitchToClient={switchToClient}
        onLogout={handleLogout}
      />
    );
  }

  const navAccount = nav === 'cuentas' ? accounts[0] : selectedAcct;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-1)' }}>
      <Topbar
        user={username} onLogout={handleLogout} notifCount={notifCount} onBell={() => setNotifPanel(true)}
        userRole={userRole} onSwitchToAdmin={(userRole === 'ADMIN' || userRole === 'GERENTE') ? switchToAdmin : undefined}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar active={nav} onNav={handleNav} collapsed={collapsed}/>
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-1)' }}>
          {(nav === 'home') && (
            <DesktopDashboard accounts={accounts} txns={txns} onAccount={handleAccount} onAction={handleAction}/>
          )}
          {(nav === 'detalle' || nav === 'cuentas') && navAccount && (
            <DesktopDetalle account={navAccount} txns={selectedAcctTxns} onBack={() => setNav('home')} onAction={handleAction}/>
          )}
          {(nav === 'cuentas') && !navAccount && (
            <DesktopDashboard accounts={accounts} txns={txns} onAccount={handleAccount} onAction={handleAction}/>
          )}
          {nav === 'transfer' && (
            <DesktopTransfer accounts={accounts} onConfirm={handleTransferConfirm}/>
          )}
          {nav === 'history' && (
            <DesktopHistory txns={txns}/>
          )}
          {nav === 'profile' && (
            <DesktopProfile username={username} accounts={accounts} onLogout={handleLogout}/>
          )}
          {nav === 'security' && (
            <DesktopSecurity accounts={accounts} onToast={showToast} onToggleLock={handleToggleLock}/>
          )}
          {nav === 'success' && (
            <DesktopSuccess data={successData} onDone={() => setNav('home')}/>
          )}
        </div>
      </div>
      <Toast toast={toast}/>
      {opModal && (
        <OpModal
          kind={opModal.kind}
          initialSrcId={opModal.srcId}
          accounts={accounts}
          onClose={() => setOpModal(null)}
          onSuccess={async (result) => {
            showToast(result.kind === 'deposit' ? 'Depósito acreditado exitosamente' : 'Retiro procesado exitosamente', 'success');
            await loadDashboard();
            setOpModal(null);
          }}
          showToast={showToast}
        />
      )}
      {notifPanel && (
        <NotificacionPanel
          desktop
          notifs={notifs}
          onClose={() => setNotifPanel(false)}
          onLeerTodas={() => setNotifs(ns => ns.map(n => ({ ...n, leida: true })))}
          onLeer={id => setNotifs(ns => ns.map(n => n.idTransaccion === id ? { ...n, leida: true } : n))}
        />
      )}
    </div>
  );
};

export default DesktopApp;
