const API_URL = import.meta.env.VITE_API_URL;

let refreshing = null;
let _onSessionExpired = null;
export const setSessionExpiredHandler = (fn) => { _onSessionExpired = fn; };

async function apiFetch(path, options = {}) {
  const { headers = {}, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
    ...rest,
  });

  if (res.status === 401 && path !== '/api/v1/auth/refresh') {
    if (!refreshing) {
      refreshing = fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      }).finally(() => {
        refreshing = null;
      });
    }

    const r = await refreshing;

    if (r.ok) {
      return fetch(`${API_URL}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        credentials: 'include',
        ...rest,
      });
    }

    _onSessionExpired?.();
    throw Object.assign(new Error('Sesión expirada'), { status: 401 });
  }

  return res;
}

async function unwrap(res) {
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw Object.assign(new Error(json.mensaje || 'Error inesperado'), {
      status: res.status,
      data: json,
    });
  }

  return json;
}

// Desenvuelve Spring HATEOAS CollectionModel → array plano.
// Si ya es array lo devuelve sin cambios.
// Si no hay _embedded (colección vacía) devuelve [].
function unwrapCollection(json) {
  if (Array.isArray(json)) return json;
  if (json?._embedded) {
    const vals = Object.values(json._embedded);
    if (vals.length > 0 && Array.isArray(vals[0])) {
      return vals[0].map(({ _links, ...data }) => data);
    }
  }
  return [];
}

export const login = (username, password) =>
  apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }).then(unwrap);

export const logout = () =>
  apiFetch('/api/v1/auth/logout', {
    method: 'POST',
  }).then(r => r.ok);

export const registrar = (data) =>
  apiFetch('/api/v1/registro', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(unwrap);

export const validarIdentidad = (documento, fechaExpedicion) =>
  apiFetch('/api/v1/registro/validar-identidad', {
    method: 'POST',
    body: JSON.stringify({ documento, fechaExpedicion }),
  }).then(unwrap);

export const getDashboard = () =>
  apiFetch('/api/v1/cuentas/dashboard')
    .then(unwrap)
    .then(d => {
      const cuentas = d.cuentas ?? d;
      if (!Array.isArray(cuentas)) return cuentas;
      const clientName = d.mensajeBienvenida?.match(/Bienvenido,\s*([^.]+)\./)?.[1]?.trim() ?? null;
      if (!clientName) return cuentas;
      return cuentas.map(c => ({ ...c, nombreCliente: c.nombreCliente ?? clientName }));
    });

export const transferir = (idCuentaOrigen, numeroCuentaDestino, monto) =>
  apiFetch('/api/v1/transacciones/transferir', {
    method: 'POST',
    body: JSON.stringify({ idCuentaOrigen, numeroCuentaDestino, monto }),
  }).then(unwrap);

export const transferirMismoBanco = (idCuentaOrigen, numeroCuentaOrigen, numeroCuentaDestino, monto) =>
  apiFetch('/api/v1/transacciones/transferir', {
    method: 'POST',
    body: JSON.stringify({ idCuentaOrigen, numeroCuentaDestino, monto }),
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
  apiFetch('/api/v1/cuentas/seguridad/bloquear', {
    method: 'POST',
    body: JSON.stringify({ password }),
  }).then(async r => {
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw Object.assign(new Error(j.mensaje || 'Error'), { status: r.status });
    }
    return r.text();
  });

export const desbloquearCuenta = (password) =>
  apiFetch('/api/v1/cuentas/seguridad/desbloquear', {
    method: 'POST',
    body: JSON.stringify({ password }),
  }).then(async r => {
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw Object.assign(new Error(j.mensaje || 'Error'), { status: r.status });
    }
    return r.text();
  });

export const cerrarCuenta = (idCuenta, contrasena) =>
  apiFetch('/api/v1/cuentas/cerrar', {
    method: 'PATCH',
    body: JSON.stringify({ idCuenta, contrasena }),
  }).then(unwrap);

export const actualizarCliente = (email, telefono) =>
  apiFetch('/api/v1/clientes/me', {
    method: 'PUT',
    body: JSON.stringify({ email, telefono }),
  }).then(unwrap);

export const iniciarTransferenciaInterbancaria = (data) =>
  apiFetch('/api/v1/transferencias/interbancarias', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(unwrap);

export const consultarTransferenciaACH = (idTransaccion) =>
  apiFetch(`/api/v1/transferencias/interbancarias/${idTransaccion}`).then(unwrap);

export const generarTokenRetiro = (idCuenta, monto) =>
  apiFetch('/api/v1/token-retiro/generar', {
    method: 'POST',
    body: JSON.stringify({ idCuenta, monto }),
  }).then(unwrap);

export const consultarTokenRetiro = (codigo) =>
  apiFetch(`/api/v1/token-retiro/${codigo}`).then(unwrap);

export const descargarExtracto = (idCuenta, anio, mes) =>
  apiFetch(`/api/v1/extractos/${idCuenta}/${anio}/${mes}`);

// ── Admin role detection ──────────────────────────────────────────────────
const getMiRol = () =>
  apiFetch('/api/v1/clientes/me/rol').then(unwrap).catch(() => ({ rol: 'CLIENTE' }));

export const isAdmin = () =>
  getMiRol().then(d => d.rol === 'ADMIN').catch(() => false);

export const isGerente = () =>
  getMiRol().then(d => d.rol === 'GERENTE').catch(() => false);

// ── HU-16: Admin Cuentas ──────────────────────────────────────────────────
export const getSolicitudesPendientes = () =>
  apiFetch('/api/v1/admin/cuentas/pendientes').then(unwrap).then(unwrapCollection);

export const aprobarCuenta = (id) =>
  apiFetch(`/api/v1/admin/cuentas/${id}/aprobar`, { method: 'PATCH' }).then(unwrap);

export const rechazarCuenta = (id) =>
  apiFetch(`/api/v1/admin/cuentas/${id}/rechazar`, { method: 'PATCH' }).then(unwrap);

// ── Reportes Maestros ────────────────────────────────────────────────────
export const getReporteMaestro = (inicio, fin) =>
  apiFetch(`/api/v1/reportes?inicio=${encodeURIComponent(inicio)}&fin=${encodeURIComponent(fin)}`).then(unwrap);

export const exportarReporteCSV = (inicio, fin) =>
  apiFetch(`/api/v1/reportes/csv?inicio=${encodeURIComponent(inicio)}&fin=${encodeURIComponent(fin)}`);

// ── HU-17: Saldos Consolidados ────────────────────────────────────────────
export const getConsolidadoSaldos = () =>
  apiFetch('/api/v1/reportes/saldos/consolidado').then(unwrap);

export const getSaldosPorEstado = (estado) =>
  apiFetch(`/api/v1/reportes/saldos/estado?estado=${estado}`).then(unwrap).then(unwrapCollection);

export const getSaldosPorRango = (min, max) => {
  const q = max != null ? `min=${min}&max=${max}` : `min=${min}`;
  return apiFetch(`/api/v1/reportes/saldos/rango?${q}`).then(unwrap).then(unwrapCollection);
};

export const getSaldosTiempoReal = () =>
  apiFetch('/api/v1/reportes/saldos/tiempo-real').then(unwrap).then(unwrapCollection);

// ── HU-18: Actividad por Cliente ──────────────────────────────────────────
export const buscarActividadPorDocumento = (documento, fechaInicio, fechaFin, tipo) => {
  const p = new URLSearchParams({ documento });
  if (fechaInicio) p.append('fechaInicio', fechaInicio);
  if (fechaFin)    p.append('fechaFin', fechaFin);
  if (tipo && tipo !== 'TODOS') p.append('tipo', tipo);
  return apiFetch(`/api/v1/admin/clientes/buscar/documento?${p}`).then(unwrap);
};

export const buscarActividadPorCuenta = (numeroCuenta, fechaInicio, fechaFin, tipo) => {
  const p = new URLSearchParams({ numeroCuenta });
  if (fechaInicio) p.append('fechaInicio', fechaInicio);
  if (fechaFin)    p.append('fechaFin', fechaFin);
  if (tipo && tipo !== 'TODOS') p.append('tipo', tipo);
  return apiFetch(`/api/v1/admin/clientes/buscar/cuenta?${p}`).then(unwrap);
};

// ── HU-18 Escenario 4: Log de Auditoría desde BD ─────────────────────────────
export const getAuditoriaLog = () =>
  apiFetch('/api/v1/admin/auditoria').then(unwrap).then(unwrapCollection);