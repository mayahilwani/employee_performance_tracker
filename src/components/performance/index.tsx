import { useState, useEffect } from "react";
import DailyPerformanceView from "./DailyPerformanceView";
import PerformanceOverview from "./PerformanceOverview";
import { invoke } from "@tauri-apps/api/core";

export default function PerformanceView({
  employeeId,
  onBack,
}: {
  employeeId: number;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"daily" | "overview">("daily");
  const [employeeName, setEmployeeName] = useState<string>("");

  useEffect(() => {
    async function fetchName() {
      try {
        const name = await invoke<string>("get_employee_name", { id: employeeId });
        setEmployeeName(name);
      } catch (err) {
        console.error("❌ Failed to fetch employee name:", err);
      }
    }
    fetchName();
  }, [employeeId]);
  return (
    <div style={{ padding: 20 }}>
      <button onClick={onBack}>← Back to Employees</button>
      <h2>Employee {employeeName || "Loading..."} Performance</h2>

      <div style={{ margin: "15px 0" }}>
        <button
          onClick={() => setTab("daily")}
          style={{
            background: tab === "daily" ? "#007bff" : "#e0e0e0",
            color: tab === "daily" ? "white" : "black",
            padding: "6px 10px",
            marginRight: 10,
            borderRadius: 5,
          }}
        >
          Kalender
        </button>
        <button
          onClick={() => setTab("overview")}
          style={{
            background: tab === "overview" ? "#007bff" : "#e0e0e0",
            color: tab === "overview" ? "white" : "black",
            padding: "6px 10px",
            borderRadius: 5,
          }}
        >
          Statistik
        </button>
      </div>

      {tab === "daily" ? (
        <DailyPerformanceView employeeId={employeeId} />
      ) : (
        <PerformanceOverview employeeId={employeeId} />
      )}
    </div>
  );
}