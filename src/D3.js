import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import data from './data.json';
import './D3styles.css';

const NetworkVisualization = () => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const width = window.innerWidth * 0.8;
  const height = window.innerHeight * 0.8;
  var [randomChance, setRandomChance] = useState(0.7);
  var [randomChance2, setRandomChance2] = useState(0.7);
  var generationvalue = 0;
  let generationtext;

  function generateBarabasiAlbertGraph(nodeCount, k) {
    const nodes = Array.from({ length: nodeCount }, (_, index) => ({ id: index + 1, connections: 0 }));
    const links = [];
  
    for (let i = k + 1; i <= nodeCount; i++) {
      const probabilities = calculateProbabilities(nodes, links);
      const selectedTargets = selectTargets(probabilities, k);
  
      for (const target of selectedTargets) {
        links.push({ source: i, target });
        nodes[i - 1].connections++;
        nodes[target - 1].connections++;
      }
    }
  
    return { nodes, links };
  }
  
  function calculateProbabilities(nodes, links) {
    const probabilities = nodes.map(node => node.connections);
    const totalConnections = links.length * 2;
  
    return probabilities.map(connections => connections / totalConnections);
  }
  
  function selectTargets(probabilities, k) {
    const targets = [];
    for (let i = 0; i < k; i++) {
      targets.push(selectIndexWithProbability(probabilities));
    }
    return targets;
  }
  
  function selectIndexWithProbability(probabilities) {
    const randomValue = Math.random();
    let cumulativeProbability = 0;
  
    for (let i = 0; i < probabilities.length; i++) {
      cumulativeProbability += probabilities[i];
      if (randomValue <= cumulativeProbability) {
        return i + 1; // Convert from 0-based index to 1-based index
      }
    }
  
    return probabilities.length; // Default to the last index if not selected earlier
  }

  const findNeighboringNodes = useCallback((clickedNodeId, newColor, svg, links, generation) => {
    // eslint-disable-next-line
    if (generationvalue < generation) {generationvalue = generation; generationtext.text('Generation: ' +  generation)};
    const connectedLinks = links.filter(
      (link) => link.source.id === clickedNodeId || link.target.id === clickedNodeId
    );
  
    connectedLinks.forEach((link) => {
      if (link.source.id === clickedNodeId) {
        const targetNode = svg
          .selectAll('.node-group')
          .filter((d) => d.id === link.target.id)
          .select('circle');
        if (!targetNode.empty() && targetNode.attr('fill') !== newColor && Math.random() < randomChance) {
          setTimeout(() => {
            targetNode.attr('fill', newColor);
            findNeighboringNodes(link.target.id, newColor, svg, links, generation + 1);
          }, 1000); // Change this value to the desired delay time in milliseconds
        }
      } else {
        const sourceNode = svg
          .selectAll('.node-group')
          .filter((d) => d.id === link.source.id)
          .select('circle');
        if (!sourceNode.empty() && sourceNode.attr('fill') !== newColor && Math.random() < randomChance) {
          setTimeout(() => {
            sourceNode.attr('fill', newColor);
            findNeighboringNodes(link.source.id, newColor, svg, links, generation + 1);
          }, 1000); // Change this value to the desired delay time in milliseconds
        }
      }
    });
  }, [randomChance, generationvalue, generationtext]);

