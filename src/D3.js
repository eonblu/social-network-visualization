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
  var [nodeAmountBA, setnodeAmountBA] = useState(50); // Amount of Nodes BA
  var [initialmBA, setinitialmBA] = useState (3); // Connections for each new node BA 
  var [nodeAmountRandom, setnodeAmountRandom] = useState(50); // Amount of Nodes Random Graph
  var [randomChance, setRandomGraphChance] = useState(0.05); // Random Chance Random Graph
  var [infectionRate, setRandomChance] = useState(0.7); // Infectionrate
  var [maskRate, setRandomChance2] = useState(0.7); // Maskrate
  var generationvalue = 0;
  let generationtext;

  function getGraphData(nodesData, linksData, countConnections) {
    const nodes = nodesData.map((node) => ({ ...node }));
    const links = linksData.map((link) => ({ ...link }));    
    if (countConnections) {
      nodes.forEach((node) => {
        node.connections = 0;
      });
    
      links.forEach((link) => {
        const sourceNode = nodes.find((node) => node.id === link.source);
        const targetNode = nodes.find((node) => node.id === link.target);
    
        if (sourceNode) sourceNode.connections += 1;
        if (targetNode) targetNode.connections += 1;
      });
    }
    return { nodes, links };
  }

  function generateBarabasiAlbertGraph(nodesCount, m) {

    const nodes = Array.from({ length: nodesCount }, (_, i) => ({ id: i + 1, connections: 0 }));

    const links = [];

    for (let i = 1; i <= m; i++) {
      for (let j = i + 1; j <= m; j++) {
        links.push({ source: i, target: j });
        nodes[i - 1].connections++;
        nodes[j - 1].connections++;
      }
    }
    for (let i = m + 1; i <= nodesCount; i++) {
      const probabilities = nodes.map(node => node.connections / (2 * links.length));
  
      for (let j = 0; j < m; j++) {
        const targetIndex = selectNode(probabilities);
        links.push({ source: i, target: nodes[targetIndex].id });
        nodes[i - 1].connections++;
        nodes[targetIndex].connections++;
      }
    }
    return { nodes, links };
  }

  function selectNode(probabilities) {
    const rand = Math.random();
    let cumulativeProbability = 0;
  
    for (let i = 0; i < probabilities.length; i++) {
      cumulativeProbability += probabilities[i];
      if (rand <= cumulativeProbability) {
        return i;
      }
    }
    return probabilities.length - 1;
  }
 
  function createProjectionGraph(nodes, links) {
    const nodesGroup1 = nodes.filter(node => node.group === 1);
    const projectedLinks = [];
    
    links.forEach((link1, index1) => {
      links.forEach((link2, index2) => {
        if (index1 !== index2 && link1.target === link2.target) {
          const source1 = nodesGroup1.find(node => node.id === link1.source);
          const source2 = nodesGroup1.find(node => node.id === link2.source);
  
          if (source1 && source2) {
            // Create a new link in the projection graph
            const newLink = { source: source1.id, target: source2.id, connections: 0 };
            // Check if the link already exists in the projected links
            const existingLinkIndex = projectedLinks.findIndex(existingLink =>
              (existingLink.source === newLink.source && existingLink.target === newLink.target) ||
              (existingLink.source === newLink.target && existingLink.target === newLink.source)
            );
  
            if (existingLinkIndex === -1) {
              projectedLinks.push(newLink);
            } else {
              // Increment connections for the existing link
              projectedLinks[existingLinkIndex].connections += 1;
            }
          }
        }
      });
    });
    return {
      nodes: nodesGroup1,
      links: projectedLinks
    };
  }

  function infect(infRate, mRate) {
    const chancevalue = Math.random();
    if (chancevalue < (mRate * mRate)) {return (Math.random() < (0.02 * infRate))}
    else if (chancevalue < mRate) {return (Math.random() < (0.15 * infRate))}
    else {return (Math.random() < infRate)}
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
        if (!targetNode.empty() && targetNode.attr('fill') !== newColor && infect(infectionRate, maskRate)) {
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
        if (!sourceNode.empty() && sourceNode.attr('fill') !== newColor && infect(infectionRate, maskRate)) {
          setTimeout(() => {
            sourceNode.attr('fill', newColor);
            findNeighboringNodes(link.source.id, newColor, svg, links, generation + 1);
          }, 1000); // Change this value to the desired delay time in milliseconds
        }
      }
    });
  }, [infectionRate, generationvalue, generationtext]);

