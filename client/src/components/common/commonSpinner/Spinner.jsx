import React from "react";
import { HashLoader, PacmanLoader, RingLoader } from "react-spinners";
import "./Spinner.css";

export const SpinnerTypes = {
  HASH: "hash",
  PACMAN: "pacman",
  RING: "ring",
};

export default function Spinner({ type = SpinnerTypes.HASH, size = 100, color = "#36D7B7" }) {
  const loaderProps = { size, color, loading: true };

  const renderLoader = () => {
    switch (type) {
      case SpinnerTypes.PACMAN:
        return <PacmanLoader {...loaderProps} />;
      case SpinnerTypes.RING:
        return <RingLoader {...loaderProps} />;
      case SpinnerTypes.HASH:
      default:
        return <HashLoader {...loaderProps} />;
    }
  };

  return <div className="spinner-container">{renderLoader()}</div>;
}
