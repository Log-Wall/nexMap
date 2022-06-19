call: function (alias, args = false) {
  if (!Object.keys(nexMap.aliases).includes(alias)) {
      nexMap.display.notice(`"nm  ${alias}" is not a valid command.`);
      return;
  }

  nexMap.aliases[alias](args);
},
config: function () {
  nexMap.display.configDialog();
},
save: function () {
  nexMap.settings.save();
},
find: function (args) {
  if (!/^[a-zA-z\s]+$/g.test(args)) {
      return;
  }
  
  nexMap.display.generateTable('displayTable', nexMap.findRooms(args), args.toLowerCase());
},
area: function (args) {
  if (!/^[a-zA-z'-\s]+$/g.test(args)) {
      return;
  }

  nexMap.display.generateTable('areaTable', nexMap.findAreas(args), args);
},
info: function () {
  nexMap.display.notice('Room.Info');
  print(`Name: 		${GMCP.Room.Info.name}`);
  print(`Number: 		${GMCP.Room.Info.num}`);
  print(`Area: 		${GMCP.Room.Info.area}`);
  print(`Area ID: 		${GMCP.CurrentArea.id}`);
  print(`Environment: 	${GMCP.Room.Info.environment}`);
  print(`Coordinates: 	${GMCP.Room.Info.coords}`);
  print(`Details: 		${GMCP.Room.Info.details}`);
},
goto: function (args) {
  if (/^[0-9]+$/g.test(args)) {
      cy.$(':selected').unselect()
      cy.$(`#${args}`).select()
  } else if (/^[a-zA-z'-\s]+$/g.test(args)) {
      nexMap.walker.goto(args);
  }
},
mark: function (args) {
  if (!/^[a-zA-z\s]+$/g.test(args)) {
      return;
  }
  nexMap.settings.addMark(args);
},
marks: function () {
  nexMap.display.generateTable('landmarkTable');
},
stop: function () {
  nexMap.walker.stop();
},
zoom: function (args) {
  if (!/^\d(?:.\d\d?)?$/g.test(args)) {
      return;
  }
  if(args>3)
      cy.zoom(3);
  else if (args<0.2)
      cy.zoom(0.2);
  else
      cy.zoom(parseFloat(args));
},
fit: function () {
  cy.fit();
},
refresh: function () {
  nexMap.styles.refresh();
},
wormholes: function () {
  nexMap.settings.toggle('useWormholes');
},
clouds: function () {
  nexMap.settings.toggle('useDuanathar');
  nexMap.settings.toggle('useDuanatharan');
},
walkto: function() {
  
},
npc: function(text) {
  let qry = text.toLowerCase();
  let table = async function(rr) {
      let re = new RegExp(`${rr}`, 'i');
      nexMap.mongo.db.collectionName = 'denizens';
      let results = await nexMap.mongo.db.aggregate([{$match: {name:re}}, {$sort: {name:1,area:1}}]);
      nexMap.display.generateTable('denizenTable', results, qry);
  }
  table(qry);
},
update: async function() {
  let response = await fetch('https://cdn.jsdelivr.net/gh/Log-Wall/nexMap/dist/nexMap.nxs', {cache: "no-store"});
  let data = await response.json();
  packages[packages.findIndex(e=>e.name=='nexmap')] = data;
  gmcp_save_system(false);
}