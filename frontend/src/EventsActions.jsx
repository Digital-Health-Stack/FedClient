// import axios from "axios";

// const private_server_model_initiate_url = process.env.REACT_APP_INITIATE_MODEL_FOR_TRAINING;
// const private_training_start_url = process.env.REACT_APP_EXECUTE_TRAINING_ROUND;
// const server_status_four_update_Url =
//   process.env.REACT_APP_UPDATE_CLIENT_STATUS_FOUR_URL;

// export default function EventsAction({ socket, clientToken }) {
//   const setUpModel = async (config, sessionId) => {
//     console.log("config received by setUpModel: ", config);

//     const data = {
//       model_config: config,
//       session_id: sessionId,
//       // client_id: clientToken,
//     };
//     const res = await axios.post(private_server_model_initiate_url, data);
//     if (res.status === 200) {
//       console.log(res.data.message);

//       const status_four_data = {
//         client_id: clientToken,
//         session_id: sessionId,
//         decision: 1,
//       };
//       const response = await axios.post(
//         server_status_four_update_Url,
//         status_four_data
//       );
//       if (response.status === 200) {
//         console.log(response.message);
//       } else {
//         console.error("Failed to update the client status", response);
//       }
//     } else {
//       console.error("Failed to send model config to private server", res);
//     }
//   };

//   const train_model = async () => {
//     const training_verbose = await axios.get(private_training_start_url);
//     if (training_verbose.status === 200) {
//       console.log("output:", training_verbose.data.stdout);
//       console.log("stderr:", training_verbose.data.stderr);
//       console.log("returncode:", training_verbose.data.returncode);
//     } else {
//       console.error("Failed to start the execution on the private server", res);
//     }
//   };

//   if (socket) {
//     socket.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       if (message.type === "get_model_parameters_start_background_process") {
//         console.log("Config before initialising: ", message);
//         const config = message.data;
//         const sessionId = message.session_id;
//         console.log("building model on client side...");
//         setUpModel(config, sessionId); // Function to initialize training
//       } else if (message.type === "start_training") {
//         console.log("start training on client side...");
//         train_model();
//       } else if (message.type === "ping") {
//         console.log("ping received from server");
//         // Send pong response back to the server
//         socket.send(JSON.stringify({ type: "pong" }));
//         console.log("Sent pong response to server");
//       }
//     };
//   }
// }
