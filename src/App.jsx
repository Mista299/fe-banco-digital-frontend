import { useState, useCallback, useEffect } from 'react';
import { useViewport } from './hooks/useViewport';
import { BottomNav, Toast } from './components/primitives';
import ConfirmModal from './components/ConfirmModal';
import NotificacionPanel from './components/NotificacionPanel';

import SplashScreen     from './screens/SplashScreen';
import LoginScreen      from './screens/LoginScreen';
import RegistroScreen   from './screens/RegistroScreen';
import { DashboardA, DashboardB } from './screens/Dashboard';
import DetalleScreen    from './screens/DetalleScreen';
import TransferirScreen from './screens/TransferirScreen';
import SimpleTxScreen   from './screens/SimpleTxScreen';
import HistorialScreen  from './screens/HistorialScreen';
import PerfilScreen     from './screens/PerfilScreen';
import SeguridadScreen  from './screens/SeguridadScreen';
import SuccessScreen    from './screens/SuccessScreen';
import ErrorScreen      from './screens/ErrorScreen';
import ExtractosScreen  from './screens/ExtractosScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';

import * as api from './api';

const FINISHES = ['obsidian', 'midnight', 'graphite'];
const addMeta = (a, i) => ({
  ...a,
  label: a.label || (a.tipo === 'CORRIENTE' ? 'Cuenta Corriente' : 'Cuenta de Ahorros'),
  finish: FINISHES[i % FINISHES.length],
});

const LoadingScreen = () => (
  <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M8 24V8L24 24V8" stroke="#4D8DFF" strokeWidth="2.2" strokeLinecap="square"/>
      <circle cx="8" cy="8" r="1.5" fill="#4D8DFF"/>
      <circle cx="24" cy="24" r="1.5" fill="#4D8DFF"/>
    </svg>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--text-3)', textTransform: 'uppercase' }}>Cargando…</div>
  </div>
);

