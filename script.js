const envelope = document.getElementById("envelope");
const opening = document.getElementById("opening");
const invitation = document.getElementById("invitation");
const music = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

let opened = false;

envelope.addEventListener("click", async () => {
  if (opened) return;
  opened = true;

  envelope.classList.add("opening");

  // The click is the user gesture that allows the browser to start audio.
  try {
    music.volume = 0.72;
    await music.play();
  } catch (error) {
    console.log("Audio will require another tap:", error);
  }

  setTimeout(() => {
    opening.style.transition = "opacity 1.3s ease, transform 1.3s ease";
    opening.style.opacity = "0";
    opening.style.transform = "scale(1.04)";

    setTimeout(() => {
      opening.style.display = "none";
      invitation.classList.add("visible");
      invitation.setAttribute("aria-hidden", "false");
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 1100);
  }, 850);
});

musicToggle.addEventListener("click", () => {
  if (music.paused) {
    music.play();
    musicToggle.innerHTML = "♫ <span>MUSIC ON</span>";
  } else {
    music.pause();
    musicToggle.innerHTML = "♫ <span>MUSIC OFF</span>";
  }
});
