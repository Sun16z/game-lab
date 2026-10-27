import { expect,it } from "vitest";
import { readProgress } from "./progress";
it("restores only valid checkpoint data",()=>{
 expect(readProgress('{"version":1,"level":3,"tests":8}')).toEqual({level:3,tests:8});
 for(const raw of ['{','{"version":2,"level":0,"tests":0}','{"version":1,"level":10,"tests":8}','{"version":1,"level":0,"tests":-1}'])expect(readProgress(raw)).toBeNull();
});
