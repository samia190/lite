import { useEffect, useState } from "react";
import { get, patch } from "../utils/api";
import FileUpload from "./FileUpload";

export default function BackgroundManager() {
  const [backgrounds, setBackgrounds] = useState({});

  useEffect(() => {
    fetchBackgrounds();
  }, []);

  const fetchBackgrounds = async () => {
    const res = await get("/settings/backgrounds");
    setBackgrounds(res || {});
  };

  const updateBackground = async (page, url) => {
    const updated = { ...backgrounds, [page]: url };
    setBackgrounds(updated);
    await patch("/settings/backgrounds", { [page]: url });
  };

  return (
    <div>
      <h3>Page Backgrounds</h3>

      {["home", "login", "signup"].map((page) => (
        <div key={page} style={{ marginBottom: "20px" }}>
          <strong>{page.toUpperCase()} PAGE</strong>

          <FileUpload
            value={backgrounds[page]}
            onChange={(url) => updateBackground(page, url)}
          />
        </div>
      ))}
    </div>
  );
}
