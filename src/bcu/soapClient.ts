import { createClientAsync } from 'soap';

type WebService = 'awsultimocierre' | 'awsbcumonedas' | 'awsbcucotizaciones'

export async function getSoapClient(ws: WebService) {
    return await createClientAsync(`https://cotizaciones.bcu.gub.uy/wscotizaciones/servlet/${ws}?wsdl`);
}