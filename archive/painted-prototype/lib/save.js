export const SAVE_KEY='hantu-codex-v1';
export const EMPTY_SAVE={name:'Ari',collected:[],notes:'',runs:0};
export const IDS=['pontianak','toyol','hantu-raya','langsuir','pocong','orang-bunian'];
export function cleanSave(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('This is not a field journal.');return {name:typeof raw.name==='string'?raw.name.slice(0,32):'Ari',collected:Array.isArray(raw.collected)?[...new Set(raw.collected.filter(id=>IDS.includes(id)))]:[],notes:typeof raw.notes==='string'?raw.notes.slice(0,10000):'',runs:Number.isSafeInteger(raw.runs)&&raw.runs>=0?raw.runs:0};}
