import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";

interface Employee {
  id: number;
  name: string;
  join_date: string;
  monthly_rate: number;
}

interface EmployeeListProps {
  onSelectEmployee: (id: number) => void;
  onGoToTherapies: () => void;
}

export default function EmployeeList({ onSelectEmployee, onGoToTherapies  }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState("");
  const [joindate, setJoinDate] = useState("");
  const [monthlyrate, setMonthlyRate] = useState("");
  const [error, setError] = useState("");

  async function fetchEmployees() {
    try {
      console.log("🔄 Fetching employees from backend...");
      setError("");
      const list = await invoke<Employee[]>('get_employees');
      console.log("📋 Received employees:", list);
      setEmployees(list);
    } catch (error) {
      console.error('❌ Failed to fetch employees:', error);
      setError(`Failed to load employees: ${error}`);
    }
  }

  async function addEmployee() {
    if (!name || !joindate || !monthlyrate) {
      setError("Please fill all fields");
      return;
    }

    try {
      console.log("🔄 Adding employee:", { name, joindate, monthlyrate });
      setError("");
      await invoke('add_employee', { 
        name, 
        joinDate: joindate, 
        monthlyRate: parseFloat(monthlyrate) 
      });
      console.log("✅ Employee added, refreshing list...");
      await fetchEmployees();
      setName("");
      setJoinDate("");
      setMonthlyRate("");
    } catch (error) {
      console.error('❌ Failed to add employee:', error);
      setError(`Failed to add employee: ${error}`);
    }
  }

  useEffect(() => {
    console.log("🎯 EmployeeList component mounted");
    fetchEmployees();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Mitarbeiter</h2>
      
      {error && (
        <div className="text-red-500 bg-red-100 p-2 rounded my-2">
          {error}
        </div>
      )}

      <div className="my-4 space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="border p-1 mr-2"
        />
        <input
          value={joindate}
          onChange={(e) => setJoinDate(e.target.value)}
          placeholder="Beigetreten am (JJJJ-MM-TT)"
          className="border p-1 mr-2"
        />
        <input
          value={monthlyrate}
          onChange={(e) => setMonthlyRate(e.target.value)}
          placeholder="Gehalt pro Monat"
          type="number"
          step="0.01"
          className="border p-1 mr-2"
        />
        <button
          onClick={addEmployee}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Mitarbeiten hinfügen
        </button>
      </div>

      {employees.length === 0 ? (
        <p>Noch Keine Mitarbeiter, fueg welchen hin!</p>
      ) : (
        <ul>
          {employees.map((emp) => (
            <li key={emp.id} className="border-b py-2">
              <strong>{emp.name}</strong> — {emp.join_date} — €{emp.monthly_rate.toFixed(2)}/Monat
              <button
                onClick={() => onSelectEmployee(emp.id)}
                className="ml-4 bg-green-500 text-white px-2 py-1 rounded text-sm"
              >
                Leistung anzeigen
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={onGoToTherapies} style={{ marginTop: 20 }}>
        Therapien Liste
      </button>
    </div>
  );
}