import { useState } from 'react';
import { Icon, NxWordmark, Spinner } from '../components/primitives';
import * as api from '../api';

const LoginScreen = ({ onLogin, onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!username || !password) { setError('Ingrese usuario y contraseña'); return; }
    setLoading(true); setError('');
    try {
      const resp = await api.login(username, password);
      onLogin(username, resp.genero);
    } catch (e) {
      setError(e.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #0A0F1E 0%, #07080B 60%)',
      paddingTop: 70, paddingBottom: 30, paddingLeft: 24, paddingRight: 24,
      display: 'flex', flexDirection: 'column',
    }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <NxWordmark />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-3)', textTransform: 'uppercase' }}>
          <span className="nx-dot"/>Activo
        </div>
      </div>

      <div className="fade-up" style={{ marginTop: 56, animationDelay: '0.05s' }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Bienvenido de vuelta</div>
        <div style={{ fontSize: 32, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff' }}>
          Acceso a su<br/>banca privada.
        </div>
      </div>

      <div className="fade-up" style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14, animationDelay: '0.1s' }}>
        <div>
          <label className="nx-label">Usuario</label>
          <input className={`nx-input${error ? ' error' : ''}`} value={username} onChange={e => setUsername(e.target.value)} placeholder="su.usuario" autoCapitalize="none"/>
        </div>
        <div>
          <label className="nx-label">Contraseña</label>
          <div style={{ position: 'relative' }}>
            <input className={`nx-input${error ? ' error' : ''}`} type={showPwd ? 'text' : 'password'}
              value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              style={{ paddingRight: 48 }} onKeyDown={e => e.key === 'Enter' && submit()}/>
            <button onClick={() => setShowPwd(s => !s)} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none',
              color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={showPwd ? 'eye-off' : 'eye'} size={18}/>
            </button>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: 'var(--danger)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}/>

      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12, animationDelay: '0.15s' }}>
        <button className="nx-btn nx-btn-primary" onClick={submit} disabled={loading} style={{ width: '100%' }}>
          {loading ? <><Spinner /> Verificando…</> : <>Ingresar &nbsp;<Icon name="arrow-up-right" size={18}/></>}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--stroke-1)' }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--text-3)', textTransform: 'uppercase' }}>o</span>
          <div style={{ flex: 1, height: 1, background: 'var(--stroke-1)' }}/>
        </div>

        <button onClick={onRegister} style={{ background: 'transparent', border: 'none', color: 'var(--text-2)', fontSize: 14, cursor: 'pointer', padding: '10px 0', fontFamily: 'var(--font-sans)' }}>
          ¿Aún no es cliente? <span style={{ color: 'var(--electric)', fontWeight: 500 }}>Crear cuenta</span>
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
