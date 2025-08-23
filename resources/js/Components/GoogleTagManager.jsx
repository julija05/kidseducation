import React from 'react';
import { Head } from '@inertiajs/react';

const GoogleTagManager = ({ gtmId, gaId }) => {
    // Don't render in development or if IDs are not provided
    if (!gtmId && !gaId) {
        return null;
    }

    return (
        <Head>
            {/* Google Tag Manager */}
            {gtmId && (
                <>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                                })(window,document,'script','dataLayer','${gtmId}');
                            `
                        }}
                    />
                </>
            )}

            {/* Google Analytics 4 (if GA ID is provided separately) */}
            {gaId && !gtmId && (
                <>
                    <script
                        async
                        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                    />
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${gaId}', {
                                    page_title: document.title,
                                    page_location: window.location.href,
                                    send_page_view: true
                                });
                            `
                        }}
                    />
                </>
            )}
        </Head>
    );
};

export default GoogleTagManager;