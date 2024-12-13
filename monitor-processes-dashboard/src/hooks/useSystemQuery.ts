import { useEffect, useState } from "react";

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

type Buffer = {
  content: BufferStamp[];
  max_length: number;
};

export type BufferStamp = {
  date_time: string;
  usage_percentage: number;
};

type SystemQuery = {
  date_time: string;
  device_details: DeviceDetails;
  total_system_data: TotalSystemData;
  processes_data: ProcessData[];
  cpu_usage_buffer: Buffer;
  memory_usage_buffer: Buffer;
};

export const useSystemQuery = (webSocketPath = "ws://127.0.0.1:8080") => {
  const [data, setData] = useState<SystemQuery | undefined>();
  // const [cpuUsageBuffer, addToCpuUsageBuffer] =
  //   useCircularBuffer<GraphData>(100);
  // const [memoryUsageBuffer, addToMemoryUsageBuffer] =
  //   useCircularBuffer<GraphData>(100);

  useEffect(() => {
    const ws = new WebSocket(webSocketPath);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      // console.log("Message received:", event.data);
      const parsedSystemQuery = JSON.parse(event.data) as SystemQuery;
      setData(parsedSystemQuery);
      // addToCpuUsageBuffer(
      //   getGraphData(
      //     dateFilter(parsedSystemQuery),
      //     cpuUsageFilter(parsedSystemQuery)
      //   )
      // );
      // addToMemoryUsageBuffer(
      //   getGraphData(
      //     dateFilter(parsedSystemQuery),
      //     memoryUsageFilter(parsedSystemQuery)
      //   )
      // );
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

  return data;
};
