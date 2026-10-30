(function(){
var Q=window.QZ,el=document.getElementById('check');if(!Q||!el)return;
var qs=Q.questions.filter(function(q){return q.optionen&&q.optionen.length});
var A={},i=-1,t0=Date.now();
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function live(b){return b.charAt(0)!='/'||!Q.pages||Q.pages.indexOf(b.split('#')[0].split('?')[0])>-1}
function md(s){return esc(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g,function(m,a,b){return live(b)?'<a href="'+(b.charAt(0)=='/'?Q.base+b:b)+'">'+a+'</a>':a})}
function multi(q){return /mehrere/.test(q.auswahl)}
function seg(){if(A.q1==='Ich wohne zur Miete')return 'A';var v=A.q4;
 if(v==='Selbst machen und günstig')return 'B';if(v==='Rundum-Service mit Leitstelle')return 'D';return 'C'}
function intro(){var sb=document.querySelector('[data-quiz-start]');
 if(sb){sb.onclick=function(){i=0;step(true);var b=el.querySelector('.opt');if(b)b.focus()};i=0;step(false);return}
 i=0;step(false)}
function step(sc){if(sc===undefined)sc=true;var q=qs[i],sel=A[q.id]||(multi(q)?[]:null);
 var h='<div class="qbar"><i style="width:'+Math.round(i/qs.length*100)+'%"></i></div><div class="qstep"><span class="small">Frage '+(i+1)+' von '+qs.length+'</span><p class="qq">'+esc(q.frage)+'</p>';
 q.optionen.forEach(function(o,k){var on=multi(q)?sel.indexOf(o)>-1:sel===o;h+='<button class="opt" data-k="'+k+'" aria-pressed="'+on+'">'+esc(o)+'</button>'});
 h+='</div><div class="qnav"><button class="lnk" id="bk">'+(i?'Zurück':'')+'</button>';
 if(multi(q)||q.pflicht==='nein')h+='<button class="btn" id="nx"'+(multi(q)&&!sel.length?' disabled':'')+'>'+(q.pflicht==='nein'&&!sel?'Überspringen':'Weiter')+'</button>';
 el.innerHTML=h+'</div>';
 [].forEach.call(el.querySelectorAll('.opt'),function(b){b.onclick=function(){var o=q.optionen[b.dataset.k];
  if(multi(q)){var s=(A[q.id]||[]).slice(),x=s.indexOf(o),excl=q.optionen[0];
   if(x>-1)s.splice(x,1);else{if(o===excl)s=[];else s=s.filter(function(v){return v!==excl});s.push(o)}A[q.id]=s;step()}
  else{A[q.id]=o;next()}}});
 var bk=document.getElementById('bk');bk.onclick=function(){if(i>0){i--;step()}};
 var nx=document.getElementById('nx');if(nx)nx.onclick=next;
 if(sc)el.scrollIntoView({block:'start',behavior:'smooth'})}
function next(){i++;if(i<qs.length)step();else result()}
function hints(){var s=A.q3||[],h=[];var rules=Q.results; // hint lines are fixed by copy rules
 if(s.indexOf('Eine alte Alarmanlage')>-1)h.push('Deine Anlage ist älter? Schau, wie sie meldet: [2G-Abschaltung](/2g-abschaltung-alarmanlage/)');
 if(s.indexOf('Geprüfte Tür oder geprüftes Fenster')>-1)h.push('Mehr zur Kennzeichnung: [RC 2 bei Tür und Fenster](/einbruchschutz-tuer-fenster-rc2/)');
 if(s.indexOf('Noch nichts')>-1)h.push('Die Polizei rät: erst Mechanik, dann Technik. Mehr dazu: [RC 2 bei Tür und Fenster](/einbruchschutz-tuer-fenster-rc2/)');
 return h}
function result(){var S=seg(),r=Q.results[S],E=Q.email;send({stage:'result'});
 var h='<div class="res"><span class="tag">Dein Ergebnis</span><h3>'+esc(r.titel)+'</h3><p>'+esc(r.text)+'</p>'+(r.link&&live(r.link)?'<p><a class="btn" href="'+Q.base+r.link+'">Zu deinem Weg</a></p>':'');
 hints().forEach(function(x){h+='<p class="small">'+md(x)+'</p>'});
 h+='</div><form class="mail" id="mf" novalidate><p>'+esc(E.text)+'</p><label for="em"><strong>'+esc(E.feld_email)+'</strong></label><input id="em" type="email" autocomplete="email" inputmode="email" required>'+
 '<label class="chk"><input type="checkbox" id="c1"><span>'+md(E.einwilligung_vertiefung.label||E.einwilligung_vertiefung.text)+'</span></label>'+(E.einwilligung_vertiefung.detail?'<p class="small">'+md(E.einwilligung_vertiefung.detail)+'</p>':'')+
 (E.einwilligung_weitergabe?'<label class="chk"><input type="checkbox" id="c2"><span>'+md(E.einwilligung_weitergabe.text)+'</span></label>'+
 '<div id="plzw" hidden><label for="plz">Postleitzahl (freiwillig)</label><input id="plz" type="text" inputmode="numeric" maxlength="5" pattern="[0-9]{5}" autocomplete="postal-code"></div>':'')+
 '<input class="hp" id="hp" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0"><p class="err" id="er"></p><button class="btn" type="submit">Vertiefung anfordern</button>'+
 ' <button class="lnk" type="button" id="rs">Check neu starten</button></form>';
 el.innerHTML=h;el.scrollIntoView({block:'start'});
 var c2=document.getElementById('c2')||{checked:false};if(c2.id)c2.onchange=function(){document.getElementById('plzw').hidden=!c2.checked};
 document.getElementById('rs').onclick=function(){A={};i=0;step()};
 document.getElementById('mf').onsubmit=function(e){e.preventDefault();var em=document.getElementById('em').value.trim(),er=document.getElementById('er'),plzEl=document.getElementById('plz'),plz=plzEl?plzEl.value.trim():'';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){er.textContent='Bitte prüfe deine E-Mail-Adresse.';return}
  if(!document.getElementById('c1').checked){er.textContent='Für die Vertiefung per Mail brauchen wir dein Häkchen bei der ersten Einwilligung.';return}
  if(plz&&!/^\d{5}$/.test(plz)){er.textContent='Die Postleitzahl hat fünf Ziffern.';return}
  er.textContent='';var b=this.querySelector('button[type=submit]');b.disabled=true;b.textContent='Wird gesendet …';
  send({stage:'lead',email:em,consent_mail:true,consent_forward:c2.checked,plz:c2.checked?plz:'',consent_text_mail:E.einwilligung_vertiefung.text,consent_text_forward:c2.checked&&E.einwilligung_weitergabe?E.einwilligung_weitergabe.text:'',hp:document.getElementById('hp').value},function(ok){
   if(ok)el.innerHTML='<div class="res"><span class="tag">Fast geschafft</span><p>'+esc(Q.danke)+'</p></div>';
   else{b.disabled=false;b.textContent='Vertiefung anfordern';er.textContent='Das hat leider nicht geklappt. Bitte versuch es gleich noch einmal.'}})}}
function send(extra,cb){var d={segment:seg(),answers:A,page:location.pathname,src:new URLSearchParams(location.search).get('src')||'',secs:Math.round((Date.now()-t0)/1000)};
 for(var k in extra)d[k]=extra[k];
 try{fetch(Q.hook,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(d),keepalive:true}).then(function(r){cb&&cb(r.ok)}).catch(function(){cb&&cb(false)})}catch(e){cb&&cb(false)}}
intro()})();
