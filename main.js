// Teachable Machine model URL
const URL = "https://teachablemachine.withgoogle.com/models/KQmUJ34Ph/";

let model, labelContainer, maxPredictions, uploadContainer, imagePreviewContainer;

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;

function updateThemeButton() {
    if (themeToggleBtn) {
        themeToggleBtn.textContent = body.classList.contains('light-mode') ? '다크모드' : '라이트모드';
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-mode');

        // Save theme preference
        if (body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
        updateThemeButton();
    });
}

// Apply saved theme on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
    }
    updateThemeButton();

    // Only load model if on main page
    if (document.getElementById('image-upload-input')) {
        init();
    }
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
        uploadContainer = document.getElementById("upload-container");
        imagePreviewContainer = document.getElementById("image-preview-container");
        
        // Add event listener for file upload
        imageUploadInput.addEventListener('change', handleImageUpload);

    } catch (e) {
        console.error("Error loading model:", e);
        if(labelContainer) {
            labelContainer.innerHTML = "<div class='result-message'>모델을 로드하는 중 오류가 발생했습니다.</div>";
        }
    }
}

// Analysis steps configuration
const analysisSteps = [
    { icon: '📤', text: '이미지 로딩 중...', duration: 500 },
    { icon: '👤', text: '얼굴 인식 중...', duration: 800 },
    { icon: '🔍', text: 'AI 분석 중...', duration: 1000 },
    { icon: '🧮', text: '결과 계산 중...', duration: 700 },
    { icon: '✨', text: '분석 완료!', duration: 300 }
];

// Analysis overlay elements
let analysisOverlay, analysisIcon, analysisStep, progressBar, progressText;

function initAnalysisElements() {
    analysisOverlay = document.getElementById('analysis-overlay');
    analysisIcon = document.getElementById('analysis-icon');
    analysisStep = document.getElementById('analysis-step');
    progressBar = document.getElementById('progress-bar');
    progressText = document.getElementById('progress-text');
}

function showAnalysisOverlay() {
    if (!analysisOverlay) initAnalysisElements();
    analysisOverlay.style.display = 'flex';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
}

function hideAnalysisOverlay() {
    if (analysisOverlay) {
        analysisOverlay.style.display = 'none';
    }
}

function updateAnalysisStep(stepIndex, progress) {
    if (!analysisIcon || !analysisStep) return;

    const step = analysisSteps[stepIndex];
    analysisIcon.textContent = step.icon;
    analysisStep.textContent = step.text;

    const percentage = Math.round(progress);
    progressBar.style.width = percentage + '%';
    progressText.textContent = percentage + '%';
}

async function runAnalysisAnimation() {
    showAnalysisOverlay();

    const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0);
    let elapsed = 0;

    for (let i = 0; i < analysisSteps.length; i++) {
        const step = analysisSteps[i];
        const startProgress = (elapsed / totalDuration) * 100;
        const endProgress = ((elapsed + step.duration) / totalDuration) * 100;

        // Animate progress for this step
        const startTime = Date.now();

        await new Promise(resolve => {
            const animate = () => {
                const now = Date.now();
                const stepElapsed = now - startTime;
                const stepProgress = Math.min(stepElapsed / step.duration, 1);
                const currentProgress = startProgress + (endProgress - startProgress) * stepProgress;

                updateAnalysisStep(i, currentProgress);

                if (stepProgress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });

        elapsed += step.duration;
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            uploadContainer.style.display = 'none';
            if (imagePreviewContainer) {
                imagePreviewContainer.style.display = 'block';
            }

            // Clear previous results
            labelContainer.innerHTML = '';

            // Wait for the image to be fully loaded before predicting
            imagePreview.onload = async () => {
                // Run analysis animation alongside prediction
                const [, predictionResult] = await Promise.all([
                    runAnalysisAnimation(),
                    model.predict(imagePreview)
                ]);

                hideAnalysisOverlay();
                displayResult(predictionResult);
            };
        }
        reader.readAsDataURL(file);
    }
}

