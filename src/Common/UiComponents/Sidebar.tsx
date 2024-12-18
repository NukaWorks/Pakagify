import { ReactElement } from "react";
import PropTypes from "prop-types";

export default function Sidebar({
  children,
  direction,
}: Readonly<{
  children: ReactElement;
  direction: "Vertical" | "Horizontal";
}>) {
  return (
    <div
      className={[
        "App__SidePanel",
        direction.match("Vertical") ? "App__SidePanel--Vertical" : "App__SidePanel--Horizontal",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

Sidebar.propTypes = {
  children: PropTypes.any,
  direction: PropTypes.string,
};

Sidebar.defaultProps = {
  direction: "Vertical",
};
