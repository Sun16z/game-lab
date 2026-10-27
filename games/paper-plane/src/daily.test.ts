import { expect,it } from "vitest";
import { dailyRoute } from "./daily";
import { routes,land,type State } from "./rules";
it("maps a valid UTC day to a consistent, solvable route",()=>{
 const index=dailyRoute("2026-10-28");expect(index).not.toBeNull();expect(index).toBe(dailyRoute("2026-10-28"));
 const state:State={index:index!,throws:0,complete:false};expect(Array.from({length:51},(_,i)=>land(state,i+20).success).some(Boolean)).toBe(true);
 expect(dailyRoute("2026-02-30")).toBeNull();expect(routes.length).toBe(10);
});
