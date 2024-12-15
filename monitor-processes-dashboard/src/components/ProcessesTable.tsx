import { ProcessData, TableConfig } from "../hooks/useSystemQuery";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Container from "./Container";
import { getPercentage } from "../services/getPercentage";
import { getStorageUnits } from "../services/getStorageUnits";
import { TableSortLabel } from "@mui/material";

type TableHeader = {
  name: string;
  id: keyof ProcessData;
};

type ProcessesTableHeadProps = {
  tableConfig: TableConfig;
  setTableConfig: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView
  ) => void;
};

const ProcessesTableHead = ({
  tableConfig,
  setTableConfig,
}: ProcessesTableHeadProps) => {
  const TABLE_HEADERS: readonly TableHeader[] = [
    { name: "Process Path", id: "process_path" },
    { name: "PID", id: "pid" },
    { name: "CPU Usage", id: "cpu_usage" },
    { name: "Memory Usage", id: "memory" },
    { name: "Disk Usage", id: "disk_usage" },
  ];

  const createNewConfigFromSort = (
    headerId: keyof ProcessData,
    currentTableConfig: TableConfig
  ) => {
    const currentOrderBy = currentTableConfig.order_by;
    const currentOrder = currentTableConfig.order;
    const currentPage = currentTableConfig.page;

    let newTableConfig: TableConfig = {
      order_by: currentOrderBy,
      order: currentOrder,
      page: currentPage,
    };

    if (headerId === currentOrderBy) {
      if (currentOrder === "asc") {
        newTableConfig.order = "desc";
      } else {
        newTableConfig.order = "asc";
      }
    } else {
      newTableConfig.order_by = headerId;
      newTableConfig.order = "asc";
      newTableConfig.page = 0;
    }
    return newTableConfig;
  };

  return (
    <TableHead>
      <TableRow>
        {TABLE_HEADERS.map((header, index) => (
          <TableCell
            key={`${header.id}`}
            align={index === 0 ? "left" : "right"}
            sortDirection={
              tableConfig.order_by === header.id ? tableConfig.order : false
            }
          >
            <TableSortLabel
              onClick={() => {
                const newTableConfig = createNewConfigFromSort(
                  header.id,
                  tableConfig
                );
                setTableConfig(JSON.stringify(newTableConfig));
              }}
              active={tableConfig.order_by === header.id}
              direction={
                tableConfig.order_by === header.id ? tableConfig.order : "asc"
              }
            >
              <span className="text-white font-semibold">{header.name}</span>
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

type ProcessesTableProps = {
  data: ProcessData[];
  tableConfig: TableConfig;
  setTableConfig: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView
  ) => void;
};

const ProcessesTable = ({
  data,
  tableConfig,
  setTableConfig,
}: ProcessesTableProps) => {
  return (
    <Container>
      <TableContainer>
        <Table>
          <ProcessesTableHead
            tableConfig={tableConfig}
            setTableConfig={setTableConfig}
          />
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.pid}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <span className="text-white">{row.process_path}</span>
                </TableCell>
                <TableCell align="right">
                  <span className="text-white">{row.pid}</span>
                </TableCell>
                <TableCell align="right">
                  <span className="text-white">
                    {getPercentage(row.cpu_usage, 100)}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <span className="text-white">
                    {getStorageUnits(row.memory)}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <span className="text-white">
                    {getStorageUnits(row.disk_usage)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ProcessesTable;
