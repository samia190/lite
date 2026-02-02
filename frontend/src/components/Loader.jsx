import React from "react";
import "./loader.css";
import { safePath } from "../utils/paths";
import OptimizedImage from "./OptimizedImage";

export default function Loader({ size = 140 }) {
  const px = typeof size === "number" ? `${size}px` : size;

  return (
    <div className="site-loader" style={{ ["--loader-size"]: px }}>
      <div className="loader-ring" />
      <div className="loader-inner">
        <img src={safePath("/header/logo.PNG")} alt="KANGARU GIRLSlogo" className="loader-logo" />
      </div>
    </div>
  );
}

