import React from "react";
import ReactQuill from 'react-quill';
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import 'react-quill/dist/quill.snow.css';
// import { Editor } from "@toast-ui/react-editor";
const Markdown = () => {
  return (
    <Editor
      initialValue="hello Sistem Ujian!"
      previewStyle="vertical"
      height="600px"
      initialEditType="markdown"
      useCommandShortcut={true}
    />
  );
};

export default Markdown;
