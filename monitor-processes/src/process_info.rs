use serde::Serialize;
use sysinfo::System;

pub struct SystemQuery {
    system: System,
    cores: usize,
    total_memory: u64,
}

#[derive(Debug, Serialize, Clone)]
pub struct ProcessData {
    pub pid: u32,
    pub process_path: String,
    pub cpu_usage: f64,
    pub memory: f64,
    pub disk_usage: u64,
}

#[derive(Debug, Serialize)]
pub struct TotalProcessesData {
    cores: usize,
    pub total_memory: u64,
    pub used_memory: u64,
    pub global_cpu_usage: f64,
}

impl SystemQuery {
    pub fn new() -> Self {
        let mut system_query = Self {
            system: System::new_all(),
            cores: 0,
            total_memory: 0,
        };

        system_query.system.refresh_all();
        system_query.cores = system_query.system.physical_core_count().unwrap_or(0);
        system_query.total_memory = system_query.system.total_memory();

        return system_query;
    }

    pub fn get_system_processes_data(&mut self) -> Vec<ProcessData> {
        self.system.refresh_all();

        let processes_data: Vec<ProcessData> = self
            .system
            .processes()
            .into_iter()
            .map(|(pid, process)| {
                let fixed_process_path = match process.exe() {
                    Some(path) => path.to_str().unwrap().to_string(),
                    None => String::from("unknown"),
                };
                return ProcessData {
                    pid: pid.as_u32(),
                    process_path: fixed_process_path,
                    cpu_usage: process.cpu_usage() as f64 / self.system.cpus().len() as f64,
                    memory: process.memory() as f64 / 1000.0,
                    disk_usage: process.disk_usage().read_bytes,
                };
            })
            .collect();

        return processes_data;
    }

    pub fn get_total_processes_data(&mut self) -> TotalProcessesData {
        self.system.refresh_all();

        TotalProcessesData {
            cores: self.cores,
            total_memory: self.total_memory,
            used_memory: self.system.used_memory(),
            global_cpu_usage: self.system.global_cpu_usage() as f64,
        }
    }
}
