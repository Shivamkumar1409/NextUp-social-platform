import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux"; 
import UserLayout from "@/layout/UserLayout";
import { useSocket } from "@/context/SocketContext";
import styles from "./index.module.css";
import { BASE_URL } from "@/config";
import { getAllUsers, getAboutUser } from "@/config/redux/action/authAction"; 

export default function Chat() {
  const router = useRouter();
  
  // 1. Get onlineUsers safely
  const { socket, notifications, setNotifications, onlineUsers = [] } = useSocket();
  
  const dispatch = useDispatch(); 
  const messagesEndRef = useRef(null);
  
  const { user } = useSelector((state) => state.auth);
  const { all_users } = useSelector((state) => state.auth);

  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  
  // --- UPLOAD STATES ---
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); 
  
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null); 
  
  const [previewImage, setPreviewImage] = useState(null); 

  // --- HELPER: DETECT & RENDER LINKS ---
  const renderMessageWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            const href = part.startsWith("www.") ? `http://${part}` : part;
            return (
                <a 
                    key={index} 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ textDecoration: "underline", color: "inherit", fontWeight: "bold" }}
                    onClick={(e) => e.stopPropagation()} 
                >
                    {part}
                </a>
            );
        }
        return part;
    });
  };

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    if (all_users.length === 0) dispatch(getAllUsers());
    if (!user && localStorage.getItem("token")) {
        dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }
  }, [all_users.length, user, dispatch]);

  // --- FETCH MESSAGES ---
  useEffect(() => {
    const fetchMessages = async () => {
        if (!selectedUser || !user?._id) return;
        
        try {
            const response = await fetch(`${BASE_URL}/get_messages?sender=${user._id}&receiver=${selectedUser._id}`);
            const data = await response.json();
            
            const formattedMessages = data.map(msg => ({
                _id: msg._id,
                message: msg.message,
                image: msg.image, 
                file: msg.file, 
                sender: msg.sender,
                isSeen: msg.isSeen,
                isMe: msg.sender === user._id, 
                createdAt: msg.createdAt,
                deletedBy: msg.deletedBy || []
            }));

            setMessages(formattedMessages.filter(m => !m.deletedBy.includes(user._id))); 

            await fetch(`${BASE_URL}/mark_seen`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sender: selectedUser._id, receiver: user._id }) 
            });
            socket.emit("mark_as_seen", { senderId: selectedUser._id, receiverId: user._id }); 
        } catch (error) { console.error(error); }
    };
    fetchMessages();
  }, [selectedUser, user]);

  // --- SOCKET LISTENERS ---
  useEffect(() => {
    if (!socket || !user) return;

    socket.on("receive_message", (data) => {
      if (selectedUser && data.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, { 
            _id: data._id || Date.now(), 
            message: data.message, 
            image: data.image,
            file: data.file,
            sender: data.senderId, 
            isMe: false,
            isSeen: false,
            deletedBy: []
        }]);
        socket.emit("mark_as_seen", { senderId: data.senderId, receiverId: user._id }); 
      }
    });

    socket.on("messages_seen", (data) => {
      if (selectedUser && data.receiverId === selectedUser._id) {
        setMessages((prev) => prev.map(msg => ({ ...msg, isSeen: true })));
      }
    });

    socket.on("message_deleted", (data) => {
        setMessages((prev) => prev.filter(msg => msg._id !== data.messageId));
    });

    return () => {
        socket.off("receive_message");
        socket.off("messages_seen");
        socket.off("message_deleted");
    };
  }, [socket, selectedUser, user]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (selectedUser && notifications.length > 0) {
        const remainingNotifications = notifications.filter(n => n.senderId !== selectedUser._id);
        if (remainingNotifications.length !== notifications.length) setNotifications(remainingNotifications);
    }
  }, [selectedUser, notifications, setNotifications]);


  // --- HANDLE SEND ---
  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage && !selectedFile) || !selectedUser || !user) return;
    
    const formData = new FormData();
    formData.append("sender", user._id); 
    formData.append("receiver", selectedUser._id);
    formData.append("message", messageInput || ""); 
    
    if (selectedImage) formData.append("image", selectedImage);
    if (selectedFile) formData.append("file", selectedFile); 

    try {
        const response = await fetch(`${BASE_URL}/send_message`, { method: "POST", body: formData });
        const savedMessage = await response.json();

        socket.emit("send_message", {
            senderId: user._id, 
            receiverId: selectedUser._id,
            message: messageInput,
            image: savedMessage.image,
            file: savedMessage.file, 
            _id: savedMessage._id 
        });

        setMessages((prev) => [...prev, { 
            _id: savedMessage._id,
            message: messageInput, 
            image: savedMessage.image,
            file: savedMessage.file, 
            sender: user._id, 
            isMe: true,
            isSeen: false,
            createdAt: new Date().toISOString(),
            deletedBy: []
        }]);

        setMessageInput(""); setSelectedImage(null); setSelectedFile(null);
    } catch (error) { console.error(error); }
  };

  // --- HANDLE DELETE ---
  const handleDelete = async (msgId, createdAt, isMe) => {
      const timeDiff = (Date.now() - new Date(createdAt).getTime()) / 1000;
      const canDeleteForEveryone = isMe && timeDiff < 30;

      let type = null; 

      if (canDeleteForEveryone) {
          if (window.confirm("Delete for everyone?")) {
              type = "everyone";
          } 
          else if (window.confirm("Delete just for yourself?")) {
              type = "me";
          }
          else {
              return;
          }
      } else {
          if (window.confirm("Delete this message for yourself?")) {
              type = "me";
          } else {
              return;
          }
      }

      if (!type) return;

      try {
          await fetch(`${BASE_URL}/delete_message`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messageId: msgId, userId: user._id, type }) 
          });

          if (type === "everyone") {
              setMessages(prev => prev.filter(m => m._id !== msgId));
              socket.emit("delete_message", { receiverId: selectedUser._id, messageId: msgId });
          } else {
              setMessages(prev => prev.filter(m => m._id !== msgId));
          }
      } catch (error) { console.error("Error deleting", error); }
  };


  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.userList}>
            <h3 style={{ margin: "0 0 15px 10px" }}>Chats</h3>
            
            {/* FIX: Ensure all_users is an array and filter out nulls */}
            {(all_users || []).map((u) => {
                if (!u) return null;
                
                const isOnline = (onlineUsers || []).some(id => String(id) === String(u._id));

                return (
                    <div key={u._id} onClick={() => setSelectedUser(u)} className={`${styles.userCard} ${selectedUser?._id === u._id ? styles.activeUser : ""}`}>
                        <div style={{ position: "relative", width: "40px", height: "40px" }}>
                            <img 
                                src={u.profilePicture ? `${BASE_URL}/${u.profilePicture}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                className={styles.profilePic} 
                                onError={(e)=>{e.target.src="https://cdn-icons-png.flaticon.com/512/149/149071.png"}}
                                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                            />
                            {/* FIX: Online Dot with higher Z-Index */}
                            {isOnline && (
                                <div style={{ 
                                    position: "absolute", 
                                    bottom: "2px", 
                                    right: "2px", 
                                    width: "12px", 
                                    height: "12px", 
                                    backgroundColor: "#2cc92c", 
                                    borderRadius: "50%", 
                                    border: "2px solid white",
                                    zIndex: 10 
                                }} />
                            )}
                        </div>
                        <div style={{display: "flex", flexDirection: "column"}}>
                            <p className={styles.username}>{u.name}</p>
                            <span style={{fontSize: "0.8rem", color: "grey"}}>@{u.username}</span>
                        </div>
                    </div>
                )
            })}
        </div>

        <div className={styles.chatWindow}>
            {selectedUser ? (
                <>
                <div className={styles.chatHeader}>
                     <img src={selectedUser.profilePicture ? `${BASE_URL}/${selectedUser.profilePicture}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className={styles.profilePic} style={{ width: "35px", height: "35px" }} onError={(e)=>{e.target.src="https://cdn-icons-png.flaticon.com/512/149/149071.png"}}/>
                    <span>{selectedUser.username}</span>
                </div>

                <div className={styles.messagesArea}>
                    {messages.map((msg, index) => (
                        <div key={index} 
                            className={`${styles.messageBubble} ${msg.isMe ? styles.myMessage : styles.theirMessage}`} 
                            style={{ position: "relative", cursor: "pointer", wordBreak: "break-word" }}
                            onContextMenu={(e) => {
                                e.preventDefault(); 
                                handleDelete(msg._id, msg.createdAt, msg.isMe);
                            }}
                            title="Right click to delete"
                        >
                            {/* RENDER IMAGE */}
                            {msg.image && <img src={`${BASE_URL}/${msg.image}`} alt="sent" onClick={()=>setPreviewImage(msg.image)} style={{ maxWidth: "200px", borderRadius: "10px", marginBottom: "5px", display: "block", cursor: "pointer" }} />}
                            
                            {/* RENDER FILE / PDF */}
                            {msg.file && (
                                <a href={`${BASE_URL}/${msg.file}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit", background: "rgba(0,0,0,0.05)", padding: "10px", borderRadius: "8px", marginBottom: "5px" }}>
                                    <span style={{ fontSize: "1.5rem", marginRight: "10px" }}>📄</span>
                                    <span style={{ fontSize: "0.9rem", textDecoration: "underline" }}>Download Document</span>
                                </a>
                            )}

                            {/* RENDER TEXT (WITH LINKS) */}
                            {renderMessageWithLinks(msg.message)}

                            {msg.isMe && <span style={{ fontSize: "0.7rem", marginLeft: "8px", color: msg.isSeen ? "#00B2FF" : "#ffffff88" }}>{msg.isSeen ? "✓✓" : "✓"}</span>}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* FILE PREVIEWS */}
                {(selectedImage || selectedFile) && (
                    <div style={{ padding: "10px", background: "#f0f0f0", display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "0.8rem", marginRight: "10px" }}>
                            {selectedImage ? `Image: ${selectedImage.name}` : `File: ${selectedFile.name}`}
                        </span>
                        <button onClick={() => { setSelectedImage(null); setSelectedFile(null); }} style={{ background: "red", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer" }}>x</button>
                    </div>
                )}

                <div className={styles.inputArea}>
                    {/* HIDDEN INPUTS */}
                    <input type="file" accept="image/*" style={{ display: "none" }} ref={imageInputRef} onChange={(e) => setSelectedImage(e.target.files[0])} />
                    <input type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: "none" }} ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files[0])} />
                    
                    {/* BUTTONS */}
                    <button onClick={() => imageInputRef.current.click()} style={{ marginRight: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }} title="Send Image">📷</button>
                    <button onClick={() => fileInputRef.current.click()} style={{ marginRight: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }} title="Send File">📎</button>
                    
                    <input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type a message..." className={styles.inputField} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                    <button onClick={handleSendMessage} className={styles.sendButton}>Send</button>
                </div>
                </>
            ) : <div className={styles.noChatSelected}>Select a user to start chatting</div>}
        </div>

        {/* LIGHTBOX */}
        {previewImage && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setPreviewImage(null)}>
                <button style={{ position: "absolute", top: "20px", right: "30px", background: "none", color: "white", border: "none", fontSize: "2rem", cursor: "pointer" }} onClick={() => setPreviewImage(null)}>&times;</button>
                <img src={`${BASE_URL}/${previewImage}`} style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "8px", boxShadow: "0 0 20px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()} />
            </div>
        )}
      </div>
    </UserLayout>
  );
}