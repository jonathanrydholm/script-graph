import { Box, Stack } from '@mui/material';
import { Outlet, Route, Routes } from 'react-router-dom';
import FlowEditor from './FlowEditor';
import {
    type IdentifiedProjectConfig,
    type ProjectFlow,
    type ProjectReference,
} from '@script_graph/core';
import Projects from './Projects';
import ProjectFlows from './ProjectFlows';
import { useEffect, useState } from 'react';
import { type SerializedPlugin } from '@script_graph/general-types';

declare global {
    interface Window {
        api: {
            waitUntilReady: () => Promise<void>;

            createProject: (
                project: ProjectReference,
            ) => Promise<ProjectReference>;
            getProject: (path: string) => Promise<IdentifiedProjectConfig>;
            getRegisteredPlugins: () => Promise<SerializedPlugin[]>;
            getProjectReferences: () => Promise<ProjectReference[]>;
            updateProject: (
                config: IdentifiedProjectConfig,
            ) => Promise<IdentifiedProjectConfig>;
            getFlow: (
                projectPath: string,
                flowId: string,
            ) => Promise<ProjectFlow | null>;
            updateFlow: (
                projectPath: string,
                config: ProjectFlow,
            ) => Promise<ProjectFlow>;

            runManualFlow: (projectPath: string, id: string) => Promise<void>;

            selectFolder: () => Promise<string | null>;

            onNodeLog: (
                callback: (stringifiedLog: string) => void,
            ) => () => void;

            onNodeStatus: (
                callback: (statusMessage: string) => void,
            ) => () => void;

            onPluginsModified: (
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

    console.log('isReady', ready);

    if (!ready) {
        return <></>;
    }

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path={`flow/:id`} element={<FlowEditor />} />
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
                    <Stack
                        sx={{
                            backgroundColor: '#202228',
                            borderRadius: '4px',
                            boxShadow: '2px 2px 8px 0 rgba(0, 0, 0, 0.5)',
                            overflowY: 'auto',
                        }}
                        flex={1}
                    >
                        <ProjectFlows />
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
