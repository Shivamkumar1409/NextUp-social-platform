import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { BASE_URL, clientServer } from '@/config';
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import styles from './index.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import { getConnectionRequests, getMyConnectionRequests, sendConnectionRequest } from '@/config/redux/action/authAction';

export default function ViewProfilePage({ userProfile }) {

  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentInConnection] = useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  // --- 1. FETCH DATA ---
  const getUsersPosts = async () => {
    await dispatch(getAllPosts());
    if(localStorage.getItem("token")){
        await dispatch(getConnectionRequests({token: localStorage.getItem("token")}));
        await dispatch(getMyConnectionRequests({token: localStorage.getItem("token")}));
    }
  }

  useEffect(() => {
    getUsersPosts();
  }, []);

  // --- 2. FILTER POSTS ---
  useEffect(() => {
    if (userProfile && postReducer.posts) {
        // FIX: Use flat structure (post.userId is populated, userProfile is flat)
        let post = postReducer.posts.filter((post) => {
            return post.userId?.username === userProfile.username;
        });
        setUserPosts(post);
    }
  }, [postReducer.posts, userProfile]);

  // --- 3. CHECK CONNECTION STATUS ---
  useEffect(() => {
    if (!userProfile) return;

    const profileId = userProfile._id; // FIX: Flat ID
    
    // Check Incoming Requests (connections)
    const incoming = authState.connections || [];
    const isIncoming = incoming.some(req => req.connectionId?._id === profileId || req.userId?._id === profileId);

    // Check Outgoing Requests (connectionRequest)
    const outgoing = authState.connectionRequest || [];
    const isOutgoing = outgoing.some(req => req.connectionId?._id === profileId || req.userId?._id === profileId);

    if (isIncoming || isOutgoing) {
        setIsCurrentInConnection(true);
        
        // Check if accepted
        const incomingMatch = incoming.find(req => (req.connectionId?._id === profileId || req.userId?._id === profileId) && req.status_accepted === true);
        const outgoingMatch = outgoing.find(req => (req.connectionId?._id === profileId || req.userId?._id === profileId) && req.status_accepted === true);

        if (incomingMatch || outgoingMatch) {
            setIsConnectionNull(false); // It IS connected
        }
    } else {
        setIsCurrentInConnection(false);
    }
    
  }, [authState.connections, authState.connectionRequest, userProfile]);


  if (!userProfile) return <div style={{padding: "50px", textAlign: "center"}}>Loading Profile...</div>;

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.Container}>
          <div className={styles.backDropContainer}>
             {/* FIX: Use flat profilePicture with Error Handler */}
            <img 
                className={styles.backDrop} 
                src={userProfile.profilePicture ? `${BASE_URL}/${userProfile.profilePicture}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                alt="backdrop" 
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                }}
            />
          </div>
          
          <div className={styles.profileContainer_details}>
            <div className={styles.profileContainer_flex}>

              <div style={{ flex: "0.8" }}>
                <div style={{ display: "flex", width: "fit-content", alignItems: "center", gap: "1.2rem"}}>
                   {/* FIX: Use flat name & username */}
                  <h2>{userProfile.name}</h2>
                  <p style={{ color: "gray"}}>@{userProfile.username}</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.2rem"}}>
                    
                    {isCurrentUserInConnection ? (
                        <button className={styles.connectedButton}>
                            {isConnectionNull ? "Pending" : "Connected"}
                        </button>
                    ) : (
                        <button onClick={() => {
                             // FIX: Use flat ID
                            dispatch(sendConnectionRequest({ token: localStorage.getItem("token"), userId: userProfile._id }));
                        }} className={styles.connectBtn}>Connect</button>
                    )}

                    <div onClick={async () => {
                        const response = await clientServer.get(`/user/download_resume?id=${userProfile._id}`);
                        window.open(`${BASE_URL}/${response.data.message}`, "_blank")
                    }} style={{ cursor: "pointer"}}>
                        <svg style={{width: "1.2em"}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                    </div>
                </div>

                <div>
                  <p>{userProfile.bio || "No bio available."}</p>
                </div>
              </div>

              <div style={{ flex: "0.2"}}>
                <h3>Recent Activity</h3>
                {userPosts.length === 0 && <p style={{fontSize:"0.8rem", color:"grey"}}>No recent posts.</p>}
                
                {userPosts.map((post) => {
                  return (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.card_profileContainer}>
                          {post.media ? 
                            <img src={`${BASE_URL}/${post.media}`} alt="" onError={(e) => e.target.style.display = 'none'} /> :
                            <div style={{ width: "3.4rem", height: "3.4rem", background: "#eee", borderRadius: "5px"}}></div>
                          }
                        </div>
                        <p style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100px"}}>{post.body}</p>
                      </div>
                    </div>
                   )
                })}
              </div>
            </div>
          </div>

          <div className="workHistory">
            <h4>Work History</h4>
            <div className={styles.workHistoryContainer}>
              {userProfile.pastWork && userProfile.pastWork.length > 0 ? (
                  userProfile.pastWork.map((work, index) => (
                    <div key={index} className={styles.workHistoryCard}>
                      <p style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.8rem"}}>{work.company} - {work.position}</p>
                      <p>{work.years} Years</p>
                    </div>
                  ))
              ) : (
                  <p>No work history added.</p>
              )}
            </div>
          </div>

        </div>
      </DashboardLayout>
    </UserLayout>
  )
}

export async function getServerSideProps(context) {
  try {
      // 1. Get Username safely (handles both [slug] and [username] file naming)
      const username = context.query.username || context.query.slug;

      console.log("Fetching profile for:", username);
      // Endpoint is: /get_user_profile_based_on_username
      const request = await clientServer.get("/get_user_profile_based_on_username", {
        params: { username }
      });

      // The backend returns { profile: ... }
      return { 
          props: { userProfile: request.data.profile } 
      }
  } catch (error) {
      console.log("Error fetching profile:", error.message);
      return {
          notFound: true // This will show a generic 404 page if user doesn't exist
      }
  }
}