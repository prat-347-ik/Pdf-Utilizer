import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
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
//import Compress from "./pages/Compress";
import { FileArchive } from "lucide-react"; // Use FileArchive instead of Compress

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/merge" element={<Merge />} />
            <Route path="/split" element={<Split />} />
            <Route path="/compress" element={<FileArchive className="w-6 h-6" />} />
            <Route path="/extract-text" element={<ExtractText />} />
            <Route path="/extract-images" element={<ExtractImages />} />
            <Route path="/sign" element={<Sign />} />
            <Route path="/protect" element={<Protect />} />
            <Route path="/rotate" element={<Rotate />} />
            <Route path="/text_to_speech" element={<TextToSpeech />} />
            <Route path="/Speech_to_text" element={<SpeechToText />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
