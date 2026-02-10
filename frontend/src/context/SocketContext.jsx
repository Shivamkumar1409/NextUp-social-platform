import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { BASE_URL } from "@/config"; 

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const { user } = useSelector((state) => state.auth); 

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 1. Initialize Socket with Token
    const newSocket = io(BASE_URL, {
        query: { token }, // Critical for identifying the user on the server
        transports: ["websocket"], 
    });

    setSocket(newSocket);

    // 2. Global Listeners
    newSocket.on("get_online_users", (users) => {
        console.log("Online Users Received:", users);
        setOnlineUsers(users);
    });

    newSocket.on("receive_message", (data) => {
        // Optional: Don't show notification if already looking at the chat
        if (!window.location.href.includes("/chat")) {
            console.log("Notification Received:", data);
            setNotifications((prev) => [...prev, data]);
        }
    });

    newSocket.on("receive_notification", (data) => {
        setNotifications((prev) => [...prev, data]);
    });

    return () => newSocket.close();
  }, []);

  // 3. Register User (Safety Fallback)
  useEffect(() => {
    if (socket && user?._id) {
        socket.emit("register_user", user._id);
        console.log("Registered User Globally:", user._id);
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};