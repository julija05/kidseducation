import { ThemeProvider } from '@/hooks/useTheme.jsx';

export default function ThemeWrapper({ children }) {
    return (
        <ThemeProvider>
            {children}
        </ThemeProvider>
    );
}