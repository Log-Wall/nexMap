import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './components/App';
import { nexmap } from './base/nexmap';
import reportWebVitals from './reportWebVitals';
import * as data from './map_mini.json';

//import "https://cdn.jsdelivr.net/npm/cytoscape@3.21.0/dist/cytoscape.min.js";
nexmap.mudmap = data;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

window.GMCP = {
  Room: JSON.parse(`{"Info":{"num":29153,"name":"Private quarters of the Ducal Family (indoors)","desc":"A rich blue carpet covers the stone floor of this small antechamber, muffling the sound of footsteps and maintaining the room's temperature at a reasonably warm level. The gentle strains of harp music echo melodically from an unseen origin, subtly drowning out the distant clamour of clashing iron and stomping feet that pervades the fortress. Two rich tapestries hang from the walls, woven with intricate patterns that depict twisting vines and plump clusters of grapes, while a small table bears a delicate crystal vase sporting a radiant spray of carefully arranged wildflowers.","area":"Sirocco Fortress","environment":"Urban","coords":"252,-1,9,3","map":"www.achaea.com/irex/maps/clientmap.php?map=252&building=0&level=3 1 1","details":["indoors"],"exits":{"e":29154,"s":29158,"sw":29157,"w":29152,"nw":29144}},"Players":[{"name":"Khaseem","fullname":"Khaseem"}],"AddPlayer":{"name":"Ghawyn","fullname":"Umbral Recruit Ghawyn Danai, Antiquarian of Acquisition"},"RemovePlayer":"Bainz","WrongDir":"se"}`)
};

/*fetch("https://ire-mudlet-mapping.github.io/AchaeaCrowdmap/Map/map_mini.json")
fetch('./map_mini.json')
  .then(response => response.json())
  .then(async data => {
    nexmap.mudmap = data;
    let graph = await nexmap.generateGraph(data);
    window.cy.add(graph)
  })
  .then(() => {
    window.cy.mount(document.getElementById('cy'))
    nexmap.changeRoom(6534)
    nexmap.styles.style();
  })
*/



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
