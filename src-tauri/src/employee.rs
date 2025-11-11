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
}

#[tauri::command]
pub fn get_employees(app_handle: AppHandle) -> Result<Vec<Employee>, String> {
    println!("🔍 get_employees command called");
    
    let conn = db::init_db(&app_handle).map_err(|e| {
        println!("❌ Database init error: {}", e);
        e.to_string()
    })?;
    
    let mut stmt = conn.prepare("SELECT id, name, join_date, monthly_rate FROM employees")
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
pub fn add_employee(app_handle: AppHandle, name: String, join_date: String, monthly_rate: f64) -> Result<(), String> {
    println!("➕ add_employee command called: {} - {} - {}", name, join_date, monthly_rate);
    
    let conn = db::init_db(&app_handle).map_err(|e| {
        println!("❌ Database init error: {}", e);
        e.to_string()
    })?;
    
    conn.execute(
        "INSERT INTO employees (name, join_date, monthly_rate) VALUES (?1, ?2, ?3)",
        params![name, join_date, monthly_rate],
    )
    .map_err(|e| {
        println!("❌ Insert error: {}", e);
        e.to_string()
    })?;
    
    println!("✅ Employee added successfully");
    Ok(())
}

#[tauri::command]
pub fn delete_employee(app_handle: AppHandle, employee_id: i32) -> Result<(), String> {
    println!("➖ delete_employee command called: ID {}", employee_id);
    
    let conn = db::init_db(&app_handle).map_err(|e| {
        println!("❌ Database init error: {}", e);
        e.to_string()
    })?;
    
    conn.execute(
        "DELETE FROM employees WHERE id = ?1",
        params![employee_id],
    )
    .map_err(|e| {
        println!("❌ Delete error: {}", e);
        e.to_string()
    })?;
    
    println!("✅ Employee deleted successfully");
    Ok(())
}

#[tauri::command]
pub fn get_employee_name(app_handle: AppHandle, employee_id: i32) -> Result<String, String> {
    println!("🔍 get_employee_name command called: ID {}", employee_id);
    
    let conn = db::init_db(&app_handle).map_err(|e| {
        println!("❌ Database init error: {}", e);
        e.to_string()
    })?;
    
    let mut stmt = conn.prepare("SELECT name FROM employees WHERE id = ?1")
        .map_err(|e| {
            println!("❌ Prepare statement error: {}", e);
            e.to_string()
        })?;
    
    let name: String = stmt.query_row(params![employee_id], |row| row.get(0))
        .map_err(|e| {
            println!("❌ Query error: {}", e);
            e.to_string()
        })?;
    
    println!("✅ Found employee name: {}", name);
    Ok(name)
}