import { useState, useCallback } from 'react';
import { BottomNav, Toast } from './components/primitives';
import ConfirmModal from './components/ConfirmModal';

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
  const [route, setRoute]           = useState('splash');
  const [navTab, setNavTab]         = useState('home');
  const [username, setUsername]     = useState('');
  const [accounts, setAccounts]     = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [selectedAcct, setSelectedAcct] = useState(null);
  const [pending, setPending]       = useState(null);
  const [completed, setCompleted]   = useState(null);
  const [toast, setToast]           = useState(null);
  const [errKind, setErrKind]       = useState('expired');
  const [errMsg, setErrMsg]         = useState('');
  const [dashVariant]               = useState('wallet');

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

  const handleLogin = async (user) => {
    setUsername(user);
    setRoute('loading');
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
    setUsername(''); setAccounts([]); setRecentTxns([]);
    setRoute('login');
  };

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
    content = <Dash accounts={accounts} recentTxns={recentTxns} username={username}
      onAccount={(a) => { setSelectedAcct(a); setRoute('detalle'); }}
      onAction={goAction}/>;
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

  const W = 402, H = 874;

  return (
    <div style={{ width: W, height: H, borderRadius: 48, position: 'relative', overflow: 'hidden', background: '#000', boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-1)', overflow: 'hidden' }}>
        {content}
      </div>

      {showBottomNav && <BottomNav active={navTab} onChange={goTab}/>}
      <Toast toast={toast}/>
      {pending && <ConfirmModal data={pending} onCancel={() => setPending(null)} onConfirm={handleConfirm}/>}

      {/* Dynamic island */}
      <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 150, pointerEvents: 'none' }}/>

      {/* Status bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 155, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '17px 32px 0', height: 54, pointerEvents: 'none' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-sans)' }}>
          {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="17" height="11" viewBox="0 0 17 11" fill="#fff"><rect x="0" y="7" width="3" height="4" rx="0.6"/><rect x="4.5" y="5" width="3" height="6" rx="0.6"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.6"/><rect x="13.5" y="0" width="3" height="11" rx="0.6"/></svg>
          <svg width="24" height="11" viewBox="0 0 24 11" fill="none"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="#fff" strokeOpacity="0.5"/><rect x="2" y="2" width="17" height="7" rx="1.5" fill="#fff"/></svg>
        </div>
      </div>

      {/* Home indicator */}
      <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, zIndex: 160, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ width: 139, height: 5, borderRadius: 100, background: 'rgba(255,255,255,0.7)' }}/>
      </div>
    </div>
  );
};

export default App;
