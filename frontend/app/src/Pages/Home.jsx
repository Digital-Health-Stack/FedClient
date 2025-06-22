import React from "react";
import { useNavigate } from "react-router-dom";
import FedClientImage from "../assets/FedClient.jpeg";
import StepsGif from "../assets/steps.gif";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center w-full my-20">
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8 px-4">
        {/* Left Column - GIF */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={StepsGif}
            alt="Federated Learning Steps"
            className="w-full max-w-md h-auto rounded-lg shadow-xl"
          />
        </div>
        {/* Right Column - Content Card */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 space-y-6 w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center">
              <img
                src={FedClientImage}
                alt="FedClient Logo"
                className="w-32 h-32 rounded-full border-4 border-blue-100"
              />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-gray-800 text-center">
              Welcome to FedClient
            </h1>

            {/* Description */}
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-blue-700 font-medium">
                Client Application for Federated Learning Simulation
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate("/register")}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
