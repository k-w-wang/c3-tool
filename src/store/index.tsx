/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { createContext, useReducer, useContext } from "react";
interface IinitialState {
	appStore: any;
	uiStore: any;
}

const initialState: IinitialState = {
	appStore: {
		access_token: localStorage.getItem("access_token") ?? undefined,
		token_type: localStorage.getItem("token_type") ?? undefined,
	},
	uiStore: {
		collapsed: false,
	},
};

function reducer(
	state: IinitialState,
	{ key, value }: { key: keyof IinitialState; value: any }
) {
	if (key) {
		state[key] = value;
	} else {
		state = value;
	}
	return { ...state };
}

// type IContext = [IinitialState, React.Dispatch<{
//   key: keyof IinitialState;
//   value: any;
// }>] | ([] & Record<never, never>)
type IContext = [
	IinitialState?,
	React.Dispatch<{
		key: keyof IinitialState;
		value: any;
	}>?
];

type IStore = [any, (val: any) => void];

const Context = createContext<IContext>([]);

function useStore(): IContext;

function useStore(contextName: keyof IinitialState): IStore;

function useStore(contextName?: keyof IinitialState): IStore {
	const [state, disp] = useContext(Context);
	const dispatch = (val: any) => {
		disp && contextName && disp({ key: contextName, value: val });
	};
	if (contextName) {
		return [(state && state[contextName]) || {}, dispatch];
	} else {
		return [state, dispatch];
	}
}

function StoreProvider({ children }: { children: JSX.Element }) {
	const [state, dispatch] = useReducer(reducer, initialState);
	return (
		<Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
	);
}
/**
 * useStore(storeName)
 * return [state,dispatch]
 */
export { useStore, StoreProvider };
