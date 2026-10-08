const envelope=document.getElementById("envelope");
const opening=document.getElementById("opening");
const invitation=document.getElementById("invitation");
const music=document.getElementById("bgMusic");
const musicToggle=document.getElementById("musicToggle");
let opened=false;

function showInvitation(){
  opening.classList.add("leaving");
  setTimeout(()=>{
    opening.hidden=true;
    opening.style.display="none";
    invitation.classList.add("visible");
    invitation.setAttribute("aria-hidden","false");
    document.body.classList.add("garden-open");
    window.scrollTo(0,0);
  },900);
}

envelope.addEventListener("click",()=>{
  if(opened)return;
  opened=true;
  envelope.classList.add("opening");
  music.volume=.72;
  const playAttempt=music.play();
  if(playAttempt&&typeof playAttempt.catch==="function"){
    playAttempt.catch(()=>{});
  }
  setTimeout(showInvitation,650);
});

musicToggle.addEventListener("click",()=>{
  if(music.paused){
    music.play().then(()=>{
      musicToggle.innerHTML="♫ <span>MUSIC ON</span>";
    }).catch(()=>{
      musicToggle.innerHTML="♫ <span>TAP TO PLAY</span>";
    });
  }else{
    music.pause();
    musicToggle.innerHTML="♫ <span>MUSIC OFF</span>";
  }
});

music.addEventListener("play",()=>{musicToggle.innerHTML="♫ <span>MUSIC ON</span>"});
music.addEventListener("pause",()=>{musicToggle.innerHTML="♫ <span>MUSIC OFF</span>"});
