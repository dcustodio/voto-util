import { useState, ChangeEvent } from "react";
import "./App.css";
import { Select, SelectItem } from "@nextui-org/react";
import { Card, CardHeader, CardBody, Divider } from "@nextui-org/react";
import { Chip } from "@nextui-org/react";
import { Checkbox } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { Slider } from "@nextui-org/react";
import cities from "./files/cidades.json";
import partidos from "./files/partidos.json";
import baseline from "./files/baseline.json";

import type { Party, City } from "./types";
import { getVotesByParty, calcNumElectedDeputeesByParty } from "./utils";

const PARTIES = Object.keys(partidos) as Array<Party>;

function App() {
  const [city, setCity] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState(false);
  const [missingVotes, setMissingVotes] = useState(0);
  const [cityPartyVotes, setCityPartyVotes] = useState<{
    [party: string]: number;
  }>({});
  const [partyDeputees, setPartyDeputees] = useState<{
    [party: string]: number;
  }>({});

  const DENOMINATORS = city
    ? Math.round(cities[city as City].deputados / 2) + 1
    : 0;
  const cityVoters = city ? cities[city as City].eleitores : 0;
  const cityDeputees = city ? cities[city as City].deputados : 0;

  const tableColumns = [
    {
      key: "partido",
      label: "Partido",
    },
    {
      key: "deputados",
      label: "Deputados",
    },
    ...Array(DENOMINATORS)
      .fill(0)
      .map((_v, i) => ({ key: `th-${i + 1}`, label: `/${i + 1}` })),
  ];

  const handleOnCitySelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value as City;

    setCity(selectedCity);

    const cityBaseline = PARTIES.reduce((acc, party) => {
      if (!baseline[party] || baseline[party] === 0) return acc;

      return {
        ...acc,
        [party]: Math.round(baseline[party] * cities[selectedCity].eleitores),
      };
    }, {});

    setCityPartyVotes(cityBaseline);

    const votesByParty = getVotesByParty(cityBaseline, {
      deputees: cities[selectedCity].deputados,
    });

    const deputees = calcNumElectedDeputeesByParty(votesByParty);
    console.log(deputees);
    setPartyDeputees(deputees);
  };

  const handlePartyVoteChange = (party: string, value: number) => {
    const newDistribution = {
      ...cityPartyVotes,
      [party]: Math.round(value * cityVoters),
    };

    const totalVotes = PARTIES.reduce((accVotes, currParty) => {
      if (newDistribution[currParty as Party]) {
        return accVotes + newDistribution[currParty];
      }

      return accVotes;
    }, 0);

    setMissingVotes(100 - Math.round((totalVotes * 100) / cityVoters));
    debugger; // eslint-disable-line

    if (totalVotes > cityVoters) {
      setError(true);
    } else if (error) {
      setError(false);
    }

    setCityPartyVotes(newDistribution);

    const votesByParty = getVotesByParty(newDistribution, {
      deputees: cityDeputees,
    });

    const deputees = calcNumElectedDeputeesByParty(votesByParty);
    setPartyDeputees(deputees);
  };

  const printPartyVotes = (
    city: string,
    party: string,
    denominator: number
  ) => {
    if (!city) return "";

    const votes = Math.round(cityPartyVotes[party as Party] / denominator);

    if (denominator <= partyDeputees[party])
      return <Chip color="success">{votes}</Chip>;
    return <>`${votes}`</>;
  };

  const handleToggleShowAllParties = () => {
    setShowAll(!showAll);
  };

  const getVoteTableCells = (party: Party) => (
    <>
      {...Array(DENOMINATORS)
        .fill(0)
        .map((_v, i) => (
          <TableCell className="items-start">
            {printPartyVotes(city, party, i + 1)}
          </TableCell>
        ))}
    </>
  );

  return (
    <>
      <h1 className="text-xl mb-4">Voto Util</h1>
      <main className="relative container mx-auto">
        <div className="grid grid-cols-12 gap-4 content-center	">
          <div className="col-span-2">
            <Card>
              <CardHeader className="bg-stone-100	">
                <div className="flex flex-col">
                  <h2>Partidos</h2>
                  <span>
                    <Checkbox
                      size="sm"
                      onChange={handleToggleShowAllParties}
                      isSelected={showAll}
                    >
                      mostrar todos
                    </Checkbox>
                  </span>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <p
                  className={`font-semibold text-xs mb-4 ${
                    error ? "text-red-500" : "text-black"
                  }`}
                >
                  Votos por atribuir: {missingVotes}%
                </p>
                <ul>
                  {Object.keys(partidos)
                    .filter((party) => {
                      if (showAll) return party;

                      return baseline[party as Party] > 0;
                    })
                    .map((party) => (
                      <>
                        <li>{party}</li>
                        <Slider
                          isDisabled={!city}
                          color={error ? "danger" : "primary"}
                          size="sm"
                          label="%"
                          maxValue={0.7}
                          showTooltip
                          showOutline
                          defaultValue={baseline[party as Party]}
                          formatOptions={{ style: "percent" }}
                          step={0.01}
                          marks={[
                            {
                              value: 0.1,
                              label: "10%",
                            },
                            {
                              value: 0.5,
                              label: "50%",
                            },
                          ]}
                          className="max-w-md"
                          onChange={(value) => {
                            return handlePartyVoteChange(
                              party,
                              value as number
                            );
                          }}
                        />
                      </>
                    ))}
                </ul>
              </CardBody>
            </Card>
          </div>
          <div className="col-span-10 ">
            <div className="flex flex-col grow mx-auto">
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
                      textValue={
                        cidade.charAt(0).toUpperCase() + cidade.slice(1)
                      }
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
              {city && DENOMINATORS && (
                <div>
                  <Table>
                    <TableHeader columns={tableColumns}>
                      {(column) => (
                        <TableColumn key={column.key} align="end">
                          {column.label}
                        </TableColumn>
                      )}
                    </TableHeader>

                    <TableBody>
                      {PARTIES.filter((party) => {
                        if (showAll) return party;
                        // filter small parties out
                        return baseline[party as Party] > 0;
                      })

                        .sort((partyA, partyB) => {
                          const b = partyDeputees[partyB] ?? 0;
                          const a = partyDeputees[partyA] ?? 0;

                          return b - a;
                        })
                        .map((party) => (
                          <TableRow key={party}>
                            <TableCell>{party}</TableCell>
                            <TableCell>
                              {partyDeputees[party as Party] ?? 0}
                            </TableCell>
                            {getVoteTableCells(party)}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="my-4">
                <Card className="py-2">
                  <CardHeader className="px-4   items-start flex-gap-1">
                    <p className="text-tiny uppercase font-bold">
                      Método D'Hondt
                    </p>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <p>
                      Segundo a{" "}
                      <a
                        href="https://pt.wikipedia.org/wiki/M%C3%A9todo_D%27Hondt"
                        target="_blank"
                        className="underline decoration-2 decoration-sky-500 hover:decoration-green-400"
                      >
                        Wikipédia
                      </a>{" "}
                      o Método D'Hondt consiste numa fórmula matemática, ou
                      algoritmo, destinada a calcular a distribuição dos
                      mandatos pelas listas concorrentes, em que cada mandato é
                      sucessivamente alocado à lista cujo número total de votos
                      dividido pelos números inteiros sucessivos, começando na
                      unidade (isto é no número 1) seja maior. O processo de
                      divisão prossegue até se esgotarem todos os mandatos e
                      todas as possibilidades de aparecerem quocientes iguais
                      aos quais ainda caiba um mandato.
                    </p>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
