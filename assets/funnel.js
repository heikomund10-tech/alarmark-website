/* Alarmark funnel engine v3 (alarm check + cost check). Logic: CD quiz logic v3 (RUN-CL-DE-ALARM-MVP-QUIZ-LOGIC-3), approved by Heiko 30.10.2026.
   Result = modules: Lösungsweg (S/P x E/L) + equipment (AR rules) + cost row (Lösungsweg x scope U1-U3) + check points + hints + region.
   Markup follows the design system's quiz contract: #check.quiz, .qbar>i, .qstep, .qq, button.opt, .qnav, .res, .tag, form.mail, label.chk, .err, .small, .btn, .lnk */
(function(){
var F=window.FN,el=document.getElementById('check');if(!F||!el)return;
var M=F.mode,A={},hist=[],t0=Date.now(),url=new URLSearchParams(location.search);
var WEG=(url.get('weg')||'').toUpperCase(),U=url.get('u')||'',WF=url.get('wf')||'';if(!/^(SE|SL|PE|PL)$/.test(WEG))WEG='';if(!/^[123]$/.test(U)||!/^[hw]$/.test(WF)||!WEG){U='';WF=''}
if(M!=='kosten'){WEG='';U='';WF=''}var WEG0=WEG,U0=U,WF0=WF,REG=null,PLZ_ON=M==='alarm'&&!!F.plzdata&&!!F.plz,plzDone=false;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function has(){for(var i=0;i<arguments.length;i++)for(var k in A)if(A[k]===arguments[i])return true;return false}
function lab(qid){if(qid==='a2')return lab('a2h')||lab('a2w');var q=F.questions.filter(function(x){return x.id===qid})[0];if(!q||!A[qid])return '';var o=q.optionen.filter(function(x){return x.id===A[qid]})[0];return o?o.label:''}
function vis(q){var c=q.nur_wenn;return !c||c['in'].indexOf(A[c.q])>-1}
/* cost check: with ?weg only the scope questions a1-a3 are asked; with ?weg&u none */
function list(){return F.questions.filter(function(q){if(!vis(q))return false;if(M==='kosten'&&WEG)return !U&&/^a[123]/.test(q.id);return true})}
function tot(qs){var a2=!A.a1&&qs.some(function(q){return q.id==='a1'})?1:0;return qs.length+a2+(PLZ_ON?1:0)}
function score(reg){var s={S:0,P:0,E:0,L:0};list().forEach(function(q){q.optionen.forEach(function(o){if(A[q.id]===o.id)for(var k in o.punkte)s[k]=(s[k]||0)+o.punkte[k]})});if(reg&&REG&&REG.elev)s.P+=2;return s}
function decide(){if(WEG)return {m:WEG[0],a:WEG[1],tie:false,region:false};
 var s=score(true),s0=score(false),I=s.S-s.P,I0=s0.S-s0.P,D=s.L-s.E,m=I>=1?'S':I<=-1?'P':(F.tie.S.indexOf(A[F.tie.q])>-1?'S':'P');
 return {m:m,a:D>=1?'L':'E',tie:D===0,region:!!(REG&&REG.elev&&I0>=1&&I<=0)}}
function wf(){return WF||(has('a1c','a1d')?'w':'h')}
function scope(){if(U)return +U;var w=A.a2w,h=A.a2h,o=A.a3;
 if(w==='a2w2'||w==='a2w3')return 1;if(w==='a2w1')return o==='a3d'?3:2;if(h==='a2h1')return o==='a3d'?3:2;if(h==='a2h2')return (o==='a3a'||o==='a3b')?2:3;if(h==='a2h3')return 3;return 2}
function fill(t){return t.replace(/\{(\w+)\}/g,function(_,k){return lab(k)})}
function ar(id){return F.ar.filter(function(x){return x.id===id})[0].text}
function equip(d){var r=[],w=A.a2w,h=A.a2h;
 if(w==='a2w2'||w==='a2w3'){r.push(ar('AR-1'));if(has('a3b','a3c','a3d'))r.push(ar('AR-2'))}
 else if(w==='a2w1')r.push(ar('AR-3'));else if(h==='a2h1'||h==='a2h2')r.push(ar('AR-4'));else if(h==='a2h3'){r.push(ar('AR-4'));r.push(ar('AR-5'))}
 r.push(d.m==='S'?ar('AR-6').replace(/\.$/,'')+(has('a1b','a1d')?', ohne Bohren.':'.'):has('a1b','a1d')?ar('AR-7'):ar('AR-8'));
 if(d.a==='L')r.push(ar('AR-9'));if(A.a6==='a6b')r.push(ar('AR-10'));if(A.a6==='a6c')r.push(ar('AR-11'));if(A.a6==='a6a')r.push(ar('AR-12'));
 return r.map(fill)}
function step(scroll){var qs=list(),i=hist.length;if(i>=qs.length){if(PLZ_ON&&!plzDone)return plzStep(qs.length);return result()}var q=qs[i];
 var h='<div class="qbar"><i style="width:'+Math.round(i/tot(qs)*100)+'%"></i></div><div class="qstep"><span class="small">Frage '+(i+1)+' von '+tot(qs)+'</span><p class="qq">'+esc(q.frage)+'</p>';
 q.optionen.forEach(function(o){h+='<button class="opt" data-o="'+o.id+'" aria-pressed="'+(A[q.id]===o.id)+'">'+esc(o.label)+'</button>'});
 h+='</div><div class="qnav">'+(i?'<button class="lnk" id="bk" type="button">Zurück</button>':'')+'</div>';
 if(M==='kosten'&&WEG&&i===0)h=kopf()+h;
 el.innerHTML=h;
 [].forEach.call(el.querySelectorAll('.opt'),function(b){b.onclick=function(){A[q.id]=b.dataset.o;hist.push(q.id);step(true)}});
 var bk=document.getElementById('bk');if(bk)bk.onclick=function(){var id=hist.pop();delete A[id];step(true)};
 bindChg();if(scroll)el.scrollIntoView({block:'start',behavior:'smooth'})}
function kopf(){return '<p class="small">'+esc(F.kosten.kopf)+': <strong>'+esc(F.weg_titel[WEG])+'</strong> · <button class="lnk" id="chg" type="button">'+esc(F.kosten.aendern)+'</button></p>'}
function bindChg(){var ch=document.getElementById('chg');if(ch)ch.onclick=function(){WEG='';U='';WF='';hist=[];A={};step(true)}}
function plzStep(n){var P=F.plz,N=n+1;
 el.innerHTML='<div class="qbar"><i style="width:'+Math.round(n/N*100)+'%"></i></div><div class="qstep"><span class="small">Frage '+N+' von '+N+'</span><p class="qq">'+esc(P.ueberschrift)+'</p><label for="plz">'+esc(P.eingabe_label)+'</label><input id="plz" type="text" inputmode="numeric" maxlength="5" autocomplete="postal-code"><p class="small">'+esc(P.eingabe_hinweis)+'</p><p><button class="btn" type="button" id="plzb">Ergebnis anzeigen</button></p><div id="plzr" aria-live="polite"></div></div><div class="qnav"><button class="lnk" id="bk" type="button">Zurück</button></div>';
 var inp=document.getElementById('plz'),b=document.getElementById('plzb'),o=document.getElementById('plzr');
 inp.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();b.click()}};
 document.getElementById('bk').onclick=function(){var id=hist.pop();delete A[id];step(true)};
 b.onclick=function(){var v=inp.value.trim();if(!v){REG=null;plzDone=true;return step(true)}
  if(typeof F.plzdata==='string'){b.disabled=true;fetch(F.plzdata).then(function(r){return r.json()}).then(function(d){F.plzdata=d;b.disabled=false;b.click()}).catch(function(){b.disabled=false;o.innerHTML='<p>Die Regionaldaten konnten gerade nicht geladen werden. Bitte versuch es gleich noch einmal.</p>'});return}
  var D=F.plzdata,ks=/^\d{5}$/.test(v)&&D.plz[v];if(!ks){o.innerHTML='<p>'+esc(P.unbekannt)+'</p>';return}
  REG={ks:ks,elev:D.kreis[ks[0]].hz>D.bund*1.15};plzDone=true;step(true)};
 el.scrollIntoView({block:'start',behavior:'smooth'})}
