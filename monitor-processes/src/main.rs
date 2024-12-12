mod process_info;
use process_info::{ProcessData, SystemQuery, TotalProcessesData};

use chrono::Local;
use futures_util::{SinkExt, StreamExt};
use serde::Serialize;
use whoami::{arch, devicename, distro, platform};

use tokio::net::TcpListener;
use tokio::time::{self, Duration};
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::protocol::Message;

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
}

fn create_message(
    processes_data: Vec<ProcessData>,
    total_system_data: TotalProcessesData,
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
    };

    let serialized_json_message = serde_json::to_string(&output_message)?;
    return Ok(serialized_json_message);
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Bind the WebSocket server to an address
    let addr = "127.0.0.1:8080";
    let listener = TcpListener::bind(addr).await?;
    println!("WebSocket server running at ws://{}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(async move {
            // Accept the WebSocket connection
            let ws_stream = accept_async(stream)
                .await
                .expect("Failed to accept WebSocket connection");
            println!("New client connected!");

            let (mut ws_sink, _) = ws_stream.split();

            // Spawn a task to send the current time every half second
            tokio::spawn(async move {
                let mut interval = time::interval(Duration::from_millis(500));

                let mut system_query = SystemQuery::new();

                loop {
                    interval.tick().await;
                    let processes_data = system_query.get_system_processes_data();
                    let total_system_data = system_query.get_total_processes_data();

                    let output_message = create_message(processes_data, total_system_data).unwrap();

                    if let Err(e) = ws_sink.send(Message::text(output_message)).await {
                        println!("Failed to send message: {}", e);
                        break;
                    }
                }
            });
        });
    }

    Ok(())
}
