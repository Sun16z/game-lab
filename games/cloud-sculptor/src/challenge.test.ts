import { describe, expect, it } from "vitest";
import { addSticker, initialArtwork, movePoint, moveSticker } from "./rules";
import { decodeArtwork, encodeArtwork } from "./challenge";

describe("artwork challenge links", () => {
  it("round trips a friend's shape and sticker coordinates", () => {
    const art=moveSticker(addSticker(movePoint(initialArtwork(),0,{x:.5,y:.6}),"rainbow",4),4,{x:.7,y:.3});
    const decoded=decodeArtwork(encodeArtwork(art));
    expect(decoded?.points).toEqual(art.points);
    expect(decoded?.stickers[0]).toMatchObject({kind:"rainbow",point:{x:.7,y:.3}});
  });
  it("rejects invalid, unbounded and hostile payloads", () => {
    expect(decodeArtwork("x".repeat(1201))).toBeUndefined();
    expect(decodeArtwork('{"x":"<script>"}')).toBeUndefined();
    const data=JSON.parse(encodeArtwork(initialArtwork()));data[2]=[[100,500,500]];
    expect(decodeArtwork(JSON.stringify(data))).toBeUndefined();
    data[2]=[];data[1][0]=[5000,500];expect(decodeArtwork(JSON.stringify(data))).toBeUndefined();
  });
});
