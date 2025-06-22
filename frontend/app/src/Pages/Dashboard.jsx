import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import {
  getAllSessions,
  getUserInitiatedSessions,
} from "../services/federatedService";
import {
  getRawDatasets,
  getProcessedDatasets,
} from "../services/privateService";

export default function Dashboard() {
  const [initiatedSessions, setInitiatedSessions] = useState([]);
  const [datasets, setDatasets] = useState({ uploads: [], processed: [] });
  const [sessions, setSessions] = useState([]);
  const { api } = useAuth();

  // Update fetchInitiatedSession
  const fetchInitiatedSession = async () => {
    try {
      const res = await getUserInitiatedSessions(api);
      // Check if res.data is an array before slicing
      const data = Array.isArray(res.data) ? res.data : [];
      setInitiatedSessions(data.slice(0, 5));
    } catch (error) {
      setInitiatedSessions([]);
      console.error("Error fetching initiated sessions:", error);
    }
  };

  // Update fetchDatasets
  const fetchDatasets = async () => {
    try {
      const [raw, processed] = await Promise.all([
        getRawDatasets().catch(() => ({ data: [] })), // Handle rejected promises
        getProcessedDatasets().catch(() => ({ data: [] })),
      ]);

      // Ensure data is an array
      const uploads = Array.isArray(raw.data) ? raw.data : [];
      const processedData = Array.isArray(processed.data) ? processed.data : [];

      setDatasets({ uploads, processed: processedData });
    } catch (error) {
      setDatasets({ uploads: [], processed: [] });
      console.error("Error fetching datasets:", error);
    }
  };

  // Update fetchSessions
  const fetchSessions = async () => {
    try {
      const res = await getAllSessions(api);
      const data = Array.isArray(res.data) ? res.data : [];
      setSessions(data.slice(0, 5));
    } catch (error) {
      setSessions([]);
      console.error("Error fetching sessions:", error);
    }
  };
  const statusMap = {
    1: { text: "Pre-Training", color: "bg-blue-100 text-blue-800" },
    4: { text: "Training", color: "bg-yellow-100 text-yellow-800" },
    5: { text: "Completed", color: "bg-green-100 text-green-800" },
    "-1": { text: "Failed", color: "bg-red-100 text-red-800" },
  };

  useEffect(() => {
    fetchInitiatedSession();
    fetchDatasets();
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* <h1 className="text-3xl font-bold text-gray-900 mb-8">
          FedClient Dashboard
        </h1> */}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Sessions</p>
                <p className="text-2xl font-semibold mt-2">
                  {initiatedSessions.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <Link
              to="/TrainingStatus"
              className="text-blue-600 text-sm mt-4 block hover:underline"
            >
              View all sessions →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Raw Datasets</p>
                <p className="text-2xl font-semibold mt-2">
                  {datasets.uploads.length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
              </div>
            </div>
            <Link
              to="/ManageData"
              className="text-blue-600 text-sm mt-4 block hover:underline"
            >
              Manage datasets →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Processed Datasets</p>
                <p className="text-2xl font-semibold mt-2">
                  {datasets.processed.length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <Link
              to="/ManageData"
              className="text-blue-600 text-sm mt-4 block hover:underline"
            >
              Process data →
            </Link>
          </div>
        </div>

        {/* Active Sessions Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Training Sessions
            </h2>
            <Link
              to="/TrainingStatus"
              className="text-blue-600 text-sm hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Session ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {initiatedSessions.length > 0 &&
                  initiatedSessions.map((session) => (
                    <tr key={session.session_id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {session.session_id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600"
                              style={{
                                width: `${
                                  (session.curr_round / session.max_round) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {session.curr_round}/{session.max_round}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                            statusMap[session.training_status]?.color ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusMap[session.training_status]?.text ||
                            "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/TrainingStatus/details/${session.session_id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!initiatedSessions.length && (
              <div className="text-center py-8 text-gray-500">
                No active training sessions
              </div>
            )}
          </div>
        </div>

        {/* Recent Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Datasets */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Datasets
              </h2>
              <Link
                to="/ManageData"
                className="text-blue-600 text-sm hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {datasets.uploads.map((dataset) => (
                <div
                  key={dataset}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {dataset.filename}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                      Raw
                    </span>
                  </div>
                  <Link
                    to={`/raw-dataset-overview/${dataset.filename}`}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </Link>
                </div>
              ))}
              {datasets.processed.map((dataset) => (
                <div
                  key={dataset}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {dataset.filename}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                      Processed
                    </span>
                  </div>
                  <Link
                    to={`/processed-dataset-overview/${dataset.filename}`}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </Link>
                </div>
              ))}
              {!datasets.uploads.length && !datasets.processed.length && (
                <div className="text-center py-4 text-gray-500">
                  No datasets found
                </div>
              )}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Sessions
              </h2>
              <Link
                to="/TrainingStatus"
                className="text-blue-600 text-sm hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <li key={session.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            statusMap[session.training_status]?.color ||
                            "bg-gray-300"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {session.name || "Untitled Session"}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {session.id}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/TrainingStatus/details/${session.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View →
                      </Link>
                    </div>
                  </li>
                ))}
                {!sessions.length && (
                  <li className="py-4 text-center text-gray-500">
                    No recent sessions
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8">
          <Link to="/request">
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
// import {
//   getAllSessions,
//   getUserInitiatedSessions,
// } from "../services/federatedService";
// import { getLocalDatasets } from "../services/privateService";

// export default function Dashboard() {
//   const [initiatedSessions, setInitiatedSessions] = useState([]);
//   const [datasets, setDatasets] = useState({ uploads: [], processed: [] });
//   const [sessions, setSessions] = useState([]);
//   const { api } = useAuth();
// const fetchInitiatedSession = async () => {
//   try {
//     getUserInitiatedSessions(api).then((res) => {
//       console.log("Initiated Sessions fetched: ", res.data);
//       setInitiatedSessions(res.data);
//     });
//   } catch (error) {
//     console.error("Error fetching initiated sessions:", error);
//   }
// };
//   const fetchDatasets = async () => {
//     try {
//       getLocalDatasets().then((res) => {
//         console.log("Global Datasets : ", res.data);
//         setDatasets(res.data.contents);
//       });
//     } catch (error) {
//       console.error("Error fetching Datasets:", error);
//     }
//   };
//   const fetchSessions = async () => {
//     try {
//       getAllSessions(api).then((res) => {
//         console.log("Sessions : ", res.data);
//         setSessions(res.data);
//       });
//     } catch (error) {
//       console.error("Error fetching Sessions:", error);
//     }
//   };
//   // Define statusMap outside for better performance
//   const statusMap = {
//     1: { text: "Pre-Training Stage", color: "bg-blue-200 text-blue-700" },
//     2: { text: "Pre-Training Stage", color: "bg-blue-200 text-blue-700" },
//     3: { text: "Pre-Training Stage", color: "bg-blue-200 text-blue-700" },
//     4: { text: "Training Stage", color: "bg-yellow-200 text-yellow-700" },
//     5: { text: "Post-Training", color: "bg-green-200 text-green-700" },
//     "-1": { text: "Training Failed", color: "bg-red-200 text-red-700" },
//   };

//   // Default status if not found
//   const defaultStatus = { text: "Unknown", color: "bg-gray-200 text-gray-700" };

//   useEffect(() => {
//     const fetchData = async () => {
//       await fetchInitiatedSession();
//       await fetchDatasets();
//       await fetchSessions();
//     };
//     fetchData();
//   }, []);
//   return (
//     <div className="w-full min-h-screen p-8 bg-gray-50 flex flex-col items-center">
//       <h1 className="text-4xl font-bold text-gray-800 mb-8">
//         Federated Learning Dashboard
//       </h1>

//       {/* Initiated Sessions Section */}
//       <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl p-6 mb-8">
//         <h2 className="text-2xl font-semibold mb-4">Initiated Sessions</h2>
//         <div className="overflow-x-auto">
//           {initiatedSessions.length > 0 ? (
//             <table className="w-full border-collapse border border-gray-200 text-center">
//               <thead>
//                 <tr className="bg-gray-100 text-gray-700">
//                   <th className="border border-gray-300 px-4 py-2">#</th>
//                   <th className="border border-gray-300 px-4 py-2">
//                     Session ID
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">
//                     Current Round
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">
//                     Max Rounds
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">
//                     Session Price
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">
//                     Training Status
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {initiatedSessions.map((session, index) => (
//                   <tr key={session.session_id} className="hover:bg-gray-50">
//                     <td className="border border-gray-300 px-4 py-2">
//                       {index + 1}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {session.session_id}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {session.curr_round}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {session.max_round}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {session.session_price || "N/A"}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       <span
//                         className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${
//                           statusMap[session.training_status]?.color ||
//                           defaultStatus.color
//                         }`}
//                       >
//                         {statusMap[session.training_status]?.text ||
//                           defaultStatus.text}
//                       </span>
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       <Link
//                         to={`/TrainingStatus/details/${session.session_id}`}
//                         className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
//                       >
//                         View Details
//                       </Link>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p className="text-gray-500">No initiated sessions found.</p>
//           )}
//         </div>
//       </div>

//       {/* Grid Sections */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
//         {/* Recent Sessions */}
//         <div className="p-6 bg-white shadow-lg rounded-xl">
//           <h2 className="text-xl font-semibold mb-3">Recent Sessions</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse border border-gray-200">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="border border-gray-300 px-4 py-2 text-left">
//                     ID
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2 text-left">
//                     Name
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2 text-left">
//                     Status
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2 text-left">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {sessions.length > 0 ? (
//                   sessions.map(({ id, name, training_status }) => (
//                     <tr key={id} className="border-b border-gray-200">
//                       <td className="border border-gray-300 px-4 py-2">{id}</td>
//                       <td className="border border-gray-300 px-4 py-2">
//                         {name || "Unknown"}
//                       </td>
//                       <td className="border border-gray-300 px-4 py-2">
//                         <span
//                           className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${
//                             statusMap[training_status]?.color ||
//                             defaultStatus.color
//                           }`}
//                         >
//                           {statusMap[training_status]?.text ||
//                             defaultStatus.text}
//                         </span>
//                       </td>
//                       <td className="border border-gray-300 px-4 py-2">
//                         <Link
//                           to={`/TrainingStatus/details/${id}`}
//                           className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
//                         >
//                           🔍 View
//                         </Link>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan="4"
//                       className="text-center text-gray-500 border border-gray-300 px-4 py-2"
//                     >
//                       No recent sessions found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           <Link
//             to="/TrainingStatus"
//             className="text-blue-500 mt-4 block hover:underline text-center"
//           >
//             📂 View All Sessions →
//           </Link>
//         </div>

//         {/* My Data */}
//         <div className="p-6 bg-white shadow-lg rounded-xl">
//           <h2 className="text-xl font-semibold">My Data</h2>
//           <div className="mt-2 space-y-3">
//             {datasets.uploads.map((dataset) => (
//               <div key={dataset} className="flex justify-between items-center">
//                 <span className="text-gray-700 flex items-center">
//                   {dataset}
//                   <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-200 rounded-lg">
//                     Raw
//                   </span>
//                 </span>
//                 <Link
//                   to={`/dataset-overview/uploads/${dataset}`}
//                   className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
//                 >
//                   🔍 View
//                 </Link>
//               </div>
//             ))}
//             {datasets.processed.map((dataset) => (
//               <div key={dataset} className="flex justify-between items-center">
//                 <span className="text-gray-700 flex items-center">
//                   {dataset}
//                   <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-orange-700 bg-orange-200 rounded-lg">
//                     Processed
//                   </span>
//                 </span>
//                 <Link
//                   to={`/dataset-overview/processed/${dataset}`}
//                   className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
//                 >
//                   🔍 View
//                 </Link>
//               </div>
//             ))}
//           </div>
//           <Link
//             to="/ManageData"
//             className="text-blue-500 mt-4 block hover:underline"
//           >
//             📂 Manage Datasets →
//           </Link>
//         </div>
//       </div>

//       {/* Floating Add Job Button */}
//       <div className="fixed bottom-6 right-6">
//         <Link to="/request">
//           <button className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition">
//             + Add Session
//           </button>
//         </Link>
//       </div>
//     </div>
//   );
// }
