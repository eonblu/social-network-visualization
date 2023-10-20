import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GraphVisualization = () => {
  const svgRef = useRef();
  const width = window.innerWidth * 0.8;
  const height = window.innerHeight * 0.8;

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

      // Your graph data
      const nodes = d3.range(1, 51).map((i) => ({ id: i }));
      const links = generateRandomLinks(50, 100);

    useEffect(() => {
      const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    
      const handleNodeClick = (clickedNode, clickedNodeId, svg) => {
        const connectedLinks = links.filter(
          link => link.source.id === clickedNodeId || link.target.id === clickedNodeId
        );
        const currentColor = clickedNode.attr('fill');
        const newColor = currentColor === 'red' ? 'blue' : 'red';
        clickedNode.attr('fill', newColor);
    
        // Find the neighboring nodes and change their colors immediately
        connectedLinks.forEach(link => {
          if (link.source.id === clickedNodeId) {
            const targetNode = svg.select(`[id="${link.target.id}"] circle`);
            targetNode.attr('fill', 'blue');
          } else {
            const sourceNode = svg.select(`[id="${link.source.id}"] circle`);
            sourceNode.attr('fill', 'blue');
          }
        });
      };
      
    // Create a simple graph
    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id))
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.15))
      .force('collision', d3.forceCollide().radius(30))
      .force('y', d3.forceY(height / 2).strength(0.15));

    // Draw links
    const link = svg
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'black')
      .attr('stroke-width', 1);

    // Draw nodes
    const node = svg
    .selectAll('.node-group')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node-group')
    .attr('transform', d => `translate(${d.x},${d.y})`);

    node
    .append('circle')
    .attr('r', 10)
    .attr('fill', 'red')
    .on('click', (event, d) => {
      const clickedNode = d3.select(event.currentTarget);
      const clickedNodeId = d.id;
      handleNodeClick(clickedNode, clickedNodeId, svg);
    });

      node
      .append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .style('pointer-events', 'none')
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

  }, [width, height, nodes, links]);

  return <svg ref={svgRef}></svg>;
};

export default GraphVisualization;