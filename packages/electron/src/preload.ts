import {
    ProjectConfig,
    ProjectFlow,
    ProjectReference,
} from '@script_graph/core';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    waitUntilReady: () => ipcRenderer.invoke('waitUntilReady'),

    getProject: (id: string) => ipcRenderer.invoke('getProject', id),
    getProjectReferences: () => ipcRenderer.invoke('getProjectReferences'),
    updateProject: (config: ProjectConfig) =>
        ipcRenderer.invoke('updateProject', config),
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    getFlow: (projectId: string, flowId: string) =>
        ipcRenderer.invoke('getFlow', projectId, flowId),

    getInstalledNodes: () => ipcRenderer.invoke('getInstalledNodes'),

    createProject: (config: ProjectReference) =>
        ipcRenderer.invoke('createProject', config),

    updateFlow: (projectPath: string, config: ProjectFlow) =>
        ipcRenderer.invoke('updateFlow', projectPath, config),

    runManualFlow: (projectPath: string, flowId: string) =>
        ipcRenderer.invoke('runManualFlow', projectPath, flowId),

    onNodeLog: (callback: (stringifiedLog: string) => void) => {
        const listener = (_: unknown, value: string) => callback(value);

        ipcRenderer.on('node-log', listener);
        return () => {
            ipcRenderer.removeListener('node-log', listener);
        };
    },

    onNodeStatus: (callback: (status: string) => void) => {
        const listener = (_: unknown, value: string) => callback(value);

        ipcRenderer.on('node-status', listener);
        return () => {
            ipcRenderer.removeListener('node-status', listener);
        };
    },
});