// Display the prediction result with animation
function displayResult(prediction) {
    try {
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
        resultDiv.className = "result-message result-reveal";

        // Display the fun description
        const descriptionDiv = document.createElement("div");
        descriptionDiv.className = "result-description result-reveal";
        descriptionDiv.style.animationDelay = "0.2s";

        // Create confidence bar
        const confidenceDiv = document.createElement("div");
        confidenceDiv.className = "confidence-container result-reveal";
        confidenceDiv.style.animationDelay = "0.4s";

        const confidencePercent = Math.round(highestProb * 100);

        const winnerLower = winner ? winner.toLowerCase() : "";

        if (winnerLower.includes("dog") || winnerLower.includes("강아지")) {
            resultDiv.innerHTML = `결과는... 강아지상! 🐶`;
            resultDiv.classList.add("dog-result");
            descriptionDiv.innerHTML = "<h3>멍뭉미 폭발! 당신은 강아지상</h3><p>사람을 좋아하고 애교가 철철 넘치는 당신! 주변에 행복 바이러스를 전파하는 당신은 천상 강아지상! 복슬복슬한 강아지처럼 포근하고 사랑스러운 매력을 가졌네요.</p>";
            confidenceDiv.innerHTML = `
                <div class="confidence-label">강아지상 확률</div>
                <div class="confidence-bar-wrapper">
                    <div class="confidence-bar dog-bar" style="width: 0%"></div>
                </div>
                <div class="confidence-percent">${confidencePercent}%</div>
            `;
        } else if (winnerLower.includes("cat") || winnerLower.includes("고양이")) {
            resultDiv.innerHTML = `결과는... 고양이상! 🐱`;
            resultDiv.classList.add("cat-result");
            descriptionDiv.innerHTML = "<h3>시크한 매력! 당신은 고양이상</h3><p>알 수 없는 눈빛으로 시선을 사로잡는 당신! 츤데레 같지만, 한번 빠지면 헤어나올 수 없는 매력의 소유자군요. 도도하고 우아한 고양이처럼 모두가 당신에게 궁금증을 가질 거예요.</p>";
            confidenceDiv.innerHTML = `
                <div class="confidence-label">고양이상 확률</div>
                <div class="confidence-bar-wrapper">
                    <div class="confidence-bar cat-bar" style="width: 0%"></div>
                </div>
                <div class="confidence-percent">${confidencePercent}%</div>
            `;
        } else {
            resultDiv.innerHTML = `결과: ${winner}`;
            descriptionDiv.innerHTML = "<p>분석이 완료되었습니다!</p>";
            confidenceDiv.innerHTML = `
                <div class="confidence-label">확률</div>
                <div class="confidence-bar-wrapper">
                    <div class="confidence-bar" style="width: 0%"></div>
                </div>
                <div class="confidence-percent">${confidencePercent}%</div>
            `;
        }

        labelContainer.appendChild(resultDiv);
        labelContainer.appendChild(confidenceDiv);
        labelContainer.appendChild(descriptionDiv);

        // Animate confidence bar after a short delay
        setTimeout(() => {
            const bar = confidenceDiv.querySelector('.confidence-bar');
            if (bar) {
                bar.style.width = confidencePercent + '%';
            }
        }, 500);

        // Add "Try Again" button with animation
        const retryButton = document.createElement("button");
        retryButton.textContent = "다시하기";
        retryButton.className = "retry-button result-reveal";
        retryButton.style.animationDelay = "0.6s";
        retryButton.addEventListener('click', resetUI);
        labelContainer.appendChild(retryButton);

    } catch (e) {
        console.error("Error during prediction:", e);
        labelContainer.innerHTML = "<div class='result-message'>얼굴 분석 중 오류가 발생했습니다. 다른 사진으로 시도해 보세요.</div>";
    }
}

function resetUI() {
    imagePreview.style.display = 'none';
    imagePreview.src = '#'; // Clear image source
    labelContainer.innerHTML = '';
    uploadContainer.style.display = 'block';
    if (imagePreviewContainer) {
        imagePreviewContainer.style.display = 'none';
    }
    imageUploadInput.value = ''; // Clear file input
    hideAnalysisOverlay(); // Hide analysis overlay
}
