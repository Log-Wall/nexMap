import NexDialog from "./NexDialog";

function Nexmap({
  evt,
  settings
}) {
  return (
    <div className = 'App' id = 'development'>
      <NexDialog evt={evt} settings={settings} />
      <div id = "htmlTest" />
      <div id = "currentRoomLabel" />
      <div id = "cy" style = {{
        width: '100%',
        height: 'calc(100% - 44px)',
        position: 'absolute',
        overflow: 'hidden',
        top: '0px',
        left: '0px',
        'marginTop': '22px',
        'marginBottom': '22px',
        visibility: 'visible'
      }}/>
      <div id = "currentExitsLabel" style={{position: 'absolute', bottom: '0px'}}/>
    </div>
  );
}

window.Nexmap = Nexmap;
export default Nexmap;