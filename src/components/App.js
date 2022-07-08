//import '../styles/App.css';

import { useEffect } from "react";
import { nexmap } from "../base/nexmap";
import NexDialog from "./NexDialog";

function App() {

  useEffect(() => {
      const initialize = async () => {
        console.log('initialize')
        //await window.cy.mount(document.getElementById('cy'));
        nexmap.styles.style();
        nexmap.changeRoom(27412);
      }
      initialize();
  }, [])

  return (
    <div className="App" id="development">
      <div id="htmlTest"></div>
      <div id="currentRoomLabel"></div>
      <div id="cy" style={{
        width: '100%',
        height: 'calc(100% - 44px)',
        position: 'absolute',
        overflow: 'hidden',
        top: '0px',
        left: '0px',
        'marginTop': '22px',
        'marginBottom': '22px',
        visibility: 'hidden',
      }}></div>
      <div id="currentExitsLabel" style={{position: 'absolute', bottom: '0px'}}></div>
    </div>
  );
}

export default App;