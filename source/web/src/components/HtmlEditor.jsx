import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const HtmlEditor = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'code-block'],
      ['clean'],
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image', 'code-block'
  ];

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-brand-200 focus-within:border-brand-500">
      <style>{`
        .ql-toolbar { border: none !important; border-bottom: 1px solid #e5e7eb !important; background: #f8fafc; }
        .ql-container { border: none !important; min-height: 200px; }
        .ql-editor { font-family: inherit; font-size: 0.875rem; line-height: 1.6; }
        .ql-editor.ql-blank::before { color: #94a3b8; font-style: normal; }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Nhập mô tả chi tiết tại đây hoặc dán nội dung từ website khác..."
      />
    </div>
  );
};

export default HtmlEditor;
