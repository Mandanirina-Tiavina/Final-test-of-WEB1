/**
 * Point culture (en Français car je suis un peu obligé): 
 * Dans ce genre de jeu, un mot equivaut a 5 caractères, y compris les espaces. 
 * La precision, c'est le pourcentage de caractères tapées correctement sur toutes les caractères tapées.
 * 
 * Sur ce... Amusez-vous bien ! 
 */
let startTime = null;
let currentWordIndex = 0;
const wordsToType = [];
let correctChars = 0;
let totalTypedChars = 0;
let gameStats = JSON.parse(localStorage.getItem('typingStats')) || [];
let typingChart = null;
let historyChart = null;
let currentWordState = []; 

const modeSelect = document.getElementById("mode");
const wordDisplay = document.getElementById("word-display");
const inputField = document.getElementById("input-field");
const results = document.getElementById("results");
const restart = document.getElementById("undo-icon");
const themeSelect = document.getElementById("theme")
const languageSelect = document.getElementById("language");
const chartContainer = document.getElementById("chart-container");
const statsChart = document.getElementById("statsChart");
const historyChartCanvas = document.getElementById("historyChart");

const englishWords = {
    easy: ["apple", "banana", "grape", "orange", "cherry"],
    medium: ["keyboard", "monitor", "printer", "charger", "battery"],
    hard: ["synchronize", "complicated", "development", "extravagant", "misconception"]
};

const frenchWords = {
    easy: ["pomme", "banane", "fraise", "orange", "cerise"],
    medium: ["clavier", "écran", "souris", "chargeur", "batterie"],
    hard: ["synchroniser", "compliqué", "développement", "extravagant", "méconnaissance"]
};

// orgaize the language select
const getWords = () => languageSelect.value === 'fr' ? frenchWords : englishWords;

// Generate a random word from the selected mode and with the language
const getRandomWord = (mode) => {
    const wordList = getWords()[mode];
    return wordList[Math.floor(Math.random() * wordList.length)];
};

// Start the timer when user begins typing
const startTimer = () => {
    if (!startTime) startTime = Date.now();
};

// Initialize the typing test
const startTest = (wordCount = 50) => {
    wordsToType.length = 0; // Clear previous words
    wordDisplay.innerHTML = ""; // Clear display
    currentWordIndex = 0;
    startTime = null;
    correctChars = 0;
    totalTypedChars = 0;

    if (chartContainer) {
        chartContainer.style.display = "none";
    }

    for (let i = 0; i < wordCount; i++) {
        wordsToType.push(getRandomWord(modeSelect.value, languageSelect.value));
    }

    wordsToType.forEach((word, index) => {
        const span = document.createElement("span");
        span.textContent = word + " ";
        if (index == 0) span.classList.add("current-word");
        wordDisplay.appendChild(span);
    });

    inputField.value = "";
    results.textContent = "";
    inputField.focus();
};
const updateCurrentWord = (typed, targetWord) => {
    const wordElement = wordDisplay.children[currentWordIndex];
    if (!wordElement) return;

    // Réinitialiser l'état pour le mot courant
    currentWordState = Array(targetWord.length).fill(false);
    let coloredWord = "";

    // Comparaison caractère par caractère
    for (let i = 0; i < targetWord.length; i++) {
        if (i < typed.length) {
            currentWordState[i] = (typed[i] === targetWord[i]);
            coloredWord += `<span style="color: ${currentWordState[i] ? 'green' : 'red'}">${targetWord[i]}</span>`;
        } else {
            coloredWord += targetWord[i];
        }
    }

    wordElement.innerHTML = coloredWord + " ";
};

//Show the graphics
const showCharts = () => {
    if (!chartContainer) return;
    
    chartContainer.style.display = "block";
    updateStatsChart();
    updateHistoryChart();
};

//Update the graphic recent test
const updateStatsChart = () => {
    if (!statsChart) return;
    if (typingChart) typingChart.destroy();

    const ctx = statsChart.getContext('2d');
    const incorrectChars = totalTypedChars - correctChars;
    const lastStat = gameStats[gameStats.length - 1];

    typingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Character'],
            datasets: [
                {
                    label: 'Corrects',
                    data: [correctChars],
                    backgroundColor: 'rgba(75, 192, 75, 0.7)'
                },
                {
                    label: 'Incorrects',
                    data: [incorrectChars],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
};
//Update the histiric graphic
const updateHistoryChart = () => {
    if (!historyChartCanvas || gameStats.length < 1) return;
    if (historyChart) historyChart.destroy();

    const ctx = historyChartCanvas.getContext('2d');
    
    // Triez par timestamp pour être sûr de l'ordre
    const sortedStats = [...gameStats].sort((a, b) => a.timestamp - b.timestamp);
    
    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedStats.map((_, i) => `Test ${i + 1}`),
            datasets: [
                {
                    label: 'WPM',
                    data: sortedStats.map(s => s.wpm),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Accuracy (%)',
                    data: sortedStats.map(s => s.accuracy),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Performance'
                    }
                }
            }
        }
    });
};

const handleSpace = (e) => {
    if (e.key === " ") {
        e.preventDefault();
        
        const currentWord = wordsToType[currentWordIndex];
        const typedWord = inputField.value;
        
        updateCurrentWord(typedWord, currentWord);
        
        // Calcul EXACT pour ce mot seulement
        const charsToCheck = Math.min(typedWord.length, currentWord.length);
        let correctThisWord = 0;
        
        for (let i = 0; i < charsToCheck; i++) {
            if (typedWord[i] === currentWord[i]) correctThisWord++;
        }
        
        // Mise à jour des totaux
        correctChars += correctThisWord;
        totalTypedChars += currentWord.length; // On considère le mot complet
        
        wordDisplay.children[currentWordIndex].classList.remove("current-word");
        currentWordIndex++;
        inputField.value = "";
        
        if (currentWordIndex >= wordsToType.length) {
            const elapsedMinutes = (Date.now() - startTime) / 60000;
            const characterCount = wordsToType.join('').length;
            const incorrectChars = characterCount - correctChars;
            const wpm = Math.round((characterCount / (elapsedMinutes * 5)));
            const accuracy = (correctChars / characterCount * 100).toFixed(2);
            
            results.innerHTML = `WPM: ${wpm} | Accuracy: ${accuracy}% | Total Char: ${characterCount}`;
            //save the stats
            gameStats.push({
                wpm,
                accuracy,
                correctChars,
                incorrectChars,
                characterCount,
                timestamp: Date.now()
            });
            
            localStorage.setItem('typingStats', JSON.stringify(gameStats));
            showCharts();
        } else {
            wordDisplay.children[currentWordIndex].classList.add("current-word");
        }
    }
};

// Event listeners
// Attach `updateWord` to `keydown` instead of `input`
inputField.addEventListener("input", (event) => {
    startTimer();
    updateCurrentWord(event.target.value, wordsToType[currentWordIndex]);
});
inputField.addEventListener("keydown", handleSpace);
modeSelect.addEventListener("change", () => startTest());

//update the content
restart.addEventListener("click", () => {startTest();});
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        startTest();
    }
});
languageSelect.addEventListener("change", () => startTest())

//change the theme
const applyTheme = (theme) => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
};
themeSelect.addEventListener("change", (e) => applyTheme(e.target.value));
applyTheme(localStorage.getItem('theme') || 'light');

// Start the test
startTest();