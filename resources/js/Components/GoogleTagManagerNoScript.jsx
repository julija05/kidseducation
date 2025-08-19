import React from 'react';

const GoogleTagManagerNoScript = ({ gtmId }) => {
    // Don't render if GTM ID is not provided
    if (!gtmId) {
        return null;
    }

    return (
        <noscript>
            <iframe 
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0" 
                width="0" 
                style={{
                    display: 'none',
                    visibility: 'hidden'
                }}
                title="Google Tag Manager"
            />
        </noscript>
    );
};

export default GoogleTagManagerNoScript;