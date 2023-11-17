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

// Example usage:
const graph = generateBarabasiAlbertGraph(20, 2);
console.log(graph);