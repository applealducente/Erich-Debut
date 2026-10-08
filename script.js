const envelope=document.getElementById("envelope"),opening=document.getElementById("opening"),invitation=document.getElementById("invitation"),music=document.getElementById("bgMusic"),musicToggle=document.getElementById("musicToggle");
let opened=false;
function showInvitation(){opening.classList.add("leaving");setTimeout(()=>{opening.hidden=true;opening.style.display="none";invitation.classList.add("visible");invitation.setAttribute("aria-hidden","false");window.scrollTo(0,0)},900)}
envelope.addEventListener("click",()=>{if(opened)return;opened=true;envelope.classList.add("opening");music.volume=.72;const p=music.play();if(p&&typeof p.catch==="function")p.catch(()=>{});setTimeout(showInvitation,650)});
musicToggle.addEventListener("click",()=>{if(music.paused){music.play().then(()=>{musicToggle.innerHTML="♫ <span>MUSIC ON</span>"}).catch(()=>{musicToggle.innerHTML="♫ <span>TAP TO PLAY</span>"})}else{music.pause();musicToggle.innerHTML="♫ <span>MUSIC OFF</span>"}});
music.addEventListener("play",()=>{musicToggle.innerHTML="♫ <span>MUSIC ON</span>"});
music.addEventListener("pause",()=>{musicToggle.innerHTML="♫ <span>MUSIC OFF</span>"});

const modal=document.getElementById("rsvpModal"),openRsvp=document.getElementById("openRsvp"),closeRsvp=document.getElementById("closeRsvp"),form=document.getElementById("rsvpForm"),attendance=document.getElementById("attendance"),plusOneWrap=document.getElementById("plusOneWrap"),plusOne=document.getElementById("plusOne"),confirmation=document.getElementById("rsvpConfirmation");
function openModal(){modal.classList.add("show");modal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open")}
function closeModal(){modal.classList.remove("show");modal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
openRsvp.addEventListener("click",openModal);
closeRsvp.addEventListener("click",closeModal);
modal.querySelector(".modal-backdrop").addEventListener("click",closeModal);
attendance.addEventListener("change",()=>{plusOneWrap.style.display=attendance.value==="yes"?"block":"none";if(attendance.value!=="yes")plusOne.value="no"});
plusOneWrap.style.display="none";
form.addEventListener("submit",e=>{
 e.preventDefault();
 const name=document.getElementById("guestName").value.trim(),att=attendance.value==="yes",roles=findRoles(name);
 const response={guestName:name,attendance:att?"yes":"no",plusOne:att?plusOne.value:"no",message:document.getElementById("message").value.trim(),roles,submittedAt:new Date().toISOString()};
 const all=JSON.parse(localStorage.getItem("erich_rsvps")||"[]");
 all.push(response);
 localStorage.setItem("erich_rsvps",JSON.stringify(all));
 confirmation.hidden=false;
 confirmation.innerHTML=att?
   '<div class="role-result-title">YOUR RSVP IS SEALED ✦</div><p>See you in the garden, <strong>'+name+'</strong>.</p>'+
   (roles.length?roles.map(r=>'<div class="role-badge"><strong>'+r.category+'</strong><span>#'+r.number+'</span></div>').join(""):"")+
   '<p>We cannot wait to celebrate Erich’s eighteenth with you.</p>':
   '<div class="role-result-title">WITH LOVE ✦</div><p>Thank you, <strong>'+name+'</strong>, for letting us know.</p>';
 form.querySelectorAll("input,select,textarea,button[type=submit]").forEach(el=>el.disabled=true);
});