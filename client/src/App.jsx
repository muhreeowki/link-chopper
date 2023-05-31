import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Form from "./components/form";

const App = () => {
  return (
      <div className="App">
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Routes>
              <Route path="/" Component={Form} />
              <Route path="/app" Component={Form} />
            </Routes>
          </div>
        </div>
      </div>
  );
}

export default App;