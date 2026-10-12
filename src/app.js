import {clone,newDialog,findTask,chapterState,isLocked,validateCourse} from './data.js';
import {demoStorage,demoTutor} from './services.js';
import {esc,markdown,shell,sidebar,studentView,teacherView,messages,privacy,copy} from './de.js';
let state=demoStorage.load(), working=clone(state.draft), role='student', selected='task-1', activeId=null, editorTab='task', cardCollapsed=false, busy=false, offline=false;
const collapsed=new Set(), $=s=>document.querySelector(s), modal=$('#modal');
function persist(){try{demoStorage.save(state);}catch{toast(copy.storageError);}}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),4500);}
function currentCourse(){return role==='student'?state.published:working;}
function currentDialogs(){return state.dialogs[selected] ||= [newDialog()];}
function activeDialog(){let list=currentDialogs();return list.find(d=>d.id===activeId)||list[0];}
function dirty(){return JSON.stringify(working)!==JSON.stringify(state.draft);}
function status(){return dirty()?'Ungespeichert':JSON.stringify(state.draft)===JSON.stringify(state.published)?'Aktuell veröffentlicht':'Gespeichert · nicht veröffentlicht';}
function render(){
 const course=currentCourse();
 const available=course.chapters.filter(ch=>role==='teacher'||chapterState(ch)==='active').flatMap(ch=>ch.tasks);
 if(!available.some(t=>t.id===selected)){selected=available[0]?.id;activeId=null;}
 $('#app').innerHTML=shell(role,course);
 const locks=new Set(Object.entries(state.dialogs).filter(([,ds])=>ds.some(d=>isLocked(state.dialogs,d.id))).map(([id])=>id));
 $('#sidebar').innerHTML=sidebar(course,selected,role,state.completed.filter(id=>findTask(course,id)),Object.fromEntries(course.chapters.map(c=>[c.id,chapterState(c)])),collapsed,locks);
 const item=findTask(course,selected);
 if(!item){$('#main').innerHTML='<div class="empty"><h1>Der Lernraum ist noch geschlossen.</h1><p>Aktuell ist kein Kapitel freigegeben. In der Dozierendenansicht kannst du Kapitel veröffentlichen.</p></div>';return;}
 collapsed.delete(item.chapter.id);
 if(role==='student'){
   const d=activeDialog();activeId=d.id;
   $('#main').innerHTML=studentView(item.chapter,item.task,currentDialogs(),d,state.completed.includes(selected),cardCollapsed,offline);
   const input=$('#answer');input?.addEventListener('input',()=>{const n=input.value.length;$('#counter').textContent=`${n} / ${item.task.limit}`;$('#counter').classList.toggle('over-limit',n>item.task.limit);$('#send').disabled=busy||offline||n>item.task.limit;});
   $('#chat-form').addEventListener('submit',send);
 }else $('#main').innerHTML=teacherView(item.chapter,item.task,status(),editorTab,course);
}
function open(html){modal.innerHTML=html;if(!modal.open)modal.showModal();}
function download(name,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function send(e){e.preventDefault();if(busy||offline)return;const input=$('#answer'),text=input.value.trim(),task=findTask(state.published,selected).task;
 if(!text)return;if(text.length>task.limit){toast(copy.limit);return;}
 const d=activeDialog();d.messages.push({id:crypto.randomUUID(),role:'student',text,created:new Date().toISOString()});
 const reply={id:crypto.randomUUID(),role:'tutor',text:'',created:new Date().toISOString()};d.messages.push(reply);busy=true;input.value='';persist();
 $('#chat').innerHTML=messages(d.messages);$('#send').disabled=true;input.disabled=true;
 try{for await(const piece of demoTutor.reply(text,task,d.messages.filter(m=>m.role==='student').length-1)){
   reply.text+=piece;const bubbles=$('#chat').querySelectorAll('.bubble > p');bubbles[bubbles.length-1].textContent=reply.text;
 }}finally{busy=false;persist();render();$('#answer')?.focus();}
}
function preview(){const task=clone(findTask(working,selected).task);open(`<div class="modal-heading"><p class="eyebrow">ENTWURF TESTEN · KEINE PERSISTENZ</p><h2>${esc(task.title)}</h2></div><div class="markdown">${markdown(task.text)}</div><div id="preview-chat" class="preview-chat"><p>Demo-Tutor: Was ist dein erster Gedanke?</p></div><form id="preview-form"><label>Deine Testantwort<textarea id="preview-answer" rows="3" required maxlength="${task.limit}"></textarea></label><button class="primary">Demoantwort testen</button></form><p class="muted">Vorgegebene Antwort; private Lösungshinweise und echte Prompt-Wirkung werden nicht getestet.</p><button data-action="close" class="link">Vorschau schließen</button>`);
 $('#preview-form').addEventListener('submit',async e=>{e.preventDefault();const input=$('#preview-answer'),button=$('#preview-form button'),chat=$('#preview-chat'),text=input.value.trim();if(!text)return;const p=document.createElement('p');p.textContent='Du: '+text;chat.append(p);const reply=document.createElement('p');chat.append(reply);input.disabled=true;button.disabled=true;for await(const chunk of demoTutor.reply(text,task)){if(!modal.open||!chat.isConnected)break;reply.textContent+=chunk;}input.disabled=false;button.disabled=false;input.value='';});}
function context(){const task=findTask(state.published,selected).task;const available=(state.dialogs[task.source]||[]).flatMap(d=>d.messages.filter(m=>m.role==='student').map(m=>({d,m})));open(`<h2>Eigene Antwort übernehmen</h2><p>Wähle maximal einen Beitrag. Mit dem ersten Beitrag ist die Momentaufnahme festgeschrieben.</p>${available.length?available.map(({d,m})=>`<button class="context-option" data-context-dialog="${d.id}" data-context-message="${m.id}">${esc(m.text)}</button>`).join(''):'<p class="notice">Es gibt noch keine eigenen Antworten in der Quell-Aufgabe. Bearbeite zuerst diese Aufgabe.</p>'}<button class="link" data-action="close">Schließen</button>`);}
async function act(action){
 if(busy && !['privacy','close','consent'].includes(action)){toast('Bitte warte, bis die Demoantwort vollständig ist.');return;}
 switch(action){
 case 'privacy':open(privacy(state.consent));break;
 case 'consent':if(!state.consent){state.consent=new Date().toISOString();persist();}modal.close();break;
 case 'close':modal.close();break;
 case 'collapse':cardCollapsed=!cardCollapsed;render();break;
 case 'new-dialog':{const d=newDialog();currentDialogs().push(d);activeId=d.id;persist();render();break;}
 case 'delete-dialog':{const d=activeDialog();if(isLocked(state.dialogs,d.id)){toast(copy.locked);break;}open('<h2>Dialog löschen?</h2><p>Der Dialog wird aus diesem Browser entfernt.</p><button class="primary" data-action="confirm-delete">Dialog löschen</button> <button class="link" data-action="close">Abbrechen</button>');break;}
 case 'confirm-delete':{const d=activeDialog();if(isLocked(state.dialogs,d.id)){toast(copy.locked);break;}state.dialogs[selected]=currentDialogs().filter(x=>x.id!==d.id);if(!state.dialogs[selected].length)state.dialogs[selected]=[newDialog()];activeId=null;persist();modal.close();render();toast(copy.deleted);break;}
 case 'complete':state.completed=state.completed.includes(selected)?state.completed.filter(id=>id!==selected):[...state.completed,selected];persist();render();break;
 case 'offline':offline=!offline;render();break;
 case 'save':try{working=validateCourse(working);state.draft=clone(working);persist();render();toast(copy.saved);}catch(e){toast(e.message);}break;
 case 'publish':try{working=validateCourse(working);state.draft=clone(working);state.published=clone(working);persist();render();toast(copy.published);}catch(e){toast(e.message);}break;
 case 'preview':preview();break;
 case 'context':context();break;
 case 'upload':toast(copy.upload);break;
 case 'export':download('ki-tutor-kurs-demo.json',{schemaVersion:1,course:working});break;
 case 'export-dialog':download('ki-tutor-dialog-demo.json',{demo:true,taskId:selected,dialog:activeDialog()});break;
 case 'import':$('#import-file').click();break;
 case 'reset':open('<h2>Demo zurücksetzen?</h2><p>Alle lokalen Dialoge, Entwürfe und Fortschrittsmarkierungen werden gelöscht.</p><button class="primary" data-action="confirm-reset">Zurücksetzen</button> <button class="link" data-action="close">Abbrechen</button>');break;
 case 'confirm-reset':demoStorage.reset();state=demoStorage.load();working=clone(state.draft);selected='task-1';activeId=null;modal.close();render();open(privacy(null));break;
 }
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b||b.disabled)return;
 if(busy && (b.dataset.role||b.dataset.task||b.dataset.dialog||b.dataset.chapter)){toast('Bitte warte auf die vollständige Demoantwort.');return;}
 if(b.dataset.action){await act(b.dataset.action);return;}
 if(b.dataset.role){role=b.dataset.role;render();return;}
 if(b.dataset.task){selected=b.dataset.task;activeId=null;collapsed.delete(findTask(currentCourse(),selected).chapter.id);render();return;}
 if(b.dataset.chapter){const id=b.dataset.chapter;if(findTask(currentCourse(),selected)?.chapter.id!==id){collapsed.has(id)?collapsed.delete(id):collapsed.add(id);}render();return;}
 if(b.dataset.dialog){activeId=b.dataset.dialog;render();return;}
 if(b.dataset.editorTab){editorTab=b.dataset.editorTab;render();return;}
 if(b.dataset.contextMessage){const task=findTask(state.published,selected).task;const d=state.dialogs[task.source].find(d=>d.id===b.dataset.contextDialog);const m=d.messages.find(m=>m.id===b.dataset.contextMessage);activeDialog().context={taskId:task.source,dialogId:d.id,messageId:m.id,text:m.text,selectedAt:new Date().toISOString()};persist();modal.close();render();return;}
 if(b.dataset.copy){const m=activeDialog().messages.find(m=>m.id===b.dataset.copy);try{await navigator.clipboard.writeText(m.text);toast(copy.copied);}catch{toast(copy.copyError);}return;}
 if(b.dataset.rate){activeDialog().messages.find(m=>m.id===b.dataset.message).rating=b.dataset.rate;persist();$('#chat').innerHTML=messages(activeDialog().messages);toast(copy.feedback);return;}
 if(b.dataset.report){const id=b.dataset.report;open(`<h2>Demo-Fehler melden</h2><p>Es wird nichts an Dozierende übermittelt. Du kannst den Ablauf lokal ausprobieren.</p><label>Was war unpassend?<textarea id="report-note" rows="3" maxlength="1000"></textarea></label><label class="check"><input id="report-consent" type="checkbox"> Ich möchte diesen Dialog zur Prüfung freigeben (simuliert).</label><button id="report-save" class="primary">Lokal vormerken</button> <button data-action="close" class="link">Abbrechen</button>`);$('#report-save').onclick=()=>{if(!$('#report-consent').checked){toast('Bitte die simulierte Dialogfreigabe bestätigen.');return;}const m=activeDialog().messages.find(m=>m.id===id);m.report={note:$('#report-note').value,consentAt:new Date().toISOString()};persist();modal.close();toast(copy.report);};}
});
document.addEventListener('input',e=>{
 const field=e.target.dataset.field, chField=e.target.dataset.chapterField;if(!field&&!chField)return;
 const {task,chapter}=findTask(working,selected);let v=e.target.type==='checkbox'?e.target.checked:e.target.type==='number'?Number(e.target.value):e.target.value;
 if(field)task[field]=field==='source'?(v||null):v;if(chField)chapter[chField]=v;
 $('#editor-status').textContent=status();if(field==='title'||field==='text')$('#live-task').innerHTML=`<h2>${esc(task.title)}</h2><div class="markdown">${markdown(task.text)}</div>`;
});
document.addEventListener('change',async e=>{if(e.target.id!=='import-file')return;const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('Datei größer als 1 MB.');const data=JSON.parse(await file.text());if(data.schemaVersion!==1)throw Error('Unbekannte Dateiversion.');working=validateCourse(data.course);state.draft=clone(working);persist();selected=working.chapters.flatMap(ch=>ch.tasks)[0]?.id;render();toast(copy.imported);}catch(err){toast(copy.importError+err.message);}e.target.value='';});
modal.addEventListener('cancel',e=>{if(!state.consent)e.preventDefault();});
window.addEventListener('beforeunload',e=>{if(dirty()){e.preventDefault();e.returnValue='';}});
render();if(!state.consent)open(privacy(null));
