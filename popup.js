const audioPlayer = document.getElementById("audioPlayer");
const statusText = document.getElementById("statusText");
const stopBtn = document.getElementById("stopBtn");

document.querySelectorAll(".station-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const streamUrl = button.dataset.url;
    audioPlayer.src = streamUrl;
    audioPlayer.play();
    statusText.textContent = "Playing: " + button.textContent.trim();
  });
});

stopBtn.addEventListener("click", () => {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  statusText.textContent = "Stopped";
});
