import "./App.scss";
import { ChartComponent } from "./components/chartComponent/ChartComponent";
import { TableComponent } from "./components/TableComponent/TableComponent";

function App() {
  return (
    <div className="App">
      <div className="chartContainer">
        {/* <ChartComponent /> */}
    <TableComponent/>
      </div>
    </div>
  );
}

export default App;
