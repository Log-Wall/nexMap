//import '../styles/App.css';

import { useEffect } from "react";
import { nexmap } from "../base/nexmap";

function App() {

  useEffect(() => {
      const initialize = async () => {
        console.log('initialize')
        let graph = await nexmap.generateGraph(nexmap.mudmap);
        await window.cy.add(graph);
        await window.cy.mount(document.getElementById('cy'));
        nexmap.styles.style();
        nexmap.changeRoom(27412);
        nexmap.mongo.initialize();
      }
      initialize();
  }, [])

  return (
    <div className="App">
      <div id="currentRoomLabel"></div>
      <div id="cy"></div>
      <div id="currentExitsLabel" style={{position: 'absolute', bottom: '0px'}}></div>
    </div>
  );
}

export default App;