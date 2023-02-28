/**
 * 节流函数，对普通方法进行包装，使其拥有节流功能。
 * @param {function} fn 需要设置节流的方法
 * @param {number} interval 间隔时间
 * @returns {function} 返回一个被防抖包装过的fn
 */

// interval 间隔时间，也就是cd的长短

export function throttle<T>(fn: T & Function, interval: number): T {
	if (typeof fn !== "function") {
		throw new TypeError("Expected a function");
	}
	// 记录上次执行时间
	let lastTime = 0;

	return function (this: unknown, ...args: []) {
		// 获取当前时间
		const nowTime = new Date().getTime();

		// cd剩余时间
		const remainTime = nowTime - lastTime;
		// 如果剩余时间大于间隔时间，也就是说可以再次执行函数
		if (remainTime - interval >= 0) {
			fn.apply(this, args);
			// 将上一次函数执行的时间设置为nowTime，这样下次才能重新进入cd
			lastTime = nowTime;
		}
	} as T;
}
