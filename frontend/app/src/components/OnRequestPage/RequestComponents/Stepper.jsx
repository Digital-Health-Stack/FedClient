import React from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

export default function Stepper({ steps, currentStep, setCurrentStep }) {
  return (
    <div className="w-50 space-y-15 ml-10 mt-10">
      <h2 className="text-2xl font-bold mb-8 text-blue-600">
        New Model Request
      </h2>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-4 cursor-pointer" onClick={() => setCurrentStep(step.id)}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200
              ${
                index <= currentStep
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }
              `}
            >
              {index < currentStep ? (
                <CheckIcon className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            <div
              className={`${
                index === currentStep
                  ? "font-semibold text-gray-900"
                  : "text-gray-500"
              }`}
            >
              <span className="text-sm">Step {index + 1}</span>
              <span className="text-base block">{step.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// import React from "react";
// import { CheckIcon } from "@heroicons/react/24/outline";

// export default function Stepper({ steps, currentStep }) {
//   return (
//     <div className="w-64 bg-white h-screen p-6 border-r">
//       <div className="space-y-4">
//         {steps.map((step, index) => (
//           <div key={step.id} className="flex items-center space-x-3">
//             <div
//               className={`w-8 h-8 rounded-full flex items-center justify-center
//               ${
//                 index <= currentStep ? "bg-blue-600 text-white" : "bg-gray-100"
//               }`}
//             >
//               {index < currentStep ? (
//                 <CheckIcon className="w-4 h-4" />
//               ) : (
//                 index + 1
//               )}
//             </div>
//             <span className={`${index === currentStep ? "font-semibold" : ""}`}>
//               {step.label}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
