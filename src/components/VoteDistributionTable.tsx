import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
} from "@nextui-org/react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../hooks/useStore";
import partidos from "../files/partidos.json";
import type { Party } from "../types";

const PARTIES = Object.keys(partidos) as Array<Party>;
type Props = {
  showAll: boolean;
  partyVotes: { [party: string]: number };
  partyDeputees: { [party: string]: number };
};

type Row = { [key: string]: string | number };

export const VoteDistributionTable = ({
  showAll,
  partyVotes,
  partyDeputees,
}: Props) => {
  const { city, denominators } = useStore(
    useShallow((state) => ({
      city: state.city,
      denominators: state.denominators,
    }))
  );

  const renderCell = (item: Row, columnKey: string) => {
    if (columnKey.startsWith("th")) {
      const denominator = Number(columnKey.split("-")[1]);

      const votes = Math.round(partyVotes[item.partido as Party] / denominator);

      if (denominator <= partyDeputees[item.partido as Party]) {
        return <Chip color="success">{votes}</Chip>;
      }
    }
    const cellValue = item[columnKey];

    return cellValue;
  };

  if (!city) {
    return (
      <Table aria-label="empty table">
        <TableHeader>
          <TableColumn>Partido</TableColumn>
          <TableColumn>Deputados</TableColumn>
        </TableHeader>
        <TableBody emptyContent={"Escolha um circulo eleitoral."}>
          {[]}
        </TableBody>
      </Table>
    );
  }

  const tableColumns = [
    {
      key: "partido",
      label: "Partido",
    },
    {
      key: "deputados",
      label: "Deputados",
    },
    ...Array(denominators)
      .fill(0)
      .map((_v, i) => ({ key: `th-${i + 1}`, label: `/${i + 1}` })),
  ];

  const getTablerows = () => {
    return PARTIES.filter((party) => {
      if (showAll) return party;
      // filter small parties out
      return partyVotes[party as Party] > 0;
    })
      .sort((partyA, partyB) => {
        const b = partyVotes[partyB] ?? 0;
        const a = partyVotes[partyA] ?? 0;

        return b - a;
      })
      .map((party, index) => {
        const partyRow: Row = {
          key: index,
          partido: party,
          deputados: partyDeputees[party],
        };

        Array(denominators)
          .fill(0)
          .forEach((_e, i) => {
            partyRow[`th-${i + 1}`] = Math.round(
              partyVotes[party as Party] / (i + 1)
            );
          });

        return partyRow;
      });
  };

  const rows = getTablerows();

  return (
    <Table>
      <TableHeader columns={tableColumns}>
        {(column) => (
          <TableColumn key={column.key} align="end">
            {column.label}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody items={rows}>
        {(item) => (
          <TableRow key={item.key}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey as string)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
