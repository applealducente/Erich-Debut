const ERICH_18={
roses:["John Frics Isaac","Rom David Bleza","David Joenr Traqueña","Randolf Antonio","Frank Mhil Armada","Dan Allen Tolentino","Idhel Catabas","Crist Tilo","Aaron Sales","Justine Rhayne Nebrida","John Rod Ordonio","Joey Baldo","Alvin Sto. Domingo","John Amiel Mancilla","Fernando Alducente","Wilmer Mancilla","John Raven Cruz","Enrique Joan Mancilla/Elmo Janzhel Mancilla"],
candles:["Precious Hillary Siochi","Velinda Guadalupe","Lorraine Villaflores","Daniella Shane Molina","Leighna Mariano","Nikka Rein Bernil","Timmy Liz Ching","Sittie Ainah Sultan","Mary Ann Restua","Jelian Ventura","Hashlee Marie Boniao","Jeamy Shane Nebrida","Paola Mancilla","Jubilee Ann Mancilla","Ritshelle Sem Dela Cruz","Aislinn Laxamana","Hope Sagana","Hazel Mancilla"],
treasures:["Kate Paraiso","Jane Diane","Elaine Blanco","Maricar Rarama","Jaycel Dacanay","Mean Ricohermozo","Josephine Moya","Yanyan Vibar","Evelyn Ching Ignacio","Ally Torres","Vangie Grimaldo","Jing Morte","Mhane Rivero","Naneth Miranda","Apple Ulysses Alducente","Elma Mancilla","Diorella Cruz","Harlet Caigas"],
blueBills:["Choi Paraiso","Christopher Diane","Mario Vibar","Jhonny Tumbocon","Marcus Llenado","Crismar Canlas","John Pellazar","Botchok Grimaldo","Ogie Banigued","Rene Ching","Eric Blanco","Michael Nito","Louie Morte","Manny Miranda","Dan Malumbay","Obet Panilong","Rommel Cruz","Michael Moya"],
cotillion:[["John Raven Cruz","Erich Jacelle Mancilla"],["John Frics Isaac","Precious Hillary Siochi"],["Rom David Bleza","Velinda Guadalupe"],["Randolf Antonio","Timmy Liz Ching"],["Dan Allen Tolentino","Nikka Rein Bernil"],["Idhel Catabas","Leighna Mariano"]]
};
const ROLE_LABELS={roses:"18 Roses",candles:"18 Candles",treasures:"18 Treasures",blueBills:"18 Blue Bills"};
function normalizeName(v){return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}
function findRoles(name){
 const target=normalizeName(name),matches=[];
 for(const[key,label]of Object.entries(ROLE_LABELS)){const i=ERICH_18[key].findIndex(n=>normalizeName(n)===target);if(i!==-1)matches.push({category:label,number:i+1,name:ERICH_18[key][i]})}
 ERICH_18.cotillion.forEach((pair,index)=>{if(pair.some(n=>normalizeName(n)===target))matches.push({category:"Cotillion Dancer",number:index+1,name:pair.find(n=>normalizeName(n)===target)})});
 return matches;
}
