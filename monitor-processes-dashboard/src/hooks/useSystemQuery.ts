import { useEffect, useRef, useState } from "react";

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
  pid: number;
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

export type Order = "asc" | "desc";

export type TableConfig = {
  order_by: keyof ProcessData;
  order: Order;
  page: number;
};

type SystemQuery = {
  date_time: string;
  device_details: DeviceDetails;
  total_system_data: TotalSystemData;
  processes_data: ProcessData[];
  cpu_usage_buffer: Buffer;
  memory_usage_buffer: Buffer;
  table_config: TableConfig;
  total_processes: number;
};

export const useSystemQuery = (webSocketPath = "ws://127.0.0.1:8080") => {
  const [data, setData] = useState<SystemQuery | undefined>();

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(webSocketPath);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      const parsedSystemQuery = JSON.parse(event.data) as SystemQuery;
      setData(parsedSystemQuery);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const res: [
    SystemQuery | undefined,
    (
      | ((data: string | ArrayBufferLike | Blob | ArrayBufferView) => void)
      | undefined
    )
  ] = [data, wsRef.current?.send.bind(wsRef.current)];
  return res;
};
