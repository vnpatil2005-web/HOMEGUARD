
/* =========================================
   HOMEGUARD - FIREBASE CONNECTION
========================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    query,
    orderBy,
    limit,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


/* 1. FIREBASE CONFIGURATION */

const firebaseConfig = {
  apiKey: "AIzaSyBxskIijSvKbiCbmjKHLowNoPUI4_ilrzg",
  authDomain: "home-security-cloud-1207f.firebaseapp.com",
  projectId: "home-security-cloud-1207f",
  storageBucket: "home-security-cloud-1207f.firebasestorage.app",
  messagingSenderId: "589362458215",
  appId: "1:589362458215:web:dc2f11f22f0e24ba272ec2"
};


/* 2. INITIALIZE FIREBASE */

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


/* 3. ADMIN ACCOUNT */

const ADMIN_UID = "Jb6DprUKWlfRBpgvv9dEJpGHWGE3";

let unsubscribeHistory = null;


/* 4. OPEN HOME DASHBOARD */

function openDashboard() {

    // Use the navigation function from script.js
    if (typeof window.showPage === "function") {
        window.showPage("home");
        return;
    }

    // Fallback navigation if showPage is unavailable
    const homePage =
        document.getElementById("home") ||
        document.querySelector('[data-page="home"]');

    if (homePage) {
        document.querySelectorAll(".page").forEach(page => {
            page.classList.remove("active");
        });

        homePage.classList.add("active");
    }

    console.log("HOMEGUARD dashboard navigation completed.");
}


/* 5. ADMIN LOGIN */

const loginForm = document.getElementById("adminLoginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("adminEmail").value.trim();

        const password =
            document.getElementById("adminPassword").value;

        const message =
            document.getElementById("loginMessage");

        const submitButton =
            loginForm.querySelector('[type="submit"]');

        message.textContent = "Signing in...";
        message.style.color = "#3b82f6";

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            // Only allow the registered admin account
            if (userCredential.user.uid !== ADMIN_UID) {

                await signOut(auth);

                message.textContent =
                    "Access denied. Admin account required.";

                message.style.color = "#ef4444";

                return;
            }

            message.textContent = "Login successful!";
            message.style.color = "#22c55e";

            console.log("HOMEGUARD Admin authenticated.");

            // Open dashboard
            openDashboard();

            // Start reading Firestore history
            loadDetectionHistory();

            // Clear password field
            document.getElementById("adminPassword").value = "";

        }

        catch (error) {

            console.error("Admin login error:", error);

            message.textContent =
                "Login failed. Please check your email and password.";

            message.style.color = "#ef4444";

        }

        finally {

            if (submitButton) {
                submitButton.disabled = false;
            }

        }

    });

}


/* 6. READ FIRESTORE DETECTION HISTORY */

function loadDetectionHistory() {

    // Stop previous listener before creating a new one
    if (unsubscribeHistory) {
        unsubscribeHistory();
        unsubscribeHistory = null;
    }

    const historyCollection =
        collection(db, "detection_history");

    const historyQuery = query(
        historyCollection,
        orderBy("detected_at", "desc"),
        limit(100)
    );

    unsubscribeHistory = onSnapshot(

        historyQuery,

        (snapshot) => {

            const records = snapshot.docs.map(document => ({
                id: document.id,
                ...document.data()
            }));

            console.log(
                "Firestore records received:",
                records
            );

            // Update history table
            if (typeof window.updateHistoryRecords === "function") {
                window.updateHistoryRecords(records);
            }

            // Update dashboard with latest detection
            if (records.length > 0) {

                const latestRecord = records[0];

                if (typeof window.updateDetection === "function") {

                    window.updateDetection(
                        latestRecord.status,
                        latestRecord.detected_at
                    );

                }

            }

        },

        (error) => {

            console.error(
                "Firestore history error:",
                error
            );

            const historyBody =
                document.getElementById("historyTableBody");

            if (historyBody) {

                historyBody.innerHTML = `
                    <tr>
                        <td colspan="3" class="empty-history">
                            Unable to load detection history.
                            Please check your connection and permissions.
                        </td>
                    </tr>
                `;

            }

        }

    );

}


/* 7. CHECK ADMIN AUTHENTICATION */

onAuthStateChanged(auth, (user) => {

    if (user && user.uid === ADMIN_UID) {

        console.log("Admin session active.");

        openDashboard();

        loadDetectionHistory();

    }

    else {

        if (unsubscribeHistory) {
            unsubscribeHistory();
            unsubscribeHistory = null;
        }

        console.log("Admin is not logged in.");

    }

});


console.log("HOMEGUARD Firebase initialized successfully.");
