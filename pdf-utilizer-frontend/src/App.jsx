import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Merge from "./pages/Merge";
import Split from "./pages/Split";
import ExtractText from "./pages/ExtractText";
import ExtractImages from "./pages/ExtractImages";
import Sign from "./pages/Sign";
import Protect from "./pages/Protect";
import Rotate from "./pages/Rotate";
import TextToSpeech from "./pages/TextToSpeech";
import SpeechToText from "./pages/SpeechToText";
import Translate from "./pages/Translate";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import "react-toastify/dist/ReactToastify.css";


function App() {
  return (
    <Router>
      <div className="flex">
      
        <div className="flex-1">
        
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/merge" element={<Merge />} />
            <Route path="/split" element={<Split />} />
            <Route path="/extract-text" element={<ExtractText />} />
            <Route path="/extract-images" element={<ExtractImages />} />
            <Route path="/sign" element={<Sign />} />
            <Route path="/protect" element={<Protect />} />
            <Route path="/rotate" element={<Rotate />} />
            <Route path="/text-to-speech" element={<TextToSpeech />} />
            <Route path="/speech-to-text" element={<SpeechToText />} />
            <Route path="/translate" element={<Translate />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
