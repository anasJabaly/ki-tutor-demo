export const seedCourse = {
  id: 'age-demo-2027', title: 'Agile Systems Engineering', semester: 'Sommersemester 2027', description: 'Vom Problem zum System. Entwickle deine Ideen Schritt für Schritt mit deinem KI-Tutor.', limit: 1500,
  chapters: [
    { id:'ch-1', title:'Systeme verstehen', published:true, tasks:[
      { id:'task-1', title:'Ein System abgrenzen', text:'## Ein Fahrradverleih auf dem Campus\nEin Team möchte einen digitalen Fahrradverleih entwickeln. Studierende sollen Fahrräder finden, reservieren und zurückgeben können.\n\n**Deine Aufgabe:** Beschreibe die Systemgrenze. Welche Elemente gehören zum System und welche zu seiner Umgebung? Begründe deine Auswahl an einem Beispiel.', context:'Betrachte sowohl technische Komponenten als auch die beteiligten Menschen.', limit:1500, uploads:false, source:null },
      { id:'task-2', title:'Stakeholder erkennen', text:'## Wer hat welche Erwartungen?\nNutze den Campus-Fahrradverleih aus Aufgabe 1. Benenne drei Stakeholder und jeweils ein Bedürfnis.\n\n| Stakeholder | Bedürfnis |\n| --- | --- |\n| Dein Beispiel | Deine Begründung |', context:'Du kannst einen eigenen Beitrag aus Aufgabe 1 als Kontext übernehmen.', limit:1200, uploads:false, source:'task-1' },
      { id:'task-3', title:'Anforderungen formulieren', text:'## Von der Idee zur prüfbaren Anforderung\nFormuliere eine messbare Anforderung für den Fahrradverleih. Erkläre, wie du ihre Erfüllung überprüfen würdest.', context:'Achte auf ein überprüfbares Kriterium.', limit:1500, uploads:true, source:null }
    ]},
    { id:'ch-2', title:'Agil entwickeln', published:true, tasks:[
      { id:'task-4', title:'Eine User Story schreiben', text:'## Die Perspektive wechseln\nSchreibe eine User Story für das Reservieren eines Fahrrads. Formuliere außerdem zwei Akzeptanzkriterien.', context:'Als … möchte ich …, damit …', limit:1500, uploads:false, source:null },
      { id:'task-5', title:'Ein Experiment planen', text:'## Früh lernen\nWie kannst du mit einem kleinen Experiment prüfen, ob Studierende den Fahrradverleih nutzen würden?', context:'Beschreibe eine Hypothese, eine Beobachtung und ein Erfolgskriterium.', limit:1500, uploads:false, source:null }
    ]},
    { id:'ch-3', title:'Systeme bewerten', published:true, activeFrom:'2027-05-01', tasks:[{id:'task-6', title:'Zielkonflikte abwägen', text:'Beschreibe einen Zielkonflikt zwischen Verfügbarkeit und Kosten.', context:'', limit:1500, uploads:false, source:null}] }
  ]
};
export const clone = value => structuredClone(value);
export function newDialog() { return {id:crypto.randomUUID(), started:new Date().toISOString(), messages:[], context:null}; }
export function findTask(course, id) { for (const chapter of course.chapters) { const task = chapter.tasks.find(t=>t.id===id); if(task) return {chapter,task}; } }
export function chapterState(chapter, now = new Date()) {
  if (!chapter.published) return 'draft';
  if (chapter.activeUntil && now > new Date(chapter.activeUntil+'T23:59:59')) return 'expired';
  if (chapter.activeFrom && now < new Date(chapter.activeFrom+'T00:00:00')) return 'future';
  return 'active';
}
export function isLocked(dialogs, id) { return Object.values(dialogs).flat().some(d=>d.context?.dialogId===id); }
export function validateCourse(value) {
  const ids = new Set();
  const id = v => { if(typeof v !== 'string' || !v || ids.has(v)) throw Error('IDs fehlen oder sind doppelt.'); ids.add(v); };
  const text = v => { if(typeof v !== 'string' || v.length > 30000) throw Error('Ungültiger Text.'); };
  const limit = v => { if(!Number.isInteger(v) || v<1 || v>10000) throw Error('Zeichenlimit muss zwischen 1 und 10000 liegen.'); };
  if(!value || !Array.isArray(value.chapters) || value.chapters.length > 30) throw Error('Ungültige Kapitel.');
  id(value.id); text(value.title); text(value.semester); text(value.description); limit(value.limit);
  for(const ch of value.chapters) {
    id(ch.id); text(ch.title); if(typeof ch.published !== 'boolean' || !Array.isArray(ch.tasks) || ch.tasks.length>100) throw Error('Ungültiges Kapitel.');
    for(const field of ['activeFrom','activeUntil']) if(ch[field] && (!/^\d{4}-\d{2}-\d{2}$/.test(ch[field]) || Number.isNaN(Date.parse(ch[field])))) throw Error('Ungültiges Datum.');
    if(ch.activeFrom && ch.activeUntil && ch.activeFrom>ch.activeUntil) throw Error('Zeitfenster ist ungültig.');
    for(const t of ch.tasks) { id(t.id); text(t.title); text(t.text); text(t.context); limit(t.limit); if(typeof t.uploads!=='boolean') throw Error('Ungültige Upload-Einstellung.'); }
    for(const t of ch.tasks) if(t.source && (!ch.tasks.some(s=>s.id===t.source) || t.source===t.id)) throw Error('Kontextquelle muss eine andere Aufgabe desselben Kapitels sein.');
  }
  // Explicit allowlist: imported private data cannot enter browser demo storage.
  return {id:value.id,title:value.title,semester:value.semester,description:value.description,limit:value.limit,chapters:value.chapters.map(ch=>({id:ch.id,title:ch.title,published:ch.published,activeFrom:ch.activeFrom||'',activeUntil:ch.activeUntil||'',tasks:ch.tasks.map(t=>({id:t.id,title:t.title,text:t.text,context:t.context,limit:t.limit,uploads:t.uploads,source:t.source||null}))}))};
}
