// Teachable Machine model URL
const URL = "https://teachablemachine.withgoogle.com/models/KQmUJ34Ph/";

let model, webcam, labelContainer, maxPredictions;

// --- Theme Toggle Logic (Kept from previous version) ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;

themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    
    // Save theme preference
    if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
});

// Apply saved theme on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
    }
});
// --- End of Theme Toggle Logic ---


// --- Animal Face Test Logic ---
const startBtn = document.getElementById('start-btn');
startBtn.addEventListener('click', init);

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load the model and metadata
    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Setup webcam
        const flip = true; // Flips the webcam feed horizontally
        webcam = new tmImage.Webcam(300, 300, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // Append webcam element to the container
        document.getElementById("webcam-container").innerHTML = ''; // Clear previous content
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }

        // Hide the start button after starting
        startBtn.style.display = 'none';

    } catch (e) {
        console.error("Error initializing webcam or model:", e);
        labelContainer.innerHTML = "모델 또는 웹캠을 로드하는 중 오류가 발생했습니다.";
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas element
    const prediction = await model.predict(webcam.canvas);
    let highestProbability = 0;
    let bestClass = "";

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestProbability) {
            highestProbability = prediction[i].probability;
            bestClass = prediction[i].className;
        }
    }

    let resultText = "";
    let resultClass = "";

    if (bestClass === "강아지 (Dog)") {
        resultText = `당신은 ${Math.round(highestProbability * 100)}% 확률로 강아지상 입니다! 🐶`;
        resultClass = "dog-result";
    } else if (bestClass === "고양이 (Cat)") {
        resultText = `당신은 ${Math.round(highestProbability * 100)}% 확률로 고양이상 입니다! 🐱`;
        resultClass = "cat-result";
    } else {
        resultText = "얼굴을 보여주세요...";
    }
    
    labelContainer.innerHTML = `<div class="result-message ${resultClass}">${resultText}</div>`;
}