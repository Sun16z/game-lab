import { expect, it } from "vitest";
import { readProgress } from "./rules";
it("restores only a valid versioned local checkpoint", () => {
  expect(readProgress('{"version":2,"index":3,"throws":8}')).toEqual({index:3,throws:8,complete:false});
  for (const raw of ['{','{"version":1,"index":3,"throws":8}','{"version":2,"index":10,"throws":8}','{"version":2,"index":0,"throws":-1}']) expect(readProgress(raw)).toBeNull();
});
