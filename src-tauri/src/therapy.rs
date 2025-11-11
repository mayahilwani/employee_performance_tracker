use serde::{Serialize, Deserialize};
use rusqlite::{params, Result};
use tauri::AppHandle;
use crate::db;

#[derive(Debug, Serialize, Deserialize)]
pub struct Therapy {
    pub id: i32,
    pub therapy_name: String,
    pub cost: f64,
    pub income: f64,
}
#[tauri::command]
pub fn get_all_therapies(app_handle: AppHandle) -> Result<Vec<Therapy>, String> {
    let conn = db::init_db(&app_handle).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, therapy_name, cost, income 
         FROM therapy"
    ).map_err(|e| e.to_string())?;
    
    let therapies_iter = stmt.query_map(params![], |row| {
        Ok(Therapy {
            id: row.get(0)?,
            therapy_name: row.get(1)?,
            cost: row.get(2)?,
            income: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut therapies = Vec::new();
    for th in therapies_iter {
        therapies.push(th.map_err(|e| e.to_string())?);
    }

    Ok(therapies)
}

#[tauri::command]
pub fn update_therapy(
    app_handle: AppHandle,
    id: i32,
    therapy_name: String,
    cost: f64,
    income: f64,
) -> Result<(), String> {
    let conn = db::init_db(&app_handle).map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE therapy 
         SET therapy_name = ?1, cost = ?2, income = ?3 
         WHERE id = ?4",
        params![therapy_name, cost, income, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
