import { Icon, Screen, SubHeader, maskAcct } from '../components/primitives';

const SeguridadScreen = ({ accounts = [], onBack, onAction }) => {
  return (
    <Screen padTop={54} padBottom={120}>
      <SubHeader onBack={onBack} eyebrow="Privada" title="Seguridad"/>

      <div className="fade-up" style={{ padding: '0 20px 20px' }}>
        <div style={{ padding: '20px 18px', borderRadius: 18, background: 'linear-gradient(180deg, rgba(77,141,255,0.08), rgba(77,141,255,0.02))', border: '1px solid rgba(77,141,255,0.2)', position: 'relative', overflow: 'hidden' }}>
          <svg style={{ position: 'absolute', right: -40, top: -30, opacity: 0.18 }} width="200" height="200" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="40" stroke="#4D8DFF" strokeWidth="1"/>
            <circle cx="100" cy="100" r="60" stroke="#4D8DFF" strokeWidth="1"/>
            <circle cx="100" cy="100" r="80" stroke="#4D8DFF" strokeWidth="1"/>
          </svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(77,141,255,0.18)', color: 'var(--electric)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="shield" size={18}/>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--electric)', textTransform: 'uppercase' }}>Centro de seguridad</div>
          </div>
          <div style={{ fontSize: 17, fontWeight: 500, marginTop: 14, lineHeight: 1.3, position: 'relative' }}>
            Sus cuentas están protegidas.<br/>
            <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>Autenticación JWT activa.</span>
          </div>
        </div>
      </div>

      <div className="eyebrow" style={{ padding: '0 24px 8px' }}>Acciones por cuenta</div>

      {accounts.length === 0 && (
        <div style={{ padding: '20px 24px', color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>Sin cuentas disponibles</div>
      )}

      {accounts.map((a, idx) => (
        <div key={a.idCuenta || idx} className="nx-card" style={{ margin: '0 20px 12px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {a.label || a.tipo || 'Cuenta'}
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.2 }}>
                {maskAcct(a.numeroCuenta || a.number || '0000')}
              </div>
            </div>
            <span className={`nx-tag nx-tag-${a.estado === 'ACTIVA' ? 'active' : a.estado === 'BLOQUEADA' ? 'blocked' : 'inactive'}`}>
              {a.estado || a.status || 'INACTIVA'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(a.estado === 'ACTIVA' || a.status === 'ACTIVA') ? (
              <button onClick={() => onAction({ act: 'block', acct: a })} className="press" style={{ flex: 1, height: 38, borderRadius: 10, background: 'var(--bg-3)', border: '1px solid var(--stroke-2)', color: 'var(--text-1)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="lock" size={13}/> Bloquear
              </button>
            ) : (a.estado === 'BLOQUEADA' || a.status === 'BLOQUEADA') ? (
              <button onClick={() => onAction({ act: 'unblock', acct: a })} className="press" style={{ flex: 1, height: 38, borderRadius: 10, background: 'rgba(77,141,255,0.1)', border: '1px solid rgba(77,141,255,0.3)', color: 'var(--electric)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name="unlock" size={13}/> Desbloquear
              </button>
            ) : null}
            <button onClick={() => onAction({ act: 'close', acct: a })} className="press" style={{
              flex: 1, height: 38, borderRadius: 10, background: 'transparent', border: '1px solid rgba(255,107,122,0.3)',
              color: 'var(--danger)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: Number(a.saldo || 0) > 0 ? 0.4 : 1, pointerEvents: Number(a.saldo || 0) > 0 ? 'none' : 'auto',
            }}>
              <Icon name="x-circle" size={13}/> Cerrar
            </button>
          </div>
          {Number(a.saldo || 0) > 0 && (
            <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-4)', textTransform: 'uppercase' }}>
              ◇ Cuenta debe tener saldo cero para cerrar
            </div>
          )}
        </div>
      ))}
    </Screen>
  );
};

export default SeguridadScreen;
