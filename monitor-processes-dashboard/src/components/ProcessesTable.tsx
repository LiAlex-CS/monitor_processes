import { ProcessData } from "../hooks/useSystemQuery";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Container from "./Container";
import { getPercentage } from "../services/getPercentage";
import { getStorageUnits } from "../services/getStorageUnits";

type ProcessesTableProps = {
  data: ProcessData[];
};

const ProcessesTable = ({ data }: ProcessesTableProps) => {
  return (
    <Container>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <span className="text-white font-semibold">Process Path</span>
              </TableCell>
              <TableCell align="right">
                <span className="text-white font-semibold">PID</span>
              </TableCell>
              <TableCell align="right">
                <span className="text-white font-semibold">CPU Usage</span>
              </TableCell>
              <TableCell align="right">
                <span className="text-white font-semibold">Memory Usage</span>
              </TableCell>
              <TableCell align="right">
                <span className="text-white font-semibold">Disk Usage</span>
              </TableCell>
            </TableRow>
          </TableHead>
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
