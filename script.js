let imageFrame = document.getElementById('image-frame');
let fileInput = document.getElementById('file-input');
let playButton = document.getElementById('play-btn');
let stopButton = document.getElementById('stop-btn');
let nextFrameButton = document.getElementById('next-frame-btn');
let prevFrameButton = document.getElementById('prev-frame-btn');
let goToBeginningButton = document.getElementById('go-to-beginning-btn');
let goToEndButton = document.getElementById('go-to-end-btn');
let loopCheckbox = document.getElementById('loop-checkbox');
let animationSelect = document.getElementById('animation-select');

// Image description elements
let frameWidthElement = document.getElementById('frame-width');
let frameHeightElement = document.getElementById('frame-height');
let alphaStateElement = document.getElementById('alpha-state');

let image = new Image();
let animationData = null;
let currentFrame = 0;
let intervalId = null;
let isPlaying = false;
let selectedAnimation = null;

fileInput.addEventListener('change', async function() {
    let files = fileInput.files;
    let imageFile = null;
    let jsonFile = null;

    for (let file of files) {
        if (file.name.endsWith('.json')) {
            jsonFile = file;
        } else if (file.type.startsWith('image/')) {
            imageFile = file;
        }
    }

    if (imageFile && jsonFile) {
        image.src = URL.createObjectURL(imageFile);
        let reader = new FileReader();
        reader.onload = function(e) {
            animationData = JSON.parse(e.target.result);
            populateAnimationList();
            updateImageDescription(animationData.Description); // Update the image description section
            updateFrame(currentFrame);
        };
        reader.readAsText(jsonFile);
    } else {
        alert('Please select both an image file and its corresponding JSON file.');
    }
});

playButton.addEventListener('click', function() {
    if (animationData && selectedAnimation) {
        if (isPlaying) {
            clearInterval(intervalId);
        }
        currentFrame = selectedAnimation.Start; // Restart animation from the start frame
        updateFrame(currentFrame);
        startAnimation();
    }
});

stopButton.addEventListener('click', function() {
    if (isPlaying) {
        isPlaying = false;
        clearInterval(intervalId);
    }
});

nextFrameButton.addEventListener('click', function() {
    if (animationData && selectedAnimation) nextFrame();
});

prevFrameButton.addEventListener('click', function() {
    if (animationData && selectedAnimation) prevFrame();
});

goToBeginningButton.addEventListener('click', function() {
    if (animationData && selectedAnimation) {
        currentFrame = selectedAnimation.Start;
        updateFrame(currentFrame);
    }
});

goToEndButton.addEventListener('click', function() {
    if (animationData && selectedAnimation) {
        currentFrame = selectedAnimation.End;
        updateFrame(currentFrame);
    }
});

animationSelect.addEventListener('change', function() {
    if (isPlaying) {
        clearInterval(intervalId);
        isPlaying = false;
    }
    selectedAnimation = animationData.Animations.find(anim => anim.Name === animationSelect.value);
    currentFrame = selectedAnimation.Start;
    updateFrame(currentFrame);
    if (isPlaying) {
        startAnimation();
    }
});

function startAnimation() {
    isPlaying = true;
    intervalId = setInterval(nextFrame, selectedAnimation.FrameTime * 1000);
}

function nextFrame() {
    if (selectedAnimation.Start < selectedAnimation.End) {
        if (currentFrame < selectedAnimation.End) {
            currentFrame++;
        } else if (loopCheckbox.checked) {
            currentFrame = selectedAnimation.Start;
        } else {
            stopButton.click();
        }
    } else {
        if (currentFrame > selectedAnimation.End) {
            currentFrame--;
        } else if (loopCheckbox.checked) {
            currentFrame = selectedAnimation.Start;
        } else {
            stopButton.click();
        }
    }
    updateFrame(currentFrame);
}

function prevFrame() {
    if (selectedAnimation.Start < selectedAnimation.End) {
        if (currentFrame > selectedAnimation.Start) {
            currentFrame--;
        } else if (loopCheckbox.checked) {
            currentFrame = selectedAnimation.End;
        }
    } else {
        if (currentFrame < selectedAnimation.Start) {
            currentFrame++;
        } else if (loopCheckbox.checked) {
            currentFrame = selectedAnimation.End;
        }
    }
    updateFrame(currentFrame);
}

function updateFrame(frame) {
    let frameWidth = animationData.Description.FrameWidth;
    let frameHeight = animationData.Description.FrameHeight;
    let x = -(frame % (image.width / frameWidth)) * frameWidth;
    let y = -Math.floor(frame / (image.width / frameWidth)) * frameHeight;

    imageFrame.style.backgroundImage = `url(${image.src})`;
    imageFrame.style.backgroundPosition = `${x}px ${y}px`;
    imageFrame.style.width = `${frameWidth}px`;
    imageFrame.style.height = `${frameHeight}px`;
}

function updateImageDescription(description) {
    frameWidthElement.textContent = description.FrameWidth;
    frameHeightElement.textContent = description.FrameHeight;
    alphaStateElement.textContent = description.Alpha ? "True" : "False";
}

function populateAnimationList() {
    animationSelect.innerHTML = ''; // Clear existing options
    animationData.Animations.forEach(animation => {
        let option = document.createElement('option');
        option.value = animation.Name;
        option.text = animation.Name;
        animationSelect.appendChild(option);
    });

    // Select the first animation by default
    if (animationData.Animations.length > 0) {
        animationSelect.value = animationData.Animations[0].Name;
        selectedAnimation = animationData.Animations[0];
    }
}
