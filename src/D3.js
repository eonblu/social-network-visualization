import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import data from './data.json';
import './D3styles.css';

const NetworkVisualization = () => {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const RightWrapperRef = useRef();
  const CheckboxWrapperRef = useRef();
  const width = window.innerWidth * 0.8;
  const height = window.innerHeight * 0.8;
  var [randomChance, setRandomChance] = useState(0.7);
  var [randomChance2, setRandomChance2] = useState(0.7);
  var generationvalue = 0;
  let generationtext;

  function getGraphData(nodesData, linksData) {
    const nodes = nodesData.map((node) => ({ ...node }));
    const links = linksData.map((link) => ({ ...link }));
    return { nodes, links };
  }

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
    const randomValue = Math.random() * 1.2;
    let cumulativeProbability = 0;
  
    for (let i = 0; i < probabilities.length; i++) {
      cumulativeProbability += probabilities[i];
      if (randomValue <= cumulativeProbability) {
        return i + 1; // Convert from 0-based index to 1-based index
      }
    }
  
    return probabilities.length; // Default to the last index if not selected earlier
  }
 
  function createProjectionGraph(nodes, links) {
    console.log(nodes, links);
    const nodesGroup1 = nodes.filter(node => node.group === 1);
    const projectedLinks = [];
    
    links.forEach((link1, index1) => {
      links.forEach((link2, index2) => {
        if (index1 !== index2 && link1.target === link2.target) {
          const source1 = nodesGroup1.find(node => node.id === link1.source);
          const source2 = nodesGroup1.find(node => node.id === link2.source);
  
          if (source1 && source2) {
            // Create a new link in the projection graph
            const newLink = { source: source1.id, target: source2.id };
            // Check if the link already exists in the projected links
            if (!projectedLinks.some(existingLink =>
              (existingLink.source === newLink.source && existingLink.target === newLink.target) ||
              (existingLink.source === newLink.target && existingLink.target === newLink.source)
            )) {
              projectedLinks.push(newLink);
            }
          }
        }
      });
    });
    console.log(nodesGroup1, projectedLinks);
    return {
      nodes: nodesGroup1,
      links: projectedLinks
    };
  }
  
  const findNeighboringNodes = useCallback((clickedNodeId, newColor, svg, links, generation) => {
    // eslint-disable-next-line
    if (generationvalue < generation || generation === 1) {generationvalue = generation; generationtext.text('Generation: ' +  generation)};
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
    var BAGraph = generateBarabasiAlbertGraph(50, 2);
    var nodes = BAGraph.nodes;
    var links = BAGraph.links;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height).style('border', '2px solid black');
    let drawArea = svg.select('.drawArea');

    const newCheckbox = document.createElement('input');
    const newCheckbox2 = document.createElement('input');
    const newCheckbox3 = document.createElement('input');
    const newCheckbox4 = document.createElement('input');
    const newCheckbox5 = document.createElement('input');
    const newCheckbox6 = document.createElement('input');
    const newCheckbox7 = document.createElement('input');
    const newCheckbox8 = document.createElement('input');
    const newCheckbox9 = document.createElement('input');
    const newCheckbox10 = document.createElement('input');
    var switchElement = document.createElement('input');

    const updateBipartiteGraph = (resetZoom = true, inputnodes, inputlinks) => {
      // eslint-disable-next-line
      generationvalue = 0; generationtext.text('Generation: ' +  generationvalue);

      let newGraph;
      newGraph = getGraphData(inputnodes, inputlinks)

      const selectedNodeIds = new Set();

      selectedNodeIds.add(1).add(2).add(3).add(4).add(5);

      if (newCheckbox.checked) {
        selectedNodeIds.add(6);
      }
      if (newCheckbox2.checked) {
        selectedNodeIds.add(7);
      }
      if (newCheckbox3.checked) {
        selectedNodeIds.add(8);
      }
      if (newCheckbox4.checked) {
        selectedNodeIds.add(9);
      }
      if (newCheckbox5.checked) {
        selectedNodeIds.add(10);
      }
      if (newCheckbox6.checked) {
        selectedNodeIds.add(11);
      }
      if (newCheckbox7.checked) {
        selectedNodeIds.add(12);
      }
      if (newCheckbox8.checked) {
        selectedNodeIds.add(13);
      }
      if (newCheckbox9.checked) {
        selectedNodeIds.add(14);
      }
      if (newCheckbox10.checked) {
        selectedNodeIds.add(15);
      }

      // Filter nodes and links based on selected nodes
      const filteredNodes = newGraph.nodes.filter((node) => selectedNodeIds.has(node.id));
      const filteredLinks = newGraph.links.filter((link) => selectedNodeIds.has(link.target));

      if (switchElement.checked) {
        newGraph = createProjectionGraph(filteredNodes, filteredLinks);
        nodes = newGraph.nodes;
        links = newGraph.links;
      }
      else {
        nodes = filteredNodes;
        links = filteredLinks;
      };

      const currentZoomTransform = d3.zoomTransform(svg.node());
      d3.select(svgRef.current).selectAll("*").remove();
      drawArea = svg.select('.drawArea');
      createGraph();
      if (!resetZoom) {
        drawArea.attr('transform', currentZoomTransform);
        } 
      else {
        svg.call(zoom.transform, d3.zoomIdentity);
      };
      };

    const resetGraph = (buttonID, resetZoom = true) => {
      // eslint-disable-next-line
      generationvalue = 0; generationtext.text('Generation: ' +  generationvalue);

      let newGraph;
      switch (buttonID) {
        case 1:
          newGraph = getGraphData(data.nodes1, data.links1);
          break;
        case 2:
          newGraph = getGraphData(data.nodes2, data.links2);
          break;
        case 3:
          newGraph = getGraphData(data.nodes3, data.links3);
          break;
        case 4:
          newGraph = generateBarabasiAlbertGraph(50, 2);
          break;
        case 5:
          nodes = d3.range(1, 151).map((i) => ({ id: i, connections: 0 }));
          links = generateRandomLinks(150, 200, nodes);
          newGraph = { nodes, links };
          break;
        case 6:
          newGraph = getGraphData(data.nodesBi, data.linksBi);
          break;
        case 7:
          newGraph = getGraphData(data.nodesBi, data.linksBi);
          newGraph = createProjectionGraph(newGraph.nodes, newGraph.links);
          break;
        default:
          newGraph = {nodes, links};
          break;
      }
    
      nodes = newGraph.nodes;
      links = newGraph.links;

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
        const buttonTextSample = document.createElement('span');
        buttonTextSample.innerText = 'Sample Sets';
        buttonWrapper.appendChild(buttonTextSample);

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

        const buttonTextAlgs = document.createElement('span');
        buttonTextAlgs.innerText = 'Algorithmic Graph Creation';
        buttonWrapper.appendChild(buttonTextAlgs);

        const resetButton4 = document.createElement('button');
        resetButton4.innerText = 'Barabasi Albert';
        resetButton4.addEventListener('click', () => resetGraph(4, true));
        resetButton4.classList.add('button');
        buttonWrapper.appendChild(resetButton4);

        const resetButton5 = document.createElement('button');
        resetButton5.innerText = 'Random';
        resetButton5.addEventListener('click', () => resetGraph(5, true));
        resetButton5.classList.add('button');
        buttonWrapper.appendChild(resetButton5);

        const buttonTextSpr = document.createElement('span');
        buttonTextSpr.innerText = 'Values for spread*';
        buttonWrapper.appendChild(buttonTextSpr);

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

        // Add a new checkbox
        const RightWrapper = document.createElement('div');
        RightWrapper.classList.add('right-wrapper');
        RightWrapperRef.current.prepend(RightWrapper);

        const resetButton6 = document.createElement('button');
        resetButton6.innerText = 'Bipartite Graph';
        resetButton6.addEventListener('click', () => resetGraph(6, true));
        resetButton6.classList.add('button');
        RightWrapper.appendChild(resetButton6);

        const resetButton7 = document.createElement('button');
        resetButton7.innerText = 'Projection Graph';
        resetButton7.addEventListener('click', () => resetGraph(7, true));
        resetButton7.classList.add('button');
        RightWrapper.appendChild(resetButton7);

        const SwitchText = document.createElement('span');
        SwitchText.innerText = 'Switch between bipartite and projection view';
        RightWrapper.appendChild(SwitchText);

        var switchContainer = document.createElement("label");
        switchContainer.className = "switch";
        var switchLabel = document.createElement("span");
        switchLabel.className = "toggleswitch";
        switchElement.type = "checkbox";
        switchElement.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        switchContainer.appendChild(switchElement);
        switchContainer.appendChild(switchLabel);
        RightWrapper.appendChild(switchContainer);

        const CheckboxWrapper = document.createElement('div');
        CheckboxWrapper.classList.add('checkbox-wrapper');
        CheckboxWrapperRef.current.prepend(CheckboxWrapper);

        newCheckbox.type = 'checkbox'
        newCheckbox.checked = true;
        newCheckbox.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        newCheckbox.classList.add('checkboxes');
        CheckboxWrapper.appendChild(newCheckbox);

        newCheckbox2.type = 'checkbox'
        newCheckbox2.checked = true;
        newCheckbox2.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        newCheckbox2.classList.add('checkboxes');
        CheckboxWrapper.appendChild(newCheckbox2);

        newCheckbox3.type = 'checkbox'
        newCheckbox3.checked = true;
        newCheckbox3.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        newCheckbox3.classList.add('checkboxes');
        CheckboxWrapper.appendChild(newCheckbox3);

        newCheckbox4.type = 'checkbox'
        newCheckbox4.checked = true;
        newCheckbox4.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        newCheckbox4.classList.add('checkboxes');
        CheckboxWrapper.appendChild(newCheckbox4);

        newCheckbox5.type = 'checkbox'
        newCheckbox5.checked = true;
        newCheckbox5.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        newCheckbox5.classList.add('checkboxes');
        CheckboxWrapper.appendChild(newCheckbox5);

        newCheckbox6.type = 'checkbox'
        newCheckbox6.checked = true;
        newCheckbox6.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        newCheckbox6.classList.add('checkboxes');
        CheckboxWrapper.appendChild(newCheckbox6);

        newCheckbox7.type = 'checkbox'
        newCheckbox7.checked = true;
        newCheckbox7.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        newCheckbox7.classList.add('checkboxes');
        CheckboxWrapper.appendChild(newCheckbox7);

        newCheckbox8.type = 'checkbox'
        newCheckbox8.checked = true;
        newCheckbox8.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        newCheckbox8.classList.add('checkboxes');
        CheckboxWrapper.appendChild(newCheckbox8);

        newCheckbox9.type = 'checkbox'
        newCheckbox9.checked = true;
        newCheckbox9.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        newCheckbox9.classList.add('checkboxes');
        CheckboxWrapper.appendChild(newCheckbox9);

        newCheckbox10.type = 'checkbox'
        newCheckbox10.checked = true;
        newCheckbox10.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        newCheckbox10.classList.add('checkboxes');
        CheckboxWrapper.appendChild(newCheckbox10);
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
          .strength((d) => 1 / ((Math.min(d.source.connections, d.target.connections))+1))
          .distance((d) => 50 * Math.exp(-0.1 * Math.max(d.source.connections, d.target.connections, 1)))
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
      .attr('r', d => (6 + 0.75*d.connections))
      .attr('fill', 'red')
      .attr('fill', (d) => d.color || 'red')
      .on('click', (event, d) => {
        const clickedNodeId = d.id;
        const clickedNode = d3.select(event.currentTarget);
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
    <div>
      <div ref={RightWrapperRef} className="right-wrapper"></div>
      <div ref={CheckboxWrapperRef} className="checkbox-wrapper"></div>
    </div>
  </div>
);
};


export default NetworkVisualization;