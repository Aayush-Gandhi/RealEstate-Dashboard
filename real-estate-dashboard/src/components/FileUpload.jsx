import React from "react";

export default function FileUpload({ fileName, error, onFileUpload }) {
  return (
    <>
      <div className="upload-wrap">
        <input type="file" accept=".csv" onChange={onFileUpload} />
      </div>

      {fileName && <p className="success-text">Loaded file: {fileName}</p>}

      {error && <p className="error-text">{error}</p>}
    </>
  );
}