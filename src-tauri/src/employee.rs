use serde::{Serialize, Deserialize};
use rusqlite::{params, Result};
use tauri::AppHandle;

use crate::db;

#[derive(Debug, Serialize, Deserialize)]
pub struct Employee {
    pub id: i32,
    pub name: String,
    pub join_date: String,
    pub monthly_rate: f64,
    pub avg_hours: f64,
}

#[tauri::command]
pub fn get_employees(app_handle: AppHandle) -> Result<Vec<Employee>, String> {
    println!("🔍 get_employees command called");
    
    let conn = db::init_db(&app_handle).map_err(|e| {
        println!("❌ Database init error: {}", e);
        e.to_string()
    })?;
    
    let mut stmt = conn.prepare("SELECT id, name, join_date, monthly_rate, avg_hours FROM employees")
        .map_err(|e| {
            println!("❌ Prepare statement error: {}", e);
            e.to_string()
        })?;
    
    let employees_iter = stmt
        .query_map([], |row| {
            Ok(Employee {
                id: row.get(0)?,
                name: row.get(1)?,
                join_date: row.get(2)?,
                monthly_rate: row.get(3)?,
                avg_hours: row.get(4)?,
            })
        })
        .map_err(|e| {
            println!("❌ Query error: {}", e);
            e.to_string()
        })?;

    let mut employees = Vec::new();
    for emp in employees_iter {
        match emp {
            Ok(employee) => {
                println!("✅ Found employee: {} - {}", employee.name, employee.join_date);
                employees.push(employee);
            }
            Err(e) => {
                println!("❌ Employee mapping error: {}", e);
                return Err(e.to_string());
            }
        }
    }

    println!("📊 Returning {} employees", employees.len());
    Ok(employees)
}

#[tauri::command]
pub fn add_employee(app_handle: AppHandle, name: String, join_date: String, monthly_rate: f64, avg_hours: f64) -> Result<(), String> {
    println!("➕ add_employee command called: {} - {} - {} - {}", name, join_date, monthly_rate, avg_hours);
    
    let conn = db::init_db(&app_handle).map_err(|e| {
        println!("❌ Database init error: {}", e);
        e.to_string()
    })?;
    
    conn.execute(
        "INSERT INTO employees (name, join_date, monthly_rate, avg_hours) VALUES (?1, ?2, ?3, ?4)",
        params![name, join_date, monthly_rate, avg_hours],
    )
    .map_err(|e| {
        println!("❌ Insert error: {}", e);
        e.to_string()
    })?;
    
    println!("✅ Employee added successfully");
    Ok(())
}

#[tauri::command]
pub fn update_employee(app_handle: AppHandle, id: i32, name: String, join_date: String, monthly_rate: f64, avg_hours: f64) -> Result<(), String> {
    println!("✏️ update_employee command called: ID {} - {} - {} - {} - {}", id, name, join_date, monthly_rate, avg_hours);
    let conn = db::init_db(&app_handle).map_err(|e| {
        println!("❌ Database init error: {}", e);
        e.to_string()
    })?;
    conn.execute(
        "UPDATE employees SET name = ?1, join_date = ?2, monthly_rate = ?3, avg_hours = ?4 WHERE id = ?5",
        params![name, join_date, monthly_rate, avg_hours, id],
    )
    .map_err(|e| {
        println!("❌ Update error: {}", e);
        e.to_string()
    })?;
    println!("✅ Employee updated successfully");
    Ok(())
}

#[tauri::command]
pub fn delete_employee(app_handle: AppHandle, id: i32) -> Result<(), String> {
    println!("➖ delete_employee command called: ID {}", id);
    
    let conn = db::init_db(&app_handle).map_err(|e| {
        println!("❌ Database init error: {}", e);
        e.to_string()
    })?;
    
    conn.execute(
        "DELETE FROM employees WHERE id = ?1",
        params![id],
    )
    .map_err(|e| {
        println!("❌ Delete error: {}", e);
        e.to_string()
    })?;
    
    println!("✅ Employee deleted successfully");
    Ok(())
}

#[tauri::command]
pub fn get_employee_name(app_handle: AppHandle, id: i32) -> Result<String, String> {
    println!("🔍 get_employee_name command called: ID {}", id);
    
    let conn = db::init_db(&app_handle).map_err(|e| {
        println!("❌ Database init error: {}", e);
        e.to_string()
    })?;
    
    let mut stmt = conn.prepare("SELECT name FROM employees WHERE id = ?1")
        .map_err(|e| {
            println!("❌ Prepare statement error: {}", e);
            e.to_string()
        })?;
    
    let name: String = stmt.query_row(params![id], |row| row.get(0))
        .map_err(|e| {
            println!("❌ Query error: {}", e);
            e.to_string()
        })?;
    
    println!("✅ Found employee name: {}", name);
    Ok(name)
}

#[tauri::command]
pub fn get_employee(app_handle: AppHandle, id: i32) -> Result<Employee, String> {
    println!("🔍 get_employee command called: ID {}", id);
    
    let conn = db::init_db(&app_handle).map_err(|e| {
        println!("❌ Database init error: {}", e);
        e.to_string()
    })?;
    
    let mut stmt = conn.prepare("SELECT id, name, join_date, monthly_rate, avg_hours FROM employees WHERE id = ?1")
        .map_err(|e| {
            println!("❌ Prepare statement error: {}", e);
            e.to_string()
        })?;
    
    let employee = stmt
        .query_row(params![id], |row| {
            Ok(Employee {
                id: row.get(0)?,
                name: row.get(1)?,
                join_date: row.get(2)?,
                monthly_rate: row.get(3)?,
                avg_hours: row.get(4)?,
            })
        })
        .map_err(|e| {
            println!("❌ Query error: {}", e);
            e.to_string()
        })?;
    
    println!("✅ Found employee: {} - {} - {} - {}", employee.name, employee.join_date, employee.monthly_rate, employee.avg_hours);
    Ok(employee)
}

#[tauri::command]
pub fn get_employee_avg_hours(app_handle: AppHandle, id: i32) -> Result<String, String> {
    println!("🔍 get_employee_name command called: ID {}", id);
    
    let conn = db::init_db(&app_handle).map_err(|e| {
        println!("❌ Database init error: {}", e);
        e.to_string()
    })?;
    
    let mut stmt = conn.prepare("SELECT avg_hours FROM employees WHERE id = ?1")
        .map_err(|e| {
            println!("❌ Prepare statement error: {}", e);
            e.to_string()
        })?;
    
    let avg_hours: f64 = stmt.query_row(params![id], |row| row.get(0))
        .map_err(|e| {
            println!("❌ Query error: {}", e);
            e.to_string()
        })?;
    let avg_hours_string = avg_hours.to_string();
    println!("✅ Found employee avg_hours: {}", avg_hours);
    Ok(avg_hours_string)
}