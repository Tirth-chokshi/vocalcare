export default function DiagnosesList({ diagnoses }) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Diagnoses</h2>
        {diagnoses.length === 0 ? (
          <p>No diagnoses recorded.</p>
        ) : (
          <ul className="space-y-2">
            {diagnoses.map((diagnosis) => (
              <li key={diagnosis.id}>
                {diagnosis.name} - Diagnosed on: {new Date(diagnosis.diagnosisDate).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }