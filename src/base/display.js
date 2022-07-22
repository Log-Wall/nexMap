/* global cy */
import { nexmap } from "../nexmap.js";
import { areaWalk } from './walker.js';
import { areaContinents } from "./helpertables.js";

export const display = {

}

let pageBreak = 20;
let pageIndex = 0;
let displayCap = {};
let displayEntries = {};

export const printHTML = (html) => {
  window.nexusclient.add_html_line(html)
};

export const notice = (txt, html = false) => {
  let msg = document.createElement('span');
  msg.setAttribute('class', 'mono');
  msg.appendChild(Object.assign(document.createElement('span'), {style: 'color:DodgerBlue', innerHTML: '[-'}));
  msg.appendChild(Object.assign(document.createElement('span'), {style: 'color:OrangeRed', innerHTML: 'nexMap'}));
  msg.appendChild(Object.assign(document.createElement('span'), {style: 'color:DodgerBlue', innerHTML: '-] '}));


  if (html) {
    msg.insertAdjacentHTML('beforeend', html);
  } else {
    msg.appendChild(Object.assign(document.createElement('span'), {style: 'color:GoldenRod', innerHTML: txt}));
  }

  printHTML(msg.outerHTML);
};

export const versionNotice = (ver) => {
  if (nexmap.nxsVersion === ver) {
    notice("You are running the latest .nxs package for nexmap.");
    return;
  }

  let msg = Object.assign(document.createElement('span'), {style: 'color:GoldenRod', innerHTML: 'Click '})
  msg.appendChild(Object.assign(document.createElement('span'), {
    id: 'nexMapUpdate',
    onclick: `nexmap.aliases.update();`,
    style: "color:white;text-decoration:underline;cursor:pointer",
    innerHTML: 'HERE'
  }));
  msg.appendChild(Object.assign(document.createElement('span'), {
    style: 'color:OrangeRed', 
    innerHTML: ' for the latest features/fixes.'
  }));

  notice(`You are running .nxs package version ${nexmap.nxsVersion}.`);
  notice(`There is an update available to your nexMap .nxs package.`);
  notice(msg, true);
};

export const generateTable = (table, entries = false, caption = false) => {
  pageIndex = 0;
  displayEntries = entries;
  displayCap = caption;
  switch (table) {
    case 'displayTable':
      displayTable();
      break;
    case 'npcTable':
      npcTable();
      break;
    case 'marksTable':
      marksTable();
      break;
    default:
      break;
  }
};

export const click = {
  room(id) {
    if (typeof parseInt(id) !== "number") {
      console.log(id);
      return;
    }

    cy.$(":selected").unselect();
    cy.$(`#${id}`).select();
  },
  area(id) {
    if (typeof id !== "number") {
      console.log(id);
      return;
    }

    areaWalk(id);
  },
  denizen(id) {
    let den = displayEntries.find((e) => e.id === id);
    console.log(den);
    let rm = den.room;
    let idx = rm.indexOf(nexmap.currentRoom);
    cy.$(":selected").unselect();
    if (idx === -1) {
      cy.$(`#${rm[0]}`).select();
    } else {
      cy.$(`#${rm[idx + 1]}`).select();
    }
  },
  denizenRemove(id) {
    let msg = displayEntries.find((e) => e.id === id);
    console.log(`Denizen Remove table click: ${msg}`);
    return msg;
  },
};

const getPagination = (startIndex) => {
  let pagination;
  if (Math.ceil(displayEntries.length / pageBreak) > pageIndex + 1) {
    pagination = Object.assign(document.createElement('span'), {
      style: "color:Goldenrod",
      innerHTML: `Displaying ${startIndex + pageBreak} of ${displayEntries.length}.`
    });
    pageIndex++;
    pagination.appendChild(Object.assign(document.createElement('span'), {
      style: "color:Goldenrod", 
      innerHTML: " Click for "
    }));
    pagination.appendChild(Object.assign(document.createElement('a'), {
      style: "cursor:pointer;color:Ivory;text-decoration:underline;", 
      innerHTML: "MORE",
      className: "nexmap-pagination"
    }));
  } else {
    pagination = Object.assign(document.createElement('span'), {
      style: "color:Goldenrod", 
      innerHTML: `Displaying ${displayEntries.length} of ${displayEntries.length}.`
    });
  }
  
  return pagination;
}

const getTable = (id, columns = [1,2,3,4]) => {
  let table = Object.assign(document.createElement('table'), {
    className: `mono, ${id}`,
    style: "width:95%;max-width:100%;border:1px solid GoldenRod;border-spacing:0px",
  });
  table.createCaption();
  table.createTHead();
  table.createTBody();

  let caption = document.createElement('span');
  caption.setAttribute('class', 'mono');
  caption.appendChild(Object.assign(document.createElement('span'), {style: 'color:DodgerBlue', innerHTML: '[-'}));
  caption.appendChild(Object.assign(document.createElement('span'), {style: 'color:OrangeRed', innerHTML: 'nexMap'}));
  caption.appendChild(Object.assign(document.createElement('span'), {style: 'color:DodgerBlue', innerHTML: '-]'}));
  caption.appendChild(Object.assign(document.createElement('span'), {style: 'color:GoldenRod', innerHTML: 'Displaying matches for '}));
  caption.appendChild(Object.assign(document.createElement('span'), {style: 'color:LawnGreen', innerHTML: displayCap}));
  table.caption.appendChild(caption);

  let header  = Object.assign(document.createElement('tr'), {style: "text-align:left;color:Ivory"});
  for(let i = 0; i < columns.length; i++) {
    header.appendChild(Object.assign(document.createElement('th'), {style: `width:${i===0?'5em':'auto'}`, innerHTML: columns[i]}))
  }
  table.tHead.appendChild(header);
  return table;
}

