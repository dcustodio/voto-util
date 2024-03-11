import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Checkbox,
} from "@nextui-org/react";
import { useShallow } from "zustand/react/shallow";

import "./App.css";
import { useStore } from "./hooks/useStore";
import partidos from "./files/partidos.json";
import cities from "./files/cidades.json";

import type { Party, City } from "./types";
import { getVotesByParty, calcNumElectedDeputeesByParty } from "./utils";
import {
  InfoCard,
  SelectCity,
  Sliders,
  VoteDistributionTable,
} from "./components";

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
        <div className="grid grid-cols-12 gap-4 content-center">
          <div className="col-span-2 max-sm:col-span-12 max-sm:row-start-2">
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
          <div className="col-span-10 max-sm:col-span-12 max-sm:row-start-1 ">
            <div className="flex flex-col grow mx-auto">
              <div className="order-1 max-sm:order-2">
                <SelectCity />
              </div>
              <div className="order-2 max-sm:order-3">
                <VoteDistributionTable
                  showAll={showAll}
                  partyVotes={cityPartyVotes}
                  partyDeputees={partyDeputees}
                />
              </div>
              <div className="my-4 order-3 max-sm:order-1">
                <InfoCard />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
