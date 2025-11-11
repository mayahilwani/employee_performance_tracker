import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";

interface Therapy {
  id: number;
  therapy_name: string;
  cost: number;
  income: number;
}

export default function TherapyList() {
  const [therapies, setTherapies] = useState<Therapy[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTherapy, setEditedTherapy] = useState<Partial<Therapy>>({});
  const [error, setError] = useState("");

  async function loadTherapies() {
    try {
      setError("");
      const list = await invoke<Therapy[]>("get_all_therapies");
      setTherapies(list);
    } catch (err) {
      console.error("❌ Failed to fetch therapies:", err);
      setError(`Failed to load therapies: ${err}`);
    }
  }

  async function saveTherapy(id: number) {
    try {
      await invoke("update_therapy", {
        id,
        therapyName: editedTherapy.therapy_name,
        cost: Number(editedTherapy.cost),
        income: Number(editedTherapy.income),
      });
      setEditingId(null);
      await loadTherapies();
    } catch (err) {
      console.error("❌ Failed to update therapy:", err);
      setError(`Failed to update therapy: ${err}`);
    }
  }

  useEffect(() => {
    loadTherapies();
  }, []);

  return (
    <div>
      <h2>Therapy List</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border={1} cellPadding={6} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Therapy Name</th>
            <th>Cost (€)</th>
            <th>Income (€)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {therapies.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>

              <td>
                {editingId === t.id ? (
                  <input
                    value={editedTherapy.therapy_name ?? ""}
                    onChange={(e) =>
                      setEditedTherapy({
                        ...editedTherapy,
                        therapy_name: e.target.value,
                      })
                    }
                  />
                ) : (
                  t.therapy_name
                )}
              </td>

              <td>
                {editingId === t.id ? (
                  <input
                    type="number"
                    value={editedTherapy.cost ?? ""}
                    onChange={(e) =>
                      setEditedTherapy({
                        ...editedTherapy,
                        cost: Number(e.target.value),
                      })
                    }
                  />
                ) : (
                  t.cost
                )}
              </td>

              <td>
                {editingId === t.id ? (
                  <input
                    type="number"
                    value={editedTherapy.income ?? ""}
                    onChange={(e) =>
                      setEditedTherapy({
                        ...editedTherapy,
                        income: Number(e.target.value),
                      })
                    }
                  />
                ) : (
                  t.income
                )}
              </td>

              <td>
                {editingId === t.id ? (
                  <>
                    <button onClick={() => saveTherapy(t.id)}>💾 Save</button>
                    <button onClick={() => setEditingId(null)}>✖ Cancel</button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(t.id);
                      setEditedTherapy({ ...t });
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
