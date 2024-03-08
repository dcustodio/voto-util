import { ChangeEvent } from "react";
import { Chip, Select, SelectItem } from "@nextui-org/react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../hooks/useStore";
import type { City } from "../types";
import cities from "../files/cidades.json";

export const SelectCity = () => {
  const { city, setCity } = useStore(
    useShallow((state) => ({ city: state.city, setCity: state.setCity }))
  );

  const handleOnCitySelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value as City;

    setCity(selectedCity);
  };

  return (
    <div className="flex gap-4 items-center mb-4">
      <Select
        isRequired
        label="Circulo Eleitoral"
        className="max-w-xs"
        selectedKeys={[city]}
        onChange={handleOnCitySelectionChange}
      >
        {Object.keys(cities).map((cidade) => (
          <SelectItem
            key={cidade}
            value={cidade}
            textValue={cidade.charAt(0).toUpperCase() + cidade.slice(1)}
          >
            {cidade}
          </SelectItem>
        ))}
      </Select>
      {city && (
        <Chip className="capitalize" color="primary">
          {cities[city as City].deputados} deputados
        </Chip>
      )}
    </div>
  );
};
