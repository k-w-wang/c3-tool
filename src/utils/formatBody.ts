const formatBody: (
	body: Record<string | number | symbol, string | number | boolean>
) => string = (body) => {
	const formBody = [];
	for (const property in body) {
		formBody.push(
			encodeURIComponent(property) + "=" + encodeURIComponent(body[property])
		);
	}
	return formBody.join("&");
};
export default formatBody;
