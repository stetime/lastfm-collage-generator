import logger from "../utils/logger";

type Job = {
	resolve: (b64: string | undefined) => void;
	reject: (err: unknown) => void;
};

export class WorkerPool {
	private workers: Worker[] = [];
	private next = 0;
	private jobs = new Map<number, Job>();
	private id = 0;

	constructor(size: number, workerUrl: URL) {
		for (let i = 0; i < size; i++) {
			const worker = new Worker(workerUrl, { type: "module" });

			worker.onmessage = (
				e: MessageEvent<{ id: number; b64?: string; error?: string }>,
			) => {
				const { id, b64, error } = e.data;
				const job = this.jobs.get(id);
				if (!job) return;
				this.jobs.delete(id);
				if (error) {
					job.reject(new Error(error));
				} else {
					job.resolve(b64);
				}
			};

			worker.onerror = (error) => {
				for (const [id, job] of this.jobs.entries()) {
					job.reject(error);
					this.jobs.delete(id);
				}
			};

			this.workers.push(worker);
		}
	}

	run(user: User): Promise<string | undefined> {
		const id = this.id++;
		const worker = this.workers[this.next];
		this.next = (this.next + 1) % this.workers.length;
		return new Promise((resolve, reject) => {
			this.jobs.set(id, { resolve, reject });
			worker?.postMessage({ id, user });
		});
	}

	shutdown() {
		for (const [, job] of this.jobs.entries()) {
			job.reject(new Error("pool shutdown"));
		}
		this.jobs.clear();
		for (const worker of this.workers) {
			worker.terminate();
		}
	}
}
