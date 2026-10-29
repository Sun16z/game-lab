export const languages=['zh-Hant','en','es','pt-BR','fr','ar','sw','id','hi'] as const;
export type Language=typeof languages[number];
export type GradeBand='middle'|'upper';
export type QuestionKind='pos'|'synonym'|'antonym'|'gap';
export type Reason='noun'|'verb'|'adjective'|'synonym'|'antonym'|'pluralVerb'|'singularVerb'|'beSingular'|'bePlural';
export interface Question {id:string;band:GradeBand;kind:QuestionKind;before:string;target:string;after:string;choices:readonly [string,string,string];correct:0|1|2;reason:Reason;describes?:string}
