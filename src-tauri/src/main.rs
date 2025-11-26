// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            employee::get_employees,
            employee::add_employee,
            employee::update_employee,
            employee::delete_employee,
            employee::get_employee_name,
            employee::get_employee_avg_hours,
            performance::get_all_performance,
            performance::add_performance,
            performance::update_performance,
            performance::get_monthly_stats,
            therapy::get_all_therapies,
            therapy::update_therapy,
            therapy::add_therapy
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
mod db;
mod employee;
mod performance;
mod therapy;


