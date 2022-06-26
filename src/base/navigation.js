/* global GMCP, cy, nexMap_tab, printHTML */
import { toggle, userPreferences } from "./settings.js";
import { pathing, step, determinePath } from "./walker.js";
import { styles } from "./styles.js";
import { notice, generateTable } from "./display.js";
import { generateExits } from "./graph.js";
import { nexmap } from "./nexmap.js";
import { denizenEntries, collectDenizens, collectShrines } from './mongo.js';

export const onGMCP = async (method, args) => {
  switch (method) {
    case "Room.Info":
      GMCP.Room.Info = args;

      // If we are in the wilderness or sailing. Hide the tab and display the default
      // Nexus map window for map display.
      // nexMap_tab is from the custom tab package.
      if (args.ohmap) {
        nexMap_tab.deactivate();
        return;
      } else if (!nexMap_tab.active) {
        nexMap_tab.activate();
        styles.refresh();
        cy.center(`#${GMCP.Room.Info.num}`);
      }

      await changeRoom(GMCP.Room.Info.num);

      if (
        denizenEntries.length > 0 &&
        typeof Realm != "undefined" &&
        GMCP.Char.Items.List.location === "room" &&
        GMCP.Char.Items.List.items.length > 0
      ) {
        await collectDenizens();
        await collectShrines();
      }

      if (pathing) step();
      break;

    case "Char.Items.List":
      GMCP.Char.Items.List = args;
      break;

    case "Char.Status":
      if ((args.class === "Serpent" || userPreferences.vibratingStick) && !userPreferences.useWormhole)
        toggle("useWormholes");
      break;
    default:
      break;
  }
};

export const farseeLocal = async (target, room) => {
  let tar = cy
    .nodes()
    .find((n) => n.data("name") === room)
    .data("id");
  //let path = determinePath(nexmap.currentRoom, tar);
  let msg = document.createElement('span');
  msg.setAttribute('id', 'farsee');

  msg.appendChild(Object.assign(document.createElement('span'), {innerHTML: 'You see that '}));
  msg.appendChild(Object.assign(document.createElement('span'), {style: 'color:goldenrod', innerHTML: target}));
  msg.appendChild(Object.assign(document.createElement('span'), {innerHTML: ' is at '}));
  msg.appendChild(Object.assign(document.createElement('span'), {
    id: 'farsee',
    style: "color:White;text-decoration:underline;cursor:pointer",
    onclick: `walker.speedWalk(${nexmap.currentRoom}, ${tar})`,
    innerHTML: `"${room}"`
}));
  printHTML(msg[0].outerHTML);
  
  printHTML(
    Object.assign(document.createElement('span'), {
        innerHTML: `[${determinePath(nexmap.currentRoom, tar).rawPath.join(", ")}]`
    })
  );

  return true;
};

export const farseeArea = async (target, area) => {
  let areas = findArea(`${area}`);

  if (!areas.length) {
    console.log(`${area}`);
    return false;
  }

  let msg = document.createElement('span');
  msg.setAttribute('id', 'farsee');

  msg.appendChild(Object.assign(document.createElement('span'), {innerHTML: 'Though too far away to accurately perceive details, you see that '}));
  msg.appendChild(Object.assign(document.createElement('span'), {style: 'color:goldenrod', innerHTML: target}));
  msg.appendChild(Object.assign(document.createElement('span'), {innerHTML: ' is in '}));
  
  let link = Object.assign(document.createElement('span'), {
    id: 'farsee',
    style: "color:White;text-decoration:underline;cursor:pointer",
    onclick: `display.click.area(${JSON.stringify(areas[0].id)});`,
    innerHTML: `"${area}"`
});

  if (areas.length > 1) {
    msg.appendChild(Object.assign(document.createElement('span'), {innerHTML: area}));
    printHTML(msg[0].outerHTML);
    generateTable("areaTable", areas, area);
  } else if (areas.length === 1) {
    msg.appendChild(link);
    printHTML(msg[0].outerHTML);
  } else {
    msg.appendChild(Object.assign(document.createElement('span'), {innerHTML: area}));
    printHTML(msg[0].outerHTML);
    notice("nothing found");
  }

  return true;
};

export const stopWatch = () => {
  let t = (Date.now() - nexmap.loggingTime) / 1000;

  if (nexmap.logging) console.log(`${t}s`);

  return t;
};

