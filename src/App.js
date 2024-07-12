import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import {
  BrowserRouter as Router,
  Routes as Switch,
  Route,
} from "react-router-dom";
function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Switch>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/about" element={<About />} />
          </Switch>
      </Router>
    </>
  );
}

export default App;
