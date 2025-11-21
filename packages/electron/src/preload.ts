import { ProjectConfig } from '@script_graph/general-types';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    waitUntilReady: () => ipcRenderer.invoke('waitUntilReady'),

    /** Subscribe to any project modifications */
    subscribeToProjects: (callback: (status: string) => void) => {
        const listener = (_: unknown, value: string) => callback(value);
        ipcRenderer
            .invoke('getProjects')
            .then((projects) => callback(JSON.stringify(projects)));

        ipcRenderer.on('projectsUpdated', listener);
        return () => {
            ipcRenderer.removeListener('projectsUpdated', listener);
        };
    },

    updateProject: (config: ProjectConfig) =>
        ipcRenderer.invoke('updateProject', config),

    deleteProject: (config: ProjectConfig) =>
        ipcRenderer.invoke('deleteProject', config),

    createProject: (config: ProjectConfig) =>
        ipcRenderer.invoke('createProject', config),

    selectFolder: () => ipcRenderer.invoke('select-folder'),

    executeFlow: (projectId: string, flowId: string) =>
        ipcRenderer.invoke('executeFlow', projectId, flowId),

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

    subscribeToPlugins: (callback: (plugins: string) => void) => {
        const listener = (_: unknown, plugins: string) => callback(plugins);
        ipcRenderer
            .invoke('getRegisteredPlugins')
            .then((plugins) => callback(JSON.stringify(plugins)));

        ipcRenderer.on('onPluginsModified', listener);
        return () => {
            ipcRenderer.removeListener('onPluginsModified', listener);
        };
    },
});
