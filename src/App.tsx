/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, {
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import G6, { Graph, IG6GraphEvent, Item } from "@antv/g6";
import { Button, Drawer, Space, Tag, Upload, UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import useModal from "./utils/useModal";
import AddNodeForm from "./AddNodeForm";
import AddEdgeForm from "./AddEdgeForm";
import ContextMenu from "./contextMenu";
import "./App.css";
import showModal from "./showModal";
import { throttle } from "./utils/throttle";

type StyleType = "pub" | "sub" | "pubsub" | "default";

const nodeStyle = {
	pub: {
		stroke: "#52c41a",
		fill: "#52c41a",
	},
	sub: {
		stroke: "#ffec3d",
		fill: "#ffec3d",
	},
	pubsub: {
		stroke: "#4096ff",
		fill: "#4096ff",
	},
	default: {
		stroke: "#f9f0ff",
		fill: "#f9f0ff",
	},
};

function getStyleType({
	isPub,
	isSub,
}: {
	isPub: boolean | unknown;
	isSub: boolean | unknown;
}): StyleType {
	if (isPub && isSub) {
		return "pubsub";
	} else {
		if (isPub) {
			return "pub";
		} else if (isSub) {
			return "sub";
		}
		return "default";
	}
}

// 初始化导入的连线
const formatEdges: (links: any[]) => any[] = (links) => {
	return links.map((link, index) => {
		return {
			id: `edge${index + 1}`,
			source: String(link.SrcHopID),
			target: String(link.DstHopID),
		};
	});
};

// 初始化导入的node节点
const formatNodes: (nodes: any, calcPathTree: any) => any = (
	nodes,
	calcPathTree
) => {
	const styleTypeWithId: Record<string, StyleType> = {};
	const initNodes = Object.keys(nodes).map((key) => {
		let type: StyleType = "default";
		const isPub: boolean = calcPathTree.pubhops?.includes(nodes[key].HopID);

		const isSub: boolean = calcPathTree.subedges?.includes(nodes[key].NEID);

		if (isPub && isSub) {
			type = "pubsub";
		} else {
			if (isPub) {
				type = "pub";
			} else if (isSub) {
				type = "sub";
			}
		}
		if (type !== "default") {
			styleTypeWithId[nodes[key].HopID as string] = type;
		}
		// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
		let label: string = nodes[key].HopID;
		if (nodes[key].NEID) {
			label = `${label}\n(${nodes[key].NEID as string})`;
		}

		console.log(label);

		return {
			id: String(nodes[key].HopID),
			label,
			style: nodeStyle[type],
		};
	});
	return [initNodes, styleTypeWithId];
};

// formatEdges(initTopuData.topo.Link);
// formatNodes(initTopuData.topo.Nodes);

interface ClickPosition extends Record<string, unknown> {
	x: number;
	y: number;
}

type NodeDatas = Record<string, Record<string, unknown>>;

const App: React.FC = () => {
	const [initJson, setInitData] = useState<any>();

	const graphRef = useRef<Graph>();

	const [activeConfig, setActiveConfig] = useState<{
		type: string;
		id: string;
	}>();

	const [nodeDatas, setNodeDatas] = useState<NodeDatas>({});

	const [edgeDatas, setEdgeDatas] = useState<Array<Record<string, unknown>>>(
		[]
	);

	const nodeRef: any = useRef([]);

	const edgeRef: any = useRef([]);

	const jsonRef = useRef<any>();

	function getStyleTypeWithHopId(HopId: string): StyleType {
		const nodeinfo = jsonRef.current?.topo.Nodes[HopId];
		if (!(nodeinfo != null)) {
			return "default";
		}
		const isPub: boolean = jsonRef.current?.calc_path_tree.pubhops.includes(
			nodeinfo.HopID
		);

		const isSub: boolean = jsonRef.current?.calc_path_tree.subedges.includes(
			nodeinfo.NEID
		);

		const styleType = getStyleType({
			isPub,
			isSub,
		});
		return styleType;
	}

	useEffect(() => {
		if (initJson != null) {
			jsonRef.current = initJson;

			const [nodes, styleTypeWithId] = formatNodes(
				initJson.topo.Nodes,
				initJson.calc_path_tree
			);

			nodeRef.current = nodes;
			edgeRef.current = formatEdges(initJson.topo.Links);

			console.log(styleTypeWithId);
			console.log(initJson.topo.Nodes);

			for (const key in styleTypeWithId) {
				if (Object.prototype.hasOwnProperty.call(styleTypeWithId, key)) {
					const element = styleTypeWithId[key];
					if (element === "pubsub") {
						initJson.topo.Nodes[key].isPub = true;
						initJson.topo.Nodes[key].isSub = true;
					} else {
						if (element === "pub") {
							initJson.topo.Nodes[key].isPub = true;
						} else if (element === "sub") {
							initJson.topo.Nodes[key].isSub = true;
						}
					}
				}
			}

			setNodeDatas(initJson.topo.Nodes);

			setEdgeDatas(() => {
				return initJson.topo.Links.map((link: any, index: number) => {
					return { id: `edge${index + 1}`, ...link };
				});
			});

			const data = {
				nodes: nodeRef.current,
				edges: edgeRef.current,
			};

			graphRef.current?.data(data);

			graphRef.current?.render();
		}
	}, [initJson]);

	// 编辑node弹窗控制
	const [nodeConfig, { showModal: showNodeModal, hideModal: hideNodeModal }] =
		useModal<ClickPosition>();

	// 编辑edge弹窗控制
	const [edgeConfig, { showModal: showEdgeModal, hideModal: hideEdgeModal }] =
		useModal<ClickPosition>();

	//  新增节点
	function addClickPosition(position: ClickPosition): void {
		setActiveConfig({ id: "", type: "node" });
		showNodeModal("新增节点", position);
	}

	//  编辑节点
	function editNode(id: string): void {
		setActiveConfig({ type: "node", id });
	}

	//  删除节点
	function delNode(id: string): void {
		graphRef.current?.removeItem(id, true);

		nodeRef.current = graphRef.current?.save().nodes as [];

		edgeRef.current = graphRef.current?.save().edges as [];

		setNodeDatas((prevState) => {
			Reflect.deleteProperty(prevState, id);
			return prevState;
		});
	}

	//  编辑边
	function editEdge(id: string): void {
		setActiveConfig({ type: "edge", id });
	}

	//  删除边
	function delEdge(id: string): void {
		graphRef.current?.removeItem(id, true);

		edgeRef.current = graphRef.current?.save().edges as [];
		setEdgeDatas((prevState) => {
			return prevState.filter((item) => id !== item.id);
		});
	}

	// 初始化canvas
	useEffect(() => {
		const data = {
			nodes: nodeRef.current,
			edges: edgeRef.current,
		};

		const container = document.getElementById("container") as HTMLElement;
		const width = container.scrollWidth;
		const height =
			(container.scrollHeight !== 0 ? container.scrollHeight : 500) - 30;

		const graph = new G6.Graph({
			container: "container",
			width,
			height,
			// layout: {
			// 	// Object，可选，布局的方法及其配置项，默认为 random 布局。
			// 	type: "force", // 指定为力导向布局
			// 	preventOverlap: true, // 防止节点重叠
			// 	linkDistance: 200, // 指定边距离为100
			// 	// nodeSize: 30        // 节点大小，用于算法中防止节点重叠时的碰撞检测。由于已经在上一节的元素配置中设置了每个节点的 size 属性，则不需要在此设置 nodeSize。
			// },
			// 边的样式
			defaultEdge: {
				style: {
					stroke: "#F6BD16",
					lineWidth: 2,
					endArrow: true,
				},
			},
			// 默认节点样式
			defaultNode: {
				type: "circle",
				size: 45,
				// label样式
				// labelCfg: {
				// 	// position: "",
				// 	offset: 5,
				// 	style: {
				// 		fill: "#eee",
				// 	},
				// },
			},

			// linkCenter: true,

			// The sets of behavior modes
			modes: {
				// Defualt mode
				default: [
					"drag-node",
					// "click-select",
					"drag-canvas",
					"zoom-canvas",
					"activate-relations",
					{
						type: "create-edge",
						// @ts-ignore TODO
						shouldEnd: (e: IG6GraphEvent, _self) => {
							const source = _self.source;
							const target = e.item?._cfg?.id;

							if (_self.source === e.item?._cfg?.id) {
								return false;
							}

							return !edgeRef.current.some((edge: any) => {
								// @ts-ignore TODO
								return edge.source === source && edge.target === target;
							});
						},
					},
				],
			},
			// The node styles in different states
			nodeStateStyles: {
				// The node styles in selected state
				selected: {
					stroke: "#666",
					lineWidth: 2,
					fill: "steelblue",
				},
			},

			plugins: [
				ContextMenu({ addClickPosition, editNode, delNode, editEdge, delEdge }),
			],
		});

		graphRef.current = graph;
		graph.data(data);
		graph.render();

		graph.on("aftercreateedge", (e: IG6GraphEvent) => {
			const edges = graph.save().edges as Array<{
				curveOffset: number;
				curvePosition: number;
			}>;

			edgeRef.current = graph.save().edges as [];

			// showEdgeModal("新增edge参数", {
			// 	id: (e.edge as Item)._cfg?.id,
			// 	SrcHopID: (e.edge as Item)._cfg?.model?.source,
			// 	DstHopID: (e.edge as Item)._cfg?.model?.target,
			// });

			setActiveConfig({
				type: "edge",
				id: (e.edge as Item)._cfg?.id as string,
			});

			G6.Util.processParallelEdges(edges);

			graph.getEdges().forEach((edge, i) => {
				graph.updateItem(edge, {
					curveOffset: edges[i].curveOffset,
					curvePosition: edges[i].curvePosition,
				});
			});
		});
	}, []);

	// 获取侧边form表单数据进行操作
	const getNodeFormValues: (values: Record<string, unknown>) => void = (
		values
	) => {
		const styleType = getStyleType({
			isPub: values.isPub,
			isSub: values.isSub,
		});
		if (nodeConfig.data.id != null) {
			if (
				nodeDatas[nodeConfig.data.id as string].isPub !== values.isPub ||
				nodeDatas[nodeConfig.data.id as string].isSub !== values.isSub
			) {
				graphRef.current?.update(
					nodeConfig.data.id as string,
					{
						style: nodeStyle[styleType],
					},
					true
				);

				nodeRef.current = graphRef.current?.save().nodes as [];
			}
			setNodeDatas((prevState) => {
				return { ...prevState, [nodeConfig.data.id as string]: values };
			});
		} else {
			let label: string = values?.HopID as string;
			if (values?.NEID) {
				label = `${label}\n(${values?.NEID as string})`;
			}
			const item = graphRef.current?.addItem("node", {
				x: nodeConfig.data.x,
				y: nodeConfig.data.y,
				label,
				style: nodeStyle[styleType],
			}) as Item;

			nodeRef.current = graphRef.current?.save().nodes as [];

			setNodeDatas((prevState) => {
				return { ...prevState, [item?._cfg?.id as string]: values };
			});
		}
		onClose();
	};

	//
	const getEdgeFormValues: (values: Record<string, unknown>) => void = (
		values
	) => {
		const isEdit = edgeDatas.some((edge) => edge.id === edgeConfig.data.id);
		if (isEdit) {
			setEdgeDatas((prevState) => {
				return prevState.map((item) =>
					item.id === edgeConfig.data.id ? { id: item.id, ...values } : item
				);
			});
		} else {
			setEdgeDatas((prevState) => {
				return [
					...prevState,
					{
						id: edgeConfig.data.id,
						...values,
					},
				];
			});
		}
		hideEdgeModal();
		setActiveConfig(undefined);
	};

	useEffect(() => {
		const edges = edgeRef.current as unknown as Array<{
			curveOffset: number;
			curvePosition: number;
		}>;

		const offsetDiff = 30;

		G6.Util.processParallelEdges(edgeRef.current, offsetDiff);

		graphRef.current?.getEdges().forEach((edge, i) => {
			graphRef.current?.updateItem(edge, {
				curveOffset: edges[i].curveOffset,
				curvePosition: edges[i].curvePosition,
			});
		});
	}, [edgeRef.current]);

	// 选中节点时显示侧边编辑
	useEffect(() => {
		if (activeConfig?.type != null) {
			if (activeConfig.type === "node") {
				const title =
					activeConfig.id.length > 0
						? `编辑节点参数-${activeConfig.id}`
						: "新增节点";
				const data =
					activeConfig.id.length > 0
						? { id: activeConfig.id, ...nodeDatas[activeConfig.id] }
						: undefined;
				showNodeModal(title, data);
			}

			if (activeConfig.type === "edge") {
				const gethopid: (type: string) => string | undefined = (type) => {
					const edge = edgeRef.current.find(
						(edge: any) => (edge.id as string) === activeConfig.id
					);

					return edge && nodeDatas[edge[type]]?.HopID;
				};

				const title =
					activeConfig.id.length > 0
						? `编辑边参数-${activeConfig.id}`
						: "新增edge参数";

				const data = edgeDatas.find((edge) => edge.id === activeConfig.id) ?? {
					id: activeConfig.id,
					SrcHopID: gethopid("source"),
					DstHopID: gethopid("target"),
				};
				showEdgeModal(title, data);
			}
		}
	}, [activeConfig]);

	// 关闭弹窗
	const onClose: () => void = () => {
		setActiveConfig(undefined);
		hideNodeModal();
	};

	const hopIds = useMemo(() => {
		const ids: string[] = [];
		for (const key in nodeDatas) {
			if (Object.prototype.hasOwnProperty.call(nodeDatas, key)) {
				const element = nodeDatas[key];
				ids.push(element.HopID as string);
			}
		}
		return ids;
	}, [nodeDatas]);

	const saveJson: () => void = () => {
		const exportJson: (name: string, data: unknown) => void = (name, data) => {
			const blob = new Blob([data as BlobPart]);
			const a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.download = name;
			a.click();
		};

		const jsonData = initJson || {
			level: "debug",
			ts: "2022-09-22T04:56:58.901Z",
			caller: "nemng/pathtree_calc.go:321",
			msg: "pathTreeCalc_CalcPathtree",
			traceid: "6b74b015e955a217",
			cid: 100,
			sid: 100,
			calc_path_tree: {
				channelid: 100,
				streamid: 100,
				pubedges: [],
				subedges: [],
				bandwidth_req: 0,
				qoslevel: 0,
				channelname: "wl_test",
				streamname: "wl_test",
				pubhops: [],
			},
			topo: {},
			qos: {
				maxrtt: 10000,
				maxjitter: 10000,
				maxlossrate: 10000,
			},
		};

		const pubedges: number[] = [];

		const subedges: number[] = [];

		const pubhops: number[] = [];

		const Links: Array<Record<string, unknown>> = structuredClone(edgeDatas);
		const Edges: Record<string, number[]> = {};
		const Nodes: Record<string, Record<string, unknown>> = {};

		Links.forEach((link) => {
			Reflect.deleteProperty(link, "id");
		});

		for (const key in nodeDatas) {
			if (Object.prototype.hasOwnProperty.call(nodeDatas, key)) {
				const element = nodeDatas[key];

				// Edges hopid与neid对应关系
				if (Edges[element.NEID as string] == null) {
					Edges[element.NEID as string] = [];
				}
				Edges[element.NEID as string].push(element.HopID as number);

				if (element.isPub as boolean) {
					pubhops.push(element.HopID as number);
					if (!pubedges.includes(element.NEID as number)) {
						pubedges.push(element.NEID as number);
					}
				}

				if (
					(element.isSub as boolean) &&
					!subedges.includes(element.NEID as number)
				) {
					subedges.push(element.NEID as number);
				}

				Nodes[element.HopID as number] = { ...element };

				Reflect.deleteProperty(Nodes[element.HopID as number], "isPub");
				Reflect.deleteProperty(Nodes[element.HopID as number], "isSub");
			}
		}

		jsonData.topo = { Links, Edges, Nodes };
		jsonData.calc_path_tree.pubedges = pubedges;
		jsonData.calc_path_tree.subedges = subedges;
		jsonData.calc_path_tree.pubhops = pubhops;
		jsonRef.current = jsonData;
		exportJson("json文件.json", JSON.stringify(jsonData, undefined, 2));
	};
	const props: UploadProps = {
		accept: ".json",
		showUploadList: false,
		beforeUpload: async (file) => {
			return await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsText(file, "utf-8");
				reader.onload = () => {
					setInitData(JSON.parse(reader.result as string));
					reject(new Error("false"));
				};
				reject(new Error("false"));
			});
		},
	};
	const resultProps: UploadProps = {
		accept: ".json",
		showUploadList: false,
		beforeUpload: async (file) => {
			return await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsText(file, "utf-8");
				reader.onload = () => {
					const result: any = JSON.parse(reader.result as string);
					const jsonData = jsonRef.current;
					const nodes: Array<{ id: string; label: string; style: any }> = [];
					const edges: Array<{
						source: string;
						target: string;
						label: string;
					}> = [];

					result.PathTreePairs.forEach((item: any) => {
						const styleType = getStyleTypeWithHopId(item.root_hopid);

						let label: string = item.root_hopid;

						if (jsonData.topo?.Nodes[item.root_hopid]?.NEID) {
							label = `${label}\n(${
								jsonData.topo.Nodes[item.root_hopid].NEID as string
							})`;
						}

						console.log(label);

						nodes.push({
							id: String(item.root_hopid),
							label,
							style: nodeStyle[styleType],
						});

						item.child_hopids.forEach((childItem: any, index: any) => {
							edges.push({
								source: String(item.root_hopid),
								target: String(childItem),
								label: String(item.rankings[index]),
							});
						});
					});

					showModal({ nodes, edges });

					reject(new Error("false"));
				};
				reject(new Error("false"));
			});
		},
	};

	useEffect(() => {
		const onResize = throttle(() => {
			const container = document.getElementById("container") as HTMLElement;
			if (container) {
				const width = container.clientWidth;
				const height =
					container.clientHeight !== 0 ? container.clientHeight : 500;

				graphRef.current?.changeSize(width, height);
				graphRef.current?.fitView(20);
			}
		}, 20);

		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, []);

	return (
		<>
			<Space>
				<Tag color="#4096ff">pub/sub</Tag>
				<Tag color="#52c41a">pub</Tag>
				<Tag color="#ffec3d">sub</Tag>
				<Button type="primary" onClick={saveJson}>
					导出JSON
				</Button>
				<Upload {...props}>
					<Button type="primary" icon={<UploadOutlined />}>
						导入JSON
					</Button>
				</Upload>
				<Upload {...resultProps}>
					<Button type="primary" icon={<UploadOutlined />}>
						查看结果
					</Button>
				</Upload>
			</Space>

			<div
				id="container"
				style={{ width: "100%", height: "calc(100vh - 32px)" }}
			></div>

			<Drawer
				width={600}
				open={nodeConfig.visible}
				destroyOnClose
				title={nodeConfig.title}
				onClose={onClose}
				mask={false}
				footer={null}
				maskClosable={false}
			>
				<AddNodeForm
					getFormValues={getNodeFormValues}
					initData={nodeConfig.data}
					hopIds={hopIds}
				/>
			</Drawer>

			<Drawer
				width={600}
				open={edgeConfig.visible}
				destroyOnClose
				title={edgeConfig.title}
				onClose={() => {
					if (edgeConfig.title !== "新增edge参数") {
						hideEdgeModal();
						setActiveConfig(undefined);
					}
				}}
				// mask={false}
				footer={null}
				maskClosable={false}
			>
				<AddEdgeForm
					getFormValues={getEdgeFormValues}
					initData={{ ...edgeConfig.data }}
					nodeDatas={nodeDatas}
				/>
			</Drawer>
		</>
	);
};

export default App;
