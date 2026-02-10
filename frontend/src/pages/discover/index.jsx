import { getAllUsers } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './index.module.css';
import { BASE_URL } from '@/config';
import { useRouter } from 'next/router';

export default function Discoverpage() {

  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if(!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1>Discover</h1>

          <div className={styles.allUserProfile}>
            {authState.all_profiles_fetched && authState.all_users?.map((user) => {
              return (
                <div 
                  onClick={() => {
                    router.push(`/view_profile/${user.username}`)
                  }} 
                  key={user._id} 
                  className={styles.userCard}
                  style={{cursor: "pointer"}}
                >
                  <img 
                    className={styles.userCard_image} 
                    src={user.profilePicture ? `${BASE_URL}/${user.profilePicture}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                    alt="profile" 
                    onError={(e) => {
                        e.target.onerror = null; // PREVENTS INFINITE LOOP
                        e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; 
                    }}
                  />
                  <div>
                    <h1>{user.name}</h1>
                    <p>@{user.username}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  )
}