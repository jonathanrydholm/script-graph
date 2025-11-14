import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import theme from './Theme';
import { ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { StoreProvider } from './Providers/Store.tsx';
import CssBaseline from '@mui/material/CssBaseline';
import { NodeLogProvider } from './Providers/NodeLogs.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <CssBaseline />
        <ThemeProvider theme={theme}>
            <SnackbarProvider>
                <BrowserRouter>
                    <ReactFlowProvider>
                        <StoreProvider>
                            <NodeLogProvider>
                                <App />
                            </NodeLogProvider>
                        </StoreProvider>
                    </ReactFlowProvider>
                </BrowserRouter>
            </SnackbarProvider>
        </ThemeProvider>
    </StrictMode>,
);
