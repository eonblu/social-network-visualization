import './App.css';
import NetworkVisualization from './D3';

function App() {
  return (
    <div className="App">
      <div>
      <h2>Mathematik & Nachhaltigkeit</h2>
      <h4>Visualisierung von Graphen</h4>
      <NetworkVisualization />
      </div>
      <div className="ExplanationText">
        <h1>Explanation</h1>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
        At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
        At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
      </div>
    </div>
  );
}

export default App;
