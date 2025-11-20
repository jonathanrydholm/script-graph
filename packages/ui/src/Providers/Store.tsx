import type { ProjectConfig } from '@script_graph/general-types';
import { createContext, useState } from 'react';

export interface IStoreState {
    projects: ProjectConfig[];
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
        projects: [],
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
