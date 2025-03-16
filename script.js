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
    if (!adviceList) return "Stay mindful and take care of yourself!";
    return adviceList[Math.floor(Math.random() * adviceList.length)];
}

// Show notification function
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Function to validate mood data
function validateMoodData(mood, note) {
    if (!mood || !moodAdvice[mood]) {
        showNotification('Please select a valid mood', 'error');
        return false;
    }
    if (note && note.length > 500) {
        showNotification('Note is too long (max 500 characters)', 'error');
        return false;
    }
    return true;
}

// Function to save mood
function saveMood() {
    try {
        const mood = document.getElementById("mood").value;
        const note = document.getElementById("moodNote").value;
        const date = new Date().toISOString();

        if (!validateMoodData(mood, note)) return;

        let moodList = JSON.parse(localStorage.getItem("moods")) || [];
        const advice = getRandomAdvice(mood);
        moodList.push({ date, mood, note, advice });
        localStorage.setItem("moods", JSON.stringify(moodList));

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
            csv += `${entry.date},${entry.mood},"${entry.note || ""}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
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
    const moodList = JSON.parse(localStorage.getItem("moods")) || [];
    const listElement = document.getElementById("moodList");
    if (!listElement) return;

    listElement.innerHTML = moodList.length
        ? moodList.map((entry, index) => `
            <li>
                ${new Date(entry.date).toLocaleString()}: ${entry.mood} - ${entry.note || "No note"}
                <div class="advice">${entry.advice || getRandomAdvice(entry.mood)}</div>
                <button onclick="deleteMood(${index})" class="delete-btn">×</button>
            </li>
        `).join('')
        : '<li class="empty-state">No moods logged yet</li>';
}

// Function to display mood trends chart
function displayMoodChart() {
    const moodList = JSON.parse(localStorage.getItem("moods")) || [];
    if (!moodList.length) return document.getElementById("moodChart").style.display = 'none';

    document.getElementById("moodChart").style.display = 'block';
    const ctx = document.getElementById("moodChart").getContext("2d");
    const moodCounts = moodList.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
    }, {});

    if (window.moodChart) window.moodChart.destroy();

    window.moodChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(moodCounts),
            datasets: [{
                label: 'Mood Frequency',
                data: Object.values(moodCounts),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, stepSize: 1 } },
        }
    });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    displayMoods();
    displayMoodChart();
});
