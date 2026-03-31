import React, { useCallback } from 'react';

const CodeEditor = ({ value, onChange, editable = true }) => {
  const handleChange = useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className={`relative h-full overflow-y-auto ${!editable ? 'opacity-60 pointer-events-none' : ''}`}>
      <textarea
        value={value}
        onChange={handleChange}
        spellCheck={false}
        disabled={!editable}
        className="w-full h-full bg-transparent text-on-surface resize-none outline-none p-6"
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '14px',
          lineHeight: '1.7',
          tabSize: 2,
          color: '#e5e2e1',
          caretColor: '#00fbfb',
        }}
      />
    </div>
  );
};

export default CodeEditor;
