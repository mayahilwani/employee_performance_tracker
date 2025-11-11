import { useState } from "react"; 
import EmployeeList from "./components/EmployeeList"; 
import PerformanceView from "./components/performance/index"; 
//import PerformanceView from "./components/performance/index/DailyPerformanceList"; 
import TherapyList from "./components/TherapyList";

export default function App() { 
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null); 
  const [view, setView] = useState<"employees" | "performance" | "therapies">("employees");
  
  function handleSelectEmployee(id: number) {
    setSelectedEmployee(id);
    setView("performance");
  }

  function handleBackToEmployees() {
    setSelectedEmployee(null);
    setView("employees");
  }
  return (
    <div style={{ padding: 20 }}>
      {view === "employees" && (
        <>
          <h2>Mitarbeiter Liste</h2>
          <EmployeeList
            onSelectEmployee={handleSelectEmployee}
            onGoToTherapies={() => setView("therapies")}
          />
        </>
      )}

      {view === "performance" && selectedEmployee !== null && (
        <>
          <button onClick={handleBackToEmployees}>← Back to Employees</button>
          <PerformanceView
            employeeId={selectedEmployee}
            onBack={handleBackToEmployees}
          />
        </>
      )}

      {view === "therapies" && (
        <>
          <button onClick={() => setView("employees")}>← Back to Employees</button>
          <TherapyList />
        </>
      )}
    </div>
  );
}
