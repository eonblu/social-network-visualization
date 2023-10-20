import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';


const GraphVisualization = () => {
  const svgRef = useRef();
  const width = 928;
  const height = 680;

  const generateRandomLinks = (nodeCount, linkCount) => {
    const links = [];
    for (let i = 0; i < linkCount; i++) {
      const source = Math.floor(Math.random() * nodeCount) + 1;
      let target = Math.floor(Math.random() * nodeCount) + 1;
      while (target === source) {
        target = Math.floor(Math.random() * nodeCount) + 1;
      }
      links.push({ source, target });
    }
    return links;
  };

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
        if (!targetNode.empty() && targetNode.attr('fill') !== newColor && Math.random() < 0.7) {
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
        if (!sourceNode.empty() && sourceNode.attr('fill') !== newColor && Math.random() < 0.7) {
          setTimeout(() => {
            sourceNode.attr('fill', newColor);
            findNeighboringNodes(link.source.id, newColor, svg, links);
          }, 1000); // Change this value to the desired delay time in milliseconds
        }
      }
    });
  }, []);

      // Your graph data
      const nodes = d3.range(1, 151).map((i) => ({ id: i }));
      const links = generateRandomLinks(150, 200);

  useEffect(() => {
    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    const drawArea = svg.append('g').attr('class', 'drawArea');

    // Create a zoom behavior
    const zoom = d3.zoom().on('zoom', (event) => {
      svg.select('.drawArea').attr('transform', event.transform);
    });

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
          //.distance(25) // Adjust the distance value as needed
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.1)) // Adjust the strength as needed
      .force('collision', d3.forceCollide().radius(10))
      .force('y', d3.forceY(height / 2).strength(0.1));

      simulation.alphaDecay(0.01);

    // Draw links
    const link = drawArea
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', d => Math.sqrt(d.value))
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
      .attr('stroke-width', 1.5)
      .append('circle')
      .attr('r', 9)
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

      node
      .append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .style('font-size', '10px') // Adjust the font size as needed
      .style('font-family', 'Courier New, monospace') // Adjust the font family as needed
      .text(d => d.id);


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

  }, [width, height, nodes, links, findNeighboringNodes]);

  return <svg ref={svgRef}></svg>;
};

export default GraphVisualization;