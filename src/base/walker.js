/* global cy, GMCP, send_direct */
import { nexmap } from "./nexmap.js";
import { userPreferences } from "./settings.js";

export let pathing = false;
let pathRooms = [];
let pathCommands = [];
let pathRawCommands = [];
let pathingStartTime = Date.now();
let pathRawRooms = [];
let delay = false;
let destination = 0;
let stepCommand = "";
let placeHolderRooms = [
  "duanathar",
  "duanatharMeropis",
  "universe",
  "universeMeropis",
  "gare",
];
let universeTarget = false;
let clientEcho = window.echo_input;

export const speedWalk = async (s, t) => {
  if (nexmap.logging) {
    console.log("nexMap: speedwalk()");
  }

  pathingStartTime = Date.now();
  clientEcho = window.echo_input;
  window.echo_input = false;
  await determinePath(s, t);
  step();
};

//speedWalk(nexmap.currentRoom, cy.$(`[area = ${id}]`))
// The aStar pathing to a collection of Nodes in an area does not seem to always path to the closest Node in the collection.
// this is a work around. Search for the first room in the path that matches the desired area.
export const areaWalk = async (areaID) => {
  let target = cy
    .elements()
    .aStar({
      root: `#${nexmap.currentRoom}`,
      goal: cy.$(`[area = ${areaID}]`),
      weight: (edge) => {
        return edge.data("weight");
      },
      directed: true,
    })
    .path.nodes()
    .find((n) => n.data("area") === areaID)
    .data("id");

  speedWalk(nexmap.currentRoom, target);
};

export const goto = (str) => {
  if (typeof str === "number") {
    str = str.toString();
  } else if (typeof str !== "string") {
    return;
  }
  console.log(`str: ${str}`);
  let findMark = userPreferences.landmarks.find(
    (e) => e.name.toLowerCase() === str.toLowerCase()
  );
  if (findMark) {
    speedWalk(nexmap.currentRoom, findMark.roomID);
    return;
  }
  console.log(`findMark: ${findMark}`);
  let areas = nexmap.findArea(str);
  console.log(`areas: ${areas}`);
  if (areas.length === 0) {
    let findAreas = nexmap.findAreas(str);
    console.log(findAreas);
    let findMarks = userPreferences.landmarks.filter((e) =>
      e.name.toLowerCase().includes(str.toLowerCase())
    );
    if (findAreas.length) {
      nexmap.display.generateTable("areaTable", findAreas, str);
    }
    if (findMarks.length) {
      nexmap.display.generateTable("landmarkTable", findMarks, str);
    }
    return;
  }

  if (areas.length === 1) {
    areaWalk(areas[0].id);
    return;
  }

  let findAreaNode = function (areaID) {
    let aStar = cy.elements().aStar({
      root: `#${nexmap.currentRoom}`,
      goal: cy.$(`[area = ${areaID}]`),
      weight: (edge) => {
        return edge.data("weight");
      },
      directed: true,
    });
    return {
      distance: aStar?.path
        ?.nodes()
        ?.findIndex((e) => e.data("area") === areaID),
      id: areaID,
    };
  };

  let closestArea = { id: 0, distance: 999999 };
  areas.forEach((a) => {
    let ar = findAreaNode(a.id);
    if (ar.distance < closestArea.distance) {
      closestArea = ar;
    }
  });
  console.log(`closestArea: ${closestArea}`);

  areaWalk(closestArea.id);
};

export const step = () => {
  if (nexmap.logging) console.log("nexMap: step()");

  if (pathCommands.length === 0) {
    if (nexmap.logging) {
      console.log("nexMap: step RETURN");
    }
    return;
  }

  let index = pathRooms.indexOf(GMCP.Room.Info.num.toString());

  if (GMCP.Room.Info.num === destination) {
    pathing = false;
    reset();
    nexmap.display.notice(
      `Pathing complete. ${(Date.now() - pathingStartTime) / 1000}s`
    );
    return;
  }

  if (index >= 0) {
    pathing = true;
    stepCommand = pathCommands[index];
  }
  if (nexmap.logging) {
    console.log(stepCommand);
  }
  send_direct(`${stepCommand}`);
};

