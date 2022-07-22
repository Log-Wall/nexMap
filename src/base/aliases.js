/* global GMCP, cy, nexusclient, React */
import { notice, generateTable, printHTML } from "./display";
import { findRooms, findAreas } from "./navigation";
import { walker } from "./walker";
import { toggle, save, addMark } from "./settings";
import { styles } from "./styles";
import { nexmap } from "../nexmap";

export const aliases = {
  load: function () {
    nexusclient.ui().layout().get_tab_object = function(name, gmcp) {
      switch (name) {
        case 'nexmap':
          return React.createElement(nexmap.components.Nexmap, {
            evt: nexmap.evt,
            settings: nexmap.settings.userPreferences
          });
          break;
  
        default:
          return nexusclient._ui._layout.get_tab_object_original(name, gmcp)
          break;
      }
    };

    fetch(
      "https://ire-mudlet-mapping.github.io/AchaeaCrowdmap/Map/map_mini.json",
      { cache: "no-store" }
    )
      .then((response) => response.json())
      .then(async (data) => {
        await nexmap.generateGraph(data);
        console.log("mudmap loaded");
      })
      .then(async () => {
        window.cy.mount(document.getElementById("cy"));
        await nexmap.changeRoom(GMCP.Room.Info.num);
        nexmap.styles.style();
        cy.center(`#${GMCP.Room.Info.num}`);
        nexusclient
          .reflexes()
          .enable_reflex(
            nexusclient
              .reflexes()
              .find_by_name("group", "Aliases", false, false, "nexmap3")
          );
        nexusclient
          .reflexes()
          .enable_reflex(
            nexusclient
              .reflexes()
              .find_by_name("group", "Triggers", false, false, "nexmap3")
          );
      });
  },
  call: function (alias, args = false) {
    if (!Object.keys(aliases).includes(alias)) {
      notice(`"nm  ${alias}" is not a valid command.`);
      return;
    }

    aliases[alias](args);
  },
  config: function () {
    nexmap.evt.dispatchEvent(
      new CustomEvent("nexmap-config-dialog", { detail: true })
    );
  },
  save: function () {
    save();
  },
  find: async function (args) {
    if (!/^[a-zA-z\s]+$/g.test(args)) {
      return;
    }

    generateTable("displayTable", await findRooms(args), args.toLowerCase());
  },
  area: function (args) {
    if (!/^[a-zA-z'-\s]+$/g.test(args)) {
      return;
    }

    generateTable("areaTable", findAreas(args), args);
  },
  info: function () {
    notice("Room.Info");
    printHTML(`Name: 		${GMCP.Room.Info.name}`);
    printHTML(`Number: 		${GMCP.Room.Info.num}`);
    printHTML(`Area: 		${GMCP.Room.Info.area}`);
    printHTML(`Area ID: 		${GMCP.CurrentArea.id}`);
    printHTML(`Environment: 	${GMCP.Room.Info.environment}`);
    printHTML(`Coordinates: 	${GMCP.Room.Info.coords}`);
    printHTML(`Details: 		${GMCP.Room.Info.details}`);
  },
  goto: function (args) {
    if (/^[0-9]+$/g.test(args)) {
      cy.$(":selected").unselect();
      cy.$(`#${args}`).select();
    } else if (/^[a-zA-z'-\s]+$/g.test(args)) {
      walker.goto(args);
    }
  },
  mark: function (args) {
    if (!/^[a-zA-z\s]+$/g.test(args)) {
      return;
    }
    addMark(args);
  },
  marks: function () {
    generateTable("marksTable");
  },
  stop: function () {
    walker.stop();
  },
  zoom: function (args) {
    if (!/^\d(?:.\d\d?)?$/g.test(args)) {
      return;
    }
    if (args > 3) cy.zoom(3);
    else if (args < 0.2) cy.zoom(0.2);
    else cy.zoom(parseFloat(args));
  },
  fit: function () {
    cy.fit();
  },
  refresh: function () {
    styles.refresh();
  },
  wormholes: function () {
    toggle("useWormholes");
  },
  clouds: function () {
    toggle("useDuanathar");
    toggle("useDuanatharan");
  },
  walkto: function () {},
  npc: function (text) {
    let qry = text.toLowerCase();
    let table = async function (rr) {
      let re = new RegExp(`${rr}`, "i");
      nexmap.mongo.db.collectionName = "denizens";
      let results = await nexmap.mongo.db.aggregate([
        { $match: { name: re } },
        { $sort: { name: 1, area: 1 } },
      ]);
      generateTable("npcTable", results, qry);
    };
    table(qry);
  },
  update: async function () {
    // let response = await fetch(
    //   "https://cdn.jsdelivr.net/gh/Log-Wall/nexMap/dist/nexMap.nxs",
    //   { cache: "no-store" }
    // );
    // let data = await response.json();
    // packages[packages.findIndex((e) => e.name === "nexmap")] = data;
    // gmcp_save_system(false);
  },
};
