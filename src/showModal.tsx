/* eslint-disable @typescript-eslint/no-explicit-any */

import G6 from "@antv/g6";
import { Modal } from "antd";
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { throttle } from "./utils/throttle";
import useModal from "./utils/useModal";

const container = (function () {
	return ReactDOM.createRoot(document.createDocumentFragment());
})();

const showModal: ({ nodes, edges }: { nodes: any; edges: any }) => void = ({
	nodes,
	edges,
}) => {
	const Result: React.FC = () => {
		// 结果弹窗展示
		const [
			resultConfig,
			{ showModal: showResultModal, hideModal: hideResultModal },
		] = useModal();

		useEffect(() => {
			showResultModal();
		}, []);

		// 初始化canvas
		useEffect(() => {
			if (resultConfig.visible) {
				const domObserver = new MutationObserver((_mutationList, observer) => {
					const container = document.getElementById("result") as HTMLElement;

					if (container != null) {
						observer.disconnect();

						const width = container.scrollWidth;
						const height =
							container.scrollHeight !== 0 ? container.scrollHeight : 500;
						const layout = {
							type: "dagre",
							rankdir: "LR", // 可选，默认为图的中心
						};
						const graph = new G6.Graph({
							container: "result",
							width,
							height,
							fitView: true,
							layout,
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
							modes: {
								// Defualt mode
								default: ["drag-canvas", "zoom-canvas", "drag-node"],
							},

							// linkCenter: true,

							// The sets of behavior modes

							// The node styles in different states
							nodeStateStyles: {
								// The node styles in selected state
								selected: {
									stroke: "#666",
									lineWidth: 2,
									fill: "steelblue",
								},
							},
						});

						graph.data({ nodes, edges });
						graph.render();
					}
				});

				domObserver.observe(document.body, { childList: true, subtree: true });

				// setTimeout(() => {
				// 	// const nodes: Array<{ id: string; label: string }> = [];
				// 	// const edges: Array<{
				// 	// 	source: string;
				// 	// 	target: string;
				// 	// 	label: string;
				// 	// }> = [];
				// 	// PathTreePairs.forEach((item) => {
				// 	// 	nodes.push({
				// 	// 		id: String(item.root_hopid),
				// 	// 		label: String(item.root_hopid),
				// 	// 	});
				// 	// 	item.child_hopids.forEach((childItem, index) => {
				// 	// 		edges.push({
				// 	// 			source: String(item.root_hopid),
				// 	// 			target: String(childItem),
				// 	// 			label: String(item.rankings[index]),
				// 	// 		});
				// 	// 	});
				// 	// });

				// 	const container = document.getElementById("result") as HTMLElement;
				// 	const width = container.scrollWidth;
				// 	const height =
				// 		container.scrollHeight !== 0 ? container.scrollHeight : 500;
				// 	const layout = {
				// 		type: "dagre",
				// 		rankdir: "LR", // 可选，默认为图的中心
				// 	};
				// 	const graph = new G6.Graph({
				// 		container: "result",
				// 		width,
				// 		height,
				// 		layout,
				// 		// 边的样式
				// 		defaultEdge: {
				// 			style: {
				// 				stroke: "#F6BD16",
				// 				lineWidth: 2,
				// 				endArrow: true,
				// 			},
				// 		},
				// 		// 默认节点样式
				// 		defaultNode: {
				// 			type: "circle",
				// 			size: 30,
				// 			// label样式
				// 			// labelCfg: {
				// 			// 	// position: "",
				// 			// 	offset: 5,
				// 			// 	style: {
				// 			// 		fill: "#eee",
				// 			// 	},
				// 			// },
				// 		},

				// 		// linkCenter: true,

				// 		// The sets of behavior modes

				// 		// The node styles in different states
				// 		nodeStateStyles: {
				// 			// The node styles in selected state
				// 			selected: {
				// 				stroke: "#666",
				// 				lineWidth: 2,
				// 				fill: "steelblue",
				// 			},
				// 		},
				// 	});

				// 	graph.data({ nodes, edges });
				// 	graph.render();
				// }, 20);
			}
		}, [resultConfig.visible]);

		return (
			<Modal
				open={resultConfig.visible}
				destroyOnClose
				width={800}
				footer={false}
				onCancel={() => {
					hideResultModal();
				}}
			>
				<div
					id="result"
					style={{
						width: "100%",
						height: "calc(70vh - 32px)",
						maxHeight: 1000,
					}}
				></div>
			</Modal>
		);
	};
	container.render(<Result />);
};
export default showModal;