export const determinePath = async (src, tar) => {
  if (nexmap.logging) {
    console.log(`nexMap: determinePath(${src}, ${tar})`);
  }

  pathCommands = [];
  pathRooms = [];
  let source = src || GMCP.Room.Info.num;
  let target = tar || cy.$(":selected").data("id");

  if (source === target) {
    pathing = false;
    reset();
    nexmap.display.notice(`Pathing complete. You're already there!`);
    return;
  }

  destination = target;

  let baseStar = await aStar(source, target);
  baseStar.type = "base";

  if (nexmap.logging) {
    console.log(baseStar);
  }

  // If the path is local to the area there is no need to check other fast travel options.
  if (cy.$(`#${source}`).data("area") === cy.$(`#${target}`).data("area")) {
    hybridPath(baseStar);

    return true;
  }

  //let gare = checkGare(baseStar, target);
  //let universe = checkUniverse(baseStar, target);
  //let wings = checkClouds(baseStar, target);
  let gare, universe, wings;
  [gare, universe, wings] = await Promise.all([
    checkGare(baseStar, target),
    checkUniverse(baseStar, target),
    checkClouds(baseStar, target),
  ]);
  // We include wings in the first round of checks for situations such as the
  // first outdoor room is 1 step away, but it could also be 100 steps away.
  let optimalStar = [gare, universe, wings, baseStar].reduce((a, b) => {
    if (!a) {
      return b;
    }
    if (!b) {
      return a;
    }
    return a.distance > b.distance ? b : a;
  });

  if (!optimalStar) {
    nexmap.display.notice(`No path to ${target} found.`);
    return false;
  }

  // We need to check wings again. there are situations where the universe/gare
  // path would provide a quicker outdoor exit that the clouds could then utilize. An example
  // is deep in azdun, the universe+cloud combo typically is faster.
  if (["universe", "gare"].includes(optimalStar.type)) {
    wings = await checkClouds(optimalStar, target);
    optimalStar = wings.distance < optimalStar.distance ? wings : optimalStar;
  }

  await hybridPath(optimalStar);

  return true;
};

const aStar = async (source, target) => {
  return cy.elements().aStar({
    root: `#${source}`,
    goal: `#${target}`,
    weight: (edge) => {
      return edge.data("weight");
    },
    directed: true,
  });
};

const checkGare = async (astar, tar) => {
  if (nexmap.logging) {
    console.log(`nexMap: checkGare(${astar}, ${tar})`);
  }

  if (!GMCP.Status.class.includes("Dragon")) {
    return false;
  }

  // Where is the first room on the baseline path that we could use Gare?
  let firstGareRoomIndex = astar.path
    .nodes()
    .findIndex((e) => !userPreferences.antiGareAreas.includes(e.data("area")));
  if (firstGareRoomIndex === -1) {
    return false;
  }

  // Gare room is #12695
  let gareStar = await aStar("gare", tar);
  if (!gareStar) {
    return false;
  }

  gareStar.distance += firstGareRoomIndex;
  gareStar.type = "gare";
  gareStar.path =
    firstGareRoomIndex > 0
      ? astar.path.slice(0, firstGareRoomIndex * 2 + 1).merge(gareStar.path)
      : gareStar.path;

  return gareStar;
};

const checkUniverse = async (astar, target) => {
  if (nexmap.logging) {
    console.log(`nexMap: checkUniverse(${astar}, ${target})`);
  }

  if (!userPreferences.useUniverse) {
    return;
  }

  if (!["Jester", "Occultist"].includes(GMCP.Status.class)) {
    return;
  }

  let meropis = false;
  if (nexmap.areaContinents.Meropis.includes(nexmap.currentArea)) {
    meropis = "Meropis";
  }

  // Where is the first room on the baseline path that we could use universe?
  let firstUniverseRoomIndex = astar.path
    .nodes()
    .findIndex(
      (e) => !userPreferences.antiUniverseAreas.includes(e.data("area"))
    );
  if (firstUniverseRoomIndex === -1) {
    return;
  }
  if (nexmap.logging) {
    console.log(`firstUniverseRoomIndex`, firstUniverseRoomIndex);
  }
  let universeStar = await aStar("universe", target);
  if (!universeStar) {
    return false;
  }

  universeStar.distance += firstUniverseRoomIndex;
  universeStar.type = "universe";
  universeStar.path =
    firstUniverseRoomIndex > 0
      ? astar.path
          .slice(0, firstUniverseRoomIndex * 2 + 1)
          .merge(universeStar.path)
      : universeStar.path;
  universeTarget =
    nexmap.universeRooms[meropis ? "meropis" : "main"][
      universeStar.path.nodes()[1].data("id")
    ];

  return universeStar;
};

