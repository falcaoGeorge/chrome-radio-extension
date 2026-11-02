const audioPlayer = document.getElementById("audioPlayer");
const statusText = document.getElementById("statusText");
const stopBtn = document.getElementById("stopBtn");

const setStation = (button) => {
  const streamUrl = button.dataset.url;
  audioPlayer.src = streamUrl;
  audioPlayer.play();
  statusText.textContent = "Playing: " + button.textContent.trim();
};

document.querySelectorAll(".station-btn").forEach((button) => {
  button.addEventListener("click", () => setStation(button));
});

stopBtn.addEventListener("click", () => {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  statusText.textContent = "Stopped";
});

audioPlayer.addEventListener("error", () => {
  statusText.textContent = "Stream failed. Try another station.";
});
