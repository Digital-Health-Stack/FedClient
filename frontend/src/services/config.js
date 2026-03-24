import axios from "axios";

export const BASE_URL = process.env.REACT_APP_SERVER_BASE_URL;
export const PRIVATE_BASE_URL = process.env.REACT_APP_PRIVATE_SERVER_BASE_URL;

export const HTTPService = axios.create({
  baseURL: BASE_URL,
  // timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const PrivateHTTPService = axios.create({
  baseURL: PRIVATE_BASE_URL,
  // timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
});

// export const getAuthHTTPService = () => {
//     const user = JSON.parse(localStorage.getItem('user')); // Getting the user from local storage
//     const api = axios.create({
//         baseURL: BASE_URL,
//         timeout: 50000,
//         headers: {
//             "Content-Type": "application/json",
//             'Authorization': `Bearer ${user ? user.access_token : ''}` // Add the token
//         },
//     });

//     api.interceptors.response.use(
//         (response) => {
//             // Any status code within the range of 2xx will trigger this function
//             return response;
//         },
//         (error) => {
//             // Any status codes outside the range of 2xx will trigger this function
//             if (error.response) {
//                 // Server responded with a status code outside the range of 2xx
//                 console.error('Error response:', error.response);

//                 // Handle specific status codes as needed
//                 if (error.response.status === 401) {
//                     alert("Unauthorized access - please log in again.");
//                     // Optionally, log the user out, redirect to login, or refresh the token
//                 } else if (error.response.status === 403) {
//                     alert("Access denied - you do not have permission.");
//                 } else if (error.response.status === 500) {
//                     alert("Internal server error - please try again later.");
//                 }
//             } else if (error.request) {
//                 // No response was received from the server
//                 console.error('Error request:', error.request);
//                 alert("Network error - please check your internet connection.");
//             } else {
//                 // Error occurred in setting up the request
//                 console.error('Error message:', error.message);
//                 alert("An error occurred - please try again.");
//             }
//             return Promise.reject(error);  // Optionally, you can also return a custom error message here
//         }
//     );
// };
