import { useState } from 'react';
import { Icon, Spinner } from '../components/primitives';
import * as api from '../api';

const RegistroScreen = ({ onCancel, onDone }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    documento: '', fechaExpedicion: '',
    nombre: '', email: '', direccion: '', telefono: '',
    username: '', password: '',
  });

  const upd = (k) => (e) => setData(d => ({ ...d, [k]: e.target.value }));

  const stepLabels = ['Identidad', 'Datos', 'Acceso'];

  const nextStep = async () => {
    setError('');
    if (step === 1) {
      if (!data.documento || !data.fechaExpedicion) { setError('Complete todos los campos'); return; }
      setLoading(true);
      try {
        await api.validarIdentidad(data.documento, data.fechaExpedicion);
        setStep(2);
      } catch (e) {
        setError(e.message);
      } finally { setLoading(false); }
    } else if (step === 2) {
      if (!data.nombre || !data.email || !data.telefono) { setError('Complete los campos obligatorios'); return; }
      setStep(3);
    } else {
      if (!data.username || !data.password) { setError('Complete usuario y contraseña'); return; }
      setLoading(true);
      try {
        await api.registrar({
          documento: data.documento,
          fechaExpedicion: data.fechaExpedicion,
          nombre: data.nombre,
          email: data.email,
          direccion: data.direccion,
          telefono: data.telefono,
          username: data.username,
          password: data.password,
        });
        onDone(data.username);
      } catch (e) {
        const msgs = e.data?.errores ? e.data.errores.join(', ') : e.message;
        setError(msgs);
      } finally { setLoading(false); }
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #0A0F1E 0%, #07080B 50%)',
      paddingTop: 70, paddingBottom: 30,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button onClick={() => step === 1 ? onCancel() : setStep(s => s - 1)} className="press" style={{
          width: 40, height: 40, borderRadius: 12, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)',
          color: 'var(--text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <Icon name="chevron-left" size={20}/>
        </button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-3)', textTransform: 'uppercase' }}>
          Apertura · Paso {step}/3
        </div>
        <div style={{ width: 40 }}/>
      </div>

      {/* Progress */}
      <div style={{ padding: '0 24px', marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? 'var(--electric)' : 'var(--stroke-2)', boxShadow: i <= step ? '0 0 8px var(--electric-glow)' : 'none', transition: 'background 0.3s ease' }}/>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {stepLabels.map((l, i) => (
            <span key={l} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: i + 1 <= step ? 'var(--text-1)' : 'var(--text-4)' }}>{l}</span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div key={step} className="fade-up" style={{ flex: 1, padding: '0 24px', overflow: 'auto' }}>
        {step === 1 && (
          <>
            <div style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>Verifiquemos su<br/>identidad.</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 28, lineHeight: 1.5 }}>Sus datos se validan en tiempo real.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="nx-label">Número de documento</label>
                <input className="nx-input mono" value={data.documento} onChange={upd('documento')} placeholder="1018452789"/>
              </div>
              <div>
                <label className="nx-label">Fecha de expedición (YYYY-MM-DD)</label>
                <input className="nx-input mono" value={data.fechaExpedicion} onChange={upd('fechaExpedicion')} placeholder="2018-03-15"/>
              </div>
            </div>
            <div style={{ marginTop: 24, padding: 14, borderRadius: 14, background: 'rgba(77,141,255,0.06)', border: '1px solid rgba(77,141,255,0.18)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--electric)', flexShrink: 0 }}><Icon name="shield" size={18}/></div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>Encriptación AES-256 extremo a extremo.</div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>Sus datos<br/>de contacto.</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 28, lineHeight: 1.5 }}>Usaremos estos datos para notificarle de movimientos.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="nx-label">Nombre completo *</label><input className="nx-input" value={data.nombre} onChange={upd('nombre')} placeholder="Juan Pérez Restrepo"/></div>
              <div><label className="nx-label">Correo electrónico *</label><input className="nx-input" value={data.email} onChange={upd('email')} placeholder="juan@correo.co" type="email"/></div>
              <div><label className="nx-label">Teléfono móvil *</label><input className="nx-input mono" value={data.telefono} onChange={upd('telefono')} placeholder="3001234567"/></div>
              <div><label className="nx-label">Dirección de residencia</label><input className="nx-input" value={data.direccion} onChange={upd('direccion')} placeholder="Cra 11 #93-45, Bogotá"/></div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>Cree sus<br/>credenciales.</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 28, lineHeight: 1.5 }}>Su usuario es único y no podrá ser modificado.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="nx-label">Usuario</label>
                <input className="nx-input" value={data.username} onChange={upd('username')} placeholder="juanp01" autoCapitalize="none"/>
              </div>
              <div>
                <label className="nx-label">Contraseña</label>
                <input className="nx-input" type="password" value={data.password} onChange={upd('password')} placeholder="Mínimo 8 caracteres"/>
              </div>
            </div>
          </>
        )}

        {error && (
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--danger)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', lineHeight: 1.5 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ padding: '20px 24px 0' }}>
        <button className="nx-btn nx-btn-primary" style={{ width: '100%' }} onClick={nextStep} disabled={loading}>
          {loading ? <Spinner /> : <>{step < 3 ? 'Continuar' : 'Crear mi cuenta'} <Icon name="arrow-up-right" size={18}/></>}
        </button>
      </div>
    </div>
  );
};

export default RegistroScreen;