export const displayTable = () => {
  let entries = displayEntries;
  let table = getTable('nexmap-displayTable', ['Num', 'Name', 'Area', 'Continent']);

  let startIndex = pageIndex > 0 ? pageIndex * pageBreak : 0;
  for (let i = startIndex; i < entries.length && i < startIndex + pageBreak; i++) {
    let row  = Object.assign(document.createElement('tr'), {style: "cursor:pointer;color:dimgrey;"});
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:grey",
      innerHTML: entries[i].data("id")
    }));
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:gainsboro;text-decoration:underline",
      innerHTML: entries[i].data("name")
    }));
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:grey",
      innerHTML: entries[i].data("areaName")
    }));
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:grey",
      innerHTML: entries[i].data("continent")
    }));
    table.tBodies[0].appendChild(row);
  }

  printHTML(table.outerHTML);
  printHTML(getPagination(startIndex).outerHTML);

  // Here we add the events to the table after the table has been added to the DOM
  // Events are not included in outerHTML.
  let tableHTML = document.getElementsByClassName('nexmap-displayTable');
  for(let i = 1;i < tableHTML[(tableHTML.length/2)-1].rows.length; i++) {
    // we do length/2-1 because 3.0 creates duplicates of every line for the scrollback buffer.
    tableHTML[(tableHTML.length/2)-1].rows[i].onclick = (e)=>{console.log(`onclick: ${e.target.parentElement.cells[0].innerHTML}`);nexmap.aliases.goto(e.target.parentElement.cells[0].innerHTML)};
  }

  
  let pagination = document.getElementsByClassName('nexmap-pagination');
  if (pagination.length) {
    pagination[(pagination.length/2)-1].onclick = displayTable;
  }
};

export const npcTable = () => {
  let entries = displayEntries;
  let table = getTable('nexmap-npcTable', ['ID', 'Name', 'Room', 'Area', 'Continent']);

  let startIndex = pageIndex > 0 ? pageIndex * pageBreak : 0;
  for (let i = startIndex; i < entries.length && i < startIndex + pageBreak; i++) {
    let row  = Object.assign(document.createElement('tr'), {style: "cursor:pointer;color:dimgrey;"});
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:grey",
      innerHTML: `${entries[i].id}`
    }));
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:gainsboro;text-decoration:underline",
      innerHTML: `${entries[i].name}`
    }));
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:grey",
      innerHTML: `${entries[i].room}`
    }));
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:grey",
      innerHTML: `${entries[i].area.name}`
    }));
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:grey",
      innerHTML: `${Object.keys(areaContinents).find(e => 
        areaContinents[e].includes(nexmap.mudmap.areas.find(e => 
          e.name===entries[i].area.name)?.id))}`
    }));
    table.tBodies[0].appendChild(row);
  }

  printHTML(table.outerHTML);
  printHTML(getPagination(startIndex).outerHTML);

  // Here we add the events to the table after the table has been added to the DOM
  // Events are not included in outerHTML.
  let tableHTML = document.getElementsByClassName('nexmap-npcTable');
  tableHTML = tableHTML[(tableHTML.length/2)-1];
  for(let i = 0;i < tableHTML.rows.length; i++) {
    tableHTML.rows[i].onclick = function() {console.log('click works');nexmap.aliases.goto(this.cells[2].innerHTML)};
  }

  
  let pagination = document.getElementsByClassName('nexmap-pagination');
  if (pagination.length) {
    pagination[(pagination.length/2)-1].onclick = npcTable;
  }
};

export const marksTable = () => {
  let entries = nexmap.settings.userPreferences.landmarks;
  let table = getTable('nexmap-marksTable', ['Num', 'Name', 'Room', 'Area', 'Continent']);

  let startIndex = pageIndex > 0 ? pageIndex * pageBreak : 0;
  for (let i = startIndex; i < entries.length && i < startIndex + pageBreak; i++) {
    let node = cy.$id(entries[i].roomID);
    let row  = Object.assign(document.createElement('tr'), {style: "cursor:pointer;color:dimgrey;"});
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:grey",
      innerHTML: entries[i].roomID
    }));
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:gainsboro;text-decoration:underline",
      innerHTML: entries[i].name
    }));
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:grey",
      innerHTML: `${node.data("name")}`
    }));
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:grey",
      innerHTML: `${node.data("userData")["Game Area"]}(${node.data("area")})`
    }));
    row.appendChild(Object.assign(document.createElement('td'), {
      style: "color:grey",
      innerHTML: node.data("continent")
    }));
    table.tBodies[0].appendChild(row);
  }

  printHTML(table.outerHTML);
  printHTML(getPagination(startIndex).outerHTML);

  let tableHTML = document.getElementsByClassName('nexmap-marksTable');
  tableHTML = tableHTML[(tableHTML.length/2)-1];
  for(let i = 0;i < tableHTML.rows.length; i++) {
    tableHTML.rows[i].onclick = function() {console.log('click works');nexmap.aliases.goto(this.cells[2].innerHTML)};
  }

  
  let pagination = document.getElementsByClassName('nexmap-pagination');
  if (pagination.length) {
    pagination[(pagination.length/2)-1].onclick = npcTable;
  }
};