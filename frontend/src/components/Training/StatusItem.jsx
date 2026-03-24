// Component for status-based values
const StatusItem = ({ label, status }) => (
  <div className="flex flex-col">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <span
      className={`text-lg font-semibold ${
        status === "In Progress" || status === "Connected"
          ? "text-green-600"
          : "text-red-600"
      }`}
    >
      {status}
    </span>
  </div>
);

export default StatusItem;
