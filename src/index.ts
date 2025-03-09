import { obtenerUltimoCierre } from "./bcu/ultimoCierre.js";
import { obtenerMonedas } from "./bcu/monedas.js";
import {
  obtenerCotizaciones as obtenerCotizacionesBcu,
  type BcuErrorMessage,
} from "./bcu/cotizaciones.js";

import { obtenerCotizaciones as obtenerCotizacionesItau } from "./itau/index.js";

export type { BcuErrorMessage };

export const bcu = {
  obtenerUltimoCierre,
  obtenerMonedas,
  obtenerCotizaciones: obtenerCotizacionesBcu,
};

export const itau = {
  obtenerCotizaciones: obtenerCotizacionesItau,
};
