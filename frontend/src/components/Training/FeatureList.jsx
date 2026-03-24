const FeatureList = ({ label, features }) => (
  <div className="mt-4">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    {console.log("Checkpoint 2: ", features)}
    {features?.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-2">
        {/* {features.map((feature, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
            >
              {feature}
            </span>
          ))} */}
      </div>
    ) : (
      <span className="text-gray-400">N/A</span>
    )}
  </div>
);

export default FeatureList;
