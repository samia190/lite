import React from "react";
import { useLoading } from "./LoadingContext";
import Loader from "./Loader";

export default function AppLoaderWrapper({ children }) {
  const { loading } = useLoading();

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#fff",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: loading ? 1 : 0,
          pointerEvents: loading ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      >
        <Loader />
      </div>
      <div style={{ opacity: loading ? 0 : 1, transition: "opacity 0.3s ease" }}>
        {children}
      </div>
    </>
  );
}
