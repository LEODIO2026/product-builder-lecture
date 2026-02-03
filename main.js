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
        webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // Append webcam element to the container
        document.getElementById("webcam-container").innerHTML = ''; // Clear previous content
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = ''; // Clear previous content
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }

        // Hide the start button after starting
        startBtn.style.display = 'none';

    } catch (e) {
        console.error("Error initializing webcam or model:", e);
        labelContainer.innerHTML = "<div class='result-message'>모델 또는 웹캠을 로드하는 중 오류가 발생했습니다.</div>";
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = `${prediction[i].className}: ${Math.round(prediction[i].probability * 100)}%`;
        const resultDiv = labelContainer.childNodes[i];
        resultDiv.innerHTML = `<div class="result-message">${classPrediction}</div>`;
        if (prediction[i].className === "강아지 (Dog)") {
            resultDiv.classList.add("dog-result");
            resultDiv.classList.remove("cat-result");
        } else if (prediction[i].className === "고양이 (Cat)") {
            resultDiv.classList.add("cat-result");
            resultDiv.classList.remove("dog-result");
        }
    }
}