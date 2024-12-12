import Header from "./components/Header";
import StatsGraph from "./components/StatsGraph";
import { useSystemQuery } from "./hooks/useSystemQuery";
import { getPercentage } from "./services/getPercentage";

const App = () => {
  const systemQueryInfo = useSystemQuery();

  if (!systemQueryInfo.systemQuery) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Loading</h1>
      </div>
    );
  }
  console.log(systemQueryInfo.cpuUsageBuffer);
  return (
    <div className="w-screen h-screen p-3">
      <Header
        deviceDetails={systemQueryInfo.systemQuery.device_details}
        totalSystemData={systemQueryInfo.systemQuery.total_system_data}
      />
      <StatsGraph
        data={systemQueryInfo.cpuUsageBuffer}
        header="Global CPU Usage"
        currentValue={getPercentage(
          systemQueryInfo.systemQuery.total_system_data.global_cpu_usage,
          100
        )}
      />
      <StatsGraph
        data={systemQueryInfo.memoryUsageBuffer}
        header="Global Memory Usage"
        currentValue={getPercentage(
          systemQueryInfo.systemQuery.total_system_data.used_memory,
          systemQueryInfo.systemQuery.total_system_data.total_memory
        )}
      />
    </div>
  );
};

export default App;
