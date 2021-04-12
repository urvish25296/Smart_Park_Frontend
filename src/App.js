import "./App.css";
//Router for navigation
import { BrowserRouter as Router, Route } from "react-router-dom";
import Login from "./components/Login";
import Main from "./components/Main";

function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/" exact component={Login} />

        <Route path="/main" exact component={Main} />
      </Router>
    </div>
  );
}

export default App;
