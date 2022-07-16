//import '../styles/App.css';

import { nexmap } from "../nexmap";
import Nexmap from "./Nexmap";

function App() {

  return (
    <Nexmap evt={nexmap.evt} settings={nexmap.settings.userPreferences} />
  );
}

export default App;