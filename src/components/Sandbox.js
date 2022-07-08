/* global addEventListener */
import * as React from 'react'

const Sandbox = ({evt, GMCP}) => {
    const [GMCPstate, setGMCP] = React.useState(GMCP)

    evt.addEventListener('changeGMCP', (e)=>{setGMCP(e.detail)})

    return (
        <div>
            Hello {GMCPstate}
        </div>
    )
}

export default Sandbox;