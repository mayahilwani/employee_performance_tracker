import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import MonthPickerInput from "react-month-picker-input";
import "react-month-picker-input/dist/react-month-picker-input.css";

interface MonthlyStats {
  month: string;
  total_hours: number;
  work_days: number;
  cost: number;
  generated_income: number;
  total_kg: number;
  total_mt: number;
  total_mld: number;
  total_fango: number;
  total_ultraschal: number;
  total_hb: number;
}

export default function PerformanceOverview({ employeeId }: { employeeId: number }) {
  const [stats, setStats] = useState<MonthlyStats[]>([]);
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [startMonth, setStartMonth] = useState(thisMonth);
  const [endMonth, setEndMonth] = useState(thisMonth);
  const [loading, setLoading] = useState(false);

  const handleStartChange = (year: number, month: number) => {
    setStartMonth(`${year}-${String(month).padStart(2, "0")}`);
  };

  const handleEndChange = (year: number, month: number) => {
    setEndMonth(`${year}-${String(month).padStart(2, "0")}`);
  };

  async function fetchMonthlyStats() {
    console.log("THIS MONTH. :", thisMonth);
    console.log("Fetching stats for employeeId:", employeeId);
    setLoading(true);
    try {
      console.log(`Fetching stats from ${startMonth} to ${endMonth}`);
      const result = await invoke<MonthlyStats[]>("get_monthly_stats", {
        employeeId,
        startMonth: startMonth || null,
        endMonth: endMonth || null,
      });
      console.log("📊 Stats:", result);
      setStats(result);
    } catch (err) {
      console.error("❌ Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Performance Overview</h3>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <label>From:</label>
        <MonthPickerInput
          yearAndMonth={{
            year: startMonth ? parseInt(startMonth.split("-")[0]) : 2025,
            month: startMonth ? parseInt(startMonth.split("-")[1]) : 1,
          }}
          onChange={(maskedval, _) => {
            const formatted = `${parseInt(maskedval.split("/")[1])}-${String(parseInt(maskedval.split("/")[0])).padStart(2, "0")}`;
            setStartMonth(formatted);
            console.log("Start month and year:", formatted);
          }}
          inputProps={{ readOnly: true }}
        />

        <label>To:</label>
        <MonthPickerInput
          yearAndMonth={{
            year: endMonth ? parseInt(endMonth.split("-")[0]) : 2025,
            month: endMonth ? parseInt(endMonth.split("-")[1]) : 12,
          }}
          onChange={(maskedval, _) => {
            const formatted = `${parseInt(maskedval.split("/")[1])}-${String(parseInt(maskedval.split("/")[0])).padStart(2, "0")}`;
            setEndMonth(formatted);
            console.log("End month and year:", formatted);
          }
          }
          inputProps={{ readOnly: true }}
        />

        <button onClick={fetchMonthlyStats} disabled={loading}>
          {loading ? "Loading..." : "Show Stats"}
        </button>
      </div>

      {stats.length === 0 ? (
        <p style={{ marginTop: 20 }}>No stats available for this range.</p>
      ) : (
        <>
          <table style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Monat</th>
                <th>Stunden</th>
                <th>Arbeit tagen</th>
                <th>Einkomm (€)</th>
                <th>Kosten (€)</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.month}>
                  <td>{s.month}</td>
                  <td>{s.total_hours.toFixed(1)}</td>
                  <td>{s.work_days}</td>
                  <td>{s.generated_income.toFixed(2)}</td>
                  <td>{s.cost.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" fill="#ff9e80" name="Employee Cost" />
              <Bar dataKey="generated_income" fill="#4caf50" name="Income Generated" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
