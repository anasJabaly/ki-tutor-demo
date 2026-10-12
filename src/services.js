import {seedCourse,clone} from './data.js';
export const STORAGE_KEY = 'syp15-demo-v1';
// Replace these local adapters with server API clients. Never put platform credentials here.
export const demoStorage = {
  load() { try { const s=JSON.parse(localStorage.getItem(STORAGE_KEY)); if(s?.version===1) return s; } catch {} return {version:1,published:clone(seedCourse),draft:clone(seedCourse),dialogs:{},completed:[],consent:null}; },
  save(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); },
  reset() {localStorage.removeItem(STORAGE_KEY);}
};
export const demoAuth = { current: () => ({id:'demo-person', authenticated:false}) };
export const demoTutor = {
  async *reply(text, task, turn=0) {
    const response = text.trim().length < 35 ? 'Dein Gedanke ist noch recht knapp. Welches konkrete Beispiel aus dem Fahrradverleih würde deine Aussage verständlicher machen?' :
      /stakeholder|bedürfnis/i.test(task.title) ? 'Du hast eine erste Perspektive beschrieben. Woran würdest du erkennen, dass das Bedürfnis dieses Stakeholders tatsächlich erfüllt ist?' :
      /anforderung|story|experiment/i.test(task.title) ? 'Dein Ansatz lässt sich weiter konkretisieren. Welches beobachtbare Kriterium würde zeigen, dass dein Vorschlag funktioniert?' :
      turn % 2 ? 'Du unterscheidest bereits mehrere Elemente. Was würde sich an deiner Systemgrenze ändern, wenn die Wartung durch einen externen Dienstleister erfolgt?' :
      'Du hast einen nachvollziehbaren Ansatz formuliert. Betrachte jetzt die Reservierung: Liegt die Person, die ein Fahrrad bucht, innerhalb oder außerhalb deiner Systemgrenze? Begründe deine Entscheidung.';
    for(const word of response.split(' ')) {await new Promise(r=>setTimeout(r,35)); yield word+' ';}
  }
};
