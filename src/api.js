let refreshing = null;

async function apiFetch(path, options = {}) {
  const { headers = {}, ...rest } = options;
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
    ...rest,
  });

  if (res.status === 401 && path !== '/api/v1/auth/refresh') {
    if (!refreshing) {
      refreshing = fetch('/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      }).finally(() => { refreshing = null; });
    }
    const r = await refreshing;
    if (r.ok) {
      return fetch(path, {
        headers: { 'Content-Type': 'application/json', ...headers },
        credentials: 'include',
        ...rest,
      });
    }
    throw Object.assign(new Error('Sesión expirada'), { status: 401 });
  }

  return res;
}

async function unwrap(res) {
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw Object.assign(new Error(json.mensaje || 'Error inesperado'), { status: res.status, data: json });
  return json;
}

export const login = (username, password) =>
  apiFetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }).then(unwrap);

export const logout = () =>
  apiFetch('/api/v1/auth/logout', { method: 'POST' }).then(r => r.ok);

export const registrar = (data) =>
  apiFetch('/api/v1/registro', { method: 'POST', body: JSON.stringify(data) }).then(unwrap);

export const validarIdentidad = (documento, fechaExpedicion) =>
  apiFetch('/api/v1/registro/validar-identidad', { method: 'POST', body: JSON.stringify({ documento, fechaExpedicion }) }).then(unwrap);

export const getDashboard = () =>
  apiFetch('/api/v1/cuentas/dashboard').then(unwrap).then(d => d.cuentas ?? d);


export const retirar = (idCuenta, monto) =>
  apiFetch('/api/v1/transacciones/retirar', { method: 'POST', body: JSON.stringify({ idCuenta, monto }) }).then(unwrap);

export const transferir = (idCuentaOrigen, numeroCuentaDestino, monto) =>
  apiFetch('/api/v1/transacciones/transferir', { method: 'POST', body: JSON.stringify({ idCuentaOrigen, numeroCuentaDestino, monto }) }).then(unwrap);

export const transferirMismoBanco = (idCuentaOrigen, numeroCuentaOrigen, numeroCuentaDestino, monto) =>
  apiFetch('/api/v1/transacciones/transferencia', {
    method: 'POST',
    body: JSON.stringify({ idCuentaOrigen, numeroCuentaOrigen, numeroCuentaDestino, monto }),
  }).then(unwrap);

export const getMovimientos = (idCuenta) =>
  apiFetch(`/api/v1/transacciones/cuenta/${idCuenta}`).then(unwrap);

export const registrarDepositoPendiente = (numeroCuenta, monto, referenciaGateway) =>
  apiFetch('/api/v1/transacciones/deposito-pendiente', {
    method: 'POST',
    body: JSON.stringify({ numeroCuenta, monto, referenciaGateway }),
  }).then(unwrap);

export const consultarDepositoPendiente = (referencia) =>
  apiFetch(`/api/v1/transacciones/deposito-pendiente/${referencia}`).then(unwrap);

export const getMovimientosFiltro = (idCuenta, desde, hasta) =>
  apiFetch(`/api/v1/transacciones/cuenta/${idCuenta}/filtro?fechaInicio=${desde}&fechaFin=${hasta}`).then(unwrap);

export const bloquearCuenta = (password) =>
  apiFetch('/api/v1/cuentas/seguridad/bloquear', { method: 'POST', body: JSON.stringify({ password }) }).then(async r => {
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw Object.assign(new Error(j.mensaje || 'Error'), { status: r.status }); }
    return r.text();
  });

export const desbloquearCuenta = (password) =>
  apiFetch('/api/v1/cuentas/seguridad/desbloquear', { method: 'POST', body: JSON.stringify({ password }) }).then(async r => {
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw Object.assign(new Error(j.mensaje || 'Error'), { status: r.status }); }
    return r.text();
  });

export const cerrarCuenta = (idCuenta, contrasena) =>
  apiFetch('/api/v1/cuentas/cerrar', { method: 'PATCH', body: JSON.stringify({ idCuenta, contrasena }) }).then(unwrap);

export const actualizarCliente = (email, telefono) =>
  apiFetch('/api/v1/clientes/me', { method: 'PUT', body: JSON.stringify({ email, telefono }) }).then(unwrap);

export const generarTokenRetiro = (idCuenta, monto) =>
  apiFetch('/api/v1/token-retiro/generar', { method: 'POST', body: JSON.stringify({ idCuenta, monto }) }).then(unwrap);

export const consultarTokenRetiro = (codigo) =>
  apiFetch(`/api/v1/token-retiro/${codigo}`).then(unwrap);
