import { useState, useEffect } from "react";
import "./App.css";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Checkbox,
} from "@nextui-org/react";

import { useStore } from "./hooks/useStore";
import { useShallow } from "zustand/react/shallow";
import partidos from "./files/partidos.json";
import cities from "./files/cidades.json";

import type { Party, City } from "./types";
import { getVotesByParty, calcNumElectedDeputeesByParty } from "./utils";
import { SelectCity } from "./components/SelectCity";
import { Sliders } from "./components/Sliders";
import { VoteDistributionTable } from "./components/VoteDistributionTable";

const PARTIES = Object.keys(partidos) as Array<Party>;

function App() {
  const { city, percentageByParty } = useStore(
    useShallow((state) => ({
      city: state.city,
      percentageByParty: state.percentageByParty,
    }))
  );

  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState(false);
  const [missingVotes, setMissingVotes] = useState(0);
  const [cityPartyVotes, setCityPartyVotes] = useState<{
    [party: string]: number;
  }>({});
  const [partyDeputees, setPartyDeputees] = useState<{
    [party: string]: number;
  }>({});

  const cityVoters = city ? cities[city as City].eleitores : 0;
  const cityDeputees = city ? cities[city as City].deputados : 0;

  useEffect(() => {
    const partyVotes = PARTIES.reduce<{ [party: string]: number }>(
      (accVotes, currParty) => {
        return {
          ...accVotes,
          [currParty]: Math.round(percentageByParty[currParty] * cityVoters),
        };
      },
      {}
    );

    setCityPartyVotes(partyVotes);
    const votesByParty = getVotesByParty(partyVotes, {
      deputees: cityDeputees,
    });

    const deputees = calcNumElectedDeputeesByParty(votesByParty);
    setPartyDeputees(deputees);
  }, [city]);

  const handleOnVoteUpdate = (voteDistribution: {
    [party: string]: number;
  }) => {
    const totalPercentage = Object.keys(voteDistribution).reduce(
      (accVotes, currParty) => {
        if (voteDistribution[currParty]) {
          return accVotes + voteDistribution[currParty];
        }

        return accVotes;
      },
      0
    );
    if (totalPercentage > 1) {
      setError(true);
    } else if (error) {
      setError(false);
    }
    setMissingVotes(Math.round(100 - totalPercentage * 100));

    const partyVotes = PARTIES.reduce<{ [party: string]: number }>(
      (accVotes, currParty) => {
        return {
          ...accVotes,
          [currParty]: Math.round(voteDistribution[currParty] * cityVoters),
        };
      },
      {}
    );

    setCityPartyVotes(partyVotes);
    const votesByParty = getVotesByParty(partyVotes, {
      deputees: cityDeputees,
    });

    const deputees = calcNumElectedDeputeesByParty(votesByParty);
    setPartyDeputees(deputees);
  };

  const handleToggleShowAllParties = () => {
    setShowAll(!showAll);
  };

  return (
    <>
      <h1 className="text-xl mb-4">Voto Útil</h1>
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
                <Sliders
                  hasError={error}
                  showAll={showAll}
                  onVoteUpdate={handleOnVoteUpdate}
                />
              </CardBody>
            </Card>
          </div>
          <div className="col-span-10 ">
            <div className="flex flex-col grow mx-auto">
              <SelectCity />
              <VoteDistributionTable
                showAll={showAll}
                partyVotes={cityPartyVotes}
                partyDeputees={partyDeputees}
              />

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
