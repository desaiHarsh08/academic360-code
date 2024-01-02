import {
  HashRouter as Router,
  Routes,
  Route
} from "react-router-dom"
import Home from "./pages/Home";
import DashboardHome from "./components/DashboardHome";
import Dashboard from "./pages/Dashboard";
import AddStudent from "./components/AddStudent";
import SearchStudent from "./components/SearchStudent";
import DeleteStudent from "./components/DeleteStudent";
import Settings from "./components/Settings";
import GetAllReports from "./components/GetAllReports";
import ViewMarksheet from "./components/EditMarksheet";
import EditMarksheet from "./components/EditMarksheet";


function App() {
  return (
    <Router>
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route exact path="/dashboard" element={<Dashboard />}>
        <Route exact path="" element={<DashboardHome />} />
        <Route exact path="add" element={<AddStudent />} />
        <Route exact path="search" element={<SearchStudent />} />
        <Route exact path="delete" element={<DeleteStudent />} />
        
        <Route exact path="get-reports" element={<GetAllReports />} />
      </Route>
      <Route exact path="/edit" element={<EditMarksheet />} />
      <Route exact path="/settings" element={<Settings />} />
    </Routes>
    </Router>
  );
}

export default App;
