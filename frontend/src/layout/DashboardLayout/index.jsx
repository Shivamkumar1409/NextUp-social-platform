import React, { useEffect } from 'react'
import styles from "./index.module.css";
import { useRouter } from 'next/router';
import { setTokenIsThere } from '@/config/redux/reducer/authReducer';
import { useDispatch, useSelector } from 'react-redux';
// 1. IMPORT SOCKET HOOK
import { useSocket } from "@/context/SocketContext"; 

export default function DashboardLayout({children}) {

    const router = useRouter();
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);
    
    // 2. GET NOTIFICATIONS
    const { notifications } = useSocket(); 

    useEffect(() => {
            if (localStorage.getItem('token') === null) {
                router.push("/login")
            }
            dispatch(setTokenIsThere())
    }, [dispatch, router]) // Added dependency array to prevent infinite loop

  return (
    <div>
        <div className="container">
        <div className={styles.homeContainer}>
          <div className={styles.homeContainer_leftBar}>

            <div onClick={() => { router.push("/dashboard") }} className={styles.sideBarOption}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <p>Scroll</p>
            </div>

            {/* --- CHAT BUTTON WITH RED BADGE --- */}
            <div onClick={() => { router.push("/chat") }} 
                 className={styles.sideBarOption}
                 style={{ position: "relative" }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <p>Chat</p>

                {/* THE BADGE LOGIC */}
                {notifications.length > 0 && (
                    <div style={{
                        position: "absolute",
                        top: "5px",
                        left: "25px",
                        background: "red",
                        color: "white",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        fontSize: "0.7rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold"
                    }}>
                        {notifications.length}
                    </div>
                )}
            </div>
            {/* ----------------------------- */}

            <div onClick={() => { router.push("/discover") }} className={styles.sideBarOption}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <p>Discover</p>
            </div>

            <div onClick={() => { router.push("/my_connections") }} className={styles.sideBarOption}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <p>My Connection</p>
            </div>
          </div>

          <div className={styles.homeContainer_feedContainer}>
            {children}
          </div>

          <div className={styles.homeContainer_extraContainer}>
            <h3>Top Profiles</h3>
             {/* FIX: Check for profile directly, remove .userId */}
             {authState.all_profiles_fetched && authState.all_users?.map((profile) => (
              <div key={profile._id} className={styles.extraContainer_profile}>
                 <p>{profile?.name || profile?.username || "Unknown User"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div className={styles.mobileNavBar}>
        <div onClick={() => { router.push("/dashboard") }} className={styles.singleNavItemHolder_mobileView}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
        </div>

        {/* --- MOBILE CHAT BUTTON WITH BADGE --- */}
        <div onClick={() => { router.push("/chat") }} 
             className={styles.singleNavItemHolder_mobileView}
             style={{ position: "relative" }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            
            {notifications.length > 0 && (
                <div style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    fontSize: "0.6rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold"
                }}>
                    {notifications.length}
                </div>
            )}
        </div>
        {/* ------------------------------------- */}

        <div onClick={() => { router.push("/discover") }} className={styles.singleNavItemHolder_mobileView}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
        </div>

        <div onClick={() => { router.push("/my_connections") }} className={styles.singleNavItemHolder_mobileView}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
        </div>
      </div>
    </div>
  )
}