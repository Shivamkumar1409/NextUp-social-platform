import { BASE_URL } from '@/config';
import { AcceptConnection, getConnectionRequests } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './index.module.css';
import { useRouter } from 'next/router';

export default function MyConnectionsPage() {

  const dispatch = useDispatch();
  const router = useRouter();
  
  // Incoming requests are the ones you need to ACCEPT.
  const authState = useSelector((state) => state.auth);
  const incomingRequests = authState.connections || [];

  useEffect(() => {
    // Fetch requests sent TO me
    dispatch(getConnectionRequests({ token: localStorage.getItem("token") }));
  }, [dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.7rem" }}>
          
          {/* --- SECTION 1: PENDING REQUESTS --- */}
          <h4>Connection Requests</h4>

          {incomingRequests.filter(c => c.status_accepted === null).length === 0 && (
             <p style={{color: "grey"}}>No pending requests.</p>
          )}

          {incomingRequests.filter((connection) => connection.status_accepted === null).map((user, index) => {
            return (
              <div 
                onClick={() => router.push(`/view_profile/${user.userId?.username}`)} 
                className={styles.userCard} 
                key={user._id || index}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", justifyContent: "space-between" }}>
                  
                  {/* Profile Picture */}
                  <div className={styles.profilePicture}>
                    <img 
                        src={user.userId?.profilePicture ? `${BASE_URL}/${user.userId.profilePicture}` : "/default-avatar.png"} 
                        alt="profile" 
                        onError={(e) => {e.target.src = "/default-avatar.png"}}
                    />
                  </div>

                  {/* User Info (Sender) */}
                  <div className={styles.userInfo}>
                      <h3>{user.userId?.name || "Unknown User"}</h3>
                      <p>@{user.userId?.username || "unknown"}</p>
                  </div>

                  {/* Accept Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(AcceptConnection({
                        connectionId: user._id,
                        token: localStorage.getItem("token"),
                        action: "accept"
                      }));
                    }} 
                    className={styles.connectedButton}
                  >
                    Accept
                  </button>
                </div>
              </div>
            )
          })}

          {/* --- SECTION 2: MY NETWORK (ACCEPTED) --- */}
          <h4>My Network</h4>

          {incomingRequests.filter((connection) => connection.status_accepted === true).length === 0 && (
             <p style={{color: "grey"}}>No connections yet.</p>
          )}

          {incomingRequests.filter((connection) => connection.status_accepted === true).map((user, index) => {
            return (
              <div 
                onClick={() => router.push(`/view_profile/${user.userId?.username}`)} 
                className={styles.userCard} 
                key={user._id || index}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", justifyContent: "space-between" }}>
                  <div className={styles.profilePicture}>
                    <img 
                        src={user.userId?.profilePicture ? `${BASE_URL}/${user.userId.profilePicture}` : "/default-avatar.png"} 
                        alt="profile" 
                        onError={(e) => {e.target.src = "/default-avatar.png"}}
                    />
                  </div>
                  <div className={styles.userInfo}>
                      <h3>{user.userId?.name || "Unknown User"}</h3>
                      <p>@{user.userId?.username || "unknown"}</p>
                  </div>
                </div>
              </div>
            )
          })}
            
        </div>
      </DashboardLayout>
    </UserLayout>
  )
}