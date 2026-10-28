export type Point = readonly [number,number];
export type Puzzle = {points:readonly Point[]; edges:readonly (readonly [number,number])[]; start:number};
// Each map is a connected drawing with a deliberately chosen Euler starting point.
export const puzzles:readonly Puzzle[] = [
 {points:[[20,70],[50,20],[80,70]],edges:[[0,1],[1,2],[2,0]],start:0},
 {points:[[20,25],[80,25],[80,75],[20,75]],edges:[[0,1],[1,2],[2,3],[3,0],[0,2]],start:0},
 {points:[[15,75],[15,40],[50,15],[85,40],[85,75]],edges:[[0,1],[1,2],[2,3],[3,4],[4,0],[1,3]],start:1},
 {points:[[15,50],[38,20],[62,20],[85,50],[62,80],[38,80]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[1,5]],start:1},
 {points:[[15,50],[35,20],[65,20],[85,50],[65,80],[35,80],[50,50]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[1,6],[6,4]],start:1},
 {points:[[10,50],[30,20],[50,50],[30,80],[70,20],[90,50],[70,80]],edges:[[0,1],[1,2],[2,3],[3,0],[2,4],[4,5],[5,6],[6,2],[1,3]],start:1},
 {points:[[50,50],[15,25],[35,12],[65,12],[85,25],[85,75],[65,88],[35,88],[15,75]],edges:[[0,1],[1,2],[2,0],[0,3],[3,4],[4,0],[0,5],[5,6],[6,0],[0,7],[7,8],[8,0]],start:0},
 {points:[[50,50],[10,30],[30,12],[70,12],[90,30],[90,70],[70,88],[30,88],[10,70],[50,8]],edges:[[0,1],[1,2],[2,0],[0,3],[3,4],[4,0],[0,5],[5,6],[6,0],[0,7],[7,8],[8,0],[2,9],[9,3]],start:2}
];
export function edgeKey(a:number,b:number):string{return a<b?`${a}-${b}`:`${b}-${a}`}
export function advance(p:Puzzle,path:readonly number[],next:number):number[]|undefined{const current=path.at(-1);if(current===undefined||!p.points[next])return;const key=edgeKey(current,next);if(!p.edges.some(([a,b])=>edgeKey(a,b)===key))return;if(path.slice(1).some((n,i)=>edgeKey(path[i],n)===key))return;return [...path,next]}
export function solved(p:Puzzle,path:readonly number[]):boolean{return path.length===p.edges.length+1}
export function solve(p:Puzzle,path:readonly number[]=[p.start]):number[]|undefined{if(solved(p,path))return [...path];for(let i=0;i<p.points.length;i++){const n=advance(p,path,i);if(n){const result=solve(p,n);if(result)return result}}return undefined}
