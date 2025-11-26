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
  onGoToEmployeeEdit: () => void;
}

export default function EmployeeList({ onSelectEmployee, onGoToTherapies, onGoToEmployeeEdit }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
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

      {employees.length === 0 ? (
        <p>Noch Keine Mitarbeiter, fueg welchen hin!</p>
      ) : (
        <ul>
          {employees.map((emp) => (
            <li key={emp.id} className="border-b py-2">
              <strong>{emp.name}</strong>
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
      <button onClick={onGoToEmployeeEdit} style={{ marginTop: 20 }}>
        Mitarbeiter Liste
      </button>
    </div>
  );
}