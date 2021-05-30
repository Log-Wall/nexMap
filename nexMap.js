'use strict';
var cy = {};
var nexMap = {
    logging: true,
    mudmap: {},
	cytoscapeLoaded: false,
    mudletMapLoaded: false,
    currentRoom: -99,
    currentArea: -99,
    currentZ: -99,
    shortDirs: {
        east: "e",
        west: "w",
        south: "s",
        north: "n",
        northeast: "ne",
        northwest: "nw",
        southeast: "se",
        southeastst: "se", // mudlet map misspells 'southeast'
        southwest: "sw",
        in: "in",
        out: "out",
        down: "d",
        up: "up",
    },
    wormWarpExits: {},
};
