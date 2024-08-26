import { getSoapClient } from './soapClient';
import { obtenerUltimoCierre } from './ultimoCierre';

interface WsBcuCotizacionesIn {
    Moneda: Array<{
        item: number;
    }>;
    FechaDesde: string;
    FechaHasta: string;
    Grupo: 0 | 1 | 2 | 3;
}

interface Result {
    Fecha: string | null;
    Moneda: number;
    Nombre: string;
    CodigoISO: string;
    Emisor: string;
    TCC: number;
    TCV: number;
    ArbAct: number;
    FormaArbitrar: number;
}

export async function obtenerCotizaciones({
    Moneda = [{ item: 2225 }],
    Grupo = 0,
    ...restOfParams
}: Partial<WsBcuCotizacionesIn>) {
    const client = await getSoapClient('awsbcucotizaciones');

    const ultimoCierre = await obtenerUltimoCierre();

    const [result] = await client.ExecuteAsync({
        Entrada: {
            Moneda,
            Grupo,
            FechaDesde: restOfParams.FechaDesde || ultimoCierre,
            FechaHasta: restOfParams.FechaHasta || ultimoCierre,
        }
    });

    handleError(result);

    return result.Salida.datoscotizaciones['datoscotizaciones.dato'] as Result[];
}

const errorCodes = {
    100: 'NO_EXCHANGE_RATE_EXISTS_FOR_THE_SPECIFIED_DATE',
    101: 'CURRENCY_CODE_DOES_NOT_EXIST',
    102: 'INVALID_DATE_FIELD',
    103: 'END_DATE_IS_EARLIER_THAN_START_DATE',
    104: 'DATE_RANGE_EXCEEDS_THE_ALLOWED_LIMIT',
    105: 'GROUP_DOES_NOT_EXIST_OR_IS_DISABLED',
    106: 'SERVICE_UNAVAILABLE_DUE_TO_DATA_UPDATE',
    107: 'SERVICE_UNAVAILABLE'
} as const;

type ErrorCode = keyof typeof errorCodes;
export type ErrorMessage = typeof errorCodes[ErrorCode];

function handleError(result: any) {
    const status = result.Salida.respuestastatus;
    console.log(status);
    if (status.codigoerror === 0) {
        return
    }

    const errorCode = status.codigoerror;
    const errorMessage = errorCodes[errorCode as keyof typeof errorCodes] || 'UNKNOWN_ERROR';
    throw new Error(errorMessage);
}