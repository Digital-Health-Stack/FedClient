// import { Route, Routes } from "react-router-dom";
// import Home from "./Pages/Home";
// import Request from "./Pages/Request";
// import Register from "./Pages/Register";
// import TrainingStatus from "./Pages/TrainingStatus";
// import TrainingDetails from "./Pages/TrainingDetails";
// import TrainingResults from "./Pages/Results";
// import ResultDetails from "./Pages/ResultDetails";
// import About from "./Pages/About";
// import Error from "./Pages/Error";
// import NavBar from "./components/OnWholeApp/NavBar";
// import MyDataProvider from "./GlobalContext";
// import EventsAction from "./EventsActions";
// import { useState } from "react";
// import { AuthProvider } from "./contexts/AuthContext";
// import { PrivateRoute, OnlyGuestRoute } from "./components/ProtectedRoute";
// import { ToastContainer } from "react-toastify";

// import "./index.css";
// import "react-toastify/dist/ReactToastify.min.css";
// import DatasetList from "./Pages/DatasetList";
// import DatasetDetail from "./Pages/DatasetDetail";
// import ManageData from "./Pages/ManageData";
// import ViewRecentUploads from "./components/DataPipeline/ViewRecentUploads";
// import ViewAllDatasets from "./components/DataPipeline/ViewAllDatasets";
// import DataSetOverview from "./components/DataPipeline/DataSetVisuals/DataSetOverview";
// import PreprocessingDocs from "./components/DataPipeline/DataSetVisuals/ProcessingComponents/PreprocessingDocs.jsx";

// /*
// The App component is the main component of the application. It is the parent component of all the other components.
// It contains the NavBar component, which is a navigation bar that allows the user to navigate between different
// pages of the application. The App component also contains the Routes component, which is used to define the
// routes of the application. Each route is associated with a specific page component, which is rendered when
// the user navigates to that route.
// */

// export default function App() {
//   const [clientToken, setClientToken] = useState("");
//   const [sessions, setSessions] = useState([]);
//   const [socket, setSocket] = useState(null);
//   return (
//     <>
//       <MyDataProvider>
//         <AuthProvider>
//           <ToastContainer />

//           <EventsAction socket={socket} clientToken={clientToken} />

//           <NavBar />

//           <div
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <Routes>
//               <Route path="/" exact element={<Home />} />

//               <Route
//                 path="/Register"
//                 element={
//                   <OnlyGuestRoute>
//                     <Register
//                       clientToken={clientToken}
//                       setClientToken={setClientToken}
//                       setSocket={setSocket}
//                     />
//                   </OnlyGuestRoute>
//                 }
//               />

//               <Route
//                 path="/Request"
//                 element={
//                   <PrivateRoute>
//                     <Request
//                       clientToken={clientToken}
//                       setSessions={setSessions}
//                     />
//                   </PrivateRoute>
//                 }
//               />

//               <Route
//                 path="/TrainingStatus"
//                 element={
//                   <PrivateRoute>
//                     <TrainingStatus sessions={sessions} />
//                   </PrivateRoute>
//                 }
//               />
//               <Route
//                 path="/TrainingStatus/details/:sessionId"
//                 element={
//                   <PrivateRoute>
//                     <TrainingDetails
//                       clientToken={clientToken}
//                       socket={socket}
//                     />
//                   </PrivateRoute>
//                 }
//               />

//               <Route
//                 path="/Results"
//                 element={
//                   <PrivateRoute>
//                     <TrainingResults />
//                   </PrivateRoute>
//                 }
//               />

//               <Route
//                 path="/TrainingResults/details/:sessionId"
//                 element={
//                   <PrivateRoute>
//                     <ResultDetails />
//                   </PrivateRoute>
//                 }
//               />
//               <Route
//                 path="/Datasets"
//                 element={
//                   <PrivateRoute>
//                     <DatasetList />
//                   </PrivateRoute>
//                 }
//               />