const App = () => {
  const { isMobile } = useViewport();
  const [route, setRoute]           = useState('splash');
  const [navTab, setNavTab]         = useState('home');
  const [username, setUsername]     = useState('');
  const [genero, setGenero]         = useState(null);
  const [accounts, setAccounts]     = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [selectedAcct, setSelectedAcct] = useState(null);
  const [pending, setPending]       = useState(null);
  const [completed, setCompleted]   = useState(null);
  const [toast, setToast]           = useState(null);
  const [errKind, setErrKind]       = useState('expired');
  const [errMsg, setErrMsg]         = useState('');
  const [dashVariant]               = useState('wallet');
  const [notifs, setNotifs]         = useState([]);
  const [notifPanel, setNotifPanel] = useState(false);
  const [userRole, setUserRole]     = useState(null);
  const [hasClientAccounts, setHasClientAccounts] = useState(false);

  const notifCount = notifs.filter(n => !n.leida).length;

  const showToast = useCallback((msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await api.getDashboard();
      const enriched = data.map(addMeta);
      setAccounts(enriched);
      const active = enriched.find(a => a.estado === 'ACTIVA');
      if (active?.idCuenta) {
        api.getMovimientos(active.idCuenta).then(setRecentTxns).catch(() => {});
      }
    } catch (e) {
      if (e.status === 401) setRoute('login');
    }
  }, []);

  // Redirigir al login cuando el refresh token expira
  useEffect(() => {
    api.setSessionExpiredHandler(() => {
      setRoute('login');
      setUsername('');
      setAccounts([]);
      setRecentTxns([]);
      setNotifs([]);
    });
  }, []);

  // Polling de notificaciones ACH pendientes
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

  const handleLogin = async (user, userGenero) => {
    setUsername(user);
    setGenero(userGenero ?? null);
    setRoute('loading');

    const adminFlag = await api.isAdmin().catch(() => false);
    if (adminFlag) {
      setUserRole('ADMIN');
      const cuentas = await api.getDashboard().catch(() => []);
      const enriched = Array.isArray(cuentas) ? cuentas.map(addMeta) : [];
      if (enriched.length > 0) {
        setAccounts(enriched);
        setHasClientAccounts(true);
        const active = enriched.find(a => a.estado === 'ACTIVA');
        if (active?.idCuenta) api.getMovimientos(active.idCuenta).then(setRecentTxns).catch(() => {});
      }
      setRoute('admin-home');
      showToast(`Bienvenido, ${user}`, 'success');
      return;
    }

    const gerenteFlag = await api.isGerente().catch(() => false);
    if (gerenteFlag) {
      setUserRole('GERENTE');
      const cuentas = await api.getDashboard().catch(() => []);
      const enriched = Array.isArray(cuentas) ? cuentas.map(addMeta) : [];
      if (enriched.length > 0) {
        setAccounts(enriched);
        setHasClientAccounts(true);
        const active = enriched.find(a => a.estado === 'ACTIVA');
        if (active?.idCuenta) api.getMovimientos(active.idCuenta).then(setRecentTxns).catch(() => {});
      }
      setRoute('admin-home');
      showToast(`Bienvenido, ${user}`, 'success');
      return;
    }

    try {
      const data = await api.getDashboard();
      const enriched = data.map(addMeta);
      setAccounts(enriched);
      const active = enriched.find(a => a.estado === 'ACTIVA');
      if (active?.idCuenta) {
        api.getMovimientos(active.idCuenta).then(setRecentTxns).catch(() => {});
      }
    } catch { /* continue anyway */ }
    setRoute('home'); setNavTab('home');
    showToast(`Bienvenido, ${user}`, 'success');
  };

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    setUsername(''); setGenero(null); setAccounts([]); setRecentTxns([]); setNotifs([]);
    setUserRole(null); setHasClientAccounts(false);
    setRoute('login');
  };

  const switchToClient = () => { setRoute('home'); setNavTab('home'); };
  const switchToAdmin  = () => setRoute('admin-home');

  const goTab = (id) => {
    setNavTab(id);
    setRoute(id === 'history' ? 'history' : id);
  };

  const goAction = (id) => {
    if (id === 'transfer')       { setNavTab('transfer'); setRoute('transfer'); }
    else if (id === 'deposit')   setRoute('deposit');
    else if (id === 'withdraw')  setRoute('withdraw');
    else if (id === 'history')   { setNavTab('history'); setRoute('history'); }
    else if (id === 'security')  { setNavTab('security'); setRoute('security'); }
    else if (id === 'extractos') setRoute('extractos');
  };

  const handleConfirm = async (data) => {
    try {
      let result = null;
      if (data.kind === 'transfer') {
        result = await api.transferirMismoBanco(
          data.src.idCuenta,
          data.src.numeroCuenta,
          data.destAcct,
          data.amount
        );
      } else if (data.kind === 'ach') {
        result = await api.iniciarTransferenciaInterbancaria({
          idCuentaOrigen:          data.src.idCuenta,
          bancoDestino:            data.destBanco,
          tipoCuentaDestino:       data.destTipoCuenta,
          numeroCuentaDestino:     data.destNumCuenta,
          nombreReceptor:          data.nombreReceptor,
          tipoDocumentoReceptor:   data.tipoDocReceptor,
          numeroDocumentoReceptor: data.numDocReceptor,
          monto:                   data.amount,
        });
        setNotifs(ns => [{
          idTransaccion: result.idTransaccion,
          monto:         data.amount,
          banco:         data.destBanco,
          destinatario:  data.nombreReceptor,
          estado:        result.estado,
          leida:         false,
        }, ...ns]);
      } else if (data.act === 'block') {
        await api.bloquearCuenta(data.password);
      } else if (data.act === 'unblock') {
        await api.desbloquearCuenta(data.password);
      } else if (data.act === 'close') {
        result = await api.cerrarCuenta(data.acct.idCuenta, data.password);
      }
      setPending(null);
      setCompleted({ ...data, result });
      setRoute('success');
      loadDashboard();
    } catch (e) {
      setPending(null);
      if (e.status === 401) {
        setErrKind('expired'); setErrMsg(''); setRoute('error');
      } else {
        showToast(e.message || 'Error al procesar la operación', 'error');
      }
    }
  };

  const showBottomNav = ['home', 'history', 'security', 'profile'].includes(route);
  const activeAccounts = accounts.filter(a => (a.estado === 'ACTIVA' || a.permiteTransacciones));

  let content;
  if (route === 'splash')    content = <SplashScreen onDone={() => setRoute('login')}/>;
  else if (route === 'login')    content = <LoginScreen onLogin={handleLogin} onRegister={() => setRoute('register')}/>;
  else if (route === 'register') content = <RegistroScreen onCancel={() => setRoute('login')} onDone={handleLogin}/>;
  else if (route === 'loading')  content = <LoadingScreen/>;
  else if (route === 'home') {
    const Dash = dashVariant === 'terminal' ? DashboardB : DashboardA;
    content = <Dash accounts={accounts} recentTxns={recentTxns} username={username} genero={genero}
      onAccount={(a) => { setSelectedAcct(a); setRoute('detalle'); }}
      onAction={goAction}
      notifCount={notifCount}
      onBell={() => setNotifPanel(true)}
      onSwitchToAdmin={(userRole === 'ADMIN' || userRole === 'GERENTE') ? switchToAdmin : undefined}/>;
  }
  else if (route === 'detalle')   content = <DetalleScreen account={selectedAcct} onBack={() => setRoute('home')} onAction={goAction}/>;
  else if (route === 'transfer')  content = <TransferirScreen accounts={activeAccounts} onBack={() => setRoute('home')} onConfirm={(d) => setPending(d)}/>;
  else if (route === 'deposit')   content = <SimpleTxScreen kind="deposit" accounts={activeAccounts} onBack={() => setRoute('home')}
    onGatewayDone={(d) => { setCompleted(d); setRoute('success'); setNavTab('home'); loadDashboard(); }}/>;
  else if (route === 'withdraw')  content = <SimpleTxScreen kind="withdraw" accounts={activeAccounts} defaultAccount={selectedAcct} onBack={() => setRoute('home')}
    onGatewayDone={(d) => { setCompleted(d); setRoute('success'); setNavTab('home'); loadDashboard(); }}/>;
  else if (route === 'history')   content = <HistorialScreen accounts={accounts} onBack={() => { setRoute('home'); setNavTab('home'); }}/>;
  else if (route === 'profile')   content = <PerfilScreen username={username} onBack={() => { setRoute('home'); setNavTab('home'); }} onLogout={handleLogout}/>;
  else if (route === 'security')  content = <SeguridadScreen accounts={accounts} onBack={() => { setRoute('home'); setNavTab('home'); }} onAction={(d) => setPending(d)}/>;
  else if (route === 'success')   content = <SuccessScreen data={completed} onDone={() => { setCompleted(null); setRoute('home'); setNavTab('home'); }}/>;
  else if (route === 'error')     content = <ErrorScreen kind={errKind} message={errMsg} onRetry={() => setRoute('home')} onLogin={() => { setRoute('login'); setNavTab('home'); }}/>;
  else if (route === 'extractos') content = <ExtractosScreen accounts={accounts} defaultAccount={selectedAcct} onBack={() => setRoute(selectedAcct ? 'detalle' : 'home')}/>;
  else if (route === 'admin-home') content = <AdminPanelScreen username={username} userRole={userRole ?? 'ADMIN'} hasClientAccounts={hasClientAccounts} onSwitchToClient={switchToClient} onLogout={handleLogout}/>;

  return (
    <div style={{
      width: isMobile ? '100vw' : 402,
      height: isMobile ? '100svh' : 874,
      borderRadius: isMobile ? 0 : 48,
      position: 'relative', overflow: 'hidden', background: '#000',
      boxShadow: isMobile ? 'none' : '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-1)', overflow: 'hidden' }}>
        {content}
      </div>

      {showBottomNav && <BottomNav active={navTab} onChange={goTab}/>}
      <Toast toast={toast}/>
      {pending && <ConfirmModal data={pending} onCancel={() => setPending(null)} onConfirm={handleConfirm}/>}
      {notifPanel && (
        <NotificacionPanel
          notifs={notifs}
          onClose={() => setNotifPanel(false)}
          onLeerTodas={() => setNotifs(ns => ns.map(n => ({ ...n, leida: true })))}
          onLeer={id => setNotifs(ns => ns.map(n => n.idTransaccion === id ? { ...n, leida: true } : n))}
        />
      )}
    </div>
  );
};

export default App;
