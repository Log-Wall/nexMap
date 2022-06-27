/* global GMCP, cy, gmcp_save_system, packages */
import { notice, generateTable, printHTML } from "./display";
import { findRooms, findAreas } from "./navigation";
import { goto, stop } from "./walker";
import { toggle, save, addMark } from "./settings";
import { styles } from "./styles";
import { nexmap } from "./nexmap";

export const aliases = {
  call: function (alias, args = false) {
    if (!Object.keys(aliases).includes(alias)) {
      notice(`"nm  ${alias}" is not a valid command.`);
      return;
    }

    aliases[alias](args);
  },
  config: function () {
    //configDialog();
  },
  save: function () {
    save();
  },
  find: function (args) {
    if (!/^[a-zA-z\s]+$/g.test(args)) {
      return;
    }

    generateTable(
      "displayTable",
      findRooms(args),
      args.toLowerCase()
    );
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
      goto(args);
    }
  },
  mark: function (args) {
    if (!/^[a-zA-z\s]+$/g.test(args)) {
      return;
    }
    addMark(args);
  },
  marks: function () {
    generateTable("landmarkTable");
  },
  stop: function () {
    stop();
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
      nexmap.db.collectionName = "denizens";
      let results = await nexmap.db.aggregate([
        { $match: { name: re } },
        { $sort: { name: 1, area: 1 } },
      ]);
      generateTable("denizenTable", results, qry);
    };
    table(qry);
  },
  update: async function () {
    let response = await fetch(
      "https://cdn.jsdelivr.net/gh/Log-Wall/nexMap/dist/nexMap.nxs",
      { cache: "no-store" }
    );
    let data = await response.json();
    packages[packages.findIndex((e) => e.name === "nexmap")] = data;
    gmcp_save_system(false);
  },
};
