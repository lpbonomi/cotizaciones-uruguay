# Adaptador de WebServices del BCU para TypeScript

Una herramienta inspirada fuertemente en [biller/bcu](https://github.com/biller/bcu) para obtener tipos de cambio oficiales para varias monedas extraídos de los WebServices del [Banco Central del Uruguay](http://www.bcu.gub.uy/).

Los WebServices utilizados son
[awsultimocierre](https://cotizaciones.bcu.gub.uy/wscotizaciones/servlet/awsultimocierre?wsdl),
[awsbcumonedas](https://cotizaciones.bcu.gub.uy/wscotizaciones/servlet/awsbcumonedas?wsdl) y
[awsbcucotizaciones](https://cotizaciones.bcu.gub.uy/wscotizaciones/servlet/awsbcucotizaciones?wsdl).

La documentación oficial de los WebServices [se puede encontrar aquí](https://www.bcu.gub.uy/Acerca-de-BCU/RD_Solicitudes_Informacion/Documentaci%C3%B3n-Agregada/PedroScheeffer169.pdf).

## Instalación

```bash
bun install cotizaciones-bcu
```

## Uso

### obtenerUltimoCierre

Obtiene la última fecha de cierre del servicio SOAP del BCU (Banco Central del Uruguay), con caché opcional.

#### Uso

typescript
import { obtenerUltimoCierre } from './src/ultimoCierre';
const fechaUltimoCierre = await obtenerUltimoCierre();

#### Parámetros

- `cache` (opcional): Booleano para habilitar/deshabilitar el caché (por defecto: `true`)

#### Retorna

Una cadena que representa la última fecha de cierre en formato 'YYYY-MM-DD'.

#### Caché

Cuando el caché está habilitado:

- Verifica la base de datos local para una fecha en caché
- Si se encuentra y es válida (dentro de los últimos 30 minutos), devuelve la fecha en caché
- De lo contrario, obtiene del servicio SOAP y actualiza el caché

#### Ejemplo

typescript
const fecha = await obtenerUltimoCierre(false); // Deshabilitar caché
console.log(fecha); // Salida: '2023-04-15'

### obtenerMonedas

Obtiene datos de monedas del servicio SOAP del BCU (Banco Central del Uruguay).

#### Uso

```typescript
import { obtenerMonedas } from "./src/monedas";
const monedas = await obtenerMonedas("INTERNATIONAL");
```

#### Parámetros

- `group` (opcional): Grupo de monedas a obtener
  - `'INTERNATIONAL'`: Monedas internacionales
  - `'LOCAL'`: Monedas locales
  - `'LOCAL_RATES'`: Tasas locales
  - `'ALL'`: Todas las monedas (por defecto)

#### Retorna

Array de objetos `WsMonedasOutLinea` que contienen información de las monedas:

- `Codigo`: Código de la moneda
- `Nombre`: Nombre de la moneda

#### Ejemplo de Respuesta

```typescript
[
  { Codigo: 2225, Nombre: "DOLAR USA BILLETE" },
  { Codigo: 1111, Nombre: "EURO" },
  // ...
];
```

Esta sección proporciona una breve descripción general de la función `obtenerMonedas`, su uso, parámetros, valor de retorno y un ejemplo de la estructura de respuesta, lo cual debería ser útil para los usuarios de tu biblioteca.

### obtenerCotizaciones

Obtiene datos de tipos de cambio del servicio SOAP del BCU (Banco Central del Uruguay).

#### Uso

```typescript
import { obtenerCotizaciones } from "./src/cotizaciones";
const cotizaciones = await obtenerCotizaciones({
  Moneda: [{ item: 2225 }], // 2225 es el código para USD
  Grupo: 0, // 0 es el código para todas las monedas
  FechaDesde: "2023-01-01", // Por defecto, usa la fecha del último cierre
  FechaHasta: "2023-01-31", // Por defecto, usa la fecha del último cierre
});
```

#### Parámetros

- `params` (opcional):
  - `Moneda`: Array de códigos de moneda
  - `Grupo`: Número de grupo (0-3)
  - `FechaDesde`: Fecha de inicio (AAAA-MM-DD)
  - `FechaHasta`: Fecha de fin (AAAA-MM-DD)

Si no se proporcionan fechas, se utiliza la fecha del último cierre.

#### Retorna

Array de objetos `Result` que contienen información de tipos de cambio.

#### Errores

Lanza un error con un mensaje descriptivo si el servicio del BCU devuelve un código de error.
