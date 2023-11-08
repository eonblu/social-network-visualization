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

  const findNeighboringNodes = useCallback((clickedNodeId, newColor, svg, links) => {
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
            findNeighboringNodes(link.target.id, newColor, svg, links);
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
            findNeighboringNodes(link.source.id, newColor, svg, links);
          }, 1000); // Change this value to the desired delay time in milliseconds
        }
      }
    });
  }, [randomChance]);

useEffect(() => {
  const generateRandomLinks = (nodeCount, linkCount, nodes) => {
    const links = [];
    for (let i = 0; i < linkCount; i++) {
      const source = Math.floor(Math.random() * nodeCount) + 1;
      let target = Math.floor(Math.random() * nodeCount) + 1;
      while (target === source) {
        target = Math.floor(Math.random() * nodeCount) + 1;
      }
      links.push({ source, target });
      nodes.find((node) => node.id === source).connections += 1;
      nodes.find((node) => node.id === target).connections += 1;
    }
    return links;
  };

    // Your graph data
    var nodes = d3.range(1, 151).map((i) => ({ id: i, connections: 0 }));
    var links = generateRandomLinks(150, 200, nodes);

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height).style('border', '2px solid black');
    let drawArea = svg.select('.drawArea');

    const resetGraph = (buttonID) => {
      if (buttonID === 1) {nodes = data.nodes1; links = data.links1}
      else if (buttonID === 2) {nodes = data.nodes2; links = data.links2}
      else if (buttonID === 3) {nodes = data.nodes3; links = data.links3};
      // Reset SVG content
      d3.select(svgRef.current).selectAll("*").remove();
      drawArea = svg.select('.drawArea');
      // Reset the zoom transform to the identity transform
      svg.call(zoom.transform, d3.zoomIdentity);
      createGraph();
      };

      if (drawArea.empty()) {
        const buttonWrapper = document.createElement('div');
        buttonWrapper.classList.add('button-wrapper');
        wrapperRef.current.prepend(buttonWrapper);
      
        // Add a button for resetting the graph
        const resetButton = document.createElement('button');
        resetButton.innerText = 'Sample Set 1';
        resetButton.addEventListener('click', () => resetGraph(1));
        resetButton.classList.add('button');
        buttonWrapper.appendChild(resetButton);
      
        const resetButton2 = document.createElement('button');
        resetButton2.innerText = 'Sample Set 2';
        resetButton2.addEventListener('click', () => resetGraph(2));
        resetButton2.classList.add('button');
        buttonWrapper.appendChild(resetButton2);
      
        const resetButton3 = document.createElement('button');
        resetButton3.innerText = 'Sample Set 3';
        resetButton3.addEventListener('click', () => resetGraph(3));
        resetButton3.classList.add('button');
        buttonWrapper.appendChild(resetButton3);

        const handleRandomChanceChange = (event) => {
          const newRandomChance = parseFloat(event.target.value);
          setRandomChance(newRandomChance);
          randomChance = newRandomChance;
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
    
    // Create a simple graph
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(25) // Adjust the distance value as needed
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.1)) // Adjust the strength as needed
      .force('collision', d3.forceCollide().radius(15))
      .force('y', d3.forceY(height / 2).strength(0.1));

      simulation.alphaDecay(0.01);

    // Draw links
    const link = drawArea
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 1.5)
      .attr('stroke-opactiy', 0.6);

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
      .attr('r', d => (7 + 1.25*d.connections))
      .attr('fill', 'red')
      .on('click', (event, d) => {
        const clickedNodeId = d.id;
        const clickedNode = d3.select(event.currentTarget);
        console.log(clickedNode);
        const currentColor = clickedNode.attr('fill');
        const newColor = currentColor === 'red' ? 'blue' : 'red';
        clickedNode.attr('fill', newColor);

        // Find the neighboring nodes and change their colors immediately
        findNeighboringNodes(clickedNodeId, newColor, svg, links);
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

}, [width, height, findNeighboringNodes, randomChance]);

return (
  <div style={{ display: 'flex' }} ref={wrapperRef}>
    <svg ref={svgRef}></svg>
  </div>
);
};


export default NetworkVisualization;