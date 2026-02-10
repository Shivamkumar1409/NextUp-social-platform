import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import { getAboutUser, deleteUserAccount } from '@/config/redux/action/authAction';
import { getAllPosts } from '@/config/redux/action/postAction';
import { clientServer, BASE_URL } from '@/config';
import styles from './index.module.css';

export default function ProfilePage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const authState = useSelector((state) => state.auth);
    const postReducer = useSelector((state) => state.postReducer);

    const [userProfile, setUserProfile] = useState({});
    const [userPosts, setUserPosts] = useState([]);

    // --- MODAL STATES ---
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false); 

    const [inputData, setInputData] = useState({ company: '', position: '', years: '' });
    const [educationInputData, setEducationInputData] = useState({ institution: '', degree: '', year: '' });

    const [bannerImage, setBannerImage] = useState(null);
    const bannerInputRef = useRef(null);

    // --- HELPERS ---
    const getName = () => userProfile.name || userProfile.userId?.name || "";
    const getUsername = () => userProfile.username || userProfile.userId?.username || "";
    const getProfilePic = () => userProfile.profilePicture || userProfile.userId?.profilePicture;

    const handleWorkInputChange = (e) => {
        const { name, value } = e.target;
        setInputData({ ...inputData, [name]: value });
    };

    const handleEducationInputChange = (e) => {
        const { name, value } = e.target;
        setEducationInputData({ ...educationInputData, [name]: value });
    };

    const handleDelete = () => {
        if (window.confirm("⚠️ Are you sure? This action is permanent.")) {
            dispatch(deleteUserAccount());
        }
    };

    const handleBannerClick = () => {
        bannerInputRef.current.click();
    };

    // --- BANNER UPLOAD LOGIC ---
    const handleBannerChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerImage(URL.createObjectURL(file));
            const formData = new FormData();
            formData.append("background_wallpaper", file);
            formData.append("token", localStorage.getItem("token"));
            try {
                await clientServer.post("/upload_background_wallpaper", formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                dispatch(getAboutUser({ token: localStorage.getItem("token") }));
            } catch (error) {
                console.error("Banner upload failed:", error);
                alert("Failed to save banner.");
            }
        }
    };

    // --- INITIAL FETCH ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        } else {
            dispatch(getAboutUser({ token }));
            dispatch(getAllPosts());
        }
    }, [dispatch, router]);

    useEffect(() => {
        if (authState.user) {
            setUserProfile(authState.user);
            
            const savedWallpaper = authState.user.backgroundWallpaper || authState.user.userId?.backgroundWallpaper;
            if (savedWallpaper) {
                setBannerImage(`${BASE_URL}/${savedWallpaper}`);
            }

            const username = authState.user.username || authState.user.userId?.username;
            if (username) {
                let posts = postReducer.posts.filter((post) => {
                    return post.userId?.username === username;
                });
                setUserPosts(posts);
            }
        }
    }, [authState.user, postReducer.posts]);

    const updateProfilePicture = async (file) => {
        if(!file) return;
        const formData = new FormData();
        formData.append("profile_picture", file);
        formData.append("token", localStorage.getItem("token"));

        try {
            await clientServer.post("/upload_profile_picture", formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            dispatch(getAboutUser({ token: localStorage.getItem("token") }));
        } catch (error) {
            console.error("Upload Error:", error);
        }
    };

    // --- AUTO-SAVE LOGIC ---
    const saveDataToServer = async (dataOverride = {}) => {
        try {
            const token = localStorage.getItem("token");
            const payload = {
                token,
                name: getName(),
                bio: userProfile.bio,
                currentPost: userProfile.currentPost,
                pastWork: userProfile.pastWork,
                education: userProfile.education,
                ...dataOverride
            };

            await clientServer.post("/user_update", { token, name: payload.name });
            await clientServer.post("/update_profile_data", payload);

            dispatch(getAboutUser({ token }));
            return true;
        } catch (error) {
            console.error("Update Failed", error);
            alert("Failed to save changes.");
            return false;
        }
    };

    const handleAddWork = async () => {
        const newWorkList = [...(userProfile.pastWork || []), inputData];
        setUserProfile({ ...userProfile, pastWork: newWorkList });
        const success = await saveDataToServer({ pastWork: newWorkList });
        if (success) {
            setIsModalOpen(false);
            setInputData({ company: '', position: '', years: '' });
        }
    };

    const handleAddEducation = async () => {
        const newEduList = [...(userProfile.education || []), educationInputData];
        setUserProfile({ ...userProfile, education: newEduList });
        const success = await saveDataToServer({ education: newEduList });
        if (success) {
            setIsEducationModalOpen(false);
            setEducationInputData({ institution: '', degree: '', year: '' });
        }
    };

    if (!authState.user) return <div style={{padding: "50px", textAlign: "center"}}>Loading Profile...</div>;

    return (
        <UserLayout>
            <DashboardLayout>
                <div className={styles.container}>
                    
                    {/* --- BANNER --- */}
                    <div className={styles.bannerContainer} style={{ backgroundImage: bannerImage ? `url(${bannerImage})` : `linear-gradient(135deg, #004aad 0%, #0070f3 100%)` }}>
                        
                        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                            <div onClick={handleBannerClick} className={styles.editBannerBtn}>
                                Edit Cover
                            </div>
                        </div>

                        <input type="file" ref={bannerInputRef} onChange={handleBannerChange} style={{display: 'none'}} accept="image/*" />

                        <div className={styles.profileImageContainer}>
                            <label htmlFor='profilePictureUpload' style={{ cursor: 'pointer' }}>
                                <img src={getProfilePic() ? `${BASE_URL}/${getProfilePic()}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Profile" className={styles.profileImage} onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }} />
                                <div className={styles.cameraIconOverlay}>📷</div>
                            </label>
                            <input onChange={(e) => updateProfilePicture(e.target.files[0])} hidden type="file" id='profilePictureUpload' />
                        </div>
                    </div>

                    <div className={styles.contentGrid}>
                        <div className={styles.leftColumn}>
                            <div className={styles.nameSection}>
                                <input className={styles.nameInput} type="text" value={getName()} onChange={(e) => {
                                        if (userProfile.userId) setUserProfile({ ...userProfile, userId: { ...userProfile.userId, name: e.target.value } });
                                        else setUserProfile({ ...userProfile, name: e.target.value });
                                }} />
                                <p className={styles.username}>@{getUsername()}</p>
                                <textarea className={styles.bioInput} value={userProfile.bio || ""} placeholder="Write a bio..." onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })} rows={3} />
                                <button onClick={() => saveDataToServer()} className={styles.saveBtn}>Save Changes</button>
                            </div>

                            <div className={styles.sectionCard}>
                                <div className={styles.sectionHeader}>
                                    <h3 className={styles.sectionTitle}>Work History</h3>
                                    <button onClick={() => setIsModalOpen(true)} className={styles.addBtn}>+ Add</button>
                                </div>
                                {(!userProfile.pastWork || userProfile.pastWork.length === 0) && <p className={styles.emptyText}>No work history added.</p>}
                                {userProfile.pastWork?.map((work, index) => (
                                    <div key={index} className={styles.historyItem}>
                                        <p className={styles.historyTitle}>{work.company}</p>
                                        <p className={styles.historySubtitle}>{work.position} • {work.years} Years</p>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.sectionCard}>
                                <div className={styles.sectionHeader}>
                                    <h3 className={styles.sectionTitle}>Education</h3>
                                    <button onClick={() => setIsEducationModalOpen(true)} className={styles.addBtn}>+ Add</button>
                                </div>
                                {(!userProfile.education || userProfile.education.length === 0) && <p className={styles.emptyText}>No education added.</p>}
                                {userProfile.education?.map((edu, index) => (
                                    <div key={index} className={styles.historyItem}>
                                        <p className={styles.historyTitle}>{edu.institution}</p>
                                        <p className={styles.historySubtitle}>{edu.degree} • {edu.year}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.rightColumn}>
                            <div className={styles.sectionCard}>
                                <h3 className={styles.sectionTitle}>Recent Activity</h3>
                                {userPosts.length === 0 && <p className={styles.emptyText} style={{textAlign: 'center'}}>No recent posts.</p>}
                                <div className={styles.activityList}>
                                    {userPosts.slice(0, 3).map((post) => (
                                        <div key={post._id} className={styles.activityItem}>
                                            {post.media ? (<img src={`${BASE_URL}/${post.media}`} alt="post" className={styles.activityImg} />) : <div className={styles.activityPlaceholder}></div>}
                                            <p className={styles.activityText}>{post.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={`${styles.sectionCard} ${styles.dangerZone}`}>
                                <div className={styles.dangerText}>
                                    <h4>Delete Account</h4>
                                    <p>Permanently remove your account.</p>
                                </div>
                                <button onClick={handleDelete} className={styles.deleteBtn}>Delete</button>
                            </div>
                        </div>
                    </div>

                    {/* --- INPUT MODALS --- */}
                    {(isModalOpen || isEducationModalOpen) && (
                        <div className={styles.modalOverlay} onClick={() => { setIsModalOpen(false); setIsEducationModalOpen(false); }}>
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <h3 style={{ margin: 0 }}>{isModalOpen ? "Add Work Experience" : "Add Education"}</h3>
                                {isModalOpen ? (
                                    <>
                                        <input onChange={handleWorkInputChange} name='company' value={inputData.company} className={styles.modalInput} type='text' placeholder='Company Name' />
                                        <input onChange={handleWorkInputChange} name='position' value={inputData.position} className={styles.modalInput} type='text' placeholder='Position' />
                                        <input onChange={handleWorkInputChange} name='years' value={inputData.years} className={styles.modalInput} type='number' placeholder='Years' />
                                        <button onClick={handleAddWork} className={styles.modalBtn}>Add & Save Work</button>
                                    </>
                                ) : (
                                    <>
                                        <input onChange={handleEducationInputChange} name='institution' value={educationInputData.institution} className={styles.modalInput} type='text' placeholder='Institution Name' />
                                        <input onChange={handleEducationInputChange} name='degree' value={educationInputData.degree} className={styles.modalInput} type='text' placeholder='Degree / Course' />
                                        <input onChange={handleEducationInputChange} name='year' value={educationInputData.year} className={styles.modalInput} type='number' placeholder='Passing Year' />
                                        <button onClick={handleAddEducation} className={styles.modalBtn}>Add & Save Education</button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </UserLayout>
    );
}