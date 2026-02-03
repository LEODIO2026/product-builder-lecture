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
    try {
        const prediction = await model.predict(imageElement);
        
        labelContainer.innerHTML = ''; // Clear for new predictions
        let highestProb = 0;
        let winner = null;

        // Find the winner
        for (let i = 0; i < maxPredictions; i++) {
            if (prediction[i].probability > highestProb) {
                highestProb = prediction[i].probability;
                winner = prediction[i].className;
            }
        }

        // Display the main result
        const resultDiv = document.createElement("div");
        resultDiv.className = "result-message";
        
        // Display the fun description
        const descriptionDiv = document.createElement("div");
        descriptionDiv.className = "result-description";

        if (winner === "강아지 (Dog)") {
            resultDiv.innerHTML = `결과는... 강아지상! 🐶`;
            resultDiv.classList.add("dog-result");
            descriptionDiv.innerHTML = "<h3>멍뭉미 폭발! 당신은 강아지상</h3><p>사람을 좋아하고 애교가 철철 넘치는 당신! 주변에 행복 바이러스를 전파하는 당신은 천상 강아지상! 복슬복슬한 강아지처럼 포근하고 사랑스러운 매력을 가졌네요.</p>";
        } else if (winner === "고양이 (Cat)") {
            resultDiv.innerHTML = `결과는... 고양이상! 🐱`;
            resultDiv.classList.add("cat-result");
            descriptionDiv.innerHTML = "<h3>시크한 매력! 당신은 고양이상</h3><p>알 수 없는 눈빛으로 시선을 사로잡는 당신! 츤데레 같지만, 한번 빠지면 헤어나올 수 없는 매력의 소유자군요. 도도하고 우아한 고양이처럼 모두가 당신에게 궁금증을 가질 거예요.</p>";
        } else {
            resultDiv.innerHTML = "얼굴을 분석하고 있어요...";
        }
        
        labelContainer.appendChild(resultDiv);
        labelContainer.appendChild(descriptionDiv);
    } catch (e) {
        console.error("Error during prediction:", e);
        labelContainer.innerHTML = "<div class='result-message'>얼굴 분석 중 오류가 발생했습니다. 다른 사진으로 시도해 보세요.</div>";
    }
}
