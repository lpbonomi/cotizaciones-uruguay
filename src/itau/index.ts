import { JSDOM } from "jsdom";
import { z } from "zod";

const CotizacionSchema = z.object({
  moneda: z.string(),
  compra: z.coerce
    .string()
    .transform((val) => parseFloat(val.replace(",", "."))),
  venta: z.coerce
    .string()
    .transform((val) => parseFloat(val.replace(",", "."))),
});

const dateSchema = z
  .string()
  .regex(/^\d{14}$/)
  .transform((date) => {
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    const hour = date.slice(8, 10);
    const minute = date.slice(10, 12);
    const second = date.slice(12, 14);

    // The timestamp provided by Itaú corresponds to local time in Uruguay (UTC
    // -03). By appending the fixed offset to the ISO string we ensure the
    // generated Date represents the same instant regardless of the server's
    // own timezone configuration.
    return new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}-03:00`
    );
  });

const currencyMap = {
  "US.D": "usd",
  ARGP: "ars",
  CRUZ: "brl",
  "EUR ": "eur",
  URGI: "uyu",
  LINK: "link",
} as const;

type SuccessResponse = {
  success: true;
  result: {
    fecha: Date;
    cotizaciones: Record<
      (typeof currencyMap)[keyof typeof currencyMap],
      { compra: number; venta: number }
    >;
  };
};

type ErrorResponse = {
  success: false;
  error: string;
};

type Response = SuccessResponse | ErrorResponse;

/**
 * Obtiene las cotizaciones de monedas desde Itaú
 *
 * @warning Esta no es una API oficial de Itaú y está sujeta a cambios sin previo aviso
 */
export async function obtenerCotizaciones(): Promise<Response> {
  try {
    const response = await fetch("https://www.itau.com.uy/inst/aci/cotiz.xml");
    if (!response.ok) {
      return {
        success: false,
        error: `Error al obtener datos: ${response.status} ${response.statusText}`,
      };
    }

    const xml = await response.text();
    const dom = new JSDOM(xml);
    const parser = new dom.window.DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const root = doc.documentElement;
    const fecha = root.querySelector("fecha");
    const cotizaciones = root.querySelectorAll("cotizacion");

    let cotizacionesObject: SuccessResponse["result"]["cotizaciones"];
    try {
      cotizacionesObject = Array.from(cotizaciones).reduce(
        (acc, cotizacion) => {
          const moneda = cotizacion.querySelector("moneda")?.textContent;
          const compra = cotizacion.querySelector("compra")?.textContent;
          const venta = cotizacion.querySelector("venta")?.textContent;

          if (moneda && compra && venta) {
            const validated = CotizacionSchema.parse({ moneda, compra, venta });
            acc[currencyMap[moneda as keyof typeof currencyMap]] = {
              compra: validated.compra,
              venta: validated.venta,
            };
          }

          return acc;
        },
        {} as SuccessResponse["result"]["cotizaciones"]
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }

    const dateStr = fecha?.textContent;
    if (!dateStr) {
      return {
        success: false,
        error: "Fecha no encontrada en la respuesta",
      };
    }

    const date = dateSchema.safeParse(dateStr);

    if (!date.success) {
      return {
        success: false,
        error: "Fecha no válida en la respuesta",
      };
    }

    return {
      success: true,
      result: {
        fecha: date.data,
        cotizaciones: cotizacionesObject,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al procesar la respuesta",
    };
  }
}
