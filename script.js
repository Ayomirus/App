
// Mood advice messages
const moodAdvice = {
    "😊 Happy": [
        "Keep spreading that joy! Your happiness can inspire others.",
        "What a great mood! Remember this feeling for challenging times.",
        "Your positive energy is contagious. Share it with someone today!"
    ],
    "😢 Sad": [
        "Remember that it's okay not to be okay. This too shall pass.",
        "Take a moment to be gentle with yourself today.",
        "Consider reaching out to someone you trust - sharing can help."
    ],
    "😡 Angry": [
        "Take deep breaths and count to ten. It helps calm the mind.",
        "Try stepping away for a moment to clear your thoughts.",
        "Channel this energy into something productive, like exercise."
    ],
    "😌 Relaxed": [
        "This is the perfect time for reflection and gratitude.",
        "Enjoy this peaceful moment - you've earned it!",
        "Consider doing something creative while in this calm state."
    ],
    "😴 Tired": [
        "Listen to your body - maybe it's time for a short rest.",
        "Consider taking a refreshing walk or getting some fresh air.",
        "Remember to take care of yourself and get enough sleep tonight."
    ]
};

// Function to get random advice based on mood
function getRandomAdvice(mood) {
    const adviceList = moodAdvice[mood];
    const randomIndex = Math.floor(Math.random() * adviceList.length);
    return adviceList[randomIndex];
}



// Show notification function
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Function to validate mood data
function validateMoodData(date, mood, note) {
    if (!date || !(date instanceof Date) || isNaN(date)) {
        showNotification('Invalid date', 'error');
        return false;
    }
    if (!mood || !Object.keys(moodAdvice).includes(mood)) {
        showNotification('Please select a valid mood', 'error');
        return false;
    }
    if (note && note.length > 500) {
        showNotification('Note is too long (max 500 characters)', 'error');
        return false;
    }
    return true;
}

// Function to save mood with date and note
function saveMood() {
    try {
        const mood = document.getElementById("mood").value;
        const note = document.getElementById("moodNote").value;
        const date = new Date().toISOString();

        if (!validateMoodData(date, mood, note)) {
            return;
        }

        let moodList = JSON.parse(localStorage.getItem("moods")) || [];
        const advice = getRandomAdvice(mood);
        moodList.push({ date, mood, note, advice });
        localStorage.setItem("moods", JSON.stringify(moodList));

        // Clear inputs
        document.getElementById("moodNote").value = "";
        
        showNotification(advice);
        displayMoods();
        displayMoodChart();
    } catch (error) {
        console.error('Error saving mood:', error);
        showNotification('Failed to save mood', 'error');
    }
}

// Function to delete a mood entry
function deleteMood(index) {
    try {
        let moodList = JSON.parse(localStorage.getItem("moods")) || [];
        moodList.splice(index, 1);
        localStorage.setItem("moods", JSON.stringify(moodList));
        showNotification('Mood entry deleted');
        displayMoods();
        displayMoodChart();
    } catch (error) {
        console.error('Error deleting mood:', error);
        showNotification('Failed to delete mood', 'error');
    }
}

