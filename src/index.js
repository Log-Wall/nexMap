import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { nexmap } from './base/nexmap';
import { stylesheet } from './base/styles';
import reportWebVitals from './reportWebVitals';
import "https://cdn.jsdelivr.net/npm/cytoscape@3.21.0/dist/cytoscape.min.js";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/* global cytoscape */
window.cy = cytoscape({
  container: undefined,//document.getElementById('cy'),
  layout: 'grid',
  style: stylesheet,
  zoom: 1.25,
  minZoom: 0.2,
  maxZoom: 3,
  wheelSensitivity: 0.5,
  boxSelectionEnabled: false,
  selectionType: 'single',

  hideEdgesOnViewport: true,
  textureOnViewport: true,
  motionBlur: true,
  pixelRatio: 'auto',
});

fetch("https://ire-mudlet-mapping.github.io/AchaeaCrowdmap/Map/map_mini.json")
  .then(response => response.json())
  .then(data => window.cy.add(nexmap.generateGraph(data)))/*window.cy.add(nexmap.generateGraph(data)))*/


window.cy.mount(document.getElementById('cy'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
