/** UTC makes the same date and puzzle available across time zones. */
export function utcDay(date:Date):string{return date.toISOString().slice(0,10)}
export function validUtcDay(day:string):boolean{return /^\d{4}-\d{2}-\d{2}$/.test(day)&&!Number.isNaN(Date.parse(`${day}T00:00:00Z`))&&utcDay(new Date(`${day}T00:00:00Z`))===day}
export function dailyIndex(day:string,count:number):number{
 if(!validUtcDay(day)||!Number.isInteger(count)||count<1)throw new Error("Invalid daily puzzle date or count");
 let hash=2166136261;for(const character of day)hash=Math.imul(hash^character.charCodeAt(0),16777619);
 return (hash>>>0)%count;
}
