import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Stepper from "../components/OnRequestPage/RequestComponents/Stepper";
import OrganizationDetailsStep from "../components/OnRequestPage/RequestComponents/OrganizationDetailsStep";
import SelectDatasetsStep from "../components/OnRequestPage/RequestComponents/SelectDatasetsStep";
import StatisticalInfoStep from "../components/OnRequestPage/RequestComponents/StatisticalInfoStep";
import ModelSelectionStep from "../components/OnRequestPage/RequestComponents/ModelSelectionStep";
import HyperparametersInfoStep from "../components/OnRequestPage/RequestComponents/Hyperparameters";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { createSession } from "../services/federatedService";
import {
  BuildingOfficeIcon,
  FolderIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const steps = [
  { id: 0, label: "Organization Details", icon: BuildingOfficeIcon },
  { id: 1, label: "Dataset Information", icon: FolderIcon },
  { id: 2, label: "Model Selection", icon: CpuChipIcon },
  { id: 3, label: "Statistical Info", icon: ChartBarIcon },
  { id: 4, label: "Hyperparameters", icon: WrenchScrewdriverIcon }
];

export default function Request() {
  const [currentStep, setCurrentStep] = useState(0);
  const methods = useForm({});

  const { api } = useAuth();
  const navigate = useNavigate();

  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = async (data) => {
    if (data.organisation_name === "") {
      toast.error("Please enter your organization name.")
      return setCurrentStep(0);
    }
    if (!data.dataset_info.server_stats) {
      toast.error("Please fetch at least one dataset.")
      return setCurrentStep(1);
    }
    if (!data.dataset_info.task_id) {
      toast.error("Please select a task for the dataset.")
      return setCurrentStep(1);
    }
    if (!data.dataset_info.output_columns || data.dataset_info.output_columns.length === 0) {
      toast.error("Please select at least one output column.")
      return setCurrentStep(1);
    }
    if (!data.model_name || data.model_name === "" || !data.model_info) {
      toast.error("Please select a model.")
      return setCurrentStep(2);
    }
    if (!data.expected_results || !data.expected_results.std_mean || !data.expected_results.std_deviation) {
      toast.error("Please provide expected results.")
      return setCurrentStep(3);
    }
    console.log("Request JSON: ", data);
    if (!data.hyperparameters || !data.hyperparameters.wait_time || !data.hyperparameters.no_of_rounds) {
      toast.error("Please provide hyperparameters.")
      return setCurrentStep(4);
    }


    const requestData = {
      fed_info: data,
      // client_token: api.getAccessToken(),
    };

    try {
      const res = await createSession(api, requestData);
      navigate(`/trainings/${res.data.session_id}`);
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="flex bg-gray-50 w-full">
        <Stepper steps={steps} currentStep={currentStep} setCurrentStep={setCurrentStep} />

        <div className="flex-1 p-8 ml-0">
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800">
                {steps[currentStep].label}
              </h3>
              <p className="text-gray-500 mt-2 text-sm">
                {currentStep === 0 &&
                  "Enter your organization details to proceed with the model request"}
                {currentStep === 1 &&
                  "Select datasets you want to include in the training process"}
                {currentStep === 2 &&
                  "Choose the machine learning model architecture"}
                {currentStep === 3 &&
                  "Configure statistical parameters for model training"}
                {currentStep === 4 &&
                  "Set hyperparameters for the training process"}
              </p>
            </div>

            <div className="space-y-8">
              {currentStep === 0 && <OrganizationDetailsStep />}
              {currentStep === 1 && <SelectDatasetsStep />}
              {currentStep === 2 && <ModelSelectionStep />}
              {currentStep === 3 && <StatisticalInfoStep />}
              {currentStep === 4 && <HyperparametersInfoStep />}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-lg border font-medium flex items-center transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Previous
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center transition-colors"
                >
                  Next
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <input
                  {...methods.register("submit")}
                  type="submit"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center transition-colors"
                  value={"Submit Request"}
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}

// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import Stepper from "../components/OnRequestPage/RequestComponents/Stepper.jsx";
// import OrganizationDetailsStep from "../components/OnRequestPage/RequestComponents/OrganizationDetailsStep.jsx";
// import SelectDatasetsStep from "../components/OnRequestPage/RequestComponents/SelectDatasetsStep.jsx";
// import StatisticalInfoStep from "../components/OnRequestPage/RequestComponents/StatisticalInfoStep.jsx";
// import ModelSelectionStep from "../components/OnRequestPage/RequestComponents/ModelSelectionStep.jsx";
// import {
//   BuildingOfficeIcon,
//   FolderIcon,
//   CpuChipIcon,
//   ChartBarIcon,
//   ArrowRightIcon,
//   ArrowLeftIcon,
// } from "@heroicons/react/24/outline";

// const steps = [
//   { id: 0, label: "Organization Details", icon: BuildingOfficeIcon },
//   { id: 1, label: "Dataset Information", icon: FolderIcon },
//   { id: 2, label: "Model Selection", icon: CpuChipIcon },
//   { id: 3, label: "Statistical Info", icon: ChartBarIcon },
// ];

// export default function Request() {
//   const [currentStep, setCurrentStep] = useState(0);
//   const {
//     register,
//     control,
//     handleSubmit,
//     formState: { errors },
//     trigger,
//   } = useForm({ mode: "onChange" });

//   const handleNext = async () => {
//     const isValid = await trigger();
//     if (isValid) setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
//   };

//   const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

//   const onSubmit = (data) => console.log("Form Data:", data);

//   return (
//     <div className="flex bg-gray-50 w-full">
//       <Stepper steps={steps} currentStep={currentStep} />

//       <div className="flex-1 p-8 ml-0">
//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8"
//         >
//           <div className="mb-8">
//             <h3 className="text-2xl font-semibold text-gray-800">
//               {steps[currentStep].label}
//             </h3>
//             <p className="text-gray-500 mt-2 text-sm">
//               {currentStep === 0 &&
//                 "Enter your organization details to proceed with the model request"}
//               {currentStep === 1 &&
//                 "Select datasets you want to include in the training process"}
//               {currentStep === 2 &&
//                 "Choose the machine learning model architecture"}
//               {currentStep === 3 &&
//                 "Configure statistical parameters for model training"}
//             </p>
//           </div>

//           <div className="space-y-8">
//             {currentStep === 0 && (
//               <OrganizationDetailsStep register={register} errors={errors} />
//             )}
//             {currentStep === 1 && (
//               <SelectDatasetsStep
//                 register={register}
//                 control={control}
//                 errors={errors}
//               />
//             )}
//             {currentStep === 2 && (
//               <ModelSelectionStep
//                 control={control}
//                 register={register}
//                 errors={errors}
//               />
//             )}
//             {currentStep === 3 && (
//               <StatisticalInfoStep
//                 control={control}
//                 register={register}
//                 errors={errors}
//               />
//             )}
//           </div>

//           <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between">
//             {currentStep > 0 && (
//               <button
//                 type="button"
//                 onClick={handlePrev}
//                 className="px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-lg border font-medium flex items-center transition-colors"
//               >
//                 <ArrowLeftIcon className="w-5 h-5 mr-2" />
//                 Previous
//               </button>
//             )}
//             <div className="ml-auto flex space-x-4">
//               {currentStep < steps.length - 1 ? (
//                 <button
//                   type="button"
//                   onClick={handleNext}
//                   className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center transition-colors"
//                 >
//                   Next
//                   <ArrowRightIcon className="w-5 h-5 ml-2" />
//                 </button>
//               ) : (
//                 <button
//                   type="submit"
//                   className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center transition-colors"
//                 >
//                   Submit Request
//                 </button>
//               )}
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import DataInfo from "../components/OnRequestPage/CustomModels/DataInfo";
// import MultiLayerPerceptron from "../components/OnRequestPage/CustomModels/MultiLayerPerceptron";
// import CNN from "../components/OnRequestPage/CNN";
// import { useGlobalData } from "../GlobalContext";
// import { useForm } from "react-hook-form";
// import CustomSVM from "../components/OnRequestPage/CustomSVM";
// import LandMarkSVM from "../components/OnRequestPage/LandMarkSVM";
// import LinearRegression from "../components/OnRequestPage/LinearRegression";
// import { createSession } from "../services/federatedService";
// import { useAuth } from "../contexts/AuthContext";
// import { useNavigate } from "react-router-dom";
// import {
//   AcademicCapIcon,
//   DocumentTextIcon,
//   CubeIcon,
//   ChartBarIcon,
// } from "@heroicons/react/24/outline";

// // Required URLs
// const federatedSessionRequestURL =
//   process.env.REACT_APP_REQUEST_FEDERATED_SESSION_URL;

// /*
// ==================================================
// Form schema:
//  {fed_info: {obj}, client_token: string}
// ==================================================

// ==================================================
// fed_info schema:
// {
//   dataset_info :
//   {
//     about_dataset : string,
//     feature_list:
//     {
//       0: {feature_name: 'col1', type_Of_feature: 'int'}
//       1: {feature_name: 'col2', type_Of_feature: 'array of shape (256,256)'}
//     }
//   }
//   model_info : { obj, structure depends on individual model itself}
//   model_name: "string"
//   organisation_name: "string"
// }
// ==================================================

// */
// export default function Request() {
//   // React States
//   const [selectedModel, setSelectedModel] = useState("");
//   const { GlobalData, setGlobalData } = useGlobalData();
//   const { register, control, handleSubmit } = useForm();
//   const { api } = useAuth();
//   const navigate = useNavigate();

//   // Avail Models (keys not labels will be used in model_name)
//   const availableModels = {
//     LinearRegression: {
//       label: "Linear Regression",
//       component: <LinearRegression control={control} register={register} />,
//     },

//     SVM: {
//       label: "SVM",
//       component: <CustomSVM control={control} register={register} />,
//     },

//     LandMarkSVM: {
//       label: "LandMark SVM",
//       component: <LandMarkSVM control={control} register={register} />,
//     },

//     multiLayerPerceptron: {
//       label: "Multi Layer Perceptron",
//       component: <MultiLayerPerceptron control={control} register={register} />,
//     },
//     CNN: {
//       label: "CNN",
//       component: <CNN control={control} register={register} />,
//     },
//   };

//   const onSubmit = async (formData) => {
//     const requestData = {
//       fed_info: formData,
//       // client_token: clientToken,
//     };
//     console.log("sending in request:", requestData);
//     try {
//       createSession(api, requestData)
//         .then((res) => {
//           const newRequestData = {
//             RequestId: `${GlobalData.Client.ClientID}${Date.now()}`,
//             OrgName: formData.organisation_name,
//             Status: "Requested",
//             Model: formData.model_info,
//             Data: formData.dataset_info,
//           };

//           // const session_token = res.data.session_token;
//           // setSessions((prevList) => [...prevList, session_token]);
//           // alert("Federated Learning Request is accepted!");
//           setGlobalData((prevGlobalData) => ({
//             ...prevGlobalData,
//             CurrentModels: [...prevGlobalData.CurrentModels, newRequestData],
//           }));

//           navigate(`/TrainingStatus/details/${res.data.session_id}`);
//         })
//         .catch(console.error);
//       // const res = await axios.post(federatedSessionRequestURL, requestData);
//       // // We dont need to store this here this can be fetch from server side
//       // const newRequestData = {
//       //   RequestId: `${GlobalData.Client.ClientID}${Date.now()}`,
//       //   OrgName: formData.organisation_name,
//       //   Status: "Requested",
//       //   Model: formData.model_info,
//       //   Data: formData.dataset_info,
//       // };

//       // if (res.status === 200) {
//       //   // Client Background Task --> Save the session token in the use State have to implement logic in backend

//       //   const session_token = res.data.session_token;
//       //   setSessions((prevList) => [...prevList, session_token]);
//       //   alert("Federated Learning Request is accepted!");
//       //   setGlobalData((prevGlobalData) => ({
//       //     ...prevGlobalData,
//       //     CurrentModels: [...prevGlobalData.CurrentModels, newRequestData],
//       //   }));
//       // } else {
//       //   console.error("Failed to submit the request:", res);
//       // }
//     } catch (error) {
//       console.error("Error submitting the request:", error);
//     }
//   };

//   return (
//     <div className="bg-gray-100 flex flex-col items-center p-6 w-full">
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-lg space-y-6"
//       >
//         <div className="flex items-center space-x-2">
//           <AcademicCapIcon className="h-6 w-6 text-blue-600" />
//           <h4 className="text-lg font-semibold">Organization Name</h4>
//         </div>
//         <input
//           type="text"
//           placeholder="e.g. XYZ"
//           {...register("organisation_name")}
//           className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         {/* Dataset info */}
//         <div className="flex items-center space-x-2">
//           <DocumentTextIcon className="h-6 w-6 text-green-600" />
//           <h4 className="text-lg font-semibold">Dataset Information</h4>
//         </div>
//         <DataInfo control={control} register={register} />

//         {/* Statistical Information */}
//         <div className="flex items-center space-x-2">
//           <ChartBarIcon className="h-6 w-6 text-yellow-600" />
//           <h4 className="text-lg font-semibold">Statistical Information</h4>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-lg font-medium text-gray-700">
//               Expected Standard Mean
//             </label>
//             <input
//               type="number"
//               id="standardMean"
//               step="0.00001"
//               className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="e.g., 0.5"
//               {...register("std_mean")}
//             />
//           </div>
//           <div>
//             <label className="block text-lg font-medium text-gray-700">
//               Expected Standard Deviation
//             </label>
//             <input
//               type="number"
//               id="standardDeviation"
//               step="0.00001"
//               className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="e.g., 0.1"
//               {...register("std_deviation")}
//             />
//           </div>
//         </div>

//         {/* model selection */}
//         <div className="flex items-center space-x-2">
//           <CubeIcon className="h-6 w-6 text-purple-600" />
//           <h4 className="text-lg font-semibold">Select Model</h4>
//         </div>
//         <select
//           {...register("model_name")}
//           onChange={(e) => setSelectedModel(e.target.value)}
//           className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//         >
//           <option value="">Select your model</option>
//           {Object.keys(availableModels).map((model_value) => (
//             <option key={model_value} value={model_value}>
//               {availableModels[model_value].label}
//             </option>
//           ))}
//         </select>

//         {selectedModel && (
//           <div className="p-4 border rounded-md bg-gray-50">
//             {availableModels[selectedModel].component}
//           </div>
//         )}

//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
//         >
//           Request
//         </button>
//       </form>
//     </div>
//   );
// }

// ################# Don't delete  #################
// {
//   "organisation_name": "CDIS",
//   "dataset_info": {
//       "about_dataset": "testing",
//       "feature_list": [
//           {
//               "feature_name": "img",
//               "type_Of_feature": "numpy array"
//           }
//       ]
//   },
//   "model_name": "CNN",
//   "std_mean": "2",
//   "std_deviation": "0.2",
//   "model_info": {
//       "input_shape": "(128,128,1)",
//       "output_layer": {
//           "num_nodes": "1",
//           "activation_function": "sigmoid"
//       },
//       "loss": "mse",
//       "optimizer": "adam",
//       "test_metrics": [
//           "mse"
//       ],
//       "layers": [
//           {
//               "layer_type": ""
//           },
//           {
//               "layer_type": "convolution",
//               "filters": "16",
//               "kernel_size": "(2,2)",
//               "stride": "(2,2)",
//               "activation_function": "relu"
//           },
//           {
//               "layer_type": "pooling",
//               "pooling_type": "max",
//               "pool_size": "(2,2)"
//           },
//           {
//               "layer_type": "flatten"
//           },
//       ]
//   }
// }
