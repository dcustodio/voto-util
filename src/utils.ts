import type { Party } from "../src/types";

/**
 * Divides votes by quotients
 * @param voteDistribution -  { "A": 12000, "B": 3000 }
 * @param seats - total number of seats to be allocated for the district/constituency
 * @returns votes per party divided by quotients e.g.: [[{ party: 'A', votes: 12000} , { party: 'A', votes: 6000 }],[{ party: B', votes: 9000},{ party: 'B', votes: 4500}]]
 */
export const hondtVoteDistribution = (
  voteDistribution: {
    [party: string]: number;
  },
  seats: number
) => {
  const parties = Object.keys(voteDistribution) as Array<Party>;

  return parties.map((party: Party) => {
    const partyVotes = voteDistribution[party] ? voteDistribution[party] : 0;
    const cols = [];
    for (let i = 1; i <= seats; i++) {
      cols.push({ party, votes: Math.round(partyVotes / i) });
    }
    return cols;
  });
};

/**
 *
 * @param voteDistribution
 * @param param1
 * @returns [{ party: 'A', votes: 12000},{ party: 'B', votes: 9000}, { party: 'A', votes: 6000},{ party: 'B', votes: 4500}]
 */
export const getVotesByParty = (
  voteDistribution: {
    [party: string]: number;
  },
  { deputees }: { deputees: number }
) => {
  const hondtVotes = hondtVoteDistribution(voteDistribution, deputees);
  const seatsByParty = hondtVotes
    .flat()
    .sort((a, b) => b.votes - a.votes)
    .slice(0, deputees);

  return seatsByParty;
};

export const calcNumElectedDeputeesByParty = (
  flatDistribution: { party: Party; votes: number }[]
) => {
  return flatDistribution.reduce<{ [party: string]: number }>((acc, c) => {
    if (!acc[c.party]) {
      return { ...acc, [c.party]: 1 };
    } else {
      let dep = acc[c.party];
      return { ...acc, [c.party]: ++dep };
    }
  }, {});
};