// Function to export data as CSV
function exportData() {
    try {
        let moodList = JSON.parse(localStorage.getItem("moods")) || [];
        if (moodList.length === 0) {
            showNotification('No data to export', 'error');
            return;
        }
        
        let csv = "Date,Mood,Note\n";
        moodList.forEach(entry => {
            csv += `${entry.date},${entry.mood},"${entry.note}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mood_tracker_data.csv';
        a.click();
        showNotification('Data exported successfully!');
    } catch (error) {
        console.error('Error exporting data:', error);
        showNotification('Failed to export data', 'error');
    }
}

// Function to display stored moods
function displayMoods() {
    try {
        let moodList = JSON.parse(localStorage.getItem("moods")) || [];
        let listElement = document.getElementById("moodList");
        listElement.innerHTML = "";

        if (moodList.length === 0) {
            listElement.innerHTML = '<li class="empty-state">No moods logged yet</li>';
            return;
        }

        moodList.forEach((entry, index) => {
            let listItem = document.createElement("li");
            let date = new Date(entry.date).toLocaleString();
            listItem.innerHTML = `
                ${date}: ${entry.mood} - ${entry.note || "No note"}
                <div class="advice">${entry.advice || getRandomAdvice(entry.mood)}</div>
                <button onclick="deleteMood(${index})" class="delete-btn" aria-label="Delete entry">×</button>
            `;
            listElement.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error displaying moods:', error);
        showNotification('Failed to display moods', 'error');
    }
}

// Function to display mood trends chart
function displayMoodChart() {
    try {
        let moodList = JSON.parse(localStorage.getItem("moods")) || [];
        let moodData = {};
        
        if (moodList.length === 0) {
            document.getElementById("moodChart").style.display = 'none';
            return;
        }
        
        document.getElementById("moodChart").style.display = 'block';
        
        // Group by days
        moodList.forEach(entry => {
            let date = new Date(entry.date).toLocaleDateString();
            if (!moodData[date]) {
                moodData[date] = {};
            }
            moodData[date][entry.mood] = (moodData[date][entry.mood] || 0) + 1;
        });

        let ctx = document.getElementById("moodChart").getContext("2d");
        if (window.moodChart && typeof window.moodChart.destroy === 'function') {
            window.moodChart.destroy();
        }

        let datasets = Object.keys(moodList.reduce((acc, entry) => {
            acc[entry.mood] = true;
            return acc;
        }, {})).map((mood, index) => ({
            label: mood,
            data: Object.keys(moodData).map(date => moodData[date][mood] || 0),
            backgroundColor: [`hsl(${index * 360 / 5}, 70%, 50%)`],
        }));

        window.moodChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(moodData),
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Mood Trends Over Time'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error displaying chart:', error);
        showNotification('Failed to display chart', 'error');
    }
}

// Update current time display
function updateDateTime() {
    const dateTimeElement = document.getElementById("currentDateTime");
    const now = new Date();
    dateTimeElement.textContent = now.toLocaleString();
}

// Device sensor monitoring
async function initSensors() {
    try {
        // Step counter
        if ('stepCounter' in navigator.sensors) {
            const stepCounter = await navigator.sensors.stepCounter.start();
            stepCounter.onreading = () => {
                if (stepCounter.steps > 10000) {
                    showNotification("Great job! You've reached 10,000 steps today!", 'success');
                }
            };
        }

        // Motion sensors
        if ('Accelerometer' in window) {
            const accelerometer = new Accelerometer({frequency: 1});
            accelerometer.addEventListener('reading', () => {
                const activity = Math.abs(accelerometer.x) + Math.abs(accelerometer.y) + Math.abs(accelerometer.z);
                if (activity > 20) {
                    showNotification("You seem very active! How are you feeling?", 'info');
                }
            });
            accelerometer.start();
        }
    } catch (error) {
        console.log('Sensor access not available:', error);
    }
}

// Request notification permission
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            showNotification('Notifications enabled!', 'success');
        }
    }
}

// Initialize the app
function initApp() {
    // Start updating time display
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Display moods and chart
    displayMoods();
    displayMoodChart();

    // Initialize sensors and notifications
    initSensors();
    requestNotificationPermission();
}

// Backup data to file
function backupData() {
    try {
        const data = localStorage.getItem("moods");
        const blob = new Blob([data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mood_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showNotification('Backup created successfully!');
    } catch (error) {
        showNotification('Failed to create backup', 'error');
    }
}

// Restore data from backup
function restoreData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            localStorage.setItem("moods", JSON.stringify(data));
            showNotification('Data restored successfully!');
            displayMoods();
            displayMoodChart();
        } catch (error) {
            showNotification('Invalid backup file', 'error');
        }
    };
    reader.readAsText(file);
}

// Register service worker for offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(error => console.log('Service Worker registration failed:', error));
}

// Start the app when the page loads
document.addEventListener('DOMContentLoaded', initApp);
