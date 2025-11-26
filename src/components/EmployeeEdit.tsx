import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";

interface Employee {
  id: number;
  name: string;
  join_date: string;
  monthly_rate: number;
  avg_hours: number;
}

interface EmployeeEditProps {
  onSelectEmployee: (id: number) => void;
  //onGoToTherapies: () => void;
}

export default function EmployeeEdit({ onSelectEmployee  }: EmployeeEditProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState("");
  const [joindate, setJoinDate] = useState("");
  const [monthlyrate, setMonthlyRate] = useState("");
  const [avghours, setAvgHours] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedEmployee, setEditedEmployee] = useState<Partial<Employee>>({});
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
  async function saveEmployee(id: number) {
    try {
      await invoke("update_employee", {
        id: id,
        name: editedEmployee.name,
        joinDate: editedEmployee.join_date,
        monthlyRate: Number(editedEmployee.monthly_rate),
        avgHours: Number(editedEmployee.avg_hours),
      });
      setEditingId(null);
      await fetchEmployees();
    } catch (err) {
      console.error("❌ Failed to update employee:", err);
      setError(`Failed to update employee: ${err}`);
    }
  }
  async function addEmployee() {
    if (!name || !joindate || !monthlyrate || !avghours) {
      setError("Please fill all fields");
      return;
    }

    try {
      console.log("🔄 Adding employee:", { name, joindate, monthlyrate, avghours });
      setError("");
      await invoke('add_employee', { 
        name, 
        joinDate: joindate, 
        monthlyRate: parseFloat(monthlyrate),
        avgHours: parseFloat(avghours)
      });
      console.log("✅ Employee added, refreshing list...");
      await fetchEmployees();
      setName("");
      setJoinDate("");
      setMonthlyRate("");
      setAvgHours("");
    } catch (error) {
      console.error('❌ Failed to add employee:', error);
      setError(`Failed to add employee: ${error}`);
    }
  }
  async function deleteEmployee(employeeId: number) {
    
    try {
      console.log("🔄 Deleting employee:", { name, joindate, monthlyrate });
      setError("");
      await invoke('delete_employee', { 
        employeeId: employeeId
      });
      console.log("✅ Employee deleted, refreshing list...");
      await fetchEmployees();
      setName("");
      setJoinDate("");
      setMonthlyRate("");
      setAvgHours("");
    } catch (error) {
      console.error('❌ Failed to delete employee:', error);
      setError(`Failed to delete employee: ${error}`);
    }
  }
  useEffect(() => {
    console.log("🎯 EmployeeEdit component mounted");
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
          step="500.0"
          className="border p-1 mr-2"
        />
        <input
          value={avghours}
          onChange={(e) => setAvgHours(e.target.value)}
          placeholder="Stunden pro Tag"
          type="number"
          step="0.1"
          className="border p-1 mr-2"
        />
        <button
          onClick={addEmployee}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Mitarbeiter hinfügen
        </button>
      </div>

      {employees.length === 0 ? (
        <p>Noch Keine Mitarbeiter, fueg welchen hin!</p>
      ) : (
        <ul>
          {employees.map((emp) => (
            <li key={emp.id} className="border-b py-2">
              <strong>{emp.name}</strong> — {emp.join_date} — €{emp.monthly_rate.toFixed(2)}/Monat - {emp.avg_hours}st/t
              <button
                onClick={() => onSelectEmployee(emp.id)}
                className="ml-4 bg-green-500 text-white px-2 py-1 rounded text-sm"
              >
                Löschen
              </button>
            </li>
          ))}
        </ul>
      )}

      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Datum</th>
            <th>Einkomm (€)</th>
            <th>Stunden/tag</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>

              <td>
                {editingId === t.id ? (
                  <input
                    value={editedEmployee.name ?? ""}
                    onChange={(e) =>
                      setEditedEmployee({
                        ...editedEmployee,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  t.name
                )}
              </td>

              <td>
                {editingId === t.id ? (
                  <input
                    type="number"
                    value={editedEmployee.join_date ?? ""}
                    onChange={(e) =>
                      setEditedEmployee({
                        ...editedEmployee,
                        join_date: e.target.value,
                      })
                    }
                  />
                ) : (
                  t.join_date
                )}
              </td>

              <td>
                {editingId === t.id ? (
                  <input
                    type="number"
                    value={editedEmployee.monthly_rate ?? ""}
                    onChange={(e) =>
                      setEditedEmployee({
                        ...editedEmployee,
                        monthly_rate: Number(e.target.value),
                      })
                    }
                  />
                ) : (
                  t.monthly_rate
                )}
              </td>
              <td>
                {editingId === t.id ? (
                  <input
                    type="number"
                    value={editedEmployee.avg_hours ?? ""}
                    onChange={(e) =>
                      setEditedEmployee({
                        ...editedEmployee,
                        avg_hours: Number(e.target.value),
                      })
                    }
                  />
                ) : (
                  t.avg_hours
                )}
              </td>

              <td>
                {editingId === t.id ? (
                  <>
                    <button onClick={() => saveEmployee(t.id)}>💾 Save</button>
                    <button onClick={() => setEditingId(null)}>✖ Cancel</button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(t.id);
                      setEditedEmployee({ ...t });
                    }}
                  >
                    ✏️ Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}