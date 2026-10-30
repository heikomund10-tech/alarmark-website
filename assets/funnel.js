/* Alarmark funnel engine (alarm check + cost check). Logic and texts come from window.FN (compiled from the CD's quiz_logic, 30.10.2026).
   Markup follows the design system's quiz contract: #check.quiz, .qbar>i, .qstep, .qq, button.opt, .qnav, .res, .tag, form.mail, label.chk, .err, .small, .btn, .lnk */
(function(){
var F=window.FN,el=document.getElementById('check');if(!F||!el)return;
var M=F.mode,C=F[M],A={},hist=[],t0=Date.now(),url=new URLSearchParams(location.search),WEG=(url.get('weg')||'').toUpperCase();
if(!/^(SE|SL|PE|PL)$/.test(WEG))WEG='';var WEG0=WEG;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function lab(qid){var q=C.questions.filter(function(x){return x.id===qid})[0];if(!q||!A[qid])return '';var o=q.optionen.filter(function(x){return x.id===A[qid]})[0];return o?o.label:''}
function vis(q){var c=q.nur_wenn;if(!c)return true;if(c.weg===false)return !WEG;return c['in'].indexOf(A[c.q])>-1}
function list(){return C.questions.filter(vis)}
function score(){var s={S:0,P:0,E:0,L:0};C.questions.filter(vis).forEach(function(q){q.optionen.forEach(function(o){if(A[q.id]===o.id)for(var k in o.punkte)s[k]=(s[k]||0)+o.punkte[k]})});return s}
function decide(){if(WEG&&M==='kosten')return {m:WEG[0],a:WEG[1],tie:false};
 var s=score(),I=s.S-s.P,D=s.L-s.E,m=I>=1?'S':I<=-1?'P':(C.tie_S.indexOf(A[C.tie_q])>-1?'S':'P');return {m:m,a:D>=1?'L':'E',tie:D===0}}
function fill(t){return t.replace(/\{(\w+)\}/g,function(_,k){return lab(k)})}
function step(scroll){var qs=list(),i=hist.length;if(i>=qs.length)return result();var q=qs[i];
 var h='<div class="qbar"><i style="width:'+Math.round(i/qs.length*100)+'%"></i></div><div class="qstep"><span class="small">Frage '+(i+1)+' von '+qs.length+'</span><p class="qq">'+esc(q.frage)+'</p>';
 q.optionen.forEach(function(o){h+='<button class="opt" data-o="'+o.id+'" aria-pressed="'+(A[q.id]===o.id)+'">'+esc(o.label)+'</button>'});
 h+='</div><div class="qnav">'+(i?'<button class="lnk" id="bk" type="button">Zurück</button>':'')+'</div>';
 if(M==='kosten'&&WEG&&i===0)h='<p class="small">Dein Weg aus dem Alarm-Check: <strong>'+esc(F.weg_titel[WEG])+'</strong> · <button class="lnk" id="chg" type="button">Weg ändern</button></p>'+h;
 el.innerHTML=h;
 [].forEach.call(el.querySelectorAll('.opt'),function(b){b.onclick=function(){A[q.id]=b.dataset.o;hist.push(q.id);step(true)}});
 var bk=document.getElementById('bk');if(bk)bk.onclick=function(){var id=hist.pop();delete A[id];step(true)};
 var ch=document.getElementById('chg');if(ch)ch.onclick=function(){WEG='';hist=[];A={};step(true)};
 if(scroll)el.scrollIntoView({block:'start',behavior:'smooth'})}
function hints(d){var out=[];C.hints.forEach(function(x){var on=x.tie_alarm?d.tie:x.opts.some(function(o){for(var k in A)if(A[k]===o)return true;return false});if(on)out.push(x.text)});return out.slice(0,C.max_hints||4)}
function result(){var d=decide(),id=d.m+d.a,r=C.results[id],noWeg=!(M==='kosten'&&WEG);
 var v=r.begruendung,txt;
 if(M==='alarm'){txt=(d.m==='S'&&C.pref_P.indexOf(A[C.tie_q])>-1&&v.S_trotz_a3c)||(d.m==='P'&&C.tie_S.indexOf(A[C.tie_q])>-1&&v.P_trotz_a3ab)||v.standard}
 else txt=noWeg?v.ohne_weg:v.mit_weg;
 send({stage:'result',quiz:M,result:id});
 var h='<div class="res"><span class="tag">Dein Ergebnis</span><h3>'+esc(r.titel)+'</h3><p>'+esc(fill(txt||''))+'</p>';
 if(r.kosten){var k=r.kosten;h+='<p><strong>Über fünf Jahre:</strong> '+esc(k.summe_5_jahre)+'</p><ul><li>Anschaffung: '+esc(k.anschaffung)+'</li><li>Laufend über fünf Jahre: '+esc(k.laufend_5_jahre)+'</li></ul>';
  if(k.hinweis_gross&&C.gross.indexOf(A.k2)>-1)h+='<p class="small">'+esc(k.hinweis_gross)+'</p>';
  if(k.hinweis_wohnung&&C.wohnung.indexOf(A.k1)>-1)h+='<p class="small">'+esc(k.hinweis_wohnung)+'</p>';
  if(k.vergleich)h+='<p class="small">'+esc(k.vergleich)+'</p>'}
 h+='<p><strong>Gut zu wissen:</strong> '+esc(r.erkenntnis)+'</p>';
 var pp=r.pruefpunkte.concat(hints(d));if(pp.length)h+='<p><strong>Deine Prüfpunkte</strong></p><ul>'+pp.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>';
 h+='<p class="small">Quelle: '+esc(r.quelle)+'</p>';
 if(M==='alarm'&&F.plzdata&&C.plz)h+=plzBox();
 h+='<details class="small"><summary>So kommen wir darauf</summary><p>'+esc(C.transparenz.replace(/^So (kommen wir darauf|rechnen wir):\s*/,''))+'</p></details>';
 if(M==='alarm')h+='<p><a class="btn" href="'+F.base+C.next.href+id+'">'+esc(C.next.button)+'</a></p>';
 h+='</div>'+mailBox();
 if(M==='kosten'&&noWeg)h+='<p><a class="btn" href="'+F.base+'/#check">Jetzt Alarm-Check starten</a></p>';
 h+='<p><button class="lnk" type="button" id="rs">Neu starten</button></p>';
 el.innerHTML=h;el.scrollIntoView({block:'start'});
 document.getElementById('rs').onclick=function(){A={};hist=[];if(M==='kosten')WEG=WEG0;step(true)};
 bindMail(id);bindPlz()}
function mailBox(){var E=F.email;return '<form class="mail" id="mf" novalidate><p><strong>'+esc(C.next.mail_h)+'</strong></p><p>'+esc(C.next.mail_t)+'</p><label for="em"><strong>'+esc(E.feld_email)+'</strong></label><input id="em" type="email" autocomplete="email" inputmode="email" required>'+
 '<label class="chk"><input type="checkbox" id="c1"><span>'+md(E.label)+'</span></label><p class="small">'+md(E.detail)+'</p>'+
 '<input id="hp" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0"><p class="err" id="er"></p><button class="btn" type="submit">'+esc(C.next.mail_btn)+'</button></form>'}
function md(s){return esc(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g,function(m,a,b){return '<a href="'+(b.charAt(0)=='/'?F.base+b:b)+'">'+a+'</a>'})}
function bindMail(id){var f=document.getElementById('mf');f.onsubmit=function(e){e.preventDefault();var em=document.getElementById('em').value.trim(),er=document.getElementById('er');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){er.textContent='Bitte prüf deine E-Mail-Adresse.';return}
 if(!document.getElementById('c1').checked){er.textContent='Für die Mails brauchen wir dein Häkchen.';return}
 er.textContent='';var b=f.querySelector('button[type=submit]');b.disabled=true;b.textContent='Wird gesendet …';
 send({stage:'lead',quiz:M,result:id,email:em,consent_mail:true,consent_forward:false,plz:'',consent_text_mail:F.email.label+' '+F.email.detail,consent_text_forward:'',hp:document.getElementById('hp').value},function(ok){
  if(ok)f.innerHTML='<p><strong>Fast geschafft.</strong> '+esc(F.danke)+'</p>';else{b.disabled=false;b.textContent=C.next.mail_btn;er.textContent='Das hat leider nicht geklappt. Bitte versuch es gleich noch einmal.'}})}}
function plzBox(){var P=C.plz;return '<div class="plz"><p><strong>'+esc(P.ueberschrift)+'</strong></p><label for="plz">'+esc(P.eingabe_label)+'</label><input id="plz" type="text" inputmode="numeric" maxlength="5" autocomplete="postal-code"><p class="small">'+esc(P.eingabe_hinweis)+'</p><p><button class="lnk" type="button" id="plzb">'+esc(P.button)+'</button></p><div id="plzr" aria-live="polite"></div></div>'}
function bindPlz(){var b=document.getElementById('plzb');if(!b)return;var inp=document.getElementById('plz');inp.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();b.click()}};
 b.onclick=function(){var o=document.getElementById('plzr');if(typeof F.plzdata==='string'){b.disabled=true;fetch(F.plzdata).then(function(r){return r.json()}).then(function(d){F.plzdata=d;b.disabled=false;b.click()}).catch(function(){b.disabled=false;o.innerHTML='<p>Die Regionaldaten konnten gerade nicht geladen werden. Bitte versuch es gleich noch einmal.</p>'});return}
 var P=C.plz,D=F.plzdata,v=inp.value.trim(),ks=D.plz[v];
 if(!/^\d{5}$/.test(v)||!ks){o.innerHTML='<p>'+esc(P.unbekannt)+'</p>';return}
 var fmt=function(n){return (Math.round(n*10)/10).toFixed(1).replace('.',',')},t;
 if(ks.length>1){var a=D.kreis[ks[0]],c=D.kreis[ks[1]];t=P.zwei_kreise.replace('{kreis_1}',a.n).replace('{hz_1}',fmt(a.hz)).replace('{kreis_2}',c.n).replace('{hz_2}',fmt(c.hz))}
 else{var k=D.kreis[ks[0]],r=k.hz/D.bund;t=(r<0.85?P.unter:r>1.15?P.ueber:P.um).replace('{kreis}',k.n).replace('{hz_kreis}',fmt(k.hz))}
 o.innerHTML='<p>'+esc(t.replace('{hz_bund}',fmt(D.bund)))+'</p><p class="small">'+esc(P.grenze)+'</p><p class="small">'+esc(P.quellenzeile.replace('{pks_version}',D.version||''))+'</p>'}}
function send(extra,cb){var d={campaign:'CL-DE-ALARM-MVP',segment:extra.result||'',answers:A,page:location.pathname,src:url.get('src')||'',secs:Math.round((Date.now()-t0)/1000)};
 for(var k in extra)d[k]=extra[k];
 try{fetch(F.hook,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(d),keepalive:true}).then(function(r){cb&&cb(r.ok)}).catch(function(){cb&&cb(false)})}catch(e){cb&&cb(false)}}
step(false)})();