function regBox(){if(!REG)return '';var P=F.plz,D=F.plzdata,ks=REG.ks,fmt=function(n){return (Math.round(n*10)/10).toFixed(1).replace('.',',')};
 var k=D.kreis[ks[0]],r=k.hz/D.bund,t=(r<0.85?P.unter:r>1.15?P.ueber:P.um).replace('{kreis}',k.n).replace('{hz_kreis}',fmt(k.hz)).replace('{hz_bund}',fmt(D.bund));
 if(ks.length>1)t=P.zwei_kreise.replace('{kreis_1}',k.n)+' '+t;
 return '<div class="plz"><p><strong>'+esc(P.ueberschrift)+'</strong></p><p>'+esc(t)+'</p><p class="small">'+esc(P.grenze)+'</p><p class="small">'+esc(P.quellenzeile.replace('{pks_version}',D.version||''))+'</p></div>'}
function hints(d){var h=[];if(has('a1b','a1d'))h.push(F.hints.miete);if(d.tie)h.push(F.hints.ls);return h.slice(0,REG?2:3)}
function costRow(id,u){var r=(F.kosten.rows[id]||{})['U'+u];if(!r)return null;var w=wf();return {an:r.an[w],fj:r.fj[w],q:r.q}}
function ul(a){return a.length?'<ul>'+a.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>':''}
function result(){var d=decide(),id=d.m+d.a,u=scope();send({stage:'result',quiz:M,result:id,u:u});
 var h=M==='alarm'?alarmRes(d,id,u):kostenRes(d,id,u);
 if(F.mail_on)h+=mailBox();
 h+='<p><button class="lnk" type="button" id="rs">Neu starten</button></p>';
 el.innerHTML=h;el.scrollIntoView({block:'start'});bindChg();
 document.getElementById('rs').onclick=function(){A={};hist=[];REG=null;plzDone=false;WEG=WEG0;U=U0;WF=WF0;if(M==='kosten'&&WEG&&U)result();else step(true)};
 if(F.mail_on)bindMail(id)}
function alarmRes(d,id,u){var r=F.results[id];
 var t=(d.m==='S'&&A.a4==='a4c')||(d.m==='P'&&has('a4a','a4b'))?r.trotz:r.standard;if(d.region)t+=' '+r.region;
 var h='<div class="res"><span class="tag">Dein Ergebnis</span><h3>'+esc(r.titel)+'</h3><p>'+esc(fill(t))+'</p>';
 h+='<p><strong>Deine Ausstattung</strong> <span class="small">('+esc(lab('a2'))+' · '+esc(lab('a3'))+')</span></p>'+ul(equip(d));
 var c=costRow(id,u);if(c)h+='<p><strong>Deine Kosten</strong></p><ul><li>Anschaffung: '+esc(c.an)+'</li><li>Über fünf Jahre: '+esc(c.fj)+'</li></ul>';
 h+='<p><strong>Gut zu wissen:</strong> '+esc(r.erkenntnis)+'</p>';
 var pp=[r.pp,F.pp_u[u],F.pp_b[A.a6]].filter(Boolean).slice(0,3);h+='<p><strong>Deine Prüfpunkte</strong></p>'+ul(pp);
 var hs=hints(d);if(hs.length)h+='<p><strong>Hinweise</strong></p>'+ul(hs);
 h+=regBox();
 h+='<p class="small">Quelle: '+esc(r.quelle)+'</p>';
 h+='<details class="small"><summary>So kommen wir darauf</summary><p>'+esc(F.transparenz.replace(/^So kommen wir darauf:\s*/,''))+'</p></details>';
 h+='<p><a class="btn" href="'+F.base+'/alarmanlage-haus-kosten/?weg='+id+'&u='+u+'&wf='+wf()+'">'+esc(F.next_button)+'</a></p></div>';
 return h}
function kostenRes(d,id,u){var K=F.kosten,r=K.results[id],rw=K.rows[id]||{},alt=id[0]+(id[1]==='E'?'L':'E'),c=costRow(id,u),ca=costRow(alt,u);
 var b=(A.a4&&A.a5?fill('Du hast gesagt: „{a4}“ und „{a5}“. '):'')+K.begr[id].replace('{Umfangstext}',K.umfangstext['U'+u]);
 var h=(WEG?kopf():'')+'<div class="res"><span class="tag">Dein Ergebnis</span><h3>'+esc(r.titel)+'</h3><p>'+esc(b)+'</p>';
 h+='<ul><li>Anschaffung: '+esc(c.an)+'</li><li><strong>Über fünf Jahre: '+esc(c.fj)+'</strong></li></ul>';if(rw.laufend)h+='<p class="small">Davon laufend: '+esc(rw.laufend)+'</p>';
 h+='<p class="small">Zum Vergleich – '+esc(F.weg_titel[alt])+': '+esc(ca.fj)+'</p>';
 h+='<p><strong>Gut zu wissen:</strong> '+esc(r.erkenntnis)+'</p><p><strong>Deine Prüfpunkte</strong></p>'+ul(r.pruefpunkte);
 h+='<p class="small">Quelle: '+esc(r.quelle)+'; '+esc(c.q)+'</p><details class="small"><summary>So rechnen wir</summary><p>'+esc(K.transparenz.replace(/^So rechnen wir:\s*/,''))+'</p></details></div>';
 if(!WEG0)h+='<p class="small">'+esc(K.region_hinweis)+'.</p><p><a class="btn" href="'+F.base+'/#check">Jetzt Alarm-Check starten</a></p>';
 return h}
function mailBox(){var E=F.email;return '<form class="mail" id="mf" novalidate><p><strong>'+esc(E.h||'')+'</strong></p><label for="em"><strong>'+esc(E.feld_email)+'</strong></label><input id="em" type="email" autocomplete="email" inputmode="email" required>'+
 '<label class="chk"><input type="checkbox" id="c1"><span>'+md(E.label)+'</span></label><p class="small">'+md(E.detail)+'</p>'+
 '<input id="hp" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0"><p class="err" id="er"></p><button class="btn" type="submit">'+esc(E.btn||'Senden')+'</button></form>'}
function md(s){return esc(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g,function(m,a,b){return '<a href="'+(b.charAt(0)=='/'?F.base+b:b)+'">'+a+'</a>'})}
function bindMail(id){var f=document.getElementById('mf');f.onsubmit=function(e){e.preventDefault();var em=document.getElementById('em').value.trim(),er=document.getElementById('er');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){er.textContent='Bitte prüf deine E-Mail-Adresse.';return}
 if(!document.getElementById('c1').checked){er.textContent='Dafür brauchen wir dein Häkchen.';return}
 er.textContent='';var b=f.querySelector('button[type=submit]');b.disabled=true;
 send({stage:'lead',quiz:M,result:id,u:scope(),email:em,consent_mail:true,consent_forward:false,plz:'',consent_text_mail:F.email.label+' '+F.email.detail,consent_text_forward:'',hp:document.getElementById('hp').value},function(ok){
  if(ok)f.innerHTML='<p>'+esc(F.danke)+'</p>';else{b.disabled=false;er.textContent='Das hat leider nicht geklappt. Bitte versuch es gleich noch einmal.'}})}}
function send(extra,cb){var d={campaign:'CL-DE-ALARM-MVP',segment:extra.result||'',answers:A,page:location.pathname,src:url.get('src')||'',secs:Math.round((Date.now()-t0)/1000)};
 for(var k in extra)d[k]=extra[k];
 try{fetch(F.hook,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(d),keepalive:true}).then(function(r){cb&&cb(r.ok)}).catch(function(){cb&&cb(false)})}catch(e){cb&&cb(false)}}
if(M==='kosten'&&WEG&&U)result();else step(false)})();
