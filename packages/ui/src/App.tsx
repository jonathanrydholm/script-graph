import { Box, Stack } from '@mui/material';
import { Outlet, Route, Routes } from 'react-router-dom';
import FlowEditor from './FlowEditor';
import Projects from './Projects';
import { useEffect, useState } from 'react';
import {
    type ProjectConfig,
    type ProjectFlow,
} from '@script_graph/general-types';
import { NodeProvider } from './FlowEditor/NodeProvider';

declare global {
    interface Window {
        api: {
            /** Wait until electron to finalize.  */
            waitUntilReady: () => Promise<void>;

            /** Subscribe to any project mutations.  */
            subscribeToProjects: (
                callback: (stringifiedProjects: string) => void,
            ) => () => void;

            getFlow: (
                projectId: string,
                flowId: string,
            ) => Promise<ProjectFlow>;

            createProject: (project: ProjectConfig) => Promise<void>;

            deleteProject: (project: ProjectConfig) => Promise<void>;

            updateProject: (config: ProjectConfig) => Promise<void>;

            executeFlow: (projectId: string, flowId: string) => Promise<void>;

            selectFolder: () => Promise<string | null>;

            onNodeLog: (
                callback: (stringifiedLog: string) => void,
            ) => () => void;

            onNodeStatus: (
                callback: (statusMessage: string) => void,
            ) => () => void;

            subscribeToPlugins: (
                callback: (plugins: string) => void,
            ) => () => void;
        };
    }
}

function App() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        window.api.waitUntilReady().then(() => setReady(true));
    }, []);

    if (!ready) {
        return <></>;
    }

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path={`project/:projectId`}>
                    <Route
                        path={`flow/:flowId`}
                        element={
                            <NodeProvider>
                                <FlowEditor />
                            </NodeProvider>
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <Stack
                                justifyContent="center"
                                alignItems="center"
                                flex={1}
                                width="100%"
                                color="white"
                            >
                                Select flow
                            </Stack>
                        }
                    />
                </Route>
                <Route
                    path="*"
                    element={
                        <Stack
                            justifyContent="center"
                            alignItems="center"
                            flex={1}
                            width="100%"
                            color="white"
                        >
                            Select project
                        </Stack>
                    }
                />
            </Route>
        </Routes>
    );
}

const Layout = () => {
    return (
        <Stack flex={1} gap={2}>
            <Box
                height="50px"
                width="100%"
                sx={{
                    backgroundColor: '#202228',
                    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.5)',
                }}
            ></Box>
            <Stack flex={1} direction="row" gap={2}>
                <Stack width="250px" gap={2}>
                    <Stack
                        sx={{
                            backgroundColor: '#202228',
                            borderRadius: '4px',
                            boxShadow: '2px 2px 8px 0 rgba(0, 0, 0, 0.5)',
                        }}
                        flex={1}
                    >
                        <Projects />
                    </Stack>
                </Stack>
                <Stack
                    sx={{ backgroundColor: '#202228', borderRadius: '4px' }}
                    flex={1}
                >
                    <Outlet />
                </Stack>
            </Stack>
        </Stack>
    );
};

export default App;