export const findRoom = async (roomNum) => {
  if (nexmap.logging) console.log(` findRoom(${nexmap.roomNum})`);

  let area = nexmap.mudmap.areas.find((e) => e.rooms.find((e2) => e2.id === roomNum));

  if (typeof area === "undefined") {
    console.log(`Area ${roomNum} not mapped`);
    return false;
  }

  let rm = area.rooms.find((e3) => e3.id === roomNum);
  if (nexmap.logging) {
    console.log(rm);
  }
  printHTML(JSON.stringify(rm));
  console.log(rm);
  return true;
};

// Returns a collection of Nodes matching the room NAME
export const findRooms = async (search) => {
  if (nexmap.logging) console.log(` findRoom(${search})`);

  let qry = cy.nodes().filter((e) => {
    if (
      e.data("name") &&
      e.data("name").toLowerCase().includes(search.trim().toLowerCase())
    )
      return true;
    else return false;
  });

  if (typeof qry === "undefined") {
    console.log(`Rooms matching ${search} not found.`);
    return false;
  } else {
    return qry;
  }
};

// Returns a collection of JSON area objects.
// JSON areas have custom names that do not always match the GMCP area names.
// The GMCP area names are stored as userData in the room objects. Searches all user data for exact matches,
// then returns the area containing the matched room.
export const findArea = async (search) => {
  let areas = nexmap.mudmap.areas.filter((e) =>
    e.rooms.find(
      (e2) =>
        e2?.userData?.["Game Area"]?.toLowerCase() === search.toLowerCase()
    )
  );

  if (typeof areas === "undefined") {
    console.log(`Area not found`);
    return false;
  }

  return areas;
};

// Filters for possible matching areas rather than exact matches.
export const findAreas = async (search) => {
  let areas = nexmap.mudmap.areas.filter((e) =>
    e.rooms.find((e2) =>
      e2?.userData?.["Game Area"]?.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (typeof areas === "undefined") {
    console.log(`Area not found`);
    return false;
  }

  return areas;
};

export const changeArea = async (area, z, override = false) => {
  if (nexmap.logging) console.log(` changeArea(${area} ${z})`);

  if (area === nexmap.currentArea && z === nexmap.currentZ && !override) {
    if (nexmap.logging) {
      console.log(` changeArea() returned`);
    }
    return;
  }

  nexmap.currentArea = area;
  nexmap.currentZ = z;

  cy.$(".areaDisplay").removeClass("areaDisplay");
  cy.$(".pseudo").remove();
  let x = cy
    .nodes()
    .filter(
      (e) =>
        e.data("area") === nexmap.currentArea && e.data("z") === nexmap.currentZ
    );
  x.addClass("areaDisplay");
  generateExits(nexmap.currentArea, nexmap.currentZ);
  cy.center(`#${GMCP?.Room?.Info?.num || 436}`);
  return true;
};

export const changeRoom = async (id) => {
  if (nexmap.logging) console.log(` changeRoom(${id})`);

  if (id === nexmap.currentRoom) return;

  if (cy.$id(id).hasClass("currentRoom") || !cy.$id(id).length) return;

  let room = cy.$id(id);

  cy.startBatch();
  cy.$(".currentRoom").removeClass("currentRoom"); //remove the class from the previous room.
  room.addClass("currentRoom");

  await changeArea(cy.$id(id).data("area"), cy.$id(id).position().z);
  cy.endBatch();

  cy.center(`#${id}`);
  document.getElementById("currentRoomLabel").innerHTML = `${room.data(
    "areaName"
  )}: ${room.data("name")} (${GMCP.Room.Info.num})`;
  document.getElementById("currentExitsLabel").innerHTML = `Exits: ${room
    .data("exits")
    .join(", ")}`;
  /*
  $('.clickableExitSpace').remove();
  $('.clickableExit').remove();
  cy.$id(GMCP.Room.Info.num).data('exits').forEach((e, i) => {
      $('<span></span>', {class: 'clickableExit', style: 'text-decoration:underline;cursor:pointer'})
          .text(`${e}`)
          .on('click', function() {send_direct(this.innerText)})
          .appendTo('#currentExitsLabel');
      $('<span></span>', {class: 'clickableExitSpace'})
          .text(`${i == cy.$id(GMCP.Room.Info.num).data('exits').length - 1 ? '' : ', '}`)
          .appendTo('#currentExitsLabel');
  });
*/
  nexmap.currentRoom = id;
};
