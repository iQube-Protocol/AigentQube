import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const MermaidComponent = ({ chart }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      arrowMarkerAbsolute: true,
    });

    if (chartRef.current) {
      mermaid.contentLoaded();
    }
  }, [chart]);

  return <div ref={chartRef} className="mermaid">{chart}</div>;
};

export default MermaidComponent;