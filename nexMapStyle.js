   /*
    cy.startBatch()
    cy.style().clear();
    
    // Core element styles
    cy.style()
        .selector('node')
            .style({
                shape: 'rectangle',
                width: 10,
                height: 10,
        		'border-color': 'black',
        		'border-width': 0.5,
        		display: 'none',
            })
        .selector('edge')
            .style({
                width: 1,
                'line-color': 'grey',
        		//display: 'none',
            });
    
    // Classes styles
    cy.style()
        .selector('.displayLabel')
            .style({
                label: 'data(name)',
        		//label: 'data(id)',
                color: 'white',
            })
    	.selector('.areaDisplay')
    		.style({
        		display: 'element',
    		}) 
        .selector('.areaAdjacent')
    		.style({
        		display: 'element',
    			visibility: 'hidden'
    		})    
    	.selector('.wormhole')
    		.style({
    			visibility: nexMap.settings.userPreferences.displayWormholes?'visible':'hidden',
        		width: 1,
                'line-style':'dashed',
                'line-dash-pattern':[5,10],
                'line-color':'#8d32a8'
    		})
    	.selector('.sewergrate')
    		.style({
        		visibility: 'hidden'
    		})    
    	.selector('.downexit')
    		.style({
    			'source-arrow-shape':'triangle',
        		'curve-style':'bezier',
        		visibility: 'hidden'    
    		})
    	.selector('.upexit')
    		.style({
    			'source-arrow-shape':'triangle',
        		'curve-style':'bezier',
        		visibility: 'hidden'
    		})
    	.selector('.inexit')
    		.style({
    			'source-arrow-shape':'circle',
        		'curve-style':'bezier',
        		visibility: 'hidden'    
    		})
    	.selector('.outexit')
    		.style({
    			'source-arrow-shape':'circle',
        		'curve-style':'bezier',
        		visibility: 'hidden'
    		})
        .selector('.doorexit')
    		.style({
    			'curve-style':'straight',
                'mid-source-arrow-shape':'tee',
                'mid-target-arrow-shape':'tee',
                'arrow-scale':.65
    		})
        .selector('.pseudo-d')
            .style({
            display: 'element',
        	label: '',
            'border-color':'black',
            'border-width':0.5,
            'background-color':'white',
            shape:'polygon',
            'shape-polygon-points':[
                -0.6,-0.7,
                0.6,-0.7,
                0,-0.1]
        })
        .selector('.pseudo-up')
            .style({
            display: 'element',
        	label: '',
            'border-color':'black',
            'border-width':0.5,
            'background-color':'white',
            shape:'polygon',
            'shape-polygon-points':[
                0.6,0.7,
                -0.6,0.7,
                0,0.1]
        })
        .selector('.pseudo-in')
            .style({
            display: 'element',
        	label: '',
            'border-color':'black',
            'border-width':0.5,
            'background-color':'white',
            shape:'polygon',
            'shape-polygon-points':[
                0.7,-0.6,
                0.7,0.6,
                0.1,0.0]
        })
        .selector('.pseudo-out')
            .style({
            display: 'element',
        	label: '',
            'border-color':'black',
            'border-width':0.5,
            'background-color':'white',
            shape:'polygon',
            'shape-polygon-points':[
                -0.7,0.6,
                -0.7,-0.6,
                -0.1,0.0]
        })
        .selector('.areaAdjacentExit')
            .style({
            display: 'element',
            'target-arrow-shape':'vee',
            'curve-style':'straight',
        	'arrow-scale':0.75
        });
    
    // Node colors based on environment tag
    nexMap.mudmap.customEnvColors.forEach(e => {
        cy.style()
        .selector(`.environment${e.id}`)
            .style('background-color', `rgb(${e.color24RGB.join()})`)     
    });

    cy.style()
        .selector(':selected')
            .style({
            'background-color': 'green',
            })
        .selector('.currentRoom')
            .style({
        	'border-color':nexMap.styles.userPreferences.currentRoomColor,
        	'border-width':2,
        	shape: nexMap.styles.userPreferences.currentRoomShape,
        	width:12,
        	height:12
            });

    cy.style().update();
    */