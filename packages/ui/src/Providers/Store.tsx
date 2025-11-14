import { createContext, useState } from 'react';
import type { IdentifiedProjectConfig } from '@script-graph/core';

export interface IStoreState {
    selectedProject: IdentifiedProjectConfig | null
}

export interface IStoreContext {
    setStore: React.Dispatch<React.SetStateAction<IStoreState>>;
    store: IStoreState;
}

// eslint-disable-next-line react-refresh/only-export-components
export const StoreContext = createContext<IStoreContext>({} as IStoreContext);

interface IStoreProvider {
    children: React.ReactElement;
}

export const StoreProvider = ({ children }: IStoreProvider) => {
    const [store, setStore] = useState<IStoreState>({
        selectedProject: null
    });

    return (
        <StoreContext.Provider
            value={{
                setStore,
                store,
            }}
        >
            {children}
        </StoreContext.Provider>
    );
};
