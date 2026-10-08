function fillNames(id, names){
  const el = document.getElementById(id);
  names.forEach((name,i)=>{
    const item=document.createElement("article");
    item.className="name-item";
    item.innerHTML=`<span>${String(i+1).padStart(2,"0")}</span><strong>${escapeHtml(name)}</strong>`;
    el.appendChild(item);
  });
}
function fillPairs(id,pairs){
  const el=document.getElementById(id);
  pairs.forEach((pair,i)=>{
    const item=document.createElement("article");
    item.className="pair-item";
    item.innerHTML=`<span>PAIR ${String(i+1).padStart(2,"0")}</span><strong>${escapeHtml(pair[0])} &amp; ${escapeHtml(pair[1])}</strong>`;
    el.appendChild(item);
  });
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));}

fillNames("roses-list",PROGRAM.roses);
fillNames("candles-list",PROGRAM.candles);
fillNames("treasures-list",PROGRAM.treasures);
fillNames("bills-list",PROGRAM.bills);
fillPairs("cotillion-list",PROGRAM.cotillion);

const form=document.getElementById("rsvpForm");
const confirmation=document.getElementById("confirmation");
form.addEventListener("submit",e=>{
  e.preventDefault();
  const data=Object.fromEntries(new FormData(form).entries());
  if(data.plusOne==="No") data.plusOneName="";
  data.submittedAt=new Date().toISOString();
  const current=JSON.parse(localStorage.getItem("erichEnchantsRSVP")||"[]");
  current.push(data);
  localStorage.setItem("erichEnchantsRSVP",JSON.stringify(current));
  form.hidden=true;
  confirmation.hidden=false;
});
