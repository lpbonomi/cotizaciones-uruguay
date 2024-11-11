import { getSoapClient } from "./soapClient.js";

export async function obtenerUltimoCierre() {
  const client = await getSoapClient("awsultimocierre");
  const [result] = await client.ExecuteAsync({});

  // Format the date to YYYY-MM-DD
  const date = new Date(result.Salida.Fecha).toISOString().split("T")[0];

  return date;
}