useEffect(() => {
  // const generateRandomLinks = (nodeCount, linkCount, nodes) => {
  //   const links = [];
  //   for (let i = 0; i < linkCount; i++) {
  //     const source = Math.floor(Math.random() * nodeCount) + 1;
  //     let target = Math.floor(Math.random() * nodeCount) + 1;
  //     while (target === source) {
  //       target = Math.floor(Math.random() * nodeCount) + 1;
  //     }
  //     links.push({ source, target });
  //     nodes.find((node) => node.id === source).connections += 1;
  //     nodes.find((node) => node.id === target).connections += 1;
  //   }
  //   return links;
  // };

    // Your graph data
    var BAGraph = generateBarabasiAlbertGraph(50, 2);
    var nodes = BAGraph.nodes;
    var links = BAGraph.links;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height).style('border', '2px solid black');
    let drawArea = svg.select('.drawArea');

    const resetGraph = (buttonID, resetZoom = true) => {
      // eslint-disable-next-line
      generationvalue = 0; generationtext.text('Generation: ' +  generationvalue);
      if (buttonID === 1) {nodes = data.nodes1; links = data.links1}
      else if (buttonID === 2) {nodes = data.nodes2; links = data.links2}
      else if (buttonID === 3) {nodes = data.nodes3; links = data.links3};
      const currentZoomTransform = d3.zoomTransform(svg.node());
      // Reset SVG content
      d3.select(svgRef.current).selectAll("*").remove();
      drawArea = svg.select('.drawArea');
      // Reset the zoom transform to the identity transform
      createGraph();
      if (!resetZoom) {
        drawArea.attr('transform', currentZoomTransform);
        } 
      else {
        svg.call(zoom.transform, d3.zoomIdentity);
      };
      };

      if (drawArea.empty()) {
        const buttonWrapper = document.createElement('div');
        buttonWrapper.classList.add('button-wrapper');
        wrapperRef.current.prepend(buttonWrapper);
      
        // Add a button for resetting the graph
        const resetButton = document.createElement('button');
        resetButton.innerText = 'Sample Set 1';
        resetButton.addEventListener('click', () => resetGraph(1, true));
        resetButton.classList.add('button');
        buttonWrapper.appendChild(resetButton);
      
        const resetButton2 = document.createElement('button');
        resetButton2.innerText = 'Sample Set 2';
        resetButton2.addEventListener('click', () => resetGraph(2, true));
        resetButton2.classList.add('button');
        buttonWrapper.appendChild(resetButton2);
      
        const resetButton3 = document.createElement('button');
        resetButton3.innerText = 'Sample Set 3';
        resetButton3.addEventListener('click', () => resetGraph(3, true));
        resetButton3.classList.add('button');
        buttonWrapper.appendChild(resetButton3);

        const handleRandomChanceChange = (event) => {
          const newRandomChance = parseFloat(event.target.value);
          setRandomChance(newRandomChance);
          // eslint-disable-next-line
          randomChance = newRandomChance;
          sliderText.innerHTML = 'Value ' + randomChance;
        };

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 1;
        slider.step = 0.01;
        slider.value = randomChance;
        slider.classList.add('slider');
        slider.addEventListener('input', handleRandomChanceChange);
        buttonWrapper.appendChild(slider);

        var sliderText = document.createElement('sliderText');
        sliderText.innerText = 'Value ' + randomChance;
        buttonWrapper.appendChild(sliderText);

        const handleRandomChanceChange2 = (event) => {
          const newRandomChance2 = parseFloat(event.target.value);
          setRandomChance2(newRandomChance2);
          // eslint-disable-next-line
          randomChance2 = newRandomChance2;
          sliderText2.innerHTML = 'Value ' + randomChance2;
        };

        const slider2 = document.createElement('input');
        slider2.type = 'range';
        slider2.min = 0;
        slider2.max = 1;
        slider2.step = 0.01;
        slider2.value = randomChance;
        slider2.classList.add('slider');
        slider2.addEventListener('input', handleRandomChanceChange2);
        buttonWrapper.appendChild(slider2);

        var sliderText2 = document.createElement('sliderText');
        sliderText2.innerText = 'Value ' + randomChance;
        buttonWrapper.appendChild(sliderText2);         
        };

    // Create a zoom behavior
    const zoom = d3.zoom().on('zoom', (event) => {
      svg.select('.drawArea').attr('transform', event.transform);
    });

    const createGraph = () => {      
    if (drawArea.empty()) {
      drawArea = svg.append('g').attr('class', 'drawArea');

    // Add zoom behavior to SVG
    svg.call(zoom);

    // Add text to the SVG area
    // eslint-disable-next-line
    generationtext = svg
    .append('text')
    .attr('id', 'generationtext')
    .attr('x', 10) // Adjust the x position as needed
    .attr('y', height - 10) // Adjust the y position as needed
    .style('font-size', '20px') // Adjust the font size as needed
    .style('fill', 'black') // Adjust the text color as needed
    .text('Generation: ' + generationvalue); // Add your desired text here
        
    // Create a simple graph
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1))

      simulation.alphaDecay(0.01);

    // Draw links
    const link = drawArea
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-opactiy', 0.6)
      .on('click', (event, d) => {
        // Assuming d.source and d.target are node IDs
        const sourceNode = d.source;
        const targetNode = d.target;

        // Decrement the connections attribute for the source and target nodes
        if (sourceNode) sourceNode.connections -= 1;
        if (targetNode) targetNode.connections -= 1;
    
        // Remove the clicked link from the links array
        links = links.filter(link => link !== d);
    
        // Redraw the graph with the updated links
        resetGraph(0, false);
      });

    // Draw nodes
    const node = drawArea
      .selectAll('g')
      .data(nodes, d => d.id)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .attr('transform', d => `translate(${d.x},${d.y})`);

      node
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .append('circle')
      .attr('r', d => (4 + 0.75*d.connections))
      .attr('fill', 'red')
      .on('click', (event, d) => {
        const clickedNodeId = d.id;
        const clickedNode = d3.select(event.currentTarget);
        console.log(clickedNode);
        const currentColor = clickedNode.attr('fill');
        const newColor = currentColor === 'red' ? 'blue' : 'red';
        clickedNode.attr('fill', newColor);

        // Find the neighboring nodes and change their colors immediately
        findNeighboringNodes(clickedNodeId, newColor, svg, links, 1);
      });

//      node
//     .append('text')
//     .attr('dy', 4)
//     .attr('text-anchor', 'middle')
//     .style('pointer-events', 'none')
//     .style('font-size', '8px') // Adjust the font size as needed
//     .style('font-family', 'Courier New, monospace') // Adjust the font family as needed
//     .text(d => d.id);

    // Update simulation each tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

        node
        .attr('transform', d => `translate(${d.x},${d.y})`);
      
    });
  }
};

createGraph();

}, [width, height, findNeighboringNodes, randomChance, generationvalue, generationtext]);

return (
  <div style={{ display: 'flex' }} ref={wrapperRef}>
    <svg ref={svgRef}></svg>
  </div>
);
};


export default NetworkVisualization;