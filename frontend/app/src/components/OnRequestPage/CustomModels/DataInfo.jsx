// import React from "react";
// import { useFieldArray, Controller } from "react-hook-form";

// export default function DataInfo({ control, register }) {
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "dataset_info.feature_list",
//   });

//   return (
//     <div className="mx-auto mt-4 space-y-4">
//       {/* About Dataset */}
//       <div className="flex items-center border border-gray-300 rounded-lg p-2">
//         <span className="bg-gray-200 text-gray-700 px-3 py-2 rounded-l-md">
//           About Dataset:
//         </span>
//         <input
//           type="text"
//           id="datainfo"
//           aria-label="About Dataset"
//           className="flex-1 p-2 border-0 focus:ring-0 focus:outline-none"
//           placeholder="Name, purpose, etc.."
//           {...register(`dataset_info.about_dataset`)}
//         />
//       </div>

//       {/* Parent Div (where cloned elements will be inserted) */}
//       <div id="parent-template-div" className="space-y-3">
//         {fields.map((field, index) => (
//           <div key={field.id} className="flex items-center space-x-2">
//             <span className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md">
//               Column Name & Type
//             </span>
//             <Controller
//               render={({ field }) => (
//                 <input
//                   {...field}
//                   className="flex-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
//                   placeholder="Feature Name"
//                 />
//               )}
//               name={`dataset_info.feature_list.${index}.feature_name`}
//               control={control}
//               defaultValue=""
//             />
//             <Controller
//               render={({ field }) => (
//                 <input
//                   {...field}
//                   className="flex-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
//                   placeholder="Type of Feature"
//                 />
//               )}
//               name={`dataset_info.feature_list.${index}.type_Of_feature`}
//               control={control}
//               defaultValue=""
//             />
//             <button
//               className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
//               type="button"
//               onClick={() => remove(index)}
//             >
//               Remove
//             </button>
//           </div>
//         ))}
//       </div>

//       <button
//         type="button"
//         className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
//         onClick={() => append({ feature_name: "", type_Of_feature: "" })}
//       >
//         Add Feature
//       </button>
//     </div>
//   );
// }
