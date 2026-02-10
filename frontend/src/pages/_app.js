import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "@/config/redux/store"; 
import { SocketProvider } from "@/context/SocketContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function App({ Component, pageProps }) {
  return (
    // 1. WRAP WITH GOOGLE OAUTH PROVIDER
    // We hardcode the ID here to ensure it matches the backend perfectly.
    <GoogleOAuthProvider clientId="606931447521-o3hpa0iuh7g5iosank9b7lpjmfvdrupl.apps.googleusercontent.com">
      
      <Provider store={store}>
        {/* 2. SOCKET PROVIDER */}
        <SocketProvider>
          <Component {...pageProps} />
        </SocketProvider>
      </Provider>

    </GoogleOAuthProvider>
  );
}