const checkClouds = async (astar, target) => {
  // Clouds 3885
  // High clouds 4882
  // Meropis clouds room 51188
  // Meropis high clouds room 51603
  if (nexmap.logging) console.log(`nexMap: checkClouds()`);

  if (!userPreferences.useDuanathar && !userPreferences.useDuanatharan) {
    return;
  }

  let meropis = "";
  if (nexmap.areaContinents.Meropis.includes(nexmap.currentArea)) {
    meropis = "Meropis";
  }

  let firstOutdoorRoomIndex = astar.path
    .nodes()
    .findIndex(
      (e) =>
        !userPreferences.antiWingAreas.includes(e.data("area")) &&
        (e.data("userData").indoors !== "y" ||
          e.data("userData").outdoors === "y")
    );
  if (firstOutdoorRoomIndex === -1) {
    return false;
  }

  let cloudStar = await aStar("duanathar" + meropis, target);
  cloudStar.distance += firstOutdoorRoomIndex;
  cloudStar.type = "duanathar";
  cloudStar.path =
    firstOutdoorRoomIndex > 0
      ? astar.path.slice(0, firstOutdoorRoomIndex * 2 + 1).merge(cloudStar.path)
      : cloudStar.path;

  let highCloudStar = false;
  if (userPreferences.useDuanatharan) {
    highCloudStar = await aStar("duanatharan" + meropis, target);
    highCloudStar.distance += firstOutdoorRoomIndex;
    highCloudStar.type = "duanatharan";
    highCloudStar.path =
      firstOutdoorRoomIndex > 0
        ? astar.path
            .slice(0, firstOutdoorRoomIndex * 2 + 2)
            .merge(highCloudStar.path)
        : highCloudStar.path;
  }

  return highCloudStar.distance < cloudStar.distance
    ? highCloudStar
    : cloudStar;
};

// hybridPath relies on using the in game "path track" speedwalking system. This function will find special exits
// breaking the path track into sections to use special exits. The in game path track system will return an "unable to
// find a path" if there is a special exit. This will also break up paths that are greater than 100 steps away. The in
// game path track will not path greater than 100 rooms.
const hybridPath = async (optimalStar) => {
  if (nexmap.logging) {
    console.log(`nexMap: hybridPath()`);
  }

  let baseCmds = [];
  let baseRooms = [];

  for (let e of optimalStar.path.nodes()) {
    baseRooms.push(e.data("id"));
  }
  for (let e of optimalStar.path.edges()) {
    baseCmds.push(e.data("command"));
  }

  if (!nexmap.shortDirs[baseCmds[0]] && !parseInt(baseRooms[0])) {
    baseRooms.unshift(GMCP.Room.Info.num);
  }
  if (nexmap.logging) {
    console.log("hybridPath() thispc, thispr");
    console.log(baseCmds);
    console.log(baseRooms);
  }

  // This will overwrite the imaginary rooms like "Universe" "Gare" with the room number after them.
  //baseRooms = baseRooms.map((e, i) => parseInt(e) > 0 ? e : baseRooms[i+1] || GMCP.Room.Info.num)
  baseRooms = baseRooms.filter((e) => parseInt(e) > 0);
  if (nexmap.logging) {
    console.log("hybridPath() SCRUBBED");
    console.log(baseCmds);
    console.log(baseRooms);
  }
  let hybCmds = [];
  let hybRm = [GMCP.Room.Info.num];
  let pathTrackDistance = 0;

  for (let i = 0; i < baseCmds.length; i++) {
    ++pathTrackDistance;

    if (!nexmap.shortDirs[baseCmds[i]]) {
      hybRm.push(baseRooms[i + 1]);
      hybCmds.push(baseCmds[i]);
      continue;
    }

    if (nexmap.shortDirs[baseCmds[i]] && !nexmap.shortDirs[baseCmds[i + 1]]) {
      hybRm.push(baseRooms[i + 1]);
      hybCmds.push(`path track ${baseRooms[i + 1]}`);

      pathTrackDistance = 0;
      continue;
    }

    if (pathTrackDistance > 90) {
      hybRm.push(baseRooms[i]);
      hybCmds.push(`path track ${baseRooms[i]}`);
      pathTrackDistance = 0;
    }
  }

  if (nexmap.logging) {
    console.log("hybridPath() hybCmds, hybRm");
    console.log(hybCmds);
    console.log(hybRm);
  }

  pathCommands = [...hybCmds];
  pathRooms = [...hybRm];

  if (nexmap.logging) {
    console.log("FINAL hybridPath() thispc, thispr");
    console.log(pathCommands);
    console.log(pathRooms);
  }

  return true;
};

