import { expect, it } from "vitest";
import { readProgress } from "./rules";
it("restores only a valid versioned local checkpoint",()=>{
 expect(readProgress('{"version":2,"index":3,"moves":8}')).toEqual({index:3,rotation:0,moves:8,completed:false});
 for(const raw of ['{','{"version":1,"index":3,"moves":8}','{"version":2,"index":10,"moves":8}','{"version":2,"index":0,"moves":-1}']) expect(readProgress(raw)).toBeNull();
});
