import { ProcessData, TableConfig } from "../hooks/useSystemQuery";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import TextField from "@mui/material/TextField";

import Container from "./Container";
import { getPercentage } from "../services/getPercentage";
import { getStorageUnits } from "../services/getStorageUnits";
import { TableSortLabel } from "@mui/material";

type SectionHeaderProps = {
  totalProcesses: number;
  tableConfig: TableConfig;
  setTableConfig: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView
  ) => void;
};
const SectionHeader = ({
  totalProcesses,
  tableConfig,
  setTableConfig,
}: SectionHeaderProps) => {
  return (
    <div className="mb-2">
      <h2 className="text-2xl font-semibold mb-4">
        Total Processes Running:{" "}
        <span className=" font-medium">{totalProcesses}</span>
      </h2>
      <TextField
        label="Search"
        type="search"
        onInput={(e) => {
          const searchValue = (e.target as HTMLInputElement).value;
          let newTableConfig: TableConfig = { ...tableConfig };
          newTableConfig.search = searchValue.trim();
          setTableConfig(JSON.stringify(newTableConfig));
        }}
      />
    </div>
  );
};

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

    let newTableConfig: TableConfig = {
      ...currentTableConfig,
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
              <span className="font-semibold">{header.name}</span>
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

type ProcessesTableProps = {
  data: ProcessData[];
  totalProcesses: number;
  totalSearchedProcesses: number;
  tableConfig: TableConfig;
  setTableConfig: (
    data: string | ArrayBufferLike | Blob | ArrayBufferView
  ) => void;
};

const ProcessesTable = ({
  data,
  totalProcesses,
  totalSearchedProcesses,
  tableConfig,
  setTableConfig,
}: ProcessesTableProps) => {
  const PROCESSES_PER_PAGE = 15 as const;

  const createNewConfigFromPagination = (
    newPage: number,
    currentTableConfig: TableConfig
  ) => {
    let newTableConfig: TableConfig = {
      ...currentTableConfig,
    };

    newTableConfig.page = newPage;
    return newTableConfig;
  };

  return (
    <Container>
      <SectionHeader
        totalProcesses={totalProcesses}
        tableConfig={tableConfig}
        setTableConfig={setTableConfig}
      />
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
                  {row.process_path}
                </TableCell>
                <TableCell align="right">{row.pid}</TableCell>
                <TableCell align="right">
                  {getPercentage(row.cpu_usage, 100)}
                </TableCell>
                <TableCell align="right">
                  {getStorageUnits(row.memory)}
                </TableCell>
                <TableCell align="right">
                  {getStorageUnits(row.disk_usage)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[]}
        component="div"
        count={totalSearchedProcesses}
        rowsPerPage={PROCESSES_PER_PAGE}
        page={tableConfig.page}
        onPageChange={(_, newPage) => {
          const newTableConfig = createNewConfigFromPagination(
            newPage,
            tableConfig
          );
          setTableConfig(JSON.stringify(newTableConfig));
        }}
      />
    </Container>
  );
};

export default ProcessesTable;