//               <Route
//                 path="/Datasets/:code"
//                 element={
//                   <PrivateRoute>
//                     <DatasetDetail />
//                   </PrivateRoute>
//                 }
//               />
//               <Route path="/About" element={<About />} />
//               <Route path="/ManageData" element={<ManageData />} />
//               <Route
//                 path="/view-recent-uploads"
//                 element={<ViewRecentUploads />}
//               />
//               <Route path="/view-all-datasets" element={<ViewAllDatasets />} />
//               <Route
//                 path="/dataset-overview/:dir/:filename"
//                 element={<DataSetOverview />}
//               />
//               <Route
//                 path="/preprocessing-docs"
//                 element={<PreprocessingDocs />}
//               />
//               <Route path="/*" element={<Error />} />
//             </Routes>
//           </div>
//         </AuthProvider>
//       </MyDataProvider>
//     </>
//   );
// }

// // later "change" (don't uncommetn above) all the paths for PrivateRoute authentication
import { Route, Routes } from "react-router-dom";
import Request from "./Pages/Request";
import Login from "./Pages/Login.jsx";
import Trainings from "./Pages/Trainings.jsx";
import TrainingDetails from "./Pages/TrainingDetails";
import About from "./Pages/About";
import Error from "./Pages/Error";
import NavBar from "./components/OnWholeApp/NavBar";
import MyDataProvider from "./GlobalContext";
// import EventsAction from "./EventsActions";
import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute, OnlyGuestRoute } from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";

import "./index.css";
import "react-toastify/dist/ReactToastify.min.css";
import ManageData from "./Pages/ManageData";
import ViewRecentUploads from "./components/DataPipeline/ViewRecentUploads";
import ViewAllDatasets from "./components/DataPipeline/ViewAllDatasets";
import RawDataSetOverview from "./components/DataPipeline/DataSetVisuals/RawDataSetOverview";
import ProcessedDataSetOverview from "./components/DataPipeline/DataSetVisuals/ProcessedDataSetOverview";
import PreprocessingDocs from "./components/DataPipeline/DataSetVisuals/ProcessingComponents/PreprocessingDocs.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
/*
The App component is the main component of the application. It is the parent component of all the other components.
It contains the NavBar component, which is a navigation bar that allows the user to navigate between different 
pages of the application. The App component also contains the Routes component, which is used to define the
routes of the application. Each route is associated with a specific page component, which is rendered when
the user navigates to that route.
*/

export default function App() {
  const [clientToken, setClientToken] = useState("");
  const [sessions, setSessions] = useState([]);
  const [socket, setSocket] = useState(null);
  return (
    <>
      <MyDataProvider>
        <AuthProvider>
          <ToastContainer position="bottom-center" autoClose={3000} />

          {/* <EventsAction socket={socket} clientToken={clientToken} /> */}

          <NavBar />

          {/* <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          > */}
          <Routes>
            <Route
              path="/"
              exact
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/Login"
              element={
                <OnlyGuestRoute>
                  <Login
                    clientToken={clientToken}
                    setClientToken={setClientToken}
                    setSocket={setSocket}
                  />
                </OnlyGuestRoute>
              }
            />

            <Route
              path="/Request"
              element={
                <Request clientToken={clientToken} setSessions={setSessions} />
              }
            />

            <Route path="/trainings" element={<Trainings />} />
            <Route
              path="/trainings/:sessionId"
              element={<TrainingDetails clientToken={clientToken} />}
            />
            <Route path="/About" element={<About />} />
            <Route path="/ManageData" element={<ManageData />} />
            <Route
              path="/view-recent-uploads"
              element={<ViewRecentUploads />}
            />
            <Route path="/view-all-datasets" element={<ViewAllDatasets />} />
            <Route
              path="/raw-dataset-overview/:filename"
              element={<RawDataSetOverview />}
            />
            <Route
              path="/processed-dataset-overview/:filename"
              element={<ProcessedDataSetOverview />}
            />
            <Route path="/preprocessing-docs" element={<PreprocessingDocs />} />
            <Route path="/*" element={<Error />} />
          </Routes>
        </AuthProvider>
      </MyDataProvider>
    </>
  );
}
