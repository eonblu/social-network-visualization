import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GraphVisualization = () => {
  const svgRef = useRef();
  const width = window.innerWidth * 0.8;
  const height = window.innerHeight * 0.8;

  const generateRandomLinks = (nodeCount) => {
    const links = [];
    for (let i = 0; i < nodeCount; i++) {
      const source = Math.floor(Math.random() * nodeCount) + 1;
      let target = Math.floor(Math.random() * nodeCount) + 1;
      while (target === source) {
        target = Math.floor(Math.random() * nodeCount) + 1;
      }
      links.push({ source, target });
    }
    return links;
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

    // Your graph data
    const nodes = d3.range(1, 21).map((i) => ({ id: i }));
    const links = generateRandomLinks(20);

    // Create a simple graph
    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

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
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', 'red')
      .on('click', (event, d) => {
        const circle = d3.select(event.currentTarget);
        const currentColor = circle.attr('fill');
        const newColor = currentColor === 'red' ? 'blue' : 'red';
        circle.attr('fill', newColor);
      });

/*     const zoomHandler = d3.zoom().on('zoom', (event) => {
      svg.attr('transform', event.transform);
    });
  
    svg.call(zoomHandler); */
    
     // Add a drag behavior.
    node.call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));
    
    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Update simulation each tick
    simulation.on('tick', () => {
      link.attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

        node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    });

  }, [width, height]);

  return <svg ref={svgRef}></svg>;
};

export default GraphVisualization;