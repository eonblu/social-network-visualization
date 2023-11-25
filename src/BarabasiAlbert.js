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
      console.log(probabilities);
  
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
        console.log(i);
        return i;
      }
    }
    return probabilities.length - 1;
  }