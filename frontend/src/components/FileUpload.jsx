import React, { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://your-domain.com/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploadedUrl(data.file);
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadFile}>Upload</button>

      {uploadedUrl && (
        <p>
          File uploaded!  
          <a href={uploadedUrl} download>
            Download file
          </a>
        </p>
      )}
    </div>
  );
}
