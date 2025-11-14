import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { NodeStatus, TimestampedLog } from '@script_graph/core';
import {
    Button,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { TriangleAlert, Info, OctagonAlert } from 'lucide-react';

export interface INodeLogState {
    logsById: Record<string, TimestampedLog[]>;
    statusById: Record<string, NodeStatus>;
    drawerOpen: boolean;
    nodeFilter?: string;
}

export interface INodeLogContext {
    setNodeLog: React.Dispatch<React.SetStateAction<INodeLogState>>;
    nodeLog: INodeLogState;
}

// eslint-disable-next-line react-refresh/only-export-components
export const NodeLogContext = createContext<INodeLogContext>(
    {} as INodeLogContext,
);

interface INodeLogProvider {
    children: React.ReactElement;
}

export const useNodeLogs = (nodeId: string) => {
    const { nodeLog, setNodeLog } = useContext(NodeLogContext);

    const logs = useMemo(() => {
        if (!nodeLog.logsById[nodeId]) {
            return [];
        }
        return nodeLog.logsById[nodeId];
    }, [nodeId, nodeLog.logsById]);

    const status = useMemo(() => {
        if (!nodeLog.statusById[nodeId]) {
            return null;
        }
        return nodeLog.statusById[nodeId];
    }, [nodeId, nodeLog.statusById]);

    return {
        logs,
        status,
        setNodeLog,
    };
};

export const NodeLogProvider = ({ children }: INodeLogProvider) => {
    const [nodeLog, setNodeLog] = useState<INodeLogState>({
        logsById: {},
        drawerOpen: false,
        statusById: {},
    });

    useEffect(() => {
        const unsubscribeFromLogs = window.api.onNodeLog((stringifiedLog) => {
            const log: TimestampedLog = JSON.parse(stringifiedLog);
            setNodeLog((prev) => {
                return {
                    ...prev,
                    logsById: {
                        ...prev.logsById,
                        [log.nodeId]: prev.logsById[log.nodeId]
                            ? [...prev.logsById[log.nodeId], log]
                            : [log],
                    },
                };
            });
        });

        const unsubscribeFromStatuses = window.api.onNodeStatus(
            (stringifiedLog) => {
                const log: NodeStatus = JSON.parse(stringifiedLog);
                setNodeLog((prev) => {
                    return {
                        ...prev,
                        statusById: {
                            ...prev.statusById,
                            [log.nodeId]: log,
                        },
                    };
                });
            },
        );

        return () => {
            unsubscribeFromLogs();
            unsubscribeFromStatuses();
        };
    }, [setNodeLog]);

    const drawerContent = useMemo(() => {
        if (nodeLog.drawerOpen) {
            const values = Object.values(nodeLog.logsById).flat();
            const logs = nodeLog.nodeFilter
                ? values.filter((v) => v.nodeId === nodeLog.nodeFilter)
                : values.sort((a, b) => a.timestamp - b.timestamp);
            return (
                <List disablePadding>
                    {logs.map((log) => (
                        <ListItem key={`${log.nodeId} - ${log.timestamp}`}>
                            <ListItemIcon>
                                {log.level === 'error' ? (
                                    <TriangleAlert color="#EE6983" />
                                ) : log.level === 'info' ? (
                                    <Info color="#8CE4FF" />
                                ) : (
                                    <OctagonAlert color="#FFA239" />
                                )}
                            </ListItemIcon>
                            <ListItemText
                                primary={log.msg}
                                secondary={new Date(
                                    log.timestamp,
                                ).toISOString()}
                            />
                        </ListItem>
                    ))}
                </List>
            );
        }
    }, [nodeLog.drawerOpen, nodeLog.logsById, nodeLog.nodeFilter]);

    return (
        <NodeLogContext.Provider
            value={{
                setNodeLog,
                nodeLog,
            }}
        >
            {children}
            <Drawer open={nodeLog.drawerOpen}>
                <Button
                    onClick={() =>
                        setNodeLog((prev) => ({ ...prev, drawerOpen: false }))
                    }
                >
                    CLOSE
                </Button>
                {drawerContent}
            </Drawer>
        </NodeLogContext.Provider>
    );
};
