import React, { useEffect, useRef } from 'react';

export default function AdSlot({ code, className = "" }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!code || !containerRef.current) return;

        // Create a document fragment to carefully inject the HTML/JS
        const fragment = document.createRange().createContextualFragment(code);
        
        // Clear previous content
        containerRef.current.innerHTML = '';
        
        // Append new content
        containerRef.current.appendChild(fragment);

    }, [code]);

    if (!code) return null;

    return (
        <div className={`w-full overflow-hidden flex justify-center items-center my-4 ${className}`}>
            <div ref={containerRef} className="max-w-full"></div>
        </div>
    );
}
