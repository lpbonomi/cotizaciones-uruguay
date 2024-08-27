import { getSoapClient } from './soapClient.js';

const groups = {
    'INTERNATIONAL': 1,
    'LOCAL': 2,
    'LOCAL_RATES': 5,
    'ALL': 0
}

type Group = keyof typeof groups;

interface WsMonedasOutLinea {
    Codigo: number;
    Nombre: string;
}

export async function obtenerMonedas(group: Group = 'ALL') {
    const client = await getSoapClient('awsbcumonedas');

    const [result] = await client.ExecuteAsync({ Entrada: { Grupo: groups[group] } });

    return result.Salida['wsmonedasout.Linea'] as WsMonedasOutLinea[]
}
