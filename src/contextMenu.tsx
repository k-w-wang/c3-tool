import G6 from "@antv/g6";

interface ContextMenuObj {
	addClickPosition: Function;
	editNode: Function;
	delNode: Function;
	editEdge: Function;
	delEdge: Function;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const ContextMenu = ({
	addClickPosition,
	editNode,
	delNode,
	editEdge,
	delEdge,
}: ContextMenuObj) => {
	const position = {
		x: 0,
		y: 0,
	};
	return new G6.Menu({
		className: "context-menu",
		getContent(evt) {
			position.x = evt?.x as number;
			position.y = evt?.y as number;

			let header = "";
			if (evt?.target?.isCanvas?.() != null) {
				header = "Canvas Menu";
				return `<div>
                <h4>${header}</h4>
                <Button action='addnode'>Add Node</Button>
            </div>`;
			} else if (evt?.item != null) {
				const itemType = evt.item.getType();
				header = `${itemType.toUpperCase()} Menu`;

				if (evt.item.getType() === "node") {
					return `<div>
                    <h4>${header}</h4>
                    <Button action='editnode' nodeId=${
											evt?.item?._cfg?.id as string
										}>Edit Node</Button>
                    <Button action='delnode' nodeId=${
											evt?.item?._cfg?.id as string
										}>Del Node</Button>
                </div>`;
				} else {
					return `<div>
                    <h4>${header}</h4>
                    <Button action='editedge' edgeId=${
											evt?.item?._cfg?.id as string
										}>Edit Edge</Button>
                    <Button action='deledge' edgeId=${
											evt?.item?._cfg?.id as string
										}>Del Edge</Button>
                </div>`;
				}
			}

			return `defalut`;
		},
		handleMenuClick: (target, _item) => {
			switch (target.getAttribute("action")) {
				case "addnode":
					addClickPosition(position);
					break;
				case "editnode":
					editNode(target.getAttribute("nodeId"));
					break;
				case "delnode":
					delNode(target.getAttribute("nodeId"));
					break;

				case "editedge":
					editEdge(target.getAttribute("edgeId"));
					break;

				case "deledge":
					delEdge(target.getAttribute("edgeId"));
					break;
				default:
					break;
			}
		},
		// offsetX and offsetY include the padding of the parent container
		// 需要加上父级容器的 padding-left 16 与自身偏移量 10
		offsetX: 16 + 10,
		// 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
		offsetY: 0,
		// the types of items that allow the menu show up
		// 在哪些类型的元素上响应
		itemTypes: ["node", "edge", "canvas"],
	});
};

export default ContextMenu;
