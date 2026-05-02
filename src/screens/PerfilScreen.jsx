import { useState } from 'react';
import { Icon, Screen, SubHeader, Spinner } from '../components/primitives';
import * as api from '../api';

const Sep = () => <div style={{ height: 1, background: 'var(--stroke-1)', marginLeft: 56 }}/>;

const ProfileRow = ({ icon, label, value, readOnly, onEdit }) => (
  <div onClick={!readOnly ? onEdit : undefined} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: onEdit ? 'pointer' : 'default' }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-3)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={15}/>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="eyebrow" style={{ fontSize: 9 }}>{label}</div>
      <div style={{ fontSize: 13, marginTop: 2, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</div>
    </div>
    {readOnly
      ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-4)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Solo lectura</span>
      : <Icon name="chevron-right" size={16} color="var(--text-3)"/>
    }
  </div>
);

const PerfilScreen = ({ username, onBack, onLogout }) => {
  const [editing, setEditing] = useState(null);
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTel, setNewTel] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const initials = username ? username.slice(0, 2).toUpperCase() : 'NX';

  const save = async () => {
    const payload = {};
    if (editing === 'email') { if (!newEmail) return; payload.email = newEmail; payload.telefono = telefono || undefined; }
    if (editing === 'tel') { if (!newTel) return; payload.telefono = newTel; payload.email = email || undefined; }
    setLoading(true); setErr('');
    try {
      await api.actualizarCliente(payload.email, payload.telefono);
      if (editing === 'email') setEmail(newEmail);
      if (editing === 'tel') setTelefono(newTel);
      setMsg('Datos actualizados correctamente');
      setEditing(null);
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setErr(e.message);
    } finally { setLoading(false); }
  };

  return (
    <Screen padTop={54} padBottom={120}>
      <SubHeader onBack={onBack} eyebrow="Cliente" title="Perfil"/>

      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 24px 28px' }}>
        <div style={{ width: 84, height: 84, borderRadius: 42, background: 'linear-gradient(135deg, #1E2D55, #0D1B3D)', border: '1px solid var(--stroke-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 500, color: '#fff', boxShadow: '0 0 32px rgba(77,141,255,0.2)' }}>
          {initials}
        </div>
        <div style={{ fontSize: 18, fontWeight: 500, marginTop: 14 }}>{username}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-3)', textTransform: 'uppercase', marginTop: 4 }}>
          Cliente Nexus Bank
        </div>
        <div className="nx-tag" style={{ marginTop: 10, background: 'rgba(77,141,255,0.1)', color: 'var(--electric)', border: '1px solid rgba(77,141,255,0.25)' }}>
          <Icon name="sparkle" size={11}/> Privada
        </div>
      </div>

      {msg && <div style={{ margin: '0 20px 16px', padding: '10px 14px', borderRadius: 10, background: 'var(--success-dim)', color: 'var(--success)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{msg}</div>}

      <div style={{ padding: '0 20px' }}>
        <div className="eyebrow" style={{ padding: '0 4px 8px' }}>Información personal</div>
        <div className="nx-card" style={{ overflow: 'hidden' }}>
          <ProfileRow icon="user" label="Usuario" value={username} readOnly/>
          <Sep/>
          <ProfileRow icon="mail" label="Correo" value={email || 'No configurado'} onEdit={() => { setNewEmail(email); setEditing('email'); }}/>
          <Sep/>
          <ProfileRow icon="phone" label="Teléfono" value={telefono || 'No configurado'} onEdit={() => { setNewTel(telefono); setEditing('tel'); }}/>
        </div>

        {editing && (
          <div style={{ marginTop: 16, padding: '16px', background: 'var(--bg-2)', border: '1px solid var(--stroke-2)', borderRadius: 16 }}>
            <label className="nx-label">{editing === 'email' ? 'Nuevo correo' : 'Nuevo teléfono'}</label>
            <input className="nx-input" type={editing === 'email' ? 'email' : 'tel'}
              value={editing === 'email' ? newEmail : newTel}
              onChange={e => editing === 'email' ? setNewEmail(e.target.value) : setNewTel(e.target.value)}
              placeholder={editing === 'email' ? 'nuevo@correo.co' : '3001234567'}/>
            {err && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{err}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="nx-btn nx-btn-ghost" style={{ flex: 1, height: 44 }} onClick={() => { setEditing(null); setErr(''); }}>Cancelar</button>
              <button className="nx-btn nx-btn-primary" style={{ flex: 1, height: 44 }} onClick={save} disabled={loading}>
                {loading ? <Spinner /> : 'Guardar'}
              </button>
            </div>
          </div>
        )}

        <button onClick={onLogout} className="nx-btn nx-btn-danger" style={{ width: '100%', marginTop: 24 }}>
          <Icon name="logout" size={16}/> Cerrar sesión
        </button>
        <div style={{ textAlign: 'center', marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-4)', textTransform: 'uppercase' }}>
          Nexus Bank · v1.0.0
        </div>
      </div>
    </Screen>
  );
};

export default PerfilScreen;
