export default function MedicationList({ medications }) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Current Medications</h2>
        {medications.length === 0 ? (
          <p>No current medications.</p>
        ) : (
          <ul className="space-y-2">
            {medications.map((med) => (
              <li key={med.id}>
                {med.name} - {med.dosage} ({med.frequency})
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }