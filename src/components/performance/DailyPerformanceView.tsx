import { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { invoke } from "@tauri-apps/api/core";

interface Performance {
  id: number;
  employee_id: number;
  date: string;
  hours_worked: number;
  status: string;
  income: number;
  kg_num: number;
  mt_num: number;
  mld_num: number;
  mld_45_num: number;
  mld_60_num: number;
  ma_num: number;
  fango_num: number;
  ultraschal_num: number;
  hb_num: number;
}
interface FormState {
  hours: string;
  status: string;
  income: string;
  kg: string;
  mt: string;
  mld: string;
  mld_45: string;
  mld_60: string;
  ma: string;
  fango: string;
  ultraschal: string;
  hb: string;
}
export default function DailyPerformanceView({ employeeId }: { employeeId: number }) {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [form, setForm] = useState<FormState>({
  hours: "0",
  status: "Present",
  income: "0",
  kg: "0",
  mt: "0",
  mld: "0",
  mld_45: "0",
  mld_60: "0",
  ma: "0",
  fango: "0",
  ultraschal: "0",
  hb: "0",
  });
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);


  async function loadPerformance() {
    try {
      const result = await invoke<Performance[]>("get_all_performance", {
        employeeId: employeeId,
      });
      console.log("✅ Loaded performances:", result);
      setPerformances(result);
    } catch (err) {
      console.error("❌ Failed to load performances:", err);
    }
  }

  useEffect(() => {
    loadPerformance();
  }, []);

  // when date changes, update form with record if exists
  useEffect(() => {
    // const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const day = selectedDate.toLocaleDateString("sv-SE");
    const record = performances.find((p) => p.date === day);
    if (record) {
      setSelectedRecordId(record.id);
      setForm({
        hours: record.hours_worked?.toString() || "0" ,
        status: record.status,
        income: record.income?.toString() || "0",
        kg: record.kg_num?.toString() || "0",
        mt: record.mt_num?.toString() || "0",
        mld: record.mld_num?.toString() || "0",
        mld_45: record.mld_45_num?.toString() || "0",
        mld_60: record.mld_60_num?.toString() || "0",
        ma: record.ma_num?.toString() || "0",
        fango: record.fango_num?.toString() || "0",
        ultraschal: record.ultraschal_num?.toString() || "0",
        hb: record.hb_num?.toString() || "0",
      });
    } else {
      setSelectedRecordId(null);
      setForm({ hours: "0", status: "Present", income: "0", kg: "0", mt: "0", mld: "0", mld_45: "0", mld_60: "0", ma: "0", fango: "0", ultraschal: "0", hb: "0" });
    }
  }, [selectedDate, performances]);

  async function savePerformance() {
    if (!form.hours || !form.income) {
      alert("Please fill in hours and income");
      return;
    }
    alert("employeeId: " + employeeId);
    const payload = {
      employeeId: employeeId,
      date: selectedDate.toLocaleDateString("sv-SE"),
      hoursWorked: parseFloat(form.hours),
      status: form.status,
      income: parseFloat(form.income),
      kgNum: parseInt((form as any).kg) || 0,
      mtNum: parseInt((form as any).mt) || 0,
      mldNum: parseInt((form as any).mld) || 0,
      mld45Num: parseInt((form as any).mld_45) || 0,
      mld60Num: parseInt((form as any).mld_60) || 0,
      maNum: parseInt((form as any).ma) || 0,
      fangoNum: parseInt((form as any).fango) || 0,
      ultraschalNum: parseInt((form as any).ultraschal) || 0,
      hbNum: parseInt((form as any).hb) || 0,
    };

    try {
      if (selectedRecordId) {
        console.log("📝 Updating performance:", payload);
        await invoke("update_performance", { id: selectedRecordId, ...payload });
      } else {
        console.log("➕ Adding performance:", payload);
        await invoke("add_performance", payload);
      }
      await loadPerformance();
      alert("✅ Saved successfully!");
    } catch (err) {
      alert("❌ Save failed!");
      console.error("❌ Save failed:", err);
    }
  }

  function tileClassName({ date }: { date: Date }) {
    const day = date.toLocaleDateString("sv-SE");
    const record = performances.find((p) => p.date === day);
    if (!record) return "";
    if (record.status === "Krank") return "day-sick";
    if (record.status === "Urlaub") return "day-vacation";
    if (record.status === "Present") return "day-present";
    if (record.status === "Feiertag") return "holiday-day";
    if (record.status === "Sonstige") return "null";
  }

  return (
  <div
    style={{
      display: "flex",
      marginTop: 20,
      gap: "20px",
      alignItems: "flex-start",
    }}
  >
    {/* Left side: Calendar */}
    <div style={{ flex: 1 }}>
      <Calendar
        onChange={(val) => setSelectedDate(val as Date)}
        value={selectedDate}
        tileClassName={tileClassName}
      />

      <style>
        {`
          .day-present { background: #c8f7c5 !important; border-radius: 6px; }
          .day-sick { background: #f85a2eff !important; border-radius: 6px; }
          .day-vacation { background: #b3e5fc !important; border-radius: 6px; }
          .holiday-day { background: #f59fefff!important; border-radius: 6px; }
        `}
      </style>
    </div>

    {/* Right side: Form */}
    <div
      style={{
        flex: 1,
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        background: "#fafafa",
      }}
    >
      <h4 style={{ marginBottom: "20px" }}>
        {selectedRecordId ? "Edit" : "Add"} Record for{" "}
        {selectedDate.toLocaleDateString("sv-SE")}
      </h4>

      {/* Each field stacked vertically */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {[
          { label: "Status", key: "status", type: "select" },
          { label: "Arbeitsstunden", key: "hours", type: "number" },
          { label: "Income (€)", key: "income", type: "number" },
          { label: "KG", key: "kg", type: "number" },
          { label: "MT", key: "mt", type: "number" },
          { label: "MLD", key: "mld", type: "number" },
          { label: "MLD 45", key: "mld_45", type: "number" },
          { label: "MLD 60", key: "mld_60", type: "number" },
          { label: "MA", key: "ma", type: "number" },
          { label: "Fango", key: "fango", type: "number" },
          { label: "Ultraschal", key: "ultraschal", type: "number" },
          { label: "HB", key: "hb", type: "number" },
        ].map((field, i) => (
          <div
            key={field.key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <label
              style={{
                width: "40%",
                textAlign: "right",
                fontWeight: 500,
              }}
            >
              {field.label}:
            </label>

            {field.type === "select" ? (
              <select
                style={{ flex: 1, padding: "6px" }}
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option>Present</option>
                <option>Krank</option>
                <option>Urlaub</option>
                <option>Feiertag</option>
                <option>Sonstige</option>
              </select>
            ) : (
              <input
                ref={(el) => {inputRefs.current[i] = el;}}
                style={{ flex: 1, padding: "6px" }}
                type="number"
                value={(form as any)[field.key]}
                onFocus={(e) => {
                  if (e.target.value === "0") e.target.value = "";
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    setForm({ ...form, [field.key]: "0" });
                  }
                }}
                onChange={(e) =>
                  setForm({ ...form, [field.key]: e.target.value })
                }
                onKeyDown={(e) => {
                  console.log("keyDown! '"+e.key+"'");
                  if (e.key === "Enter") {
                    e.preventDefault();

                    const next = inputRefs.current[i + 1];
                    if (next) {
                      next.focus();
                    } else {
                      // optional: save when last field is reached
                      savePerformance();
                    }
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();

                    const prev = inputRefs.current[i - 1];
                    if (prev) {
                      prev.focus();
                    } else {
                      const prev = inputRefs.current[i];
                      if (prev)
                        {prev.focus();}
                    }
                  }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();

                    const next = inputRefs.current[i + 1];
                    if (next) {
                      next.focus();
                    } else {
                      // optional: save when last field is reached
                      //savePerformance();
                    }
                  }
                }}
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={savePerformance}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          border: "none",
          background: "#007bff",
          color: "white",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {selectedRecordId ? "speichern" : "Hinfügen"}
      </button>
    </div>
  </div>
);
}
