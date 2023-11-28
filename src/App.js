import './App.css';
import NetworkVisualization from './D3';

function App() {
  return (
    <div className="App">
      <div>
      <h2>Mathematics & Sustainability</h2>
      <h4>Visualization of networks and their sustainability characteristics</h4>
      <NetworkVisualization />
      </div>
      <div className="ExplanationText">
      <h2>Explanation</h2>
      <span className="ExplanationSectionText">This web app has been created as part of a course at Freie Universität Berlin to support a talk on complex networks in the context of mathematics and sustainability.</span>
      <span className="ExplanationSectionTitle">Sample Sets</span>
      <span className="ExplanationSectionText">The sample sets represent 3 default networks. One has been created using the Random Graph algorithm, one using the Barabasi Albert algorithm and one represents an actual social network. The data was collected from the members of a university karate club by Wayne Zachary in 1977. Each node represents a member of the club, and each edge represents a tie between two members of the club. (<a href="http://konect.cc/networks/ucidata-zachary/">Source: Konect.cc</a>) Can you figure out which is which?</span>
      <span className="ExplanationSectionTitle">Algorithmic Network Creation</span>
      <span className="ExplanationSectionText">There are two algorithms for network generation. The sliders adjust the amount of nodes created and in case of the Barabasi Albert the amount of initial connections, and the amount of connections each node starts with. In case of the Random Graph it adjusts the chance any two nodes are connected.</span>
      <span className="ExplanationSectionTitle">Simple Spread Simulation</span>
      <span className="ExplanationSectionText">On click of a node it changes color and can infect its neighbors. The infection and mask rate can be adjusted. Infection rate is adjusted depending on the mask rate - 2 masks result in 2% of infectionrate, 1 mask results in 25% of infectionrate, and no mask results in no change to the infection rate.</span>
      <span className="ExplanationSectionTitle">Simple Resilience Simulation</span>
      <span className="ExplanationSectionText">A dataset (<span className="container">Adjacency matrix<span className="picture"><img src="/NetworkResilienceExample.PNG" alt="Adjacency matrix"></img></span></span>) of pollinators in the Southern Brazil Atlantic Rainforest is the basis of the bipartite graph. The projection graph shows the connection between plants that share a pollinator. Each checkbox corresponds to one pollinator and to simulate the resilience of the network, the pollinators can be removed from the network entirely. The data was collected in 2012 by Varassin & Sazima. (<a href="http://www.ecologia.ib.usp.br/iwdb/html/varassin_sazima_2012.html">Source: Ecologia.ib.usp.br</a>)</span>
      <span className="ExplanationSectionTitle">Disclaimer</span>
      <span className="ExplanationSectionText">This app has been created with strong support of ChatGPT and with little previous experience from my side with Javascript.</span>
      </div>
    </div>
  );
}

export default App;
