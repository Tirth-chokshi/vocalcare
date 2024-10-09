export default function TherapyPlan({ plan }) {
    if (!plan) return <div>No current therapy plan.</div>;
  
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Current Therapy Plan</h2>
        <p><strong>Created:</strong> {new Date(plan.createdAt).toLocaleDateString()}</p>
        <p><strong>Goals:</strong> {plan.goals}</p>
        <p><strong>Interventions:</strong> {plan.interventions}</p>
      </div>
    );
  }