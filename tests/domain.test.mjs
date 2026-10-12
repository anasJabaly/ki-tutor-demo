import test from 'node:test';
import assert from 'node:assert/strict';
import {seedCourse,clone,chapterState,validateCourse,isLocked,newDialog} from '../src/data.js';
import {markdown} from '../src/de.js';
test('Freigabe berücksichtigt Entwurf, Zukunft und Ablauf',()=>{
 const c=clone(seedCourse.chapters[0]),now=new Date('2026-10-12T12:00:00');
 assert.equal(chapterState(c,now),'active');c.published=false;assert.equal(chapterState(c,now),'draft');
 c.published=true;c.activeFrom='2027-05-01';assert.equal(chapterState(c,now),'future');c.activeFrom='2026-01-01';c.activeUntil='2026-09-01';assert.equal(chapterState(c,now),'expired');
});
test('Entwurf bleibt unabhängig von Veröffentlichung',()=>{const p=clone(seedCourse),d=clone(p);d.chapters[0].tasks[0].title='Neu';assert.notEqual(d.chapters[0].tasks[0].title,p.chapters[0].tasks[0].title);});
test('Kontext sperrt Quelle und bleibt eine Momentaufnahme',()=>{const a=newDialog(),b=newDialog(),m={id:'message',text:'Erster Gedanke'};a.messages.push(m);b.context={dialogId:a.id,text:m.text};const ds={a:[a],b:[b]};assert.equal(isLocked(ds,a.id),true);m.text='Geändert';assert.equal(b.context.text,'Erster Gedanke');delete b.context;assert.equal(isLocked(ds,a.id),false);});
test('Import hält IDs stabil und entfernt private und unbekannte Felder',()=>{const c=clone(seedCourse);c.solutionHints='geheim';c.chapters[0].tasks[0].privateHints='geheim';const out=validateCourse(c);assert.equal(out.id,c.id);assert.equal(out.chapters[0].tasks[0].id,c.chapters[0].tasks[0].id);assert.ok(!JSON.stringify(out).includes('geheim'));});
test('Import verwirft doppelte IDs, ungültige Limits und falsche Kontextquellen',()=>{for(const change of [c=>c.chapters[0].tasks[1].id='task-1',c=>c.chapters[0].tasks[0].limit=-1,c=>c.chapters[0].tasks[0].source='task-4',c=>c.chapters[0].activeFrom='morgen']){const c=clone(seedCourse);change(c);assert.throws(()=>validateCourse(c));}});
test('Markdown führt HTML nicht aus und rendert Tabellen',()=>{assert.ok(!markdown('<img src=x onerror=alert(1)>').includes('<img'));assert.ok(markdown('| A | B |\n| --- | --- |\n| 1 | 2 |').includes('<table>'));});
