/* =========================================
   HOMEGUARD - FIREBASE READY JAVASCRIPT
========================================= */


/* 1. PAGE NAVIGATION */

const navigationButtons = document.querySelectorAll(".nav-link");
const quickCards = document.querySelectorAll(".quick-card");
const pages = document.querySelectorAll(".page");

function showPage(pageName) {

    pages.forEach(page => {
        page.classList.remove("active");
    });

    navigationButtons.forEach(button => {
        button.classList.remove("active");
    });

    const selectedPage = document.getElementById(pageName + "Page");

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    navigationButtons.forEach(button => {
        if (button.dataset.page === pageName) {
            button.classList.add("active");
        }
    });

    const headings = {
        home: "Home Security Monitoring",
        history: "Detection History",
        about: "About HOMEGUARD",
        settings: "Settings",
        adminLogin: "Admin Login"
    };

    const heading = document.querySelector(".page-heading h2");

    if (heading) {
        heading.textContent = headings[pageName] || "HOMEGUARD";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Sidebar navigation
navigationButtons.forEach(button => {

    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });

});


// Dashboard quick access cards
quickCards.forEach(card => {

    card.addEventListener("click", () => {
        showPage(card.dataset.page);
    });

});


/* 2. FIRESTORE HISTORY RECORDS */

// Real records will be received from firebase.js.

let detectionHistory = [];

function formatTimestamp(timestamp) {

    if (!timestamp) {
        return {
            date: "Unknown",
            time: "Unknown"
        };
    }

    const dateObject =
        timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return {
        date: dateObject.toLocaleDateString("en-CA"),
        time: dateObject.toLocaleTimeString()
    };
}


function displayHistory(records) {

    const historyBody =
        document.getElementById("historyTableBody");

    if (!historyBody) return;

    historyBody.innerHTML = "";

    if (!records || records.length === 0) {

        historyBody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-history">
                    No detection records found.
                </td>
            </tr>
        `;

        return;
    }

    records.forEach(record => {

        const row = document.createElement("tr");

        const formatted = formatTimestamp(record.detected_at);

        const statusClass =
            record.status === "HUMAN_DETECTED"
                ? "detected"
                : "clear";

        const dateCell = document.createElement("td");
        dateCell.textContent = formatted.date;

        const timeCell = document.createElement("td");
        timeCell.textContent = formatted.time;

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");
        statusBadge.className = `history-status ${statusClass}`;
        statusBadge.textContent = record.status || "UNKNOWN";

        statusCell.appendChild(statusBadge);

        row.appendChild(dateCell);
        row.appendChild(timeCell);
        row.appendChild(statusCell);

        historyBody.appendChild(row);

    });

}


// Firebase module will call this function.
window.updateHistoryRecords = function(records) {

    detectionHistory = records || [];

    displayHistory(detectionHistory);

};


/* 3. FILTER HISTORY BY DATE */

const historyDate =
    document.getElementById("historyDate");

if (historyDate) {

    historyDate.addEventListener("change", () => {

        const selectedDate = historyDate.value;

        if (!selectedDate) {
            displayHistory(detectionHistory);
            return;
        }

        const filteredRecords = detectionHistory.filter(record => {

            const formatted = formatTimestamp(record.detected_at);

            return formatted.date === selectedDate;

        });

        displayHistory(filteredRecords);

    });

}


// Initial empty history
displayHistory([]);


/* 4. DETECTION DISPLAY */

function updateDetection(status, detectedAt = new Date()) {

    const detectionCard =
        document.getElementById("detectionCard");

    const detectionLabel =
        document.getElementById("detectionLabel");

    const detectionTitle =
        document.getElementById("detectionTitle");

    const detectionDescription =
        document.getElementById("detectionDescription");

    const detectionIcon =
        document.getElementById("detectionIcon");

    const alertBadge =
        document.getElementById("alertBadge");

    const detectionTime =
        document.getElementById("detectionTime");

    if (!detectionCard) return;

    if (status === "HUMAN_DETECTED") {

        detectionCard.className = "detection-card detected";

        detectionLabel.textContent = "SECURITY ALERT";

        detectionTitle.textContent = "HUMAN DETECTED";

        detectionDescription.textContent =
            "Human presence detected in your monitored area.";

        detectionIcon.innerHTML =
            '<i class="fa-solid fa-triangle-exclamation"></i>';

        alertBadge.innerHTML =
            '<i class="fa-solid fa-bell"></i><span>SECURITY ALERT</span>';

    }

    else if (status === "AREA_CLEAR") {

        detectionCard.className = "detection-card clear";

        detectionLabel.textContent = "AREA CLEAR";

        detectionTitle.textContent = "NO HUMAN DETECTED";

        detectionDescription.textContent =
            "Your monitored area is currently clear.";

        detectionIcon.innerHTML =
            '<i class="fa-solid fa-shield-halved"></i>';

        alertBadge.innerHTML =
            '<i class="fa-solid fa-shield-check"></i><span>AREA SECURE</span>';

    }

    if (detectionTime) {

        const dateObject =
            detectedAt.toDate ? detectedAt.toDate() : new Date(detectedAt);

        detectionTime.textContent =
            dateObject.toLocaleString();

    }

}

window.updateDetection = updateDetection;


/* 5. NOTIFICATION SETTINGS */

const notificationToggle =
    document.getElementById("notificationToggle");

const clearNotificationToggle =
    document.getElementById("clearNotificationToggle");


if (notificationToggle) {

    notificationToggle.addEventListener("change", () => {

        console.log(
            "Human detection notifications:",
            notificationToggle.checked ? "Enabled" : "Disabled"
        );

    });

}


if (clearNotificationToggle) {

    clearNotificationToggle.addEventListener("change", () => {

        console.log(
            "Area clear notifications:",
            clearNotificationToggle.checked ? "Enabled" : "Disabled"
        );

    });

}


/* 6. THEME SETTING */

const themeToggle =
    document.getElementById("themeToggle");

if (themeToggle) {

    themeToggle.addEventListener("change", () => {

        document.body.classList.toggle(
            "light-theme",
            themeToggle.checked === false
        );

    });

}


/* 7. NOTIFICATION BUTTON */

const notificationButton =
    document.getElementById("notificationButton");

if (notificationButton) {

    notificationButton.addEventListener("click", () => {

        alert("HOMEGUARD notification centre is ready.");

    });

}


/* 8. PROFILE BUTTON */

const profileButton =
    document.getElementById("profileButton");

if (profileButton) {

    profileButton.addEventListener("click", () => {

        showPage("settings");

    });

}


console.log("HOMEGUARD JavaScript loaded successfully.");
