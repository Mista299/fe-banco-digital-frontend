import { useState, useCallback, useEffect } from 'react';
import * as api from '../api';
import { Sidebar, Topbar } from './DesktopChrome';
import {
  DesktopLogin, DesktopDashboard, DesktopDetalle, DesktopTransfer,
  DesktopHistory, DesktopProfile, DesktopSecurity, DesktopSuccess,
} from './DesktopScreens';
import { Icon } from '../components/primitives';
import NotificacionPanel from '../components/NotificacionPanel';

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
    else showToast('Función disponible próximamente', 'info');
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

  if (route === 'login') {
    return (
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
        <DesktopLogin onLogin={handleLogin} loading={loginLoading}/>
        <Toast toast={toast}/>
      </div>
    );
  }

  const navAccount = nav === 'cuentas' ? accounts[0] : selectedAcct;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-1)' }}>
      <Topbar user={username} onLogout={handleLogout} notifCount={notifCount} onBell={() => setNotifPanel(true)}/>
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
            <DesktopSecurity accounts={accounts} onToast={showToast}/>
          )}
          {nav === 'success' && (
            <DesktopSuccess data={successData} onDone={() => setNav('home')}/>
          )}
        </div>
      </div>
      <Toast toast={toast}/>
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
