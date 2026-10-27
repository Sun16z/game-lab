import { dailyIndex, validUtcDay } from "@game-lab/game-core";
import { routes } from "./rules";

/** A link stores the UTC date, not an untrusted route index. */
export function dailyRoute(day:string):number|null{
 return validUtcDay(day)?dailyIndex(day,routes.length):null;
}
