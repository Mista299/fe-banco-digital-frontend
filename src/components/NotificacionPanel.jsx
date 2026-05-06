import { Icon, fmtCOP } from './primitives';

const NotificacionPanel = ({ notifs, onClose, onLeerTodas, onLeer, desktop = false }) => {
  const unread = notifs.filter(n => !n.leida).length;

  const panelStyle = desktop ? {
    position: 'fixed', top: 64, right: 20, width: 380, maxHeight: 520,
    zIndex: 300, borderRadius: 16, overflow: 'hidden',
    background: 'var(--bg-1)', border: '1px solid var(--stroke-2)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
  } : {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 90, background: 'rgba(7,8,11,0.7)', backdropFilter: 'blur(6px)',
  };

  const innerStyle = desktop ? {
    display: 'flex', flexDirection: 'column', maxHeight: 520,
  } : {
    position: 'absolute', top: 0, left: 0, right: 0,
    background: 'var(--bg-1)', maxHeight: '88%',
    display: 'flex', flexDirection: 'column',
    animation: 'nx-fade-up 0.2s ease',
  };

  const content = (
    <div style={innerStyle} onClick={e => e.stopPropagation()}>
      <div style={{ padding: desktop ? '16px 18px 12px' : '54px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--stroke-1)', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Notificaciones</div>
          {unread > 0 && (
            <div className="eyebrow" style={{ marginTop: 3, color: 'var(--electric)' }}>{unread} sin leer</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {unread > 0 && (
            <button onClick={onLeerTodas} style={{ background: 'transparent', border: 'none', color: 'var(--electric)', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', cursor: 'pointer', textTransform: 'uppercase' }}>
              Leer todas
            </button>
          )}
          <button onClick={onClose} className="press" style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', color: 'var(--text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="x" size={15}/>
          </button>
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifs.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
            <div style={{ color: 'var(--text-4)', marginBottom: 12 }}><Icon name="bell" size={28}/></div>
            <div style={{ fontSize: 13 }}>Sin notificaciones</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Las transferencias ACH aparecerán aquí</div>
          </div>
        )}

        {notifs.map((n, i) => {
          const exitosa  = n.estado === 'EXITOSA';
          const reversada = n.estado === 'REVERSADA';
          const pendiente = n.estado === 'PENDIENTE_PROCESAMIENTO';

          const color  = exitosa ? 'var(--success)' : reversada ? 'var(--danger)' : 'var(--warn)';
          const bg     = exitosa ? 'rgba(91,216,160,0.10)' : reversada ? 'rgba(255,107,122,0.10)' : 'rgba(245,181,68,0.10)';
          const border = exitosa ? 'rgba(91,216,160,0.22)' : reversada ? 'rgba(255,107,122,0.22)' : 'rgba(245,181,68,0.22)';
          const icon   = exitosa ? 'check-circle' : reversada ? 'x-circle' : 'alert';
          const label  = exitosa ? 'Confirmada' : reversada ? 'Rechazada · saldo devuelto' : 'En proceso ACH…';

          return (
            <div key={n.idTransaccion}
              onClick={() => !n.leida && onLeer(n.idTransaccion)}
              style={{
                padding: '14px 20px',
                borderTop: i > 0 ? '1px solid var(--stroke-1)' : 'none',
                background: n.leida ? 'transparent' : 'rgba(77,141,255,0.025)',
                cursor: n.leida ? 'default' : 'pointer',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: bg, border: `1px solid ${border}`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={icon} size={17}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ACH · {n.banco}
                  </div>
                  {!n.leida && (
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--electric)', flexShrink: 0, marginTop: 5 }}/>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
                  {fmtCOP(n.monto)} → {n.destinatario}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                    {label}
                  </span>
                  {pendiente && (
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--warn)', display: 'inline-block', animation: 'nx-pulse 1.5s ease-in-out infinite' }}/>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (desktop) return content;

  return (
    <div style={panelStyle} onClick={onClose}>
      {content}
    </div>
  );
};

export default NotificacionPanel;
