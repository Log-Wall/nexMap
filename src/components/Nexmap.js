/* global nexusclient */

import NexDialogPure from "./NexDialog";

function Nexmap({
  evt,
  settings
}) {
  return /*#__PURE__*/nexusclient.platform().React.createElement("div", {
    className: "App",
    id: "development"
  }, /*#__PURE__*/nexusclient.platform().React.createElement(NexDialogPure, {
    evt: evt,
    settings: settings
  }), /*#__PURE__*/nexusclient.platform().React.createElement("div", {
    id: "htmlTest"
  }), /*#__PURE__*/nexusclient.platform().React.createElement("div", {
    id: "currentRoomLabel"
  }), /*#__PURE__*/nexusclient.platform().React.createElement("div", {
    id: "cy",
    style: {
      width: '100%',
      height: 'calc(100% - 44px)',
      position: 'absolute',
      overflow: 'hidden',
      top: '0px',
      left: '0px',
      'marginTop': '22px',
      'marginBottom': '22px',
      visibility: 'hidden'
    }
  }), /*#__PURE__*/nexusclient.platform().React.createElement("div", {
    id: "currentExitsLabel",
    style: {
      position: 'absolute',
      bottom: '0px'
    }
  }));
}

window.Nexmap = Nexmap;
export default Nexmap;