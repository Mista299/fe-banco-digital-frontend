import { useState, useCallback, useEffect } from 'react';
import * as api from '../api';
import { Sidebar, Topbar } from './DesktopChrome';
import {
  DesktopLogin, DesktopDashboard, DesktopDetalle, DesktopTransfer,
  DesktopHistory, DesktopProfile, DesktopSecurity, DesktopSuccess,
} from './DesktopScreens';
import { Icon } from '../components/primitives';

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

  const handleTransferConfirm = async ({ kind, amount, destAcct, srcId }) => {
    const src = accounts.find(a => (a.idCuenta || a.id) === srcId);
    if (!src) return;
    try {
      await api.transferirMismoBanco(src.idCuenta, src.numeroCuenta, destAcct, amount);
      await loadDashboard();
      setSuccessData({ kind, amount, destAcct });
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
      <Topbar user={username} onLogout={handleLogout}/>
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
    </div>
  );
};

export default DesktopApp;
