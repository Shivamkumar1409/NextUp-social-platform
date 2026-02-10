import Head from "next/head";
import { useRouter } from "next/router";
import styles from "@/styles/Landing.module.css"; // Imports the new CSS file you created
import Logo from "./login/Logo"; // Imports your new Logo component

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>NextUp - Connect Authentically</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.container}>
        
        {/* --- 1. NAVBAR --- */}
        <nav className={styles.navbar}>
          {/* Logo Section */}
          <div 
            onClick={() => router.push('/')} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
             {/* We use the Logo here, scaled down slightly for the navbar */}
             <Logo width={140} height={50} color="#004aad" />
          </div>
          
          {/* Nav Buttons */}
          <div className={styles.navButtons}>
            <button onClick={() => router.push('/login')} className={styles.loginBtn}>
              Sign In
            </button>
            <button onClick={() => router.push('/login')} className={styles.joinBtn}>
              Get Started
            </button>
          </div>
        </nav>

        {/* --- 2. HERO SECTION --- */}
        <main className={styles.main}>
          
          {/* Decorative Background Blobs (defined in Landing.module.css) */}
          <div className={styles.heroVisual}>
              <div className={styles.blob}></div>
              <div className={styles.blob2}></div>
          </div>

          <div className={styles.contentWrapper}>
            <h1 className={styles.headline}>
              Connect <span className={styles.highlight}>Authentically</span>.<br/>
              Grow <span className={styles.highlight}>Professionally</span>.
            </h1>
            
            <p className={styles.subheadline}>
              NextUp is the platform where real connections happen. 
              No fluff, no exaggeration—just the network you need to move forward.
            </p>
            
            <button onClick={() => router.push('/login')} className={styles.ctaButton}>
              Join the Community
            </button>
          </div>
        </main>

      </div>
    </>
  );
}