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
  console.log('getTable called');
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
  for(let i = 1;i < tableHTML[tableHTML.length-1].rows.length; i++) {
    tableHTML[tableHTML.length-1].rows[i].onclick = (e)=>{nexmap.aliases.goto(e.target.parentElement.cells[0].innerHTML)};
  }

  
  let pagination = document.getElementsByClassName('nexmap-pagination');
  if (pagination.length) {
    pagination[pagination.length-1].onclick = displayTable;
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
  tableHTML = tableHTML[tableHTML.length-1];
  for(let i = 0;i < tableHTML.rows.length; i++) {
    tableHTML.rows[i].onclick = function() {console.log('click works');nexmap.aliases.goto(this.cells[2].innerHTML)};
  }

  
  let pagination = document.getElementsByClassName('nexmap-pagination');
  if (pagination.length) {
    pagination[pagination.length-1].onclick = npcTable;
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

  // Here we add the events to the table after the table has been added to the DOM
  // Events are not included in outerHTML.
  let tableHTML = document.getElementById('nexmap-displaytable');
  for(let i = 0;i < tableHTML.rows.length; i++) {
    tableHTML.rows[i].onclick = function() {nexmap.aliases.goto(this.cells[0].innerHTML)};
  }

  document.getElementById('nexmap-pagination').onclick = displayTable;
};

// export const landmarkTable = (marks = false, caption = false) => {
//   let entries = marks ? marks : nexmap.settings.userPreferences.landmarks;

//   let tab = $("<table></table>", {
//     class: "mono",
//     style: "max-width:100%;border:1px solid GoldenRod;border-spacing:0px",
//   });
//   if (pageIndex === 0) {
//     let cap = $("<caption></caption>", {
//       style: "text-align:left",
//     }).appendTo(tab);
//     $("<span></span>", {
//       style: "color:DodgerBlue",
//     })
//       .text("[-")
//       .appendTo(cap);
//     $("<span></span>", {
//       style: "color:OrangeRed",
//     })
//       .text("nexMap")
//       .appendTo(cap);
//     $("<span></span>", {
//       style: "color:DodgerBlue",
//     })
//       .text("-] ")
//       .appendTo(cap);
//     $("<span></span>", {
//       style: "color:GoldenRod",
//     })
//       .text("Displaying landmarks matching ")
//       .appendTo(cap);
//     $("<span></span>", {
//       style: "font-weight:bold;color:LawnGreen",
//     })
//       .text(caption ? caption : "All")
//       .appendTo(cap); //fix

//     let header = $("<tr></tr>", {
//       style: "text-align:left;color:Ivory",
//     }).appendTo(tab);
//     $("<th></th>", {
//       style: "width:5em",
//     })
//       .text("")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:5em",
//     })
//       .text("Num")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:auto",
//     })
//       .text("Name")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:auto",
//     })
//       .text("Room")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:auto",
//     })
//       .text("Area")
//       .appendTo(header);
//   } else {
//     let header = $("<tr></tr>", {
//       style: "text-align:left;color:Ivory",
//     }).appendTo(tab);
//     $("<th></th>", {
//       style: "width:5em",
//     })
//       .text("")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:5em",
//     })
//       .text("")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:auto",
//     })
//       .text("")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:auto",
//     })
//       .text("")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:auto",
//     })
//       .text("")
//       .appendTo(header);
//   }

//   let startIndex = pageIndex > 0 ? pageIndex * pageBreak : 0;
//   for (
//     let i = startIndex;
//     i < entries.length && i < startIndex + pageBreak;
//     i++
//   ) {
//     let node = cy.$id(entries[i].roomID);
//     let row = $("<tr></tr>", {
//       style: "cursor:pointer;color:dimgrey;",
//     }).appendTo(tab);
//     $("<td></td>", {
//       style: "color:#6b5b95;text-decoration:underline",
//       onclick: `nexmap.settings.removeMark(${JSON.stringify(
//         entries[i].name
//       )});`,
//     })
//       .text("[X]")
//       .appendTo(row);
//     $("<td></td>", {
//       style: "color:#878f99",
//       onclick: `click.room(${JSON.stringify(entries[i].roomID)});`,
//     })
//       .text(i)
//       .appendTo(row);
//     $("<td></td>", {
//       style: "color:#a2b9bc;text-decoration:underline",
//       onclick: `click.room(${JSON.stringify(entries[i].roomID)});`,
//     })
//       .text(`"${entries[i].name}"`)
//       .appendTo(row);
//     $("<td></td>", {
//       style: "color:#b2ad7f",
//       onclick: `click.room(${JSON.stringify(entries[i].roomID)});`,
//     })
//       .text(`${node.data("name")}(${node.data("id")})`)
//       .appendTo(row); // Room name(id)
//     $("<td></td>", {
//       style: "color:#b2ad7f",
//       onclick: `click.room(${JSON.stringify(entries[i].roomID)});`,
//     })
//       .text(`${node.data("userData")["Game Area"]}(${node.data("area")})`)
//       .appendTo(row);
//   }

//   printHTML(tab[0].outerHTML);

//   let pagination;
//   if (Math.ceil(entries.length / pageBreak) > pageIndex + 1) {
//     pagination = $("<span></span>", {
//       style: "color:Goldenrod",
//     }).text(`Displaying ${startIndex + pageBreak} of ${entries.length}.`);
//     pageIndex++;
//     $("<span></span>", {
//       style: "color:Goldenrod",
//     })
//       .text(" Click for ")
//       .appendTo(pagination);
//     $("<a></a>", {
//       style: "cursor:pointer;color:Ivory;text-decoration:underline;",
//       onclick: "landmarkTable()",
//     })
//       .text("MORE")
//       .appendTo(pagination);
//   } else {
//     pagination = $("<span></span>", {
//       style: "color:Goldenrod",
//     }).text(`Displaying ${entries.length} of ${entries.length}.`);
//   }

//   printHTML(pagination[0].outerHTML);
// };

// export const areaTable = () => {
//   let entries = displayEntries;
//   let caption = displayCap;
//   let tab = $("<table></table>", {
//     class: "mono",
//     style: "max-width:100%;border:1px solid GoldenRod;border-spacing:0px",
//   });
//   if (pageIndex == 0) {
//     let cap = $("<caption></caption>", {
//       style: "text-align:left",
//     }).appendTo(tab);
//     $("<span></span>", {
//       style: "color:DodgerBlue",
//     })
//       .text("[-")
//       .appendTo(cap);
//     $("<span></span>", {
//       style: "color:OrangeRed",
//     })
//       .text("nexMap")
//       .appendTo(cap);
//     $("<span></span>", {
//       style: "color:DodgerBlue",
//     })
//       .text("-] ")
//       .appendTo(cap);
//     $("<span></span>", {
//       style: "color:GoldenRod",
//     })
//       .text("Displaying possible areas matching ")
//       .appendTo(cap);
//     $("<span></span>", {
//       style: "font-weight:bold;color:LawnGreen",
//     })
//       .text(caption)
//       .appendTo(cap); //fix

//     let header = $("<tr></tr>", {
//       style: "text-align:left;color:Ivory",
//     }).appendTo(tab);
//     $("<th></th>", {
//       style: "width:5em",
//     })
//       .text("Num")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:auto",
//     })
//       .text("Area Name")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:auto",
//     })
//       .text("Room Count")
//       .appendTo(header);
//   } else {
//     let header = $("<tr></tr>", {
//       style: "text-align:left;color:Ivory",
//     }).appendTo(tab);
//     $("<th></th>", {
//       style: "width:5em",
//     })
//       .text("")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:auto",
//     })
//       .text("")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:auto",
//     })
//       .text("")
//       .appendTo(header);
//   }

//   let startIndex = pageIndex > 0 ? pageIndex * pageBreak : 0;
//   for (
//     let i = startIndex;
//     i < entries.length && i < startIndex + pageBreak;
//     i++
//   ) {
//     let row = $("<tr></tr>", {
//       style: "cursor:pointer;color:dimgrey;",
//     }).appendTo(tab);
//     $("<td></td>", {
//       style: "color:grey",
//       onclick: `click.area(${JSON.stringify(entries[i].id)});`,
//     })
//       .text(entries[i].id)
//       .appendTo(row);
//     $("<td></td>", {
//       style: "color:gainsboro;text-decoration:underline",
//       onclick: `click.area(${JSON.stringify(entries[i].id)});`,
//     })
//       .text(entries[i].name)
//       .appendTo(row);
//     $("<td></td>", {
//       onclick: `click.area(${JSON.stringify(entries[i].id)});`,
//     })
//       .text(entries[i].roomCount)
//       .appendTo(row);
//   }

//   printHTML(tab[0].outerHTML);

//   let pagination;
//   if (Math.ceil(entries.length / pageBreak) > pageIndex + 1) {
//     pagination = $("<span></span>", {
//       style: "color:Goldenrod",
//     }).text(`Displaying ${startIndex + pageBreak} of ${entries.length}.`);
//     pageIndex++;
//     $("<span></span>", {
//       style: "color:Goldenrod",
//     })
//       .text(" Click for ")
//       .appendTo(pagination);
//     $("<a></a>", {
//       style: "cursor:pointer;color:Ivory;text-decoration:underline;",
//       onclick: "areaTable()",
//     })
//       .text("MORE")
//       .appendTo(pagination);
//   } else {
//     pagination = $("<span></span>", {
//       style: "color:Goldenrod",
//     }).text(`Displaying ${entries.length} of ${entries.length}.`);
//   }

//   printHTML(pagination[0].outerHTML);
// };

// export const denizenTable = () => {
//   let entries = displayEntries;
//   let caption = displayCap;

//   let tab = $("<table></table>", {
//     class: "mono",
//     style:
//       "table-layout:fixed;max-width:100%;border:1px solid GoldenRod;border-spacing:0px;padding:0 3px 0 3px",
//   });
//   if (pageIndex === 0) {
//     let cap = $("<caption></caption>", {
//       style: "text-align:left",
//     }).appendTo(tab);
//     $("<span></span>", {
//       style: "color:DodgerBlue",
//     })
//       .text("[-")
//       .appendTo(cap);
//     $("<span></span>", {
//       style: "color:OrangeRed",
//     })
//       .text("nexMap")
//       .appendTo(cap);
//     $("<span></span>", {
//       style: "color:DodgerBlue",
//     })
//       .text("-] ")
//       .appendTo(cap);
//     $("<span></span>", {
//       style: "color:GoldenRod",
//     })
//       .text("Displaying denizens matching ")
//       .appendTo(cap);
//     $("<span></span>", {
//       style: "font-weight:bold;color:LawnGreen",
//     })
//       .text(caption ? caption : "All")
//       .appendTo(cap); //fix

//     let header = $("<tr></tr>", {
//       style: "text-align:left;color:Ivory",
//     }).appendTo(tab);
//     $("<th></th>", {
//       style: "width:5ch",
//     })
//       .text("")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:8ch",
//     })
//       .text("ID")
//       .appendTo(header);
//     $("<th></th>", {
//       //style: 'width:25%'
//     })
//       .text("Name")
//       .appendTo(header);
//     $("<th></th>", {
//       //style: 'padding:0 10px 0 0'
//     })
//       .text("Room")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:25%;padding:0 0 0 10px",
//     })
//       .text("Area")
//       .appendTo(header);
//   } else {
//     let header = $("<tr></tr>", {
//       style: "text-align:left;color:Ivory",
//     }).appendTo(tab);
//     $("<th></th>", {
//       style: "width:5ch",
//     })
//       .text("")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:8ch",
//     })
//       .text("")
//       .appendTo(header);
//     $("<th></th>", {
//       //style: 'width:25%'
//     })
//       .text("")
//       .appendTo(header);
//     $("<th></th>", {
//       //style: 'padding:0 0 0 10px'
//     })
//       .text("")
//       .appendTo(header);
//     $("<th></th>", {
//       style: "width:25%;padding:0 0 0 10px",
//     })
//       .text("")
//       .appendTo(header);
//   }

//   let startIndex = pageIndex > 0 ? pageIndex * pageBreak : 0;
//   for (
//     let i = startIndex;
//     i < entries.length && i < startIndex + pageBreak;
//     i++
//   ) {
//     let row = $("<tr></tr>", {
//       style: "cursor:pointer;color:dimgrey;",
//     }).appendTo(tab);
//     $("<td></td>", {
//       style: "color:#6b5b95;text-decoration:underline",
//       onclick: `nexmap.settings.click.removeDenizen(${JSON.stringify(
//         entries[i].id
//       )});`,
//     })
//       .text("[X]")
//       .appendTo(row);
//     $("<td></td>", {
//       style: "color:#878f99",
//       onclick: `click.denizen(${JSON.stringify(entries[i].id)});`,
//     })
//       .text(`${entries[i].id}`)
//       .appendTo(row);
//     $("<td></td>", {
//       style: "color:#a2b9bc;text-decoration:underline",
//       onclick: `click.denizen(${JSON.stringify(entries[i].id)});`,
//     })
//       .text(`${entries[i].name}`)
//       .appendTo(row);
//     $("<td></td>", {
//       style: "color:#b2ad7f;overflow:hidden;white-space:nowrap",
//       onclick: `click.denizen(${JSON.stringify(entries[i].id)});`,
//     })
//       .text(`${entries[i].room}`)
//       .appendTo(row); // Room name(id)
//     $("<td></td>", {
//       style: "color:#b2ad7f;width 25%;padding:0 0 0 10px",
//       onclick: `click.denizen(${JSON.stringify(entries[i].id)});`,
//     })
//       .text(`${entries[i].area.name}`)
//       .appendTo(row);
//   }

//   printHTML(tab[0].outerHTML);

//   let pagination;
//   if (Math.ceil(entries.length / pageBreak) > pageIndex + 1) {
//     pagination = $("<span></span>", {
//       style: "color:Goldenrod",
//     }).text(`Displaying ${startIndex + pageBreak} of ${entries.length}.`);
//     pageIndex++;
//     $("<span></span>", {
//       style: "color:Goldenrod",
//     })
//       .text(" Click for ")
//       .appendTo(pagination);
//     $("<a></a>", {
//       style: "cursor:pointer;color:Ivory;text-decoration:underline;",
//       onclick: "denizenTable()",
//     })
//       .text("MORE")
//       .appendTo(pagination);
//   } else {
//     pagination = $("<span></span>", {
//       style: "color:Goldenrod",
//     }).text(`Displaying ${entries.length} of ${entries.length}.`);
//   }

//   printHTML(pagination[0].outerHTML);
// };

// export const userCommands = () => {
//   let cmds = [
//     {
//       cmd: "nm load",
//       txt: "Initial load of the map. There are a few seconds of degraded performance while the full model is loaded.",
//     },
//     {
//       cmd: "nm config",
//       txt: "Display all user configuration options.",
//     },
//     {
//       cmd: "nm save",
//       txt: "Saves the current user configuration settings.",
//     },
//     {
//       cmd: "nm find <string>",
//       txt: "Replaces the functionality of the mapdb package. Displays all rooms matching the phrase. Clicking any entry on the table will begin pathing.",
//     },
//     {
//       cmd: "nm area <string>",
//       txt: "Searches for areas matching the provided string. Displays in table format with click to go functionality.",
//     },
//     {
//       cmd: "nm npc <string>",
//       txt: "Searches for NPCs matching the provided string. Displays in table format with click to go functionality.",
//     },
//     {
//       cmd: "nm info",
//       txt: "Displays the current rooms GMCP information.",
//     },
//     {
//       cmd: "nm goto <####>",
//       txt: "Calculates the most efficient path to the target room. Will use wings/wormholes/dash/gallop if enabled by the user in settings.",
//     },
//     {
//       cmd: "nm goto <string>",
//       txt: 'Will path to a nexMap landmark or game area matching the string "nm goto ashtan". If no matches are found, tables of possible matches will be displayed.',
//     },
//     {
//       cmd: "nm mark <string>",
//       txt: 'Creates a landmark for the current room using the string label provided. "nm mark secret place". Pathing to these landmarks uses the goto syntax "nm goto secret place".',
//     },
//     {
//       cmd: "nm marks",
//       txt: 'Displays a list all stored landmarks with click to go functionality as well as a "[X]" click to remove option.',
//     },
//     {
//       cmd: "nm stop",
//       txt: "Cancels the current pathing.",
//     },
//     {
//       cmd: "nm zoom",
//       txt: "Manual zoom control of the map. Accepts values between 0.2 - 3.0",
//     },
//     {
//       cmd: "nm refresh",
//       txt: "Refresh the graphical display of the map. Fail safe for display issues.",
//     },
//     {
//       cmd: "nm wormholes",
//       txt: "Toggles the use of wormholes for pathing.",
//     },
//     {
//       cmd: "nm clouds",
//       txt: "Toggles the use of clouds, both high and low, for pathing.",
//     },
//     {
//       cmd: "(map)",
//       txt: "Selecting any room on the map via mouse click will path to the selected room.",
//     },
//     {
//       cmd: "(map)",
//       txt: "A mouse click on the map anywhere other than a room will deselect the current selection and stop any active pathing.",
//     },
//   ];

//   let tab = $("<table></table>", {
//     class: "mono",
//     style: "max-width:100%;border:1px solid GoldenRod;border-spacing:2px",
//   });
//   let header = $("<tr></tr>", {
//     style: "text-align:left;color:Ivory",
//   }).appendTo(tab);
//   $("<th></th>", {
//     style: "width:10em",
//   })
//     .text("Command")
//     .appendTo(header);
//   $("<th></th>", {
//     style: "width:auto",
//   })
//     .text("Summary")
//     .appendTo(header);

//   for (let x in cmds) {
//     let row = $("<tr></tr>", {
//       style:
//         "color:dimgrey;border-top: 1px solid GoldenRod;border-bottom: 1px solid GoldenRod;",
//     }).appendTo(tab);
//     $("<td></td>", {
//       style: "color:grey",
//     })
//       .text(cmds[x].cmd)
//       .appendTo(row);
//     $("<td></td>", {
//       style: "color:grey;",
//     })
//       .text(cmds[x].txt)
//       .appendTo(row);
//   }
//   notice("Aliases for user interaction");
//   printHTML(tab[0].outerHTML);
// };

// export const configDialog = () => {
//   let main = $("<div></div>", {
//     id: "nexMapDialog",
//   });
//   $("<div></div>").appendTo(main);

//   let tab = $("<table></table>", {
//     class: "mono nexInput",
//     style: "max-width:100%;border-spacing:4x;vertical-align:center",
//   });

//   let header = $("<tr></tr>", {
//     style: "text-align:left;color:Ivory",
//   }).appendTo(tab);
//   $("<th></th>", {
//     style: "width:auto",
//   })
//     .text("Option")
//     .appendTo(header);
//   $("<th></th>", {
//     style: "width:auto",
//   })
//     .text("Setting")
//     .appendTo(header);

//   let configs = [
//     {
//       name: "Use Wormholes",
//       setting: "useWormholes",
//     },
//     {
//       name: "Use Sewer Grates",
//       setting: "useSewergrates",
//     },
//     {
//       name: "Use Universe Tarot",
//       setting: "useUniverse",
//     },
//     /*{
//             name: 'Show Wormholes',
//             setting: 'displayWormholes'
//         },*/
//     {
//       name: "Vibrating Stick",
//       setting: "vibratingStick",
//     },
//     {
//       name: "Eagle Wings",
//       setting: "useDuanathar",
//     },
//     {
//       name: "Atavian Wings",
//       setting: "useDuanatharan",
//     },
//   ];
//   for (let i = 0; i < configs.length; i++) {
//     let lab = $("<label></label>", {
//       class: "nexswitch nexInput",
//     });
//     $("<input></input>", {
//       type: "checkbox",
//       class: "nexbox nexInput",
//     })
//       .prop("checked", nexmap.settings.userPreferences[configs[i].setting])
//       .on("change", function () {
//         nexmap.settings.toggle(configs[i].setting);
//       })
//       .appendTo(lab);
//     $("<span></span>", {
//       class: "nexslider nexInput",
//     }).appendTo(lab);

//     let row = $("<tr></tr>", {
//       class: "nexRow",
//       style: "cursor:pointer;color:dimgrey;",
//     }).appendTo(tab);
//     $("<td></td>", {
//       style: "color:grey",
//     })
//       .text(configs[i].name)
//       .appendTo(row);
//     $("<td></td>", {
//       style: "color:gainsboro;text-decoration:underline",
//     })
//       .append(lab)
//       .appendTo(row);
//   }
//   let tin = $("<input></input>", {
//     type: "text",
//     class: "nexInput",
//     id: "nexCommandSep",
//     maxlength: 2,
//     width: 24,
//     value: nexmap.settings.userPreferences.commandSeparator,
//   });
//   let tinRow = $("<tr></tr>", {
//     class: "nexRow",
//     style: "cursor:pointer;color:dimgrey;",
//   }).appendTo(tab);
//   $("<td></td>", {
//     style: "color:grey",
//   })
//     .text("Command Separator")
//     .appendTo(tinRow);
//   $("<td></td>", {
//     style: "color:gainsboro;text-decoration:underline",
//   })
//     .append(tin)
//     .appendTo(tinRow);

//   let duanathar = $("<input></input>", {
//     type: "text",
//     class: "nexInput",
//     id: "nexDuanathar",
//     width: 150,
//     value: nexmap.settings.userPreferences.duanatharCommand,
//   });
//   let duanatharRow = $("<tr></tr>", {
//     class: "nexRow",
//     style: "cursor:pointer;color:dimgrey;",
//   }).appendTo(tab);
//   $("<td></td>", {
//     style: "color:grey",
//   })
//     .text("Eagle Wings Command(s)")
//     .appendTo(duanatharRow);
//   $("<td></td>", {
//     style: "color:gainsboro;text-decoration:underline",
//   })
//     .append(duanathar)
//     .appendTo(duanatharRow);

//   let duanatharan = $("<input></input>", {
//     type: "text",
//     class: "nexInput",
//     id: "nexDuanatharan",
//     width: 150,
//     value: nexmap.settings.userPreferences.duanatharanCommand,
//   });
//   let duanatharanRow = $("<tr></tr>", {
//     class: "nexRow",
//     style: "cursor:pointer;color:dimgrey;",
//   }).appendTo(tab);
//   $("<td></td>", {
//     style: "color:grey",
//   })
//     .text("Atavian Wing Command(s)")
//     .appendTo(duanatharanRow);
//   $("<td></td>", {
//     style: "color:gainsboro;text-decoration:underline",
//   })
//     .append(duanatharan)
//     .appendTo(duanatharanRow);

//   let playerShape = $("<select></select>", {
//     class: "nexInput",
//     id: "nexPlayerShape",
//     height: "auto",
//     width: "auto",
//   }).on("change", function () {
//     nexmap.settings.userPreferences.currentRoomShape = $(this)[0].value;
//     cy.style()
//       .selector(".currentRoom")
//       .style({
//         shape: $(this)[0].value,
//       })
//       .update();
//   });
//   $("<option></option>", {
//     value: "rectangle",
//     text: "Rectangle",
//   })
//     .prop(
//       "selected",
//       nexmap.settings.userPreferences.currentRoomShape === "rectangle"
//         ? true
//         : false
//     )
//     .appendTo(playerShape);
//   $("<option></option>", {
//     value: "ellipse",
//     text: "Circle",
//   })
//     .prop(
//       "selected",
//       nexmap.settings.userPreferences.currentRoomShape === "ellipse"
//         ? true
//         : false
//     )
//     .appendTo(playerShape);
//   $("<option></option>", {
//     value: "diamond",
//     text: "Diamond",
//   })
//     .prop(
//       "selected",
//       nexmap.settings.userPreferences.currentRoomShape === "diamond"
//         ? true
//         : false
//     )
//     .appendTo(playerShape);
//   $("<option></option>", {
//     value: "star",
//     text: "Star",
//   })
//     .prop(
//       "selected",
//       nexmap.settings.userPreferences.currentRoomShape === "star" ? true : false
//     )
//     .appendTo(playerShape);
//   $("<option></option>", {
//     value: "vee",
//     text: "Vee",
//   })
//     .prop(
//       "selected",
//       nexmap.settings.userPreferences.currentRoomShape === "vee" ? true : false
//     )
//     .appendTo(playerShape);
//   let playerShapeRow = $("<tr></tr>", {
//     class: "nexRow",
//     style: "cursor:pointer;color:dimgrey;",
//   }).appendTo(tab);
//   $("<td></td>", {
//     style: "color:grey",
//   })
//     .text("Current room shape")
//     .appendTo(playerShapeRow);
//   $("<td></td>", {
//     style: "color:gainsboro;text-decoration:underline",
//   })
//     .append(playerShape)
//     .appendTo(playerShapeRow);

//   let curColor = $("<input></input>", {
//     type: "color",
//     class: "nexInput",
//     id: "nexPlayerColor",
//     width: 100,
//     defaultValue: nexmap.settings.userPreferences.currentRoomColor,
//     value: nexmap.settings.userPreferences.currentRoomColor,
//   }).on("change", function () {
//     nexmap.settings.userPreferences.currentRoomColor = $(this)[0].value;
//     cy.style()
//       .selector(".currentRoom")
//       .style({
//         "border-color": $(this)[0].value,
//       })
//       .update();
//   });
//   let curColorRow = $("<tr></tr>", {
//     class: "nexRow",
//     style: "cursor:pointer;color:dimgrey;",
//   }).appendTo(tab);
//   $("<td></td>", {
//     style: "color:grey",
//   })
//     .text("Current Room Color")
//     .appendTo(curColorRow);
//   $("<td></td>", {
//     style: "color:gainsboro;text-decoration:underline",
//   })
//     .append(curColor)
//     .appendTo(curColorRow);

//   tab.appendTo(main);

//   main.dialog({
//     title: "nexMap Configuration",
//     width: 400,
//     close: function () {
//       nexmap.settings.userPreferences.commandSeparator =
//         $("#nexCommandSep")[0].value.toString();
//       nexmap.settings.userPreferences.duanatharCommand =
//         $("#nexDuanathar")[0].value.toString();
//       nexmap.settings.userPreferences.duanatharanCommand =
//         $("#nexDuanatharan")[0].value.toString();
//       nexmap.settings.save();
//       notice("User settings saved to server.");
//       $(".nexInput").remove();
//       $(".nexMapDialog").parent().remove();
//     },
//   });
// };
