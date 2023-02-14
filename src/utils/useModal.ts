import { useReducer } from "react";

/*
 *  传入参数
 *  目的为封装一个弹窗
 *  title: 弹窗标题，
 *  visible：是否显示，
 *  loading：状态（如发送请求可设置为true）
 *  data，弹窗数据
 *  *  返回参数
 *  {
 *      modalConfig:  {title, visible, loading, data},
 *      showModal: 显示弹窗，
 *      hideModal：关闭弹窗，
 *      setLoading：设置加载状态，
 *  }
 */

type IData<T> = Partial<T>;

export interface IModalConfig<T = {}> {
	visible: boolean;
	title: string;
	loading: boolean;
	data: IData<T>;
}

export interface IModalFun {
	showModal: <T>(title?: string, data?: IData<T>) => void;
	hideModal: () => void;
	setLoading: (isLoading: boolean) => void;
}

const reducer: (
	state: IModalConfig,
	action: Partial<IModalConfig> & { type: string }
) => IModalConfig = (state, action) => {
	switch (action.type) {
		case "hideModal":
			return {
				...state,
				visible: false,
				loading: false,
				data: {},
			};
		case "showModal":
			return {
				...state,
				visible: true,
				data: action.data ?? state.data,
				title: action.title ?? state.title,
			};
		case "setLoading":
			return {
				...state,
				loading: action.loading ?? state.loading,
			};
		default:
			return {
				...state,
			};
	}
};

const useModal: <T = {}>(
	title?: string,
	visible?: boolean,
	loading?: boolean,
	data?: IData<T>
) => [IModalConfig<T>, IModalFun] = (
	title = "",
	visible = false,
	loading = false,
	data = {}
) => {
	const globalDataInit = {
		title,
		visible,
		loading,
		data,
	};

	const [modalConfig, dispatch] = useReducer(reducer, globalDataInit);

	const showModal: <T>(title?: string, data?: IData<T>) => void = (
		title = modalConfig.title,
		data
	) => {
		dispatch({ type: "showModal", title, data });
	};

	const hideModal: () => void = () => {
		dispatch({ type: "hideModal" });
	};

	const setLoading: (isLoading: boolean) => void = (isLoading) => {
		dispatch({ type: "setLoading", loading: isLoading });
	};

	return [modalConfig, { showModal, hideModal, setLoading }];
};
export default useModal;
