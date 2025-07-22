/**
 * Parse text containing code blocks and return structured data
 * Supports both inline code (`code`) and code blocks (```language\ncode\n```)
 */
export function parseCodeBlocks(text) {
    if (!text) return { hasCodeBlocks: false, content: text };
    
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    let hasCodeBlocks = false;
    let content = text;
    let match;
    const codeBlocks = [];
    
    // Extract code blocks
    while ((match = codeBlockRegex.exec(text)) !== null) {
        hasCodeBlocks = true;
        const language = match[1] || 'text';
        const code = match[2].trim();
        const blockId = `CODE_BLOCK_${codeBlocks.length}`;
        
        codeBlocks.push({
            id: blockId,
            language,
            code,
            isBlock: true
        });
        
        // Replace with placeholder
        content = content.replace(match[0], `{{${blockId}}}`);
    }
    
    // Extract inline code
    while ((match = inlineCodeRegex.exec(text)) !== null) {
        hasCodeBlocks = true;
        const code = match[1];
        const blockId = `INLINE_CODE_${codeBlocks.length}`;
        
        codeBlocks.push({
            id: blockId,
            language: 'text',
            code,
            isBlock: false
        });
        
        // Replace with placeholder
        content = content.replace(match[0], `{{${blockId}}}`);
    }
    
    return {
        hasCodeBlocks,
        content,
        codeBlocks
    };
}

/**
 * Check if text contains code blocks
 */
export function hasCodeBlocks(text) {
    if (!text) return false;
    return /```[\s\S]*?```|`[^`]+`/.test(text);
}

/**
 * Get preview of code blocks for admin display
 */
export function getCodeBlockPreview(text, maxLength = 50) {
    const parsed = parseCodeBlocks(text);
    if (!parsed.hasCodeBlocks) return null;
    
    const previews = parsed.codeBlocks.map(block => ({
        language: block.language,
        preview: block.code.substring(0, maxLength) + (block.code.length > maxLength ? '...' : ''),
        isBlock: block.isBlock
    }));
    
    return previews;
}