import React from "react";
import FedprocessGif from "../assets/fedprocess.gif";
import AboutIcon from "../assets/aboutsicon.png";

export default function About() {
  return (
    <div className="flex flex-col lg:flex-row max-w-full overflow-hidden items-center justify-center my-20 gap-12">
      {/* Left Section */}
      <div className="flex flex-col items-center justify-center text-center">
        <img
          src={AboutIcon}
          alt="FedClient"
          className="max-h-48 w-auto object-contain"
        />
        <h3 className="text-2xl font-semibold text-gray-700">How it Works</h3>
      </div>

      {/* Right Section */}
      <div className="flex justify-center items-center p-4">
        <img
          src={FedprocessGif}
          alt="Fedprocess Gif"
          className="max-h-96 w-auto object-contain shadow-lg rounded-lg"
        />
      </div>
    </div>
  );
}
