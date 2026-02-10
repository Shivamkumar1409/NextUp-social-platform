import React from 'react'
import styles from "./styles.module.css"
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { reset } from '@/config/redux/reducer/authReducer';

export default function NavBarComponent() {

    const router =  useRouter();
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth)

  return (
    <div className={styles.container}>
        <nav className={styles.navBar}>

        <h1 style={{cursor:"pointer"}} onClick={() => {
            router.push("/")
        }}> NextUp</h1>

        <div className={styles.navBarOptionContainer}>

            {/* FIX: Check if authState.user exists before accessing properties */}
            {authState.profileFetched && authState.user ? (
                <div>
                    <div style={{display:"flex", gap: "1.2rem"}}>
                        {/* FIX: Use optional chaining (?.name) just in case */}
                        <p>Hey, {authState.user.name || authState.user.username || "User"}</p>
                        
                        <p onClick={() => {
                            router.push("/profile")
                        }} style={{fontWeight: "bold", cursor: "pointer"}}>Profile</p>

                        <p onClick={() => {
                            localStorage.removeItem("token")
                            router.push("/login")
                            dispatch(reset())
                        }}style={{fontWeight: "bold", cursor: "pointer"}}>Logout</p>
                    </div>
                </div>
            ) : (
                <div onClick={() => {
                    router.push("/login")
                }} className={styles.buttonJoin}>
                    <p>Be a Part</p>
                </div>
            )}

        </div>
    </nav>      
    </div>
  )
}