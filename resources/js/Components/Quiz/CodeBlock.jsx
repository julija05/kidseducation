import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function CodeBlock({ code, language = 'javascript', showCopy = true, className = '' }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    // Simple syntax highlighting for common languages
    const highlightCode = (code, language) => {
        if (!code) return '';
        
        // Basic keyword highlighting for JavaScript/TypeScript
        if (language === 'javascript' || language === 'typescript' || language === 'js' || language === 'ts') {
            return code
                .replace(/\b(function|const|let|var|return|if|else|for|while|class|extends|import|export|from|default|async|await|try|catch|finally|throw|new|this|super|static|public|private|protected|readonly|interface|type|enum|namespace|module|declare|abstract|implements|keyof|typeof|instanceof|in|of|as|is|never|unknown|any|void|string|number|boolean|object|null|undefined|true|false)\b/g, '<span class="text-purple-600 font-semibold">$1</span>')
                .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '<span class="text-gray-500 italic">$&</span>')
                .replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-600">$&</span>')
                .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-blue-600">$1</span>');
        }
        
        // Basic keyword highlighting for Python
        if (language === 'python' || language === 'py') {
            return code
                .replace(/\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|lambda|pass|break|continue|global|nonlocal|assert|del|raise|async|await|and|or|not|in|is|True|False|None|self|cls|super|__init__|__str__|__repr__|print|len|range|enumerate|zip|map|filter|sorted|reversed|sum|min|max|abs|round|int|float|str|list|dict|set|tuple|type|isinstance|hasattr|getattr|setattr|delattr)\b/g, '<span class="text-purple-600 font-semibold">$1</span>')
                .replace(/#.*$/gm, '<span class="text-gray-500 italic">$&</span>')
                .replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-600">$&</span>')
                .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-blue-600">$1</span>');
        }
        
        // Basic keyword highlighting for Java
        if (language === 'java') {
            return code
                .replace(/\b(public|private|protected|static|final|abstract|class|interface|enum|extends|implements|import|package|void|int|float|double|boolean|char|String|long|short|byte|if|else|for|while|do|switch|case|default|break|continue|return|try|catch|finally|throw|throws|new|this|super|null|true|false|instanceof|synchronized|volatile|transient|native|strictfp|assert)\b/g, '<span class="text-purple-600 font-semibold">$1</span>')
                .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '<span class="text-gray-500 italic">$&</span>')
                .replace(/("(?:\\.|[^"\\])*")/g, '<span class="text-green-600">$1</span>')
                .replace(/\b(\d+\.?\d*[fFdDlL]?)\b/g, '<span class="text-blue-600">$1</span>');
        }
        
        // Basic keyword highlighting for C++
        if (language === 'cpp' || language === 'c++' || language === 'c') {
            return code
                .replace(/\b(int|float|double|char|bool|void|auto|const|static|extern|register|volatile|inline|virtual|public|private|protected|class|struct|union|enum|typedef|namespace|using|template|typename|if|else|for|while|do|switch|case|default|break|continue|return|goto|try|catch|throw|new|delete|this|nullptr|true|false|sizeof|const_cast|dynamic_cast|static_cast|reinterpret_cast|typeid|std|cout|cin|endl|include|define|ifdef|ifndef|endif|pragma)\b/g, '<span class="text-purple-600 font-semibold">$1</span>')
                .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '<span class="text-gray-500 italic">$&</span>')
                .replace(/("(?:\\.|[^"\\])*")/g, '<span class="text-green-600">$1</span>')
                .replace(/\b(\d+\.?\d*[fFdDlL]?)\b/g, '<span class="text-blue-600">$1</span>');
        }
        
        // Basic keyword highlighting for HTML
        if (language === 'html' || language === 'xml') {
            return code
                .replace(/(&lt;\/?\w+[^&gt;]*&gt;)/g, '<span class="text-blue-600">$1</span>')
                .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-gray-500 italic">$1</span>')
                .replace(/(\w+)=/g, '<span class="text-red-600">$1</span>=')
                .replace(/="([^"]*)"/g, '="<span class="text-green-600">$1</span>"');
        }
        
        // Basic keyword highlighting for CSS
        if (language === 'css') {
            return code
                .replace(/([.#]?[a-zA-Z-]+)\s*\{/g, '<span class="text-purple-600 font-semibold">$1</span> {')
                .replace(/([a-zA-Z-]+)\s*:/g, '<span class="text-blue-600">$1</span>:')
                .replace(/:\s*([^;]+);/g, ': <span class="text-green-600">$1</span>;')
                .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500 italic">$&</span>');
        }
        
        // Basic keyword highlighting for SQL
        if (language === 'sql') {
            return code
                .replace(/\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|ALTER|DROP|TABLE|DATABASE|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER|IF|ELSE|WHILE|FOR|DECLARE|BEGIN|END|RETURN|GRANT|REVOKE|COMMIT|ROLLBACK|TRANSACTION|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|NOT|NULL|DEFAULT|CHECK|AUTO_INCREMENT|TIMESTAMP|VARCHAR|INT|BIGINT|DECIMAL|BOOLEAN|TEXT|BLOB|DATE|TIME|DATETIME|ENUM|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|DISTINCT|AS|AND|OR|IN|BETWEEN|LIKE|IS|EXISTS|CASE|WHEN|THEN|ELSE|END|COUNT|SUM|AVG|MIN|MAX|ROUND|UPPER|LOWER|SUBSTRING|CONCAT|COALESCE|ISNULL|CAST|CONVERT)\b/gi, '<span class="text-purple-600 font-semibold">$1</span>')
                .replace(/--.*$/gm, '<span class="text-gray-500 italic">$&</span>')
                .replace(/('(?:[^']|'')*')/g, '<span class="text-green-600">$1</span>')
                .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-blue-600">$1</span>');
        }
        
        return code;
    };

    // Escape HTML characters
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const escapedCode = escapeHtml(code);
    const highlightedCode = highlightCode(escapedCode, language);

    return (
        <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-400 text-sm font-medium">
                        {language.toUpperCase()}
                    </span>
                </div>
                
                {showCopy && (
                    <button
                        onClick={handleCopy}
                        className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors text-sm"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                )}
            </div>
            
            {/* Code content */}
            <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                <code 
                    className="font-mono leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
            </pre>
        </div>
    );
}