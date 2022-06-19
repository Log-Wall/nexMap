/* global cy, GMCP */
import { generateGraph } from "./graph";
import { db } from "./mongo";

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

  generateGraph: generateGraph,
  db: db,
}