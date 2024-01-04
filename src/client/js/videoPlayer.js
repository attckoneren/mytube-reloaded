const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

const videoEditBtn = document.querySelector(".videoEditBtn");
const videoDeleteBtn = document.querySelector(".videoDeleteBtn");
const likeContainer = document.getElementById("likeContainer");
const likeBtn = document.getElementById("likeBtn");

const textarea = document.getElementById("textarea");
const editCommentArea = document.querySelector(".editCommentArea");

const loggedInBox = document.querySelector(".loggedInBox");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const playPause = () => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handlePlayClick = () => {
  playPause();
};
const spacePlayPause = (e) => {
  if (
    e.keyCode === 32 &&
    e.target !== textarea &&
    e.target !== editCommentArea
  ) {
    playPause();
  }
};
const handleClickVideo = () => {
  playPause();
};
const handleMuteClick = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
  }
  if (value == 0) {
    muteBtnIcon.className = "fas fa-volume-mute";
  } else {
    muteBtnIcon.className = "fas fa-volume-up";
  }
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 500);
};

const handelEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};
const likeCounting = (likesCount) => {
  const likeCount = document.getElementById("likeCount");
  likeCount.innerText = `${likesCount}`;
  const likeBtn = document.getElementById("likeBtn");
  if (likeBtn.classList.contains("fas")) {
    likeBtn.className = "far fa-thumbs-up likeCommentBtn";
  } else {
    likeBtn.className = "fas fa-thumbs-up likeCommentBtn";
  }
};

const handleLike = async () => {
  try {
    const { id } = videoContainer.dataset;
    const response = await fetch(`/api/videos/${id}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      const { likesCount } = await response.json();
      likeCounting(likesCount);
    } else {
      console.error("Failed to update likes. Server returned an error.");
    }
  } catch (error) {
    console.error("An error occurred during the like operation:", error);
  }
};

const clickEditBtn = () => {
  const a = videoEditBtn.querySelector("a");
  a.click();
};
const clickDeleteBtn = () => {
  const a = videoDeleteBtn.querySelector("a");
  a.click();
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("click", handleClickVideo);
video.addEventListener("ended", handelEnded);
document.addEventListener("keydown", spacePlayPause);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullscreen);
if (loggedInBox) {
  likeContainer.addEventListener("click", handleLike);
}
if (videoEditBtn) {
  videoEditBtn.addEventListener("click", clickEditBtn);
}
if (videoDeleteBtn) {
  videoDeleteBtn.addEventListener("click", clickDeleteBtn);
}
