// Teachable Machine model URL
const URL = "https://teachablemachine.withgoogle.com/models/KQmUJ34Ph/";

let model, labelContainer, maxPredictions;

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
    // Load the model as soon as the page is ready
    init();
});
// --- End of Theme Toggle Logic ---


// --- Animal Face Test Logic ---
const imageUploadInput = document.getElementById('image-upload-input');
const imagePreview = document.getElementById('image-preview');

// Load the image model
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        labelContainer = document.getElementById("label-container");
        
        // Add event listener for file upload
        imageUploadInput.addEventListener('change', handleImageUpload);

    } catch (e) {
        console.error("Error loading model:", e);
        if(labelContainer) {
            labelContainer.innerHTML = "<div class='result-message'>모델을 로드하는 중 오류가 발생했습니다.</div>";
        }
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            
            // Clear previous results
            labelContainer.innerHTML = ''; 

            // Wait for the image to be fully loaded before predicting
            imagePreview.onload = () => predict(imagePreview);
        }
        reader.readAsDataURL(file);
    }
}

// run the uploaded image through the image model
async function predict(imageElement) {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(imageElement);
    
    labelContainer.innerHTML = ''; // Clear for new predictions
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = `${prediction[i].className}: ${Math.round(prediction[i].probability * 100)}%`;
        
        const resultDiv = document.createElement("div");
        resultDiv.className = "result-message";
        resultDiv.innerHTML = classPrediction;

        if (prediction[i].className === "강아지 (Dog)") {
            resultDiv.classList.add("dog-result");
        } else if (prediction[i].className === "고양이 (Cat)") {
            resultDiv.classList.add("cat-result");
        }
        
        labelContainer.appendChild(resultDiv);
    }
}
