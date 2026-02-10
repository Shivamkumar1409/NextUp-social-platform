import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./style.module.css";
import { loginUser, registerUser, emptyMessage } from '@/config/redux/action/authAction';
import { GoogleLogin } from "@react-oauth/google";
import { BASE_URL } from "@/config";
import Logo from "./Logo"; 

function LoginComponent() {

  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  // State
  const [userLoginMethod, setUserLoginMethod] = useState(false); // false = Sign Up, true = Sign In
  
  const [inputIdentifier, setInputIdentifier] = useState(""); // Holds Email (SignUp) OR Email/Phone (Login)
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); 

  // --- 1. REDIRECT IF LOGGED IN ---
  useEffect(() => {
    if (authState.loggedIn || localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);

  // --- 2. CLEAR MESSAGES ON TOGGLE ---
  useEffect(() => {
    dispatch(emptyMessage());
  }, [userLoginMethod, dispatch]);


  // --- 3. HANDLE REGISTER ---
  const handleRegister = () => {
    console.log("registering...");
    dispatch(registerUser({ 
        name, 
        username, 
        email: inputIdentifier, // In SignUp mode, this field is specifically Email
        phoneNumber, 
        password 
    }));
  }

  // --- 4. HANDLE LOGIN ---
  const handleLogin = () => {
    console.log("login..");
    dispatch(loginUser({ 
        identifier: inputIdentifier, // In Login mode, this can be Email OR Phone
        password 
    }));
  }

  // --- 5. GOOGLE LOGIN HANDLER ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${BASE_URL}/google_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        alert("Google Login Failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Google Login Connection Error");
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.cardContainer}>

        {/* --- LEFT SIDE: INPUTS --- */}
        <div className={styles.cardContainer__left}>

          {/* --- UPDATED LOGO DIMENSIONS --- */}
          <div style={{ marginBottom: "15px", display: "flex", justifyContent: "center" }}>
            {/* Width increased to 180 to fit the "NextUp" text */}
            <Logo width={180} height={60} />
          </div>

          <p className={styles.cardleft__heading}>
            {userLoginMethod ? "Sign In" : "Sign Up"}
          </p>

          <p style={{ color: authState.isError ? "red" : "green", minHeight: "24px", fontSize: "0.9rem", textAlign: "center" }}>
             {authState.message?.message}
          </p>

          <div className={styles.inputContainers}>

            {/* FIELDS ONLY FOR SIGN UP */}
            {!userLoginMethod && (
              <>
                <div className={styles.inputRow}>
                  <input
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.inputField}
                    type='text'
                    placeholder='Username'
                    value={username}
                  />
                  <input
                    onChange={(e) => setName(e.target.value)}
                    className={styles.inputField}
                    type='text'
                    placeholder='Name'
                    value={name}
                  />
                </div>
                
                <input
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={styles.inputField}
                  type='text'
                  placeholder='Phone Number'
                  value={phoneNumber}
                />
              </>
            )}

            {/* SHARED FIELDS (Email/Identifier & Password) */}
            <input
              onChange={(e) => setInputIdentifier(e.target.value)}
              className={styles.inputField}
              type='text'
              placeholder={userLoginMethod ? "Email or Phone Number" : "Email"}
              value={inputIdentifier}
            />

            <input
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
              type='password'
              placeholder='Password'
              value={password}
            />

            {/* ACTION BUTTON */}
            <div
              onClick={() => {
                if (userLoginMethod) {
                  handleLogin();
                } else {
                  handleRegister();
                }
              }}
              className={styles.buttonWithOutline}
            >
              <p>{userLoginMethod ? "Sign In" : "Sign Up"} </p>
            </div>

            {/* GOOGLE LOGIN BUTTON */}
            <div style={{ marginTop: "20px", width: "100%", display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log("Google Login Failed")}
                theme="filled_blue"
                shape="pill"
                width="250"
              />
            </div>

          </div>
        </div>


        {/* --- RIGHT SIDE: TOGGLE --- */}
        <div className={styles.cardContainer__right}>
          <div>
            <p>{userLoginMethod ? "Don't Have an Account?" : "Already Have an Account?"}</p>

            <div
              onClick={() => setUserLoginMethod(!userLoginMethod)}
              style={{ color: "black", textAlign: "center", cursor: "pointer" }}
              className={styles.buttonWithOutline}
            >
              <p>{userLoginMethod ? "Sign Up" : "Sign In"}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginComponent;