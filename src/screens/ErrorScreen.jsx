import { Icon } from '../components/primitives';

const ErrorScreen = ({ kind = 'expired', message, onRetry, onLogin }) => {
  const variants = {
    expired:  { icon: 'lock', title: 'Sesión expirada', sub: 'Por seguridad, su sesión ha caducado. Inicie sesión nuevamente.', cta: 'Iniciar sesión', alt: null },
    network:  { icon: 'reload', title: 'Sin conexión', sub: 'No pudimos contactar nuestros servidores. Verifique su conexión.', cta: 'Reintentar', alt: 'Cerrar sesión' },
    rejected: { icon: 'x-circle', title: 'Operación rechazada', sub: message || 'No fue posible completar la transacción.', cta: 'Volver', alt: null },
    generic:  { icon: 'alert', title: 'Error', sub: message || 'Ocurrió un error inesperado.', cta: 'Volver', alt: null },
  };
  const v = variants[kind] || variants.generic;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-1)', display: 'flex', flexDirection: 'column', padding: '90px 24px 32px' }}>
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: 'rgba(255,107,122,0.1)', border: '1px solid rgba(255,107,122,0.3)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={v.icon} size={32}/>
        </div>
      </div>

      <div className="fade-up" style={{ textAlign: 'center', marginTop: 28, animationDelay: '0.1s' }}>
        <div className="eyebrow" style={{ color: 'var(--danger)' }}>Atención</div>
        <div style={{ fontSize: 26, fontWeight: 500, marginTop: 8, letterSpacing: '-0.02em' }}>{v.title}</div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 12, lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>{v.sub}</div>
      </div>

      <div style={{ flex: 1 }}/>
      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 8, animationDelay: '0.2s' }}>
        <button className="nx-btn nx-btn-primary" onClick={kind === 'expired' ? onLogin : onRetry}>{v.cta}</button>
        {v.alt && <button className="nx-btn nx-btn-ghost" onClick={onLogin}>{v.alt}</button>}
      </div>
    </div>
  );
};

export default ErrorScreen;
