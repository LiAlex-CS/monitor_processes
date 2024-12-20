mod process_info;
use process_info::{ProcessData, SystemQuery, TotalProcessesData};

mod buffer;
use buffer::Buffer;

use chrono::Local;
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use whoami::{arch, devicename, distro, platform};

use tokio::net::TcpListener;
use tokio::sync::watch;
use tokio::time::{self, Duration};
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::protocol::Message;

#[derive(Serialize, Deserialize, Clone)]
struct TableConfig {
    order_by: String,
    order: String,
    page: u32,
    search: String,
}

#[derive(Serialize, Clone)]
struct UsageStamp {
    date_time: String,
    usage_percentage: f64,
}

#[derive(Serialize)]
struct DeviceDetails {
    architecture: String,
    name: String,
    distro: String,
    platform: String,
}

#[derive(Serialize)]
struct OutputMessage {
    date_time: String,
    device_details: DeviceDetails,
    total_system_data: TotalProcessesData,
    processes_data: Vec<ProcessData>,
    cpu_usage_buffer: Buffer<UsageStamp>,
    memory_usage_buffer: Buffer<UsageStamp>,
    table_config: TableConfig,
    total_processes: usize,
    total_searched_processes: usize,
}

fn create_message(
    processes_data: Vec<ProcessData>,
    total_system_data: TotalProcessesData,
    cpu_usage_buffer: Buffer<UsageStamp>,
    memory_usage_buffer: Buffer<UsageStamp>,
    table_config: TableConfig,
    total_processes: usize,
    total_searched_processes: usize,
) -> serde_json::Result<String> {
    let device_details = DeviceDetails {
        architecture: arch().to_string(),
        name: devicename(),
        distro: distro(),
        platform: platform().to_string(),
    };

    let output_message = OutputMessage {
        date_time: Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        device_details: device_details,
        total_system_data: total_system_data,
        processes_data: processes_data,
        cpu_usage_buffer: cpu_usage_buffer,
        memory_usage_buffer: memory_usage_buffer,
        table_config: table_config,
        total_processes: total_processes,
        total_searched_processes: total_searched_processes,
    };

    let serialized_json_message = serde_json::to_string(&output_message)?;
    return Ok(serialized_json_message);
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Bind the WebSocket server to an address
    let addr = "0.0.0.0:8080";
    let listener = TcpListener::bind(addr).await?;
    println!("WebSocket server running at ws://{}", addr);

    tokio::spawn(async move {
        let dist_folder = warp::fs::dir("dashboard_dist");

        // Start the warp server on localhost:3030
        println!("Serving at port 3030");
        warp::serve(dist_folder).run(([0, 0, 0, 0], 3030)).await;
    });

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(async move {
            // Accept the WebSocket connection
            let ws_stream = accept_async(stream)
                .await
                .expect("Failed to accept WebSocket connection");
            println!("New client connected!");

            let (mut ws_sink, mut ws_stream) = ws_stream.split();

            let default_table_config = TableConfig {
                order_by: String::from("process_data"),
                order: String::from("asc"),
                page: 0,
                search: String::from(""),
            };

            let (table_config_tx, mut table_config_rx) = watch::channel(default_table_config);

            // Spawn a task to send the current time every half second
            tokio::spawn(async move {
                let mut interval = time::interval(Duration::from_millis(500));

                let mut system_query = SystemQuery::new();

                let mut cpu_usage_buffer: Buffer<UsageStamp> = Buffer::new(100);
                let mut memory_usage_buffer: Buffer<UsageStamp> = Buffer::new(100);

                loop {
                    interval.tick().await;

                    let mut table_config = table_config_rx.borrow_and_update().clone();

                    println!(
                        "table config: {}, {}, {}, {}",
                        table_config.order_by,
                        table_config.order,
                        table_config.page,
                        table_config.search
                    );

                    let mut processes_data = system_query.get_system_processes_data();

                    match table_config.order_by.as_str() {
                        "process_path" => {
                            if table_config.order.as_str() == "asc" {
                                processes_data.sort_by(|a, b| a.process_path.cmp(&b.process_path))
                            } else {
                                processes_data.sort_by(|a, b| b.process_path.cmp(&a.process_path))
                            }
                        }

                        "pid" => {
                            if table_config.order.as_str() == "asc" {
                                processes_data.sort_by(|a, b| a.pid.cmp(&b.pid))
                            } else {
                                processes_data.sort_by(|a, b| b.pid.cmp(&a.pid))
                            }
                        }
                        "cpu_usage" => {
                            if table_config.order.as_str() == "asc" {
                                processes_data
                                    .sort_by(|a, b| a.cpu_usage.partial_cmp(&b.cpu_usage).unwrap())
                            } else {
                                processes_data
                                    .sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap())
                            }
                        }
                        "memory" => {
                            if table_config.order.as_str() == "asc" {
                                processes_data
                                    .sort_by(|a, b| a.memory.partial_cmp(&b.memory).unwrap())
                            } else {
                                processes_data
                                    .sort_by(|a, b| b.memory.partial_cmp(&a.memory).unwrap())
                            }
                        }
                        "disk_usage" => {
                            if table_config.order.as_str() == "asc" {
                                processes_data.sort_by(|a, b| a.disk_usage.cmp(&b.disk_usage))
                            } else {
                                processes_data.sort_by(|a, b| b.disk_usage.cmp(&a.disk_usage))
                            }
                        }
                        _ => processes_data
                            .sort_by_key(|process_data| process_data.process_path.clone()),
                    }

                    let processes_per_page: u32 = 15;

                    let total_processes = processes_data.len();

                    let search_filtered_processes: Vec<ProcessData> = processes_data
                        .drain(..)
                        .filter(|process_data| {
                            process_data
                                .process_path
                                .contains(table_config.search.as_str())
                        })
                        .collect();

                    let total_search_filtered_processes = search_filtered_processes.len();

                    let max_pages = (total_search_filtered_processes as f64
                        / processes_per_page as f64)
                        .ceil() as usize;

                    if table_config.page > max_pages as u32 {
                        table_config.page = (max_pages - 1) as u32
                    }

                    let start_process_index = (table_config.page * processes_per_page) as usize;
                    let end_process_index = std::cmp::min(
                        ((table_config.page + 1) * processes_per_page) as usize,
                        total_search_filtered_processes,
                    );

                    let search_and_page_filtered_processes =
                        search_filtered_processes[start_process_index..end_process_index].to_vec();

                    let total_system_data = system_query.get_total_processes_data();

                    let cpu_usage_stamp = UsageStamp {
                        date_time: Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
                        usage_percentage: total_system_data.global_cpu_usage,
                    };

                    let memory_usage_percentage: f64 = ((total_system_data.used_memory as f64)
                        / (total_system_data.total_memory as f64))
                        * 100.0;
                    let memory_usage_stamp = UsageStamp {
                        date_time: Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
                        usage_percentage: memory_usage_percentage,
                    };

                    cpu_usage_buffer.push(cpu_usage_stamp);
                    memory_usage_buffer.push(memory_usage_stamp);

                    let output_message = create_message(
                        search_and_page_filtered_processes,
                        total_system_data,
                        cpu_usage_buffer.clone(),
                        memory_usage_buffer.clone(),
                        table_config,
                        total_processes,
                        total_search_filtered_processes,
                    )
                    .unwrap();
                    if let Err(e) = ws_sink.send(Message::text(output_message)).await {
                        println!("Failed to send message: {}", e);
                        break;
                    }
                }
            });

            while let Some(msg) = ws_stream.next().await {
                match msg {
                    Ok(msg) => {
                        if let Ok(text) = msg.to_text() {
                            if let Ok(table_config) = serde_json::from_str::<TableConfig>(text) {
                                if table_config_tx.send(table_config).is_err() {
                                    println!("Failed to update table_config message channel");
                                    break;
                                }
                            } else {
                                println!("Failed to serialize table_config")
                            }
                        }
                    }
                    Err(e) => {
                        println!("WebSocket error: {}", e);
                        break;
                    }
                }
            }
        });
    }

    Ok(())
}
