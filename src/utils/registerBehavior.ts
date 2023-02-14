import G6 from "@antv/g6";

function registerBehavior(onClickFun: Function): void {
	// // Register a custom behavior: add a node when user click the blank part of canvas
	G6.registerBehavior("click-add-node", {
		// Set the events and the corresponding responsing function for this behavior
		getEvents() {
			// The event is canvas:click, the responsing function is onClick
			return {
				"canvas:click": "onClick",
			};
		},
		// Click event
		onClick(ev: { x: number; y: number; }) {
			console.log(ev);
			
			onClickFun({ x: ev.x, y: ev.y });
		},
	});
}
export default registerBehavior;
