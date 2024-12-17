import ProjectView from "./ProjectView";
import { MemoryRouter, Route, Routes } from "react-router";
import RecentView from "./RecentView";

export default function MainWindow() {
  return (
    <MemoryRouter initialEntries={["/project"]}>
      <Routes>
        <Route path={"/"} element={<RecentView />} />
        <Route path={"/project"} element={<ProjectView />} />
      </Routes>
    </MemoryRouter>
  );
}
