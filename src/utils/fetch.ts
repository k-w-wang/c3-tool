import qs from "qs";
const myHeaders = new Headers();
async function fetchWithTimeout(
	resource: RequestInfo | URL,
	options: RequestInit & { timeout?: number }
): Promise<Response> {
	if (options.headers != null) {
		for (const key in options.headers) {
			if (Object.prototype.hasOwnProperty.call(options.headers, key)) {
				myHeaders.set(key, options.headers[key as never]);
			}
		}
	} else {
		myHeaders.set("Content-Type", "application/json");
	}
	const accessToken = localStorage.getItem("access_token") ?? "";

	myHeaders.set("Authorization", `Bearer ${accessToken}`);
	const { timeout = 10000 } = options;
	const controller = new AbortController();

	const timer = setTimeout(() => controller.abort(), timeout);

	const response = await fetch(resource, {
		...options,
		headers: myHeaders,
		signal: controller.signal,
	});
	clearTimeout(timer);

	return response;
}

export async function get<IP, IR>(
	url: string,
	params?: IP,
	options?: RequestInit
): Promise<IR> {
	let mark = "";
	if (Object.keys(params ?? {})?.length > 0) {
		mark = "?";
	}

	const qsFormat: string = qs.stringify(params, { encode: false });

	return await (
		await fetchWithTimeout(`${url}${mark}${qsFormat}`, {
			...options,
			method: "GET",
		})
	).json();
}

export async function post<IB, IR>(
	url: string,
	body?: IB,
	options?: RequestInit
): Promise<IR> {
	return await (
		await fetchWithTimeout(url, {
			body: body instanceof FormData ? body : JSON.stringify(body),
			method: "POST",
			...options,
		})
	).json();
}

export async function put<IB, IR>(
	url: string,
	body?: IB,
	options?: RequestInit
): Promise<IR> {
	return await (
		await fetchWithTimeout(url, {
			...options,
			body: body instanceof FormData ? body : JSON.stringify(body),
			method: "PUT",
		})
	).json();
}

export async function deleted<IR>(
	url: string,
	body?: object,
	options?: RequestInit
): Promise<IR> {
	return await (
		await fetchWithTimeout(url, {
			...options,
			body: body instanceof FormData ? body : JSON.stringify(body),
			method: "DELETE",
		})
	).json();
}
