use serde::{Serialize, Deserialize};
use rusqlite::{params, Result};
use tauri::AppHandle;
use crate::db;
// use chrono::{NaiveDate, ParseError};

#[derive(Debug, Serialize, Deserialize)]
pub struct Performance {
    pub id: i32,
    pub employee_id: i32,
    pub date: String,
    pub hours_worked: f64,
    pub status: String,
    pub income: f64,
    pub kg_num: i32,
    pub mt_num: i32,
    pub mld_num: i32,
    pub fango_num: i32,
    pub ultraschal_num: i32,
    pub hb_num: i32,
}

#[tauri::command]
pub fn get_performance(app_handle: AppHandle, employee_id: i32, date: String) -> Result<Vec<Performance>, String> {
    let conn = db::init_db(&app_handle).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, employee_id, date, hours_worked, status, income, kg_num, mt_num, mld_num, fango_num, ultraschal_num, hb_num 
         FROM performance 
         WHERE employee_id = ?1 and date = ?2"
    ).map_err(|e| e.to_string())?;
    
    let performances_iter = stmt
        .query_map(params![employee_id, date], |row| {
            Ok(Performance {
                id: row.get(0)?,
                employee_id: row.get(1)?,
                date: row.get(2)?,
                hours_worked: row.get(3)?,
                status: row.get(4)?,
                income: row.get(5)?,
                kg_num: row.get(6)?,
                mt_num: row.get(7)?,
                mld_num: row.get(8)?,
                fango_num: row.get(9)?,
                ultraschal_num: row.get(10)?,
                hb_num: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut performances = Vec::new();
    for perf in performances_iter {
        performances.push(perf.map_err(|e| e.to_string())?);
    }
    println!("📊 Loading performance for employee {}", employee_id);
    Ok(performances)
}

#[tauri::command]
pub fn get_all_performance(app_handle: AppHandle, employee_id: i32) -> Result<Vec<Performance>, String> {
    let conn = db::init_db(&app_handle).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, employee_id, date, hours_worked, status, income, kg_num, mt_num, mld_num, fango_num, ultraschal_num, hb_num
         FROM performance 
         WHERE employee_id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let performances_iter = stmt.query_map(params![employee_id], |row| {
        Ok(Performance {
            id: row.get(0)?,
            employee_id: row.get(1)?,
            date: row.get(2)?,
            hours_worked: row.get(3)?,
            status: row.get(4)?,
            income: row.get(5)?,
            kg_num: row.get(6)?,
            mt_num: row.get(7)?,
            mld_num: row.get(8)?,
            fango_num: row.get(9)?,
            ultraschal_num: row.get(10)?,
            hb_num: row.get(11)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut performances = Vec::new();
    for perf in performances_iter {
        performances.push(perf.map_err(|e| e.to_string())?);
    }

    Ok(performances)
}


//fn normalize_date(date_str: &str) -> Result<String, ParseError> {
//    let date = NaiveDate::parse_from_str(date_str, "%Y-%m-%d")?;
//    Ok(date.format("%Y-%m-%d").to_string())
//}

#[tauri::command]
pub fn add_performance(
    app_handle: AppHandle,
    employee_id: i32,
    date: String,
    hours_worked: f64,
    status: String,
    income: f64,
    kg_num: i32,
    mt_num: i32,
    mld_num: i32,
    fango_num: i32,
    ultraschal_num: i32,
    hb_num: i32,
) -> Result<(), String> {
    println!("✅ Function Called add_performance");
    let conn = db::init_db(&app_handle).map_err(|e| e.to_string())?;
    //let safe_date = normalize_date(&date).map_err(|e| e.to_string())?;
    let safe_date = date; // Assume date is already in correct format
    conn.execute(
        "INSERT INTO performance (employee_id, date, hours_worked, status, income, kg_num, mt_num, mld_num, fango_num, ultraschal_num, hb_num)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![employee_id, safe_date, hours_worked, status, income, kg_num, mt_num, mld_num, fango_num, ultraschal_num, hb_num],
    )
    .map_err(|e| e.to_string())?;

    println!("✅ Inserted record for {} with status {}", safe_date, status);
    Ok(())
}


#[tauri::command]
pub fn update_performance(
    app_handle: AppHandle,
    id: i32,
    hours_worked: f64,
    status: String,
    income: f64,
    kg_num: i32,
    mt_num: i32,
    mld_num: i32,
    fango_num: i32,
    ultraschal_num: i32,
    hb_num: i32,
) -> Result<(), String> {
    let conn = db::init_db(&app_handle).map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE performance 
         SET hours_worked = ?1, status = ?2, income = ?3, kg_num = ?4, mt_num = ?5, mld_num = ?6, fango_num = ?7, ultraschal_num = ?8, hb_num = ?9 
         WHERE id = ?10",
        params![hours_worked, status, income, kg_num, mt_num, mld_num, fango_num, ultraschal_num, hb_num, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
#[derive(Serialize)]
pub struct MonthlyStats {
    pub month: String,
    pub total_hours: f64,
    pub work_days: i32,
    pub cost: f64,            // employee monthly rate
    pub generated_income: f64, // income generated from therapies
    pub total_kg: i32,
    pub total_mt: i32,
    pub total_mld: i32,
    pub total_fango: i32,
    pub total_ultraschal: i32,
    pub total_hb: i32,
}

#[tauri::command]
pub fn get_monthly_stats(
    app_handle: AppHandle,
    employee_id: i32,
    start_month: Option<String>,
    end_month: Option<String>,
) -> Result<Vec<MonthlyStats>, String> {
    let conn = db::init_db(&app_handle).map_err(|e| e.to_string())?;

    // Fetch therapy prices
    let mut therapy_stmt = conn
        .prepare("SELECT therapy_name, income FROM therapy")
        .map_err(|e| e.to_string())?;
    let mut therapy_prices = std::collections::HashMap::new();
    let therapy_iter = therapy_stmt
        .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, f64>(1)?)))
        .map_err(|e| e.to_string())?;
    for item in therapy_iter {
        let (name, price) = item.map_err(|e| e.to_string())?;
        therapy_prices.insert(name, price);
    }

    // Base monthly performance query
    let base_query = "
        SELECT substr(date, 1, 7) AS month,
               SUM(hours_worked) AS total_hours,
               COUNT(CASE WHEN status = 'Present' THEN 1 END) AS work_days,
               SUM(kg_num) AS total_kg,
               SUM(mt_num) AS total_mt,
               SUM(mld_num) AS total_mld,
               SUM(fango_num) AS total_fango,
               SUM(ultraschal_num) AS total_ultraschal,
               SUM(hb_num) AS total_hb
        FROM performance
        WHERE employee_id = ?1
    ";

    let (query, with_range) = if start_month.is_some() && end_month.is_some() {
        (
            format!(
                "{} AND substr(date, 1, 7) BETWEEN ?2 AND ?3 GROUP BY month ORDER BY month ASC",
                base_query
            ),
            true,
        )
    } else {
        (
            format!("{} GROUP BY month ORDER BY month ASC", base_query),
            false,
        )
    };

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;

    // Get employee monthly rate (cost)
    let emp_rate: f64 = match conn.query_row(
    "SELECT monthly_rate FROM employees WHERE id = ?1",
    params![employee_id],
    |row| row.get(0),
   ) {
    Ok(rate) => rate,
    Err(rusqlite::Error::QueryReturnedNoRows) => 0.0, // employee not found
    Err(e) => return Err(e.to_string()),              // other SQL errors
    };

    let map_row = |row: &rusqlite::Row| -> Result<MonthlyStats, rusqlite::Error> {
        let month: String = row.get(0)?;
        let total_kg: i32 = row.get(3)?;
        let total_mt: i32 = row.get(4)?;
        let total_mld: i32 = row.get(5)?;
        let total_fango: i32 = row.get(6)?;
        let total_ultraschal: i32 = row.get(7)?;
        let total_hb: i32 = row.get(8)?;

        let income = (total_kg as f64) * *therapy_prices.get("kg").unwrap_or(&0.0)
            + (total_mt as f64) * *therapy_prices.get("mt").unwrap_or(&0.0)
            + (total_mld as f64) * *therapy_prices.get("mld").unwrap_or(&0.0)
            + (total_fango as f64) * *therapy_prices.get("fango").unwrap_or(&0.0)
            + (total_ultraschal as f64) * *therapy_prices.get("ultraschal").unwrap_or(&0.0)
            + (total_hb as f64) * *therapy_prices.get("hb").unwrap_or(&0.0);

        Ok(MonthlyStats {
            month,
            total_hours: row.get(1)?,
            work_days: row.get(2)?,
            cost: emp_rate,
            generated_income: income,
            total_kg,
            total_mt,
            total_mld,
            total_fango,
            total_ultraschal,
            total_hb,
        })
    };

    let stats_iter = if with_range {
        let start = start_month.unwrap();
        let end = end_month.unwrap();
        println!("✅ START MONTH {} END MONTH {}", start, end);
        stmt.query_map(params![employee_id, start, end], map_row)
    } else {
        stmt.query_map(params![employee_id], map_row)
    }
    .map_err(|e| e.to_string())?;

    let mut stats = Vec::new();
    for s in stats_iter {
        stats.push(s.map_err(|e| e.to_string())?);
    }

    Ok(stats)
}