const ERICH_18={
roses:["John Frics Isaac","Rom David Bleza","David Joenr Traqueña","Randolf Antonio","Frank Mhil Armada","Dan Allen Tolentino","Idhel Catabas","Crist Tilo","Aaron Sales","Justine Rhayne Nebrida","John Rod Ordonio","Joey Baldo","Alvin Sto. Domingo","John Amiel Mancilla","Fernando Alducente","Wilmer Mancilla","John Raven Cruz","Elmo Janzhel Mancilla"],
treasures:["Kate Paraiso","Jane Borromeo","Elaine Pascual","Maricar Rarama","Jaycel Dacanay","Christine Juco","Josephine Moya","Yanyan Vibar","Evelyn Ching Ignacio","Ally Torres","Vangie Grimaldo","Jennelyn Morte","Mhane Rivero","Naneth Miranda","Apple Ulysses Alducente","Elma Mancilla","Diorella Cruz","Harlet Caigas"],
blueBills:["Choi Paraiso","Christopher Diana","Mario Vibar","Jhonny Tumbocon","Marcus Llenado","Crismar Canlas","Patrick John Razon","Botchok Grimaldo","Ogie Banigued","Rene Ching","Eric Blanco","Michael Nito","Louie Morte","Manny Miranda","Alfie Alcantara","Obet Panilong","Rommel Cruz","Michael Moya"],
candles:["Precious Hillary Siochi","Velinda Guadalupe","Lorraine Villaflores","Daniella Shane Molina","Leighna Mariano","Nikka Rein Bernil","Timmy Liz Ching","Sittie Ainah Sultan","Mary Ann Restua","Jelian Ventura","Hashlee Marie Boniao","Babylynne Gomez","Paola Mancilla","Jeamy Shane Nebrida","Jubilee Ann Mancilla","Aislinn Laxamana","Hope Sagana","Ritshelle Sem Dela Cruz"],
cotillion:[["John Raven Cruz","Erich Jacelle Mancilla"],["John Frics Isaac","Precious Hillary Siochi"],["Rom David Bleza","Velinda Guadalupe"],["Randolf Antonio","Timmy Liz Ching"],["Dan Allen Tolentino","Nikka Rein Bernil"],["Idhel Catabas","Leighna Mariano"]]
};
// Names marked "(online)" on the sheet. Filled in by applyRoles().
let ONLINE_NAMES=["Aislinn Laxamana","Hope Sagana","Ritshelle Sem Dela Cruz"];
// Replace the built-in lists with the ones read from the sheet's 18's tab
function applyRoles(r){
 if(!r)return;
 ["roses","treasures","blueBills","candles"].forEach(k=>{if(Array.isArray(r[k])&&r[k].length)ERICH_18[k]=r[k]});
 if(Array.isArray(r.cotillion)&&r.cotillion.length)ERICH_18.cotillion=r.cotillion;
 if(Array.isArray(r.online))ONLINE_NAMES=r.online;
}
const ROLE_LABELS={roses:"18 Roses",candles:"18 Candles",treasures:"18 Treasures",blueBills:"18 Blue Bills"};
const NAME_ALIASES={"marcos llenado":"marcus llenado"};
function normalizeName(v){const n=v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();return NAME_ALIASES[n]||n}
function findRoles(name){
 const target=normalizeName(name),matches=[];
 for(const[key,label]of Object.entries(ROLE_LABELS)){const i=ERICH_18[key].findIndex(n=>normalizeName(n)===target);if(i!==-1)matches.push({category:label,number:i+1,name:ERICH_18[key][i]})}
 ERICH_18.cotillion.forEach((pair,index)=>{if(pair.some(n=>normalizeName(n)===target))matches.push({category:"Cotillion Dancer",number:index+1,name:pair.find(n=>normalizeName(n)===target)})});
 return matches;
}
