import React, { useState } from "react";
import { set, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import LoginImg from "../assets/login.svg";
import SignupImg from "../assets/signup.svg";
import { createUser, login } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

export default function Register({ clientToken, setClientToken, setSocket }) {
  const [isLogin, setIsLogin] = useState(true); // Default to login form
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const handleRegister = async (formData) => {
    try {
      const clientData = {
        username: formData.clientName,
        data_url: "",
        password: formData.password,
      };

      const res = await createUser(clientData);

      if (res.status >= 200 && res.status < 300) {
        // alert("User created successfully");
        toast.success("User created successfully", {
          position: "bottom-center",
          autoClose: 3000,
        });
        reset();
        setIsLogin(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      // alert(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-center",
        autoClose: 3000,
      });
    }
  };

  const toggleForm = () => setIsLogin(!isLogin);

  const password = watch("password");

  return (
    <div className="flex flex-col items-center justify-center sm:flex-row sm:space-x-12 my-12">
      <div className="sm:block w-1/4 max-w-md">
        <img
          src={isLogin ? LoginImg : SignupImg}
          alt={isLogin ? "Login" : "Sign Up"}
          className="w-full h-auto"
        />
      </div>

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Login" : "Register"}
        </h1>

        {isLogin ? (
          <LoginForm navigate={navigate} />
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(handleRegister)}>
            <div>
              <label className="block text-sm font-medium">Client Name:</label>
              <input
                type="text"
                className={`w-full p-2 border rounded ${
                  errors.clientName ? "border-red-500" : "border-gray-300"
                }`}
                {...register("clientName", {
                  required: "Client Name is required",
                })}
              />
              {errors.clientName && (
                <p className="text-red-500 text-xs">
                  {errors.clientName.message}
                </p>
              )}
            </div>

            {/* <div>
              <label className="block text-sm font-medium">Data Path:</label>
              <input
                type="text"
                className={`w-full p-2 border rounded ${
                  errors.data_path ? "border-red-500" : "border-gray-300"
                }`}
                {...register("data_path", {
                  required: "Data Path is required",
                })}
              />
              {errors.data_path && (
                <p className="text-red-500 text-xs">
                  {errors.data_path.message}
                </p>
              )}
            </div> */}

            <div>
              <label className="block text-sm font-medium">Password:</label>
              <input
                type="password"
                className={`w-full p-2 border rounded ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">
                Confirm Password:
              </label>
              <input
                type="password"
                className={`w-full p-2 border rounded ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </form>
        )}

        <p
          className="mt-4 text-blue-500 cursor-pointer text-center"
          onClick={toggleForm}
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

const LoginForm = ({ navigate }) => {
  const { login: authLogin } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const handleLogin = async (formData) => {
    try {
      const credentials = {
        username: formData.clientName,
        password: formData.password,
      };

      const response = await login(credentials);

      if (!response.data?.access_token) {
        throw new Error("Invalid server response");
      }

      authLogin({
        ...response.data,
        username: formData.clientName,
      });

      // console.log("")
      // setClientToken(response.data.access_token);

      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Login failed. Please check your credentials";
      // alert(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Client Name:</label>
        <input
          type="text"
          className={`w-full p-2 border rounded ${
            errors.clientName ? "border-red-500" : "border-gray-300"
          }`}
          {...register("clientName", {
            required: "Client Name is required",
          })}
        />
        {errors.clientName && (
          <p className="text-red-500 text-xs">{errors.clientName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Password:</label>
        <input
          type="password"
          className={`w-full p-2 border rounded ${
            errors.password ? "border-red-500" : "border-gray-300"
          }`}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />
        {errors.password && (
          <p className="text-red-500 text-xs">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};
