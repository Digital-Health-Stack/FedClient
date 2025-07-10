import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserMinusIcon,
  UserPlusIcon,
  DocumentArrowUpIcon,
  ChartBarSquareIcon,
  ServerStackIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import { closeWebSocket, connectWebSocket } from "../../services/redisSocket";
import { toast } from "react-toastify";
import { BellIcon } from "@heroicons/react/24/outline";
import { useHelp } from "../../contexts/HelpContext";
import { useLocation } from "react-router-dom";

const NavBar = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { logout, user } = useAuth();
  const { startWalkthrough } = useHelp();
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();

  // Only show help button on pages with walkthrough functionality
  const showHelpButton =
    location.pathname === "/" || location.pathname === "/view-all-datasets";
  const handleToggle = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const handleNotificationClick = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleNotificationClose = () => {
    setNotificationsOpen(false);
  };

  useEffect(() => {
    connectWebSocket((data, id) => {
      setNotifications((prev) => [...prev, { data, id }]);
    });

    return () => closeWebSocket();
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsOpen &&
        !event.target.closest(".notification-container")
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  return (
    <nav className="bg-gray-900 border-b border-gray-700 text-white h-[57px]">
      <div className="container mx-auto flex justify-between items-center p-2 max-w-7xl">
        {/* Logo */}
        <a className="text-xl font-bold flex items-center text-white" href="/">
          <span>FedClient</span>
        </a>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={handleToggle}
          aria-expanded={isNavbarOpen}
          aria-label="Toggle navigation"
        >
          {isNavbarOpen ? (
            <XMarkIcon className="w-7 h-7" />
          ) : (
            <Bars3Icon className="w-7 h-7" />
          )}
        </button>

        {/* Navigation Links */}
        <div
          className={`absolute md:static top-10 right-0 w-full md:w-auto bg-gray-900 md:bg-transparent md:flex md:items-center p-4 md:p-0 transition-all duration-300 ${
            isNavbarOpen ? "block" : "hidden"
          } md:ml-auto`}
        >
          {user && (
            <ul className="md:flex justify-end items-center space-y-4 md:space-y-0 md:space-x-6 w-full">
              <li>
                <NavLink
                  className="navbar-dashboard flex items-center gap-2 py-2 px-4 hover:text-gray-400"
                  to="/"
                >
                  <HomeIcon className="w-5 h-5" /> Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="navbar-new-training flex items-center gap-2 py-2 px-4 hover:text-gray-400"
                  to="/Request"
                >
                  <DocumentArrowUpIcon className="w-5 h-5" /> New Training
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="navbar-trainings flex items-center gap-2 py-2 px-4 hover:text-gray-400"
                  to="/trainings"
                >
                  <ChartBarSquareIcon className="w-5 h-5" /> Trainings
                </NavLink>
              </li>
              <li>
                <NavLink
                  className="navbar-manage-data flex items-center gap-2 py-2 px-4 hover:text-gray-400"
                  // to="/ManageData"
                  to="/view-all-datasets"
                >
                  <ServerStackIcon className="w-5 h-5" /> Manage Data
                </NavLink>
              </li>
              {user && (
                <li className="notification-container relative">
                  <div
                    className="flex items-center gap-2 py-2 px-4 hover:text-gray-400 relative cursor-pointer"
                    onClick={handleNotificationClick}
                  >
                    <div className="relative">
                      <BellIcon className="w-5 h-5" />
                      {notifications.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {notifications.length}
                        </span>
                      )}
                    </div>
                  </div>
                  {notificationsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96">
                      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-800">
                          Notifications
                        </h3>
                        <button
                          onClick={handleNotificationClose}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        {notifications.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer block text-black flex justify-between items-center"
                            >
                              {notification.data}
                              <Link
                                to={`/trainings/${notification.id}`}
                                onClick={() => setNotificationsOpen(false)}
                              >
                                <button className="rounded-full bg-blue-500 text-white px-4 py-1">
                                  Join
                                </button>
                              </Link>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </li>
              )}

              {user && showHelpButton && (
                <li>
                  <button
                    className="navbar-help flex items-center gap-2 py-2 px-4 hover:text-gray-400"
                    onClick={startWalkthrough}
                    title="Help & Tutorial"
                  >
                    <QuestionMarkCircleIcon className="w-5 h-5" />
                  </button>
                </li>
              )}

              {!user && location.pathname !== "/Login" && (
                <li>
                  <NavLink
                    className="flex bg-white text-gray-900 rounded-md items-center gap-2 py-1 px-2 hover:scale-105 transition-all duration-300"
                    to="/Login"
                  >
                    <UserPlusIcon className="w-5 h-5" /> Login
                  </NavLink>
                </li>
              )}
              {user && (
                <li>
                  <button
                    className="flex bg-white text-gray-900 rounded-md items-center gap-2 py-1 px-2 hover:scale-105 transition-all duration-300"
                    onClick={logout}
                  >
                    <UserMinusIcon className="w-5 h-5" /> Log out
                  </button>
                </li>
              )}

              {/* <li>
              <NavLink
                className="flex items-center gap-2 py-2 px-4 hover:text-gray-400"
                to="/About"
              >
                <InformationCircleIcon className="w-5 h-5" /> About
              </NavLink>
            </li> */}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
