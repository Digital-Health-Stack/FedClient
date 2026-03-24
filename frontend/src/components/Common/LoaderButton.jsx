import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const LoaderButton = ({
  children,
  isLoading = false,
  loadingText = "Loading...",
  disabled = false,
  type = "button",
  className = "",
  loadingIcon: LoadingIcon = ArrowPathIcon,
  onClick,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`flex items-center transition-colors ${
        isDisabled ? "cursor-not-allowed" : ""
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingIcon className="w-5 h-5 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoaderButton;
