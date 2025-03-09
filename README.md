# Cotizaciones Uruguay

Una biblioteca para TypeScript/JavaScript que proporciona acceso a tipos de cambio de diferentes proveedores en Uruguay, incluyendo el [Banco Central del Uruguay](http://www.bcu.gub.uy/) y otros bancos.

> **DISCLAIMER**: Esta biblioteca no está afiliada oficialmente con ninguna de las instituciones financieras mencionadas. Los datos se obtienen de fuentes públicas y pueden estar sujetos a cambios sin previo aviso.

## Proveedores Soportados

### Banco Central del Uruguay (BCU)

Los WebServices utilizados son
[awsultimocierre](https://cotizaciones.bcu.gub.uy/wscotizaciones/servlet/awsultimocierre?wsdl),
[awsbcumonedas](https://cotizaciones.bcu.gub.uy/wscotizaciones/servlet/awsbcumonedas?wsdl) y
[awsbcucotizaciones](https://cotizaciones.bcu.gub.uy/wscotizaciones/servlet/awsbcucotizaciones?wsdl).

La documentación oficial de los WebServices [se puede encontrar aquí](https://www.bcu.gub.uy/Acerca-de-BCU/RD_Solicitudes_Informacion/Documentaci%C3%B3n-Agregada/PedroScheeffer169.pdf).

### Banco Itaú

El adaptador también soporta obtener cotizaciones del Banco Itaú mediante un documento XML que se puede obtener desde [su sitio web](https://www.itau.com.uy/inst/aci/cotiz.xml).

## Instalación

```bash
bun install cotizaciones-uruguay
```

O usando npm:

```bash
npm install cotizaciones-uruguay
```

## Uso

La biblioteca proporciona acceso a diferentes proveedores a través de espacios de nombres (namespaces).

```typescript
import { bcu, itau } from "cotizaciones-uruguay";
```

### BCU (Banco Central del Uruguay)

#### obtenerUltimoCierre

Obtiene la última fecha de cierre del servicio SOAP del BCU.

```typescript
const fechaUltimoCierre = await bcu.obtenerUltimoCierre();
```

**Retorna**: Una cadena que representa la última fecha de cierre en formato 'YYYY-MM-DD'.

**Ejemplo**:

```typescript
const fecha = await bcu.obtenerUltimoCierre();
console.log(fecha); // Salida: '2023-04-15'
```

#### obtenerMonedas

Obtiene datos de monedas del servicio SOAP del BCU.

```typescript
const monedas = await bcu.obtenerMonedas("INTERNATIONAL");
```

**Parámetros**:

- `group` (opcional): Grupo de monedas a obtener
  - `'INTERNATIONAL'`: Monedas internacionales
  - `'LOCAL'`: Monedas locales
  - `'LOCAL_RATES'`: Tasas locales
  - `'ALL'`: Todas las monedas (por defecto)

**Retorna**: Array de objetos `WsMonedasOutLinea` que contienen información de las monedas:

- `Codigo`: Código de la moneda
- `Nombre`: Nombre de la moneda

**Ejemplo de Respuesta**:

```typescript
[
  { Codigo: 2225, Nombre: "DOLAR USA BILLETE" },
  { Codigo: 1111, Nombre: "EURO" },
  // ...
];
```

#### obtenerCotizaciones

Obtiene datos de tipos de cambio del servicio SOAP del BCU.

```typescript
const cotizaciones = await bcu.obtenerCotizaciones({
  Moneda: [{ item: 2225 }], // 2225 es el código para USD
  Grupo: 0, // 0 es el código para todas las monedas
  FechaDesde: "2023-01-01", // Por defecto, usa la fecha del último cierre
  FechaHasta: "2023-01-31", // Por defecto, usa la fecha del último cierre
});
```

**Parámetros**:

- `params` (opcional):
  - `Moneda`: Array de códigos de moneda
  - `Grupo`: Número de grupo (0-3)
  - `FechaDesde`: Fecha de inicio (AAAA-MM-DD)
  - `FechaHasta`: Fecha de fin (AAAA-MM-DD)

Si no se proporcionan fechas, se utiliza la fecha del último cierre.

**Retorna**: Array de objetos `Result` que contienen información de tipos de cambio.

**Errores**: Lanza un error con un mensaje descriptivo si el servicio del BCU devuelve un código de error.

### Itaú

#### obtenerCotizaciones

Obtiene los tipos de cambio actuales del Banco Itaú.

```typescript
const cotizaciones = await itau.obtenerCotizaciones();
```

**Retorna**: Objeto con información de cotizaciones para diferentes monedas con sus valores de compra y venta.

**Ejemplo de Respuesta**:

```typescript
{
  success: true,
  result: {
    fecha: "2023-04-15",
    cotizaciones: {
      USD: { compra: 38.50, venta: 40.20 },
      EUR: { compra: 41.80, venta: 43.60 },
      // Otras monedas disponibles...
    }
  }
}
```

Si ocurre un error, se retorna un objeto con `success: false` y un mensaje de error:

```typescript
{
  success: false,
  error: "Error al obtener datos: 404 Not Found"
}
```

> **Nota**: Los datos proporcionados por esta biblioteca se obtienen directamente de los servicios de los bancos correspondientes y están sujetos a cambios según las políticas de cada institución. Esta biblioteca no garantiza la precisión o disponibilidad continua de los datos.
