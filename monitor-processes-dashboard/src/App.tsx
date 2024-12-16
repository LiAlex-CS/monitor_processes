import Header from "./components/Header";
import ProcessesTable from "./components/ProcessesTable";
import StatsGraph from "./components/StatsGraph";
import { useSystemQuery } from "./hooks/useSystemQuery";
import { getPercentage } from "./services/getPercentage";

const App = () => {
  const [systemQuery, send] = useSystemQuery();

  if (!systemQuery || !send) {
    return (
      <div className="flex justify-center my-10">
        <h1 className="text-3xl font-bold">No Connection Detected</h1>
      </div>
    );
  }

  // const totalCPUSum = systemQuery.processes_data.reduce(
  //   (total, process) => total + process.cpu_usage,
  //   0
  // );

  // console.log(
  //   "cal sum:",
  //   totalCPUSum,
  //   "found sum:",
  //   systemQuery.total_system_data.global_cpu_usage
  // );

  return (
    <div className="p-3">
      <Header
        deviceDetails={systemQuery.device_details}
        totalSystemData={systemQuery.total_system_data}
      />
      <StatsGraph
        data={systemQuery.cpu_usage_buffer.content}
        header="Global CPU Usage"
        currentValue={getPercentage(
          systemQuery.total_system_data.global_cpu_usage,
          100
        )}
      />
      <StatsGraph
        data={systemQuery.memory_usage_buffer.content}
        header="Global Memory Usage"
        currentValue={getPercentage(
          systemQuery.total_system_data.used_memory,
          systemQuery.total_system_data.total_memory
        )}
      />
      <ProcessesTable
        data={systemQuery.processes_data}
        tableConfig={systemQuery.table_config}
        setTableConfig={send}
        totalProcesses={systemQuery.total_processes}
      />
    </div>
  );
};

export default App;
