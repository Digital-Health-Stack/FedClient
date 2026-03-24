// import React, { useState } from "react";

// const modelConfigs = {
//   "Linear Regression": {
//     learningRate: "int",
//     LearningRate2: "int",
//     type: "number",
//     name2: "numIterations",
//     label2: "Number of Iterations",
//     type2: "number",
//   },
//   "Decision Tree": {
//     name2: "maxDepth",
//     label2: "Max Depth",
//     type2: "number",
//     name: "minSamplesSplit",
//     label: "Min Samples Split",
//     type: "number",
//   },
//   "Multi Layer Perceptron":{

//   }
//   // Add more models and their configurations here
// };

// const ModelInfo = ({ onModelInfoChange }) => {
//   const [selectedModel, setSelectedModel] = useState("");
//   const [configValues, setConfigValues] = useState({});

//   const handleModelChange = (event) => {
//     setSelectedModel(event.target.value);
//     setConfigValues({});
//   };

//   const handleConfigChange = (event) => {
//     const { name, value } = event.target;
//     setConfigValues((prevValues) => ({
//       ...prevValues,
//       [name]: value,
//     }));
//     const modelInfo = { model: selectedModel, config: configValues };
//     onModelInfoChange(modelInfo);
//   };

//   return (
//     <div className="container mt-3">
//       <h4>Model Info:</h4>
//       {/* Dropdown for selecting the model */}
//       <div className="input-group mb-3">
//         <label className="input-group-text" htmlFor="modelSelect">
//           Select Model
//         </label>
//         <select
//           className="form-select"
//           id="modelSelect"
//           value={selectedModel}
//           onChange={handleModelChange}
//         >
//           <option value="">Choose Model</option>
//           {Object.keys(modelConfigs).map((model) => (
//             <option key={model} value={model}>
//               {model}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Configuration inputs based on selected model */}
//       {selectedModel && (
//         <div className="mb-3">
//           <h5>{selectedModel} Configurations:</h5>
//           {Object.keys(modelConfigs[selectedModel]).map((param) => (
//             <div key={param} className="input-group mb-3">
//               <span className="input-group-text">{param}</span>
//               <input
//                 placeholder={modelConfigs[selectedModel][param]}
//                 className="form-control"
//                 name={param}
//                 value={configValues[param] || ""}
//                 onChange={handleConfigChange}
//               />
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ModelInfo;
