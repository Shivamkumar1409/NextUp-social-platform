import { clientServer } from "@/config";
import { createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { BASE_URL } from "@/config";

// --- 1. LOGIN USER ---
export const loginUser = createAsyncThunk(
    "user/login",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post(`/login`, {
                identifier: user.identifier || user.email,
                password: user.password,
            });

            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                return response.data.token; 
            } else {
                return thunkAPI.rejectWithValue({ message: "Token not provided" });
            }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || { message: "Login failed" });
        }
    }
);

// --- 2. REGISTER USER ---
export const registerUser = createAsyncThunk(
    "user/register",
    async (user, thunkAPI) => { 
        try {
            const request = await clientServer.post("/register", {
                username: user.username,
                password: user.password,
                email: user.email,
                name: user.name,
                phoneNumber: user.phoneNumber,
            });

            if (request.data.token) {
                localStorage.setItem("token", request.data.token);
                return request.data.token;
            } 
            return request.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data || { message: "Registration failed" });
        }
    }
);

// --- 3. GET CURRENT USER ---
export const getAboutUser = createAsyncThunk(
    "user/getAboutUser",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.get("/get_user_and_profile", {
                params: { token: user.token }
            });
            return response.data;
        } catch(error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const emptyMessage = createAction("auth/emptyMessage");

// --- 4. GET ALL USERS ---
export const getAllUsers = createAsyncThunk(
    "user/getAllUsers", 
    async (_, thunkAPI) => {
        try {
            const response = await clientServer.get("/user/get_all_users");
            return response.data.profiles; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// --- 5. CONNECTION REQUESTS (Fixed URLs) ---

export const sendConnectionRequest = createAsyncThunk(
    "user/sendConnectionRequest",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post("/send_connection_request", {
                token: user.token,
                connectionId: user.userId
            });
            thunkAPI.dispatch(getMyConnectionRequests({ token: user.token }));
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
);

// Fetches INCOMING requests (Requests people sent TO you)
export const getConnectionRequests = createAsyncThunk(
    "user/getConnectionRequests",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.get("/my_connections", {
                params: { token: user.token }
            });
            return response.data; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
);

// Fetches OUTGOING requests (Requests YOU sent)
export const getMyConnectionRequests = createAsyncThunk(
    "user/getMyConnectionRequests",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.get("/my_connections_requests", {
                params: { token: user.token }
            });
            return response.data.connection; 
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
);

export const AcceptConnection = createAsyncThunk(
    "user/acceptConnection",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post("/connection_request_response", {
                token: user.token,
                requestId: user.connectionId,
                action_type: user.action
            });
            
            thunkAPI.dispatch(getConnectionRequests({ token: user.token }));
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
);

// --- 6. DELETE ACCOUNT ---
export const deleteUserAccount = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/delete_account`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.removeItem("token");
      dispatch({ type: "LOGOUT_USER" }); 
      window.location.href = "/login";
    } else {
      alert(data.message || "Failed to delete account");
    }

  } catch (error) {
    console.error("Delete error:", error);
    alert("Something went wrong. Please try again.");
  }
};