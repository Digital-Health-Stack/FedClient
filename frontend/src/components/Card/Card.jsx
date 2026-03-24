import React from "react";
import {
  ClockIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const Card = ({ item, onClick }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {item.model_name || "Untitled Model"}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {item.status || "Completed"}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-2">
          <ClockIcon className="flex-shrink-0 h-4 w-4 mr-1.5" />
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center text-sm text-gray-500">
          <ChartBarIcon className="flex-shrink-0 h-4 w-4 mr-1.5" />
          <span>{item.rounds_completed || 0} rounds completed</span>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-500">
          Session #{item.session_id}
        </span>
        <ArrowRightIcon className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
};

export default Card;
