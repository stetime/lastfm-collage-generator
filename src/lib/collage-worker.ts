import createCollage from "../collage";

self.onmessage = async (e: MessageEvent<{ id: number; user: User }>) => {
	const { id, user } = e.data;
	try {
		const b64 = await createCollage(user);
		self.postMessage({ id, b64 });
	} catch (err) {
		self.postMessage({ id, error: String(err) });
	}
};
