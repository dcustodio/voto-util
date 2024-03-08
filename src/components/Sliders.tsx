import { Slider } from "@nextui-org/react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../hooks/useStore";
import partidos from "../files/partidos.json";
import type { Party } from "../types";

type Props = {
  showAll: boolean;
  hasError: boolean;
  onVoteUpdate: (voteDistribution: { [party: string]: number }) => void;
};

export const Sliders = ({ showAll, hasError, onVoteUpdate }: Props) => {
  const { city, percentageByParty, setPercentageByParty } = useStore(
    useShallow((state) => ({
      city: state.city,
      percentageByParty: state.percentageByParty,
      setPercentageByParty: state.setPercentageByParty,
    }))
  );
  const handlePartyVoteChange = (party: string, value: number) => {
    const newDistribution = {
      ...percentageByParty,
      [party]: value,
    };
    setPercentageByParty(newDistribution);

    onVoteUpdate(newDistribution);
  };
  return (
    <>
      {Object.keys(partidos)
        .filter((party) => {
          if (showAll) return party;

          return percentageByParty[party as Party] > 0;
        })
        .map((party) => (
          <div key={party} className="mb-4">
            <h4 className="text-tiny uppercase font-bold">{party}</h4>
            <Slider
              isDisabled={!city}
              color={hasError ? "danger" : "primary"}
              size="sm"
              label="%"
              maxValue={0.7}
              showTooltip
              showOutline
              defaultValue={percentageByParty[party as Party]}
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
                return handlePartyVoteChange(party, value as number);
              }}
            />
          </div>
        ))}
    </>
  );
};
