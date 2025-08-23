import React from 'react';
import CodeBlock from './CodeBlock';
import { parseCodeBlocks } from '@/Utils/codeBlockParser';

export default function QuestionText({ text, className = '', showCopy = true }) {
    if (!text) return null;
    
    const parsed = parseCodeBlocks(text);
    
    if (!parsed.hasCodeBlocks) {
        return (
            <div className={`prose prose-sm max-w-none ${className}`}>
                <div dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }} />
            </div>
        );
    }
    
    // Split content by code block placeholders
    const parts = parsed.content.split(/\{\{((?:CODE_BLOCK|INLINE_CODE)_\d+)\}\}/);
    
    return (
        <div className={`prose prose-sm max-w-none ${className}`}>
            {parts.map((part, index) => {
                // Check if this part is a code block placeholder
                const codeBlock = parsed.codeBlocks.find(block => block.id === part);
                
                if (codeBlock) {
                    if (codeBlock.isBlock) {
                        // Render as code block
                        return (
                            <div key={index} className="my-4">
                                <CodeBlock
                                    code={codeBlock.code}
                                    language={codeBlock.language}
                                    showCopy={showCopy}
                                />
                            </div>
                        );
                    } else {
                        // Render as inline code
                        return (
                            <code 
                                key={index} 
                                className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono"
                            >
                                {codeBlock.code}
                            </code>
                        );
                    }
                } else {
                    // Render as regular text
                    return part && (
                        <div 
                            key={index} 
                            dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br />') }} 
                        />
                    );
                }
            })}
        </div>
    );
}