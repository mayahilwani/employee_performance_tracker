use rusqlite::{Connection, Result};
use rusqlite::params;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;

pub fn get_db_path(app_handle: &AppHandle) -> PathBuf {
    // Use the official Tauri 2 data directory API
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");

    let db_dir = app_data_dir.join("data");
    std::fs::create_dir_all(&db_dir).expect("Failed to create data directory");

    let db_path = db_dir.join("app_data4.sqlite"); // app_data4.sqlite 
    println!("📁 Database path: {:?}", db_path);

    db_path
}

pub fn init_db(app_handle: &AppHandle) -> Result<Connection> {
    let path = get_db_path(app_handle);
    let conn = Connection::open(&path)?;
    println!("🔌 Database connection opened at: {:?}", path);

    conn.execute(
        "CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            join_date TEXT NOT NULL,
            monthly_rate REAL NOT NULL,
            avg_hours REAL DEFAULT 8.0
        )",
        [],
    )?;
    println!("✅ Employees table ensured");
    

    // ---------------- PERFORMANCE ----------------

    conn.execute(
        "CREATE TABLE IF NOT EXISTS performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            hours_worked REAL,
            status TEXT,
            income REAL,
            kg_num INTEGER,
            mt_num INTEGER,
            mld_num INTEGER,
            mdl_45_num INTEGER,
            mdl_60_num INTEGER,
            ma_num INTEGER,
            fango_num INTEGER,
            ultraschal_num INTEGER,
            hb_num INTEGER,
            FOREIGN KEY(employee_id) REFERENCES employees(id)
        )",
        [],
    )?;
    println!("✅ Performance table ensured");
    let _ = conn.execute(
        "ALTER TABLE performance RENAME COLUMN mdl_60_num TO mld_60_num",
        [],
    );

    // ---------------- THERAPY ----------------
    conn.execute(
        "CREATE TABLE IF NOT EXISTS therapy (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            therapy_name TEXT UNIQUE NOT NULL,
            cost REAL,
            income REAL
        )",
        [],
    )?;
    println!("✅ Therapy table ensured");

    Ok(conn)
}
