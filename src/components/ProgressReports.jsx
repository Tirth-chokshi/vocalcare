export default function ProgressReports({ reports }) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Progress Reports</h2>
        {reports.length === 0 ? (
          <p>No progress reports available.</p>
        ) : (
          <ul className="space-y-4">
            {reports.map((report) => (
              <li key={report.id} className="border-b pb-2">
                <p><strong>Date:</strong> {new Date(report.date).toLocaleDateString()}</p>
                <p><strong>Progress:</strong> {report.progressNotes}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  