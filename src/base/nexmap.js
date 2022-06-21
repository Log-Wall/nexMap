import { aliases } from "./aliases";
import { generateGraph } from "./graph";
import { db } from "./mongo";
import { farseeArea, farseeLocal, onGMCP } from "./navigation";

export const nexmap = {
  version: '3.0.7',
  nxsVersion: '3.0.7',
  logging: false,
  loggingTime: '',
  mudmap: {},
  cytoscapeLoaded: false,
  mudletMapLoaded: false,
  currentRoom: -99,
  currentArea: -99,
  currentZ: -99,
  wormholes: {},
  sewergrates: {},

  /* import mappings */
  generateGraph: generateGraph,
  farseeLocal: farseeLocal,
  farseeArea: farseeArea,
  onGMCP: onGMCP,
  aliases: aliases,

  db: db,
}