useEffect(() => {
  // eslint-disable-next-line
  const generateRandomLinksOld = (nodeCount, linkCount, nodes) => {
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

  function generateRandomLinks(nodes, k) {
    const links = [];
  
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() < k) {
          // Connect nodes with probability k
          links.push({ source: nodes[i].id, target: nodes[j].id });
          nodes[i].connections += 1;
          nodes[j].connections += 1;
        }
      }
    }
    return links;
  }

    // Your graph data
    var BAGraph = generateBarabasiAlbertGraph(50, 3);
    var nodes = BAGraph.nodes;
    var links = BAGraph.links;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height).style('border', '2px solid black');
    let drawArea = svg.select('.drawArea');

    const Amazilia_fimbriata_box = document.createElement('input');
    const Aphantochroa_cirrhochloris_box = document.createElement('input');
    const Clytolaema_rubricauda_box = document.createElement('input');
    const Glaucis_hirsuta_box = document.createElement('input');
    const Leucochloris_albicollis_box = document.createElement('input');
    const Phaethornis_eurynome_box = document.createElement('input');
    const Phaethornis_squalidus_box = document.createElement('input');
    const Rhamphodon_naevius_box = document.createElement('input');
    const Thalurania_xglaucopis_box = document.createElement('input');
    const Heliconius_erato_box = document.createElement('input');
    const Heliconius_ethilla_box = document.createElement('input');
    const Heliconius_nattereri_box = document.createElement('input');
    const Heliconius_numato_box = document.createElement('input');
    const Heliconius_sara_box = document.createElement('input');
    const Oleria_aquata_box = document.createElement('input');
    const Paracalystos_sp_box = document.createElement('input');
    const Saliana_triangularis_box = document.createElement('input');
    const Strymon_oreala_box = document.createElement('input');
    const Bombus_morio_box = document.createElement('input');
    const Epicharis_obscura_box = document.createElement('input');
    const Euglossa_chalybeata_box = document.createElement('input');
    const Euglossa_sp_box = document.createElement('input');
    const Trigona_fulviventris_box = document.createElement('input');
    var switchElement = document.createElement('input');

    const updateBipartiteGraph = (resetZoom = true, inputnodes, inputlinks) => {
      // eslint-disable-next-line
      generationvalue = 0; generationtext.text('Generation: ' +  generationvalue);

      let newGraph;
      newGraph = getGraphData(inputnodes, inputlinks)

      const selectedNodeIds = new Set();

      selectedNodeIds.add(1).add(2).add(3).add(4).add(5).add(6).add(7).add(8).add(9).add(10).add(11).add(12).add(13).add(14).add(15).add(16).add(17).add(18).add(19).add(20).add(21).add(22);

      if (Amazilia_fimbriata_box.checked) {
        selectedNodeIds.add(23);
      }
      if (Aphantochroa_cirrhochloris_box.checked) {
        selectedNodeIds.add(24);
      }
      if (Clytolaema_rubricauda_box.checked) {
        selectedNodeIds.add(25);
      }
      if (Glaucis_hirsuta_box.checked) {
        selectedNodeIds.add(26);
      }
      if (Leucochloris_albicollis_box.checked) {
        selectedNodeIds.add(27);
      }
      if (Phaethornis_eurynome_box.checked) {
        selectedNodeIds.add(28);
      }
      if (Phaethornis_squalidus_box.checked) {
        selectedNodeIds.add(29);
      }
      if (Rhamphodon_naevius_box.checked) {
        selectedNodeIds.add(30);
      }
      if (Thalurania_xglaucopis_box.checked) {
        selectedNodeIds.add(31);
      }
      if (Heliconius_erato_box.checked) {
        selectedNodeIds.add(32);
      }
      if (Heliconius_ethilla_box.checked) {
        selectedNodeIds.add(33);
      }
      if (Heliconius_nattereri_box.checked) {
        selectedNodeIds.add(34);
      }
      if (Heliconius_numato_box.checked) {
        selectedNodeIds.add(35);
      }
      if (Heliconius_sara_box.checked) {
        selectedNodeIds.add(36);
      }
      if (Oleria_aquata_box.checked) {
        selectedNodeIds.add(37);
      }
      if (Paracalystos_sp_box.checked) {
        selectedNodeIds.add(38);
      }
      if (Saliana_triangularis_box.checked) {
        selectedNodeIds.add(39);
      }
      if (Strymon_oreala_box.checked) {
        selectedNodeIds.add(40);
      }
      if (Bombus_morio_box.checked) {
        selectedNodeIds.add(41);
      }
      if (Epicharis_obscura_box.checked) {
        selectedNodeIds.add(42);
      }
      if (Euglossa_chalybeata_box.checked) {
        selectedNodeIds.add(43);
      }
      if (Euglossa_sp_box.checked) {
        selectedNodeIds.add(44);
      }
      if (Trigona_fulviventris_box.checked) {
        selectedNodeIds.add(45);
      }

      // Filter nodes and links based on selected nodes
      const filteredNodes = newGraph.nodes.filter((node) => selectedNodeIds.has(node.id));
      const filteredLinks = newGraph.links.filter((link) => selectedNodeIds.has(link.target));

      filteredLinks.forEach((link) => {
        const sourceNode = filteredNodes.find((node) => node.id === link.source);
        const targetNode = filteredNodes.find((node) => node.id === link.target);
    
        if (sourceNode) sourceNode.connections += 1;
        if (targetNode) targetNode.connections += 1;
      });

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
          newGraph = getGraphData(data.nodes1, data.links1, true);
          break;
        case 2:
          newGraph = getGraphData(data.nodes2, data.links2, true);
          break;
        case 3:
          newGraph = getGraphData(data.nodes3, data.links3, true);
          break;
        case 4:
          newGraph = generateBarabasiAlbertGraph(nodeAmountBA, initialmBA);
          break;
        case 5:
          nodes = d3.range(1, nodeAmountRandom + 1).map((i) => ({ id: i, connections: 0 }));
          links = generateRandomLinks(nodes, randomChance);
          newGraph = { nodes, links };
          break;
        case 6:
          newGraph = getGraphData(data.nodesBi, data.linksBi, true);
          break;
        case 7:
          newGraph = getGraphData(data.nodesBi, data.linksBi, true);
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
        buttonTextSample.classList.add('sectionTitle');
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

        const buttonTextAlgs = document.createElement('span');
        buttonTextAlgs.innerText = 'Algorithmic Graph Creation';
        buttonTextAlgs.classList.add('sectionTitle');
        buttonWrapper.appendChild(buttonTextAlgs);

        const resetButton4 = document.createElement('button');
        resetButton4.innerText = 'Barabasi Albert';
        resetButton4.addEventListener('click', () => resetGraph(4, false));
        resetButton4.classList.add('button');
        buttonWrapper.appendChild(resetButton4);

        const handlenodeAmountBAChange = (event) => {
          const newRandomChance2 = parseFloat(event.target.value);
          setnodeAmountBA(newRandomChance2);
          // eslint-disable-next-line
          nodeAmountBA = newRandomChance2;
          sliderBA1Text.innerHTML = '# of nodes ' + nodeAmountBA;
        };

        const sliderBA1 = document.createElement('input');
        sliderBA1.type = 'range';
        sliderBA1.min = 30;
        sliderBA1.max = 200;
        sliderBA1.step = 5;
        sliderBA1.value = nodeAmountBA;
        sliderBA1.classList.add('slider');
        sliderBA1.addEventListener('input', handlenodeAmountBAChange);
        buttonWrapper.appendChild(sliderBA1);

        var sliderBA1Text = document.createElement('sliderText');
        sliderBA1Text.innerHTML = '# of nodes ' + nodeAmountBA;
        sliderBA1Text.classList.add('sliderText');
        buttonWrapper.appendChild(sliderBA1Text);

        const handleinitialmBAChange = (event) => {
          const newRandomChance2 = parseFloat(event.target.value);
          setinitialmBA(newRandomChance2);
          // eslint-disable-next-line
          initialmBA = newRandomChance2;
          sliderBA2Text.innerHTML = 'Initial Connections ' + initialmBA;
        };

        const sliderBA2 = document.createElement('input');
        sliderBA2.type = 'range';
        sliderBA2.min = 1;
        sliderBA2.max = 10;
        sliderBA2.step = 1;
        sliderBA2.value = initialmBA;
        sliderBA2.classList.add('slider');
        sliderBA2.addEventListener('input', handleinitialmBAChange);
        buttonWrapper.appendChild(sliderBA2);

        var sliderBA2Text = document.createElement('sliderText');
        sliderBA2Text.innerHTML = 'Initial Connections ' + initialmBA;
        sliderBA2Text.classList.add('sliderText');
        buttonWrapper.appendChild(sliderBA2Text);

        const resetButton5 = document.createElement('button');
        resetButton5.innerText = 'Random';
        resetButton5.addEventListener('click', () => resetGraph(5, false));
        resetButton5.classList.add('button');
        buttonWrapper.appendChild(resetButton5);

        const handlenodeAmountRChange = (event) => {
          const newRandomChance2 = parseFloat(event.target.value);
          setnodeAmountRandom(newRandomChance2);
          // eslint-disable-next-line
          nodeAmountRandom = newRandomChance2;
          sliderR1Text.innerHTML = '# of nodes ' + nodeAmountRandom;
        };

        const sliderR1 = document.createElement('input');
        sliderR1.type = 'range';
        sliderR1.min = 30;
        sliderR1.max = 200;
        sliderR1.step = 5;
        sliderR1.value = nodeAmountRandom;
        sliderR1.classList.add('slider');
        sliderR1.addEventListener('input', handlenodeAmountRChange);
        buttonWrapper.appendChild(sliderR1);

        var sliderR1Text = document.createElement('sliderText');
        sliderR1Text.innerHTML = '# of nodes ' + nodeAmountRandom;
        sliderR1Text.classList.add('sliderText');
        buttonWrapper.appendChild(sliderR1Text);

        const handleRChanceChange = (event) => {
          const newRandomChance2 = parseFloat(event.target.value);
          setRandomGraphChance(newRandomChance2);
          // eslint-disable-next-line
          randomChance = newRandomChance2;
          sliderR2Text.innerHTML = 'Edge probability ' + Math.round(randomChance*100) + '%';
        };

        const sliderR2 = document.createElement('input');
        sliderR2.type = 'range';
        sliderR2.min = 0;
        sliderR2.max = 0.3;
        sliderR2.step = 0.01;
        sliderR2.value = randomChance;
        sliderR2.classList.add('slider');
        sliderR2.addEventListener('input', handleRChanceChange);
        buttonWrapper.appendChild(sliderR2);

        var sliderR2Text = document.createElement('sliderText');
        sliderR2Text.innerHTML = 'Edge probability ' + Math.round(randomChance*100) + '%';
        sliderR2Text.classList.add('sliderText');
        buttonWrapper.appendChild(sliderR2Text);

        const SpreadWrapper = document.createElement('div');
        SpreadWrapper.classList.add('right-wrapper');
        RightWrapperRef.current.prepend(SpreadWrapper);

        const buttonTextSpread = document.createElement('span');
        buttonTextSpread.innerText = 'Spread';
        buttonTextSpread.classList.add('sectionTitle');
        SpreadWrapper.appendChild(buttonTextSpread);

        const buttonTextSpr = document.createElement('span');
        buttonTextSpr.innerText = 'Values for spread*';
        buttonTextSpr.classList.add('sectionText');
        SpreadWrapper.appendChild(buttonTextSpr);

        const handleRandomChanceChange = (event) => {
          const newRandomChance = parseFloat(event.target.value);
          setRandomChance(newRandomChance);
          // eslint-disable-next-line
          infectionRate = newRandomChance;
          sliderText.innerHTML = 'Infection rate ' + Math.round(infectionRate*100) + '%';
        };

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 1;
        slider.step = 0.01;
        slider.value = infectionRate;
        slider.classList.add('slider');
        slider.addEventListener('input', handleRandomChanceChange);
        SpreadWrapper.appendChild(slider);

        var sliderText = document.createElement('sliderText');
        sliderText.innerHTML = 'Infection rate ' + Math.round(infectionRate*100) + '%';
        sliderText.classList.add('sliderText');
        SpreadWrapper.appendChild(sliderText);

        const handleRandomChanceChange2 = (event) => {
          const newRandomChance2 = parseFloat(event.target.value);
          setRandomChance2(newRandomChance2);
          // eslint-disable-next-line
          maskRate = newRandomChance2;
          sliderText2.innerHTML = 'Mask Rate ' + Math.round(maskRate*100) + '%';
        };

        const slider2 = document.createElement('input');
        slider2.type = 'range';
        slider2.min = 0;
        slider2.max = 1;
        slider2.step = 0.01;
        slider2.value = maskRate;
        slider2.classList.add('slider');
        slider2.addEventListener('input', handleRandomChanceChange2);
        SpreadWrapper.appendChild(slider2);

        var sliderText2 = document.createElement('sliderText');
        sliderText2.innerHTML = 'Mask Rate ' + Math.round(maskRate*100) + '%';
        sliderText2.classList.add('sliderText');
        SpreadWrapper.appendChild(sliderText2);

        const buttonTextResi = document.createElement('span');
        buttonTextResi.innerText = 'Resilience';
        buttonTextResi.classList.add('sectionTitle');
        SpreadWrapper.appendChild(buttonTextResi);

        const resetButton6 = document.createElement('button');
        resetButton6.innerText = 'Bipartite Graph';
        resetButton6.addEventListener('click', () => resetGraph(6, true));
        resetButton6.classList.add('button');
        SpreadWrapper.appendChild(resetButton6);

        const resetButton7 = document.createElement('button');
        resetButton7.innerText = 'Projection Graph';
        resetButton7.addEventListener('click', () => resetGraph(7, true));
        resetButton7.classList.add('button');
        SpreadWrapper.appendChild(resetButton7);

        const SwitchText = document.createElement('span');
        SwitchText.innerText = 'Switch between bipartite and projection view';
        SwitchText.classList.add('sectionText');
        SpreadWrapper.appendChild(SwitchText);

        var switchContainer = document.createElement("label");
        switchContainer.className = "switch";
        var switchLabel = document.createElement("span");
        switchLabel.className = "toggleswitch";
        switchElement.type = "checkbox";
        switchElement.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        switchContainer.appendChild(switchElement);
        switchContainer.appendChild(switchLabel);
        SpreadWrapper.appendChild(switchContainer);

        const ResilienceWrapper = document.createElement('div');
        ResilienceWrapper.classList.add('checkbox-wrapper');
        CheckboxWrapperRef.current.prepend(ResilienceWrapper);

        Amazilia_fimbriata_box.type = 'checkbox'
        Amazilia_fimbriata_box.checked = true;
        Amazilia_fimbriata_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Amazilia_fimbriata_box.classList.add('checkboxes');
        Amazilia_fimbriata_box.title = 'Hummingbird: Amazilia fimbriata';
        ResilienceWrapper.appendChild(Amazilia_fimbriata_box);

        Aphantochroa_cirrhochloris_box.type = 'checkbox'
        Aphantochroa_cirrhochloris_box.checked = true;
        Aphantochroa_cirrhochloris_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Aphantochroa_cirrhochloris_box.classList.add('checkboxes');
        Aphantochroa_cirrhochloris_box.title = 'Hummingbird: Aphantochroa cirrhochloris';
        ResilienceWrapper.appendChild(Aphantochroa_cirrhochloris_box);

        Clytolaema_rubricauda_box.type = 'checkbox'
        Clytolaema_rubricauda_box.checked = true;
        Clytolaema_rubricauda_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Clytolaema_rubricauda_box.classList.add('checkboxes');
        Clytolaema_rubricauda_box.title = 'Hummingbird: Clytolaema rubricauda';
        ResilienceWrapper.appendChild(Clytolaema_rubricauda_box);

        Glaucis_hirsuta_box.type = 'checkbox'
        Glaucis_hirsuta_box.checked = true;
        Glaucis_hirsuta_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Glaucis_hirsuta_box.classList.add('checkboxes');
        Glaucis_hirsuta_box.title = 'Hummingbird: Glaucis hirsuta';
        ResilienceWrapper.appendChild(Glaucis_hirsuta_box);

        Leucochloris_albicollis_box.type = 'checkbox'
        Leucochloris_albicollis_box.checked = true;
        Leucochloris_albicollis_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Leucochloris_albicollis_box.classList.add('checkboxes');
        Leucochloris_albicollis_box.title = 'Hummingbird: Leucochloris albicollis';
        ResilienceWrapper.appendChild(Leucochloris_albicollis_box);

        Phaethornis_eurynome_box.type = 'checkbox'
        Phaethornis_eurynome_box.checked = true;
        Phaethornis_eurynome_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Phaethornis_eurynome_box.classList.add('checkboxes');
        Phaethornis_eurynome_box.title = 'Hummingbird: Phaethornis eurynome';
        ResilienceWrapper.appendChild(Phaethornis_eurynome_box);

        Phaethornis_squalidus_box.type = 'checkbox'
        Phaethornis_squalidus_box.checked = true;
        Phaethornis_squalidus_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Phaethornis_squalidus_box.classList.add('checkboxes');
        Phaethornis_squalidus_box.title = 'Hummingbird: Phaethornis squalidus';
        ResilienceWrapper.appendChild(Phaethornis_squalidus_box);

        Rhamphodon_naevius_box.type = 'checkbox'
        Rhamphodon_naevius_box.checked = true;
        Rhamphodon_naevius_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Rhamphodon_naevius_box.classList.add('checkboxes');
        Rhamphodon_naevius_box.title = 'Hummingbird: Rhamphodon naevius';
        ResilienceWrapper.appendChild(Rhamphodon_naevius_box);

        Thalurania_xglaucopis_box.type = 'checkbox'
        Thalurania_xglaucopis_box.checked = true;
        Thalurania_xglaucopis_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Thalurania_xglaucopis_box.classList.add('checkboxes');
        Thalurania_xglaucopis_box.title = 'Hummingbird: Thalurania glaucopis';
        ResilienceWrapper.appendChild(Thalurania_xglaucopis_box);

        Heliconius_erato_box.type = 'checkbox'
        Heliconius_erato_box.checked = true;
        Heliconius_erato_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Heliconius_erato_box.classList.add('checkboxes');
        Heliconius_erato_box.title = 'Butterfly: Heliconius erato';
        ResilienceWrapper.appendChild(Heliconius_erato_box);

        Heliconius_ethilla_box.type = 'checkbox'
        Heliconius_ethilla_box.checked = true;
        Heliconius_ethilla_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Heliconius_ethilla_box.classList.add('checkboxes');
        Heliconius_ethilla_box.title = 'Butterfly: Heliconius ethilla';
        ResilienceWrapper.appendChild(Heliconius_ethilla_box);

        Heliconius_nattereri_box.type = 'checkbox'
        Heliconius_nattereri_box.checked = true;
        Heliconius_nattereri_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Heliconius_nattereri_box.classList.add('checkboxes');
        Heliconius_nattereri_box.title = 'Butterfly: Heliconius nattereri';
        ResilienceWrapper.appendChild(Heliconius_nattereri_box);

        Heliconius_numato_box.type = 'checkbox'
        Heliconius_numato_box.checked = true;
        Heliconius_numato_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Heliconius_numato_box.classList.add('checkboxes');
        Heliconius_numato_box.title = 'Butterfly: Heliconius numato';
        ResilienceWrapper.appendChild(Heliconius_numato_box);

        Heliconius_sara_box.type = 'checkbox'
        Heliconius_sara_box.checked = true;
        Heliconius_sara_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Heliconius_sara_box.classList.add('checkboxes');
        Heliconius_sara_box.title = 'Butterfly: Heliconius sara';
        ResilienceWrapper.appendChild(Heliconius_sara_box);

        Oleria_aquata_box.type = 'checkbox'
        Oleria_aquata_box.checked = true;
        Oleria_aquata_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Oleria_aquata_box.classList.add('checkboxes');
        Oleria_aquata_box.title = 'Butterfly: Oleria aquata';
        ResilienceWrapper.appendChild(Oleria_aquata_box);

        Paracalystos_sp_box.type = 'checkbox'
        Paracalystos_sp_box.checked = true;
        Paracalystos_sp_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Paracalystos_sp_box.classList.add('checkboxes');
        Paracalystos_sp_box.title = 'Butterfly: Paracalystos sp.';
        ResilienceWrapper.appendChild(Paracalystos_sp_box);

        Saliana_triangularis_box.type = 'checkbox'
        Saliana_triangularis_box.checked = true;
        Saliana_triangularis_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Saliana_triangularis_box.classList.add('checkboxes');
        Saliana_triangularis_box.title = 'Butterfly: Saliana triangularis';
        ResilienceWrapper.appendChild(Saliana_triangularis_box);

        Strymon_oreala_box.type = 'checkbox'
        Strymon_oreala_box.checked = true;
        Strymon_oreala_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Strymon_oreala_box.classList.add('checkboxes');
        Strymon_oreala_box.title = 'Butterfly: Strymon oreala';
        ResilienceWrapper.appendChild(Strymon_oreala_box);

        Bombus_morio_box.type = 'checkbox'
        Bombus_morio_box.checked = true;
        Bombus_morio_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Bombus_morio_box.classList.add('checkboxes');
        Bombus_morio_box.title = 'Bee: Bombus morio';
        ResilienceWrapper.appendChild(Bombus_morio_box);

        Epicharis_obscura_box.type = 'checkbox'
        Epicharis_obscura_box.checked = true;
        Epicharis_obscura_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Epicharis_obscura_box.classList.add('checkboxes');
        Epicharis_obscura_box.title = 'Bee: Epicharis obscura';
        ResilienceWrapper.appendChild(Epicharis_obscura_box);

        Euglossa_chalybeata_box.type = 'checkbox'
        Euglossa_chalybeata_box.checked = true;
        Euglossa_chalybeata_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Euglossa_chalybeata_box.classList.add('checkboxes');
        Euglossa_chalybeata_box.title = 'Bee: Euglossa chalybeata';
        ResilienceWrapper.appendChild(Euglossa_chalybeata_box);

        Euglossa_sp_box.type = 'checkbox'
        Euglossa_sp_box.checked = true;
        Euglossa_sp_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Euglossa_sp_box.classList.add('checkboxes');
        Euglossa_sp_box.title = 'Bee: Euglossa sp.';
        ResilienceWrapper.appendChild(Euglossa_sp_box);

        Trigona_fulviventris_box.type = 'checkbox'
        Trigona_fulviventris_box.checked = true;
        Trigona_fulviventris_box.addEventListener('change', () => updateBipartiteGraph(false, data.nodesBi, data.linksBi));
        Trigona_fulviventris_box.classList.add('checkboxes');
        Trigona_fulviventris_box.title = 'Bee: Trigona fulviventris';
        ResilienceWrapper.appendChild(Trigona_fulviventris_box);
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
      .force('charge', d3.forceManyBody().strength(-1000))
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
      .attr('stroke-width', d => 0.4 + (d.connections/8)**2 || 0.5)
      .attr('stroke-opactiy', 0.6)
      .on('click', (event, d) => {
        const sourceNode = d.source;
        const targetNode = d.target;
        if (sourceNode) sourceNode.connections -= 1;
        if (targetNode) targetNode.connections -= 1;
        links = links.filter(link => link !== d);
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
      .attr('r', d => (18 + (3 * Math.sqrt(d.connections/5))-(70/(d.connections+4))))
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

}, [width, height, findNeighboringNodes, infectionRate, generationvalue, generationtext]);

return (
  <div style={{ display: 'flex' }} ref={wrapperRef}>
    <svg ref={svgRef}></svg>
    <div>
      <div ref={RightWrapperRef}></div>
      <div ref={CheckboxWrapperRef}></div>
    </div>
  </div>
);
};


export default NetworkVisualization;