/* global nexusclient, React */
Object.setAtString = function (obj, dotarr, val) {
  let a = dotarr.shift()
  if (dotarr.length === 0) {
      // if at last element in chain, set value
      if (obj[a] === undefined) {
          obj[a] = {}
      }
      if (Array.isArray(val)) {
          obj[a] = val
      } else if (typeof val === 'object') {
          Object.assign(obj[a], val)
          /*
        for(key in val) {
            obj[a][key] = val[key];
        }
        */
      } else {
          obj[a] = val
      }
      return
  } else {
      if (obj[a] === undefined) {
          obj[a] = {}
      }
      Object.setAtString(obj[a], dotarr, val)
  }
}

if (typeof nexusclient.ui().layout().get_tab_object_original === 'undefined') {
nexusclient.ui().layout().get_tab_object_original = nexusclient.ui().layout().get_tab_object;
}

function startup2() {
  document.getElementById('cy')?.remove();
  const nexmapTab = document.getElementById('tbl_nexmap_map')

  nexmapTab.appendChild(Object.assign(document.createElement('div'), {id: 'currentRoomLabel'}));
  nexmapTab.appendChild(Object.assign(document.createElement('div'), {id: 'cy'}));
  nexmapTab.appendChild(Object.assign(document.createElement('div'), {id: 'currentExitsLabel', style: 'position:absolute;bottom:0px'}));
  styles.style();

  fetch("https://ire-mudlet-mapping.github.io/AchaeaCrowdmap/Map/map_mini.json")
    .then(response => response.json())
    .then(async data => {
      let graph = await generateGraph(data);
      window.cy.add(graph)
    })
    .then(() => {
      window.cy.mount(document.getElementById('cy'))
      nexmap.changeRoom(6534)
    })
}

let startUp = () => {
window.khaseem = {
    components: {
        NexMap() {
          return React.createElement("div", {
            className: "Nexmap"
          }, React.createElement("div", {
            id: "currentRoomLabel"
          }), React.createElement("div", {
            id: "cy",
            style: {
              width: '100%',
              height: 'calc(100% - 44px)',
              position: 'absolute',
              overflow: 'hidden',
              top: '0px',
              left: '0px',
              'marginTop': '22px',
              'marginBottom': '22px'
            }
          }), React.createElement("div", {
            id: "currentExitsLabel",
            style: {
              position: 'absolute',
              bottom: '0px'
            }
          }));
        }
    }
}
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
}

if (typeof React === 'undefined') {
let script = document.createElement('script');
script.src = "https://unpkg.com/react/umd/react.production.min.js";
document.head.appendChild(script);
script.onload = () => {
      // script has loaded, you can now use it safely
      startUp();
      // ... do something with the newly loaded script
};
} else {
startUp();
}
if (typeof ReactDOM === 'undefined') {
  let script = document.createElement('script');
  script.src = "https://unpkg.com/react-dom/umd/react-dom.production.min.js";
  document.head.appendChild(script);
}

window.GMCP = nexusclient.datahandler().GMCP;
window.GMCP.Room = {};
window.GMCP.Char = {
  Items: {}
};

//$.getScript('https://cdn.jsdelivr.net/gh/Log-Wall/nexMap/dist/bundle.js');
nexusclient.reflexes().disable_reflex(nexusclient.reflexes().find_by_name("group", "Aliases", false, false, "nexmap3"));
nexusclient.reflexes().disable_reflex(nexusclient.reflexes().find_by_name("group", "Triggers", false, false, "nexmap3"));

if (typeof nexusclient.ui().layout().flexLayout.model.getNodeById('nexmap') === 'undefined') {
let tt = {
  component: "nexmap",
  helpText: "nexmap",
  icon: "feather-pointed",
  id: "nexmap",
  name: "nexmap",
  type: "tab"
};
nexusclient.ui().layout().flexLayout.addTab(tt, nexusclient.ui().layout().flexLayout.model.getNodeById('map').getParent().getId());
}


const TestState = () => {
  const [count, setCount] = nexusclient.platform().React.useState(0);

  return /*#__PURE__*/nexusclient.platform().React.createElement("div", {
    onClick: () => setCount(count+1)
  }, "You clicked ", count, " times");

}

function TestState2() {
  const [count, setCount] = nexusclient.platform().React.useState(0);

  return /*#__PURE__*/nexusclient.platform().React.createElement("div", {
    onClick: () => setCount(count+1)
  }, "You clicked ", count, " times");

}

const TestState3 = function() {
  const [count, setCount] = nexusclient.platform().React.useState(0);

  return /*#__PURE__*/nexusclient.platform().React.createElement("div", {
    onClick: () => setCount(count+1)
  }, "You clicked ", count, " times");

}

class TestState4 extends nexusclient.platform().React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  render() {
    return /*#__PURE__*/nexusclient.platform().React.createElement("div", {
      onClick: () => this.setState({
        count: this.state.count + 1
      })
    }, "You clicked ", this.state.count, " times");
  }

}