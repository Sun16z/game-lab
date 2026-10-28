import type {Challenge,Difficulty} from './rules';
export interface Profile {completed:boolean[];best:Record<string,number>}
export function normalizeProfile(raw:unknown):Profile {const p=raw&&typeof raw==='object'?raw as Partial<Profile>:{};const completed=Array.from({length:12},(_,i)=>Array.isArray(p.completed)&&p.completed[i]===true);const best:Record<string,number>={};if(p.best&&typeof p.best==='object')for(const [key,value] of Object.entries(p.best))if(/^(standard|apprentice):(\d|1[01]|endless)$/.test(key)&&Number.isInteger(value)&&value>=0&&value<=10000000)best[key]=value;return{completed,best}}
export function unlocked(p:Profile){const first=p.completed.indexOf(false);return first<0?12:first}
export function saveResult(p:Profile,level:number,difficulty:Difficulty,value:number,won:boolean,endless:boolean):Profile {const key=`${difficulty}:${endless?'endless':level}`;const completed=[...p.completed];if(won&&!endless)completed[level]=true;return{completed,best:{...p.best,[key]:Math.max(p.best[key]??0,value)}}}

/** A validated explicit challenge grants entry for that run; it does not unlock the menu. */
export function canStartEndless(p:Profile,challenge:Challenge|null):boolean {return unlocked(p)===12||challenge?.endless===true}
export interface Selection {level:number;seed:number;difficulty:Difficulty;endless:boolean}
/** Keep an exact active challenge; leaving it restores ordinary contiguous progression. */
export function resolveSelection(p:Profile,selection:Selection,challenge:Challenge|null):{selection:Selection;challenge:Challenge|null} {
 const exact=challenge!==null&&challenge.level===selection.level&&challenge.seed===selection.seed&&challenge.difficulty===selection.difficulty&&challenge.endless===selection.endless;
 if(exact)return{selection:{...selection},challenge};
 return{selection:{...selection,level:Math.max(0,Math.min(11,unlocked(p),Math.trunc(selection.level))),seed:4103,endless:selection.endless&&canStartEndless(p,null)},challenge:null};
}
