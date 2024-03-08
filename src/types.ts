import cities from "./files/cidades.json";
import partidos from "./files/partidos.json";

export type Party = keyof typeof partidos;
export type City = keyof typeof cities;
