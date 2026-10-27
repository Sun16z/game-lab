import { expect,it } from "vitest";
import { dailyIndex,utcDay,validUtcDay } from "./daily";
it("uses the same UTC date across different local time zone representations",()=>{
 expect(utcDay(new Date("2026-10-28T01:30:00+08:00"))).toBe(utcDay(new Date("2026-10-27T17:30:00Z")));
 expect(dailyIndex("2026-10-27",10)).toBe(dailyIndex("2026-10-27",10));
 expect(validUtcDay("2026-02-30")).toBe(false);expect(()=>dailyIndex("invalid",10)).toThrow();
});