const checkAirlord = async (optimalStar, target) => {
  if (nexmap.logging) {
    console.log(`nexMap: checkAirlord(${optimalStar}, ${target})`);
  }

  if (!GMCP.Status.class.toLowerCase().includes("air")) {
    return;
  }

  let firstOutdoorRoom = optimalStar.astar.path
    .nodes()
    .find(
      (e) =>
        e.data().userData.indoors !== "y" &&
        !userPreferences.antiWingAreas.includes(e.data("area"))
    );
  let wingRoomId = firstOutdoorRoom ? firstOutdoorRoom.data("id") : 0;

  if (wingRoomId === 0) {
    return;
  }

  let cloudRooms = [...optimalStar.rooms];
  let cloudCommands = [...optimalStar.commands];
  let cloudPath = { astar: {}, command: "" };
  let highCloudPath = { astar: {}, command: "" };
  let stratospherePath = { astar: {}, command: "" };
  let g = typeof target === "object" ? target : `#${target}`;

  cloudPath.astar = cy.elements().aStar({
    root: `#3885`,
    goal: g,
    weight: (edge) => {
      return edge.data("weight");
    },
    directed: true,
  });
  cloudPath.command = "aero soar low";

  highCloudPath.astar = cy.elements().aStar({
    root: `#4882`,
    goal: g,
    weight: (edge) => {
      return edge.data("weight");
    },
    directed: true,
  });
  highCloudPath.command = "aero soar high";

  stratospherePath.astar = cy.elements().aStar({
    root: `#54173`,
    goal: g,
    weight: (edge) => {
      return edge.data("weight");
    },
    directed: true,
  });
  stratospherePath.command = "aero soar stratosphere";

  let optimalCloud = [cloudPath, highCloudPath, stratospherePath].reduce(
    (a, b) => {
      return a?.astar?.distance < b?.astar?.distance ? a : b;
    }
  );

  // Added +12 to the comparison based on 4 seconds of balance at an assumed rate of 3 rooms per second.
  if (
    optimalStar.astar.distance >
    cloudCommands.indexOf(wingRoomId) + optimalCloud.astar.distance + 15
  ) {
    cloudRooms.splice(cloudRooms.indexOf(wingRoomId) + 12);
    cloudCommands.splice(cloudRooms.indexOf(wingRoomId));
    cloudCommands.push(optimalCloud.command);

    optimalCloud.astar.path
      .nodes()
      .forEach((e) => cloudRooms.push(e.data("id")));
    optimalCloud.astar.path
      .edges()
      .forEach((e) => cloudCommands.push(e.data("command")));
  }

  return {
    astar: optimalCloud,
    rooms: cloudRooms,
    commands: cloudCommands,
    distanceModifier: 12, //4 second balance
  };
};

// IN DEVELOPMENT Not currently used for anything
/*
checkGlide(path, target) {
    if (nexmap.logging) {console.log(`nexMap: checkDash(${cmd})`)};

    let firstOutdoorRoom = path.rooms.find(e => cy.$id(e).data('userData').indoors != 'y' && !userPreferences.antiWingAreas.includes(cy.$id(e).data('area')));
    let firstIndoorRoom = path.rooms.slice(path.rooms.indexOf(firstOutdoorRoom)).find(e => cy.$id(e).data().userData.indoors == 'y');
    let galCmds = [];
    let galRm = [path.rooms[0]];
    let galIndex = -1;
    let len;
    console.log(firstOutdoorRoom);
    console.log(firstIndoorRoom);

    let glidePath = cy.elements().aStar({
        root: `#${firstOutdoorRoom}`,
        goal: `#${firstIndoorRoom}`,
        weight: (edge)=>{
            return edge.data('weight');
        },
        directed: true
    });
    glidePath.commands = [];
    glidePath.rooms = [];

    console.log(glidePath);

    glidePath.path.nodes().forEach(e => glidePath.rooms.push(e.data('id')));
    glidePath.path.edges().forEach(e => glidePath.commands.push(e.data('command')));

    glidePath.commands.forEach((e,i)=>{
        if (e != glidePath.commands[i+1]) {
            len = i-galIndex;
            
            if(len==2) {
                galCmds.push(e);
                galRm.push(glidePath.rooms[i]);    
            }
            
            galCmds.push(len > 2 ? `glide ${e} ${i-galIndex}` : e);
            galRm.push(len > 2 ? glidePath.rooms[galIndex+len+1] : glidePath.rooms[i+1]);

            galIndex=i;
        }
    })
    
    console.log(galCmds);
    console.log(galRm);
    //pathCommands = [...galCmds];
    //pathRooms = [...galRm];

},
*/

const reset = () => {
  if (nexmap.logging) console.log("nexMap: reset()");

  universeTarget = false;
  pathing = false;
  cy.$(":selected").unselect();
  pathCommands = [];
  pathRooms = [];
  destination = 0;
  stepCommand = "";
  delay = false;
  window.echo_input = clientEcho;
};

export const stop = () => {
  if (nexmap.logging) console.log("nexMap: stop()");

  if (pathing === true) {
    nexmap.display.notice("Pathing canceled");
    send_direct("path stop");
  }

  reset();
};
