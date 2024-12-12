import { useEffect, useState } from "react";
import { useCircularBuffer } from "./useCircularBuffer";
import { GraphData } from "../components/StatsGraph";

export type DeviceDetails = {
  architecture: string;
  name: string;
  distro: string;
  platform: string;
};

export type TotalSystemData = {
  cores: number;
  total_memory: number;
  used_memory: number;
  global_cpu_usage: number;
};

export type ProcessData = {
  pid: string;
  process_path: string;
  cpu_usage: number;
  memory: number;
  disk_usage: number;
};

type SystemQuery = {
  date_time: string;
  device_details: DeviceDetails;
  total_system_data: TotalSystemData;
  processes_data: ProcessData[];
};

const dateFilter = (systemQuery: SystemQuery) => {
  return systemQuery.date_time;
};

const cpuUsageFilter = (systemQuery: SystemQuery) => {
  return systemQuery.total_system_data.global_cpu_usage;
};

const memoryUsageFilter = (systemQuery: SystemQuery) => {
  return parseFloat(
    (
      (systemQuery.total_system_data.used_memory /
        systemQuery.total_system_data.total_memory) *
      100
    ).toFixed(2)
  );
};

const getGraphData = (x: string | number, y: number) => {
  const res: GraphData = {
    x: x,
    y: y,
  };
  return res;
};

type SystemQueryWithBuffers = {
  systemQuery: SystemQuery | undefined;
  cpuUsageBuffer: GraphData[];
  memoryUsageBuffer: GraphData[];
};

export const useSystemQuery = (webSocketPath = "ws://127.0.0.1:8080") => {
  const [data, setData] = useState<SystemQuery | undefined>();
  const [cpuUsageBuffer, addToCpuUsageBuffer] =
    useCircularBuffer<GraphData>(100);
  const [memoryUsageBuffer, addToMemoryUsageBuffer] =
    useCircularBuffer<GraphData>(100);

  useEffect(() => {
    const ws = new WebSocket(webSocketPath);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      // console.log("Message received:", event.data);
      const parsedSystemQuery = JSON.parse(event.data) as SystemQuery;
      setData(parsedSystemQuery);
      addToCpuUsageBuffer(
        getGraphData(
          dateFilter(parsedSystemQuery),
          cpuUsageFilter(parsedSystemQuery)
        )
      );
      addToMemoryUsageBuffer(
        getGraphData(
          dateFilter(parsedSystemQuery),
          memoryUsageFilter(parsedSystemQuery)
        )
      );
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  const res: SystemQueryWithBuffers = {
    systemQuery: data,
    cpuUsageBuffer: cpuUsageBuffer,
    memoryUsageBuffer: memoryUsageBuffer,
  };

  return res;
};
