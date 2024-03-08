import { create } from "zustand";
import baseline from "../files/baseline.json";
import cities from "../files/cidades.json";
import type { City } from "../types";

interface State {
  city: string;
  setCity: (city: string) => void;
  denominators: number;
  percentageByParty: { [party: string]: number };
  setPercentageByParty: (percentageByParty: {
    [party: string]: number;
  }) => void;
}

export const useStore = create<State>((set) => ({
  city: "",
  denominators: 0,
  setCity: (city) => {
    const denominators = Math.round(cities[city as City].deputados / 2) + 1;
    set({ city, denominators });
  },
  percentageByParty: baseline,
  setPercentageByParty: (percentageByParty) => set({ percentageByParty }),
}));
