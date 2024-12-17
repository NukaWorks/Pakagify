import { BrowserRouter, Route, Routes } from "react-router";
import RecentView from "./Views/RecentView";
import ProjectView from "./Views/ProjectView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/"} element={<RecentView />} />
        <Route path={"/project"} element={<ProjectView />} />
      </Routes>
    </BrowserRouter>
  );
}
