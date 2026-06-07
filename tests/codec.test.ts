import { describe, expect, it } from "bun:test";
import { createNodeWsServer } from "@ws-asyncapi/adapter-node";
import { createClient } from "@ws-asyncapi/client";
import { Channel } from "ws-asyncapi";
import { z } from "zod";
import { msgpackCodec } from "../src/index.ts";

describe("msgpackCodec", () => {
	it("has the name confirmed in the handshake", () => {
		expect(msgpackCodec.name).toBe("msgpack");
	});

	it("round-trips a frame through binary", () => {
		const frame = [2, "add", 1, { a: 1, b: 2 }];
		const encoded = msgpackCodec.encode(frame);
		expect(encoded).toBeInstanceOf(Uint8Array);
		expect(msgpackCodec.decode(encoded)).toEqual(frame);
	});

	it("round-trips nested / mixed payloads", () => {
		const frame = [0, "evt", { a: [1, 2, 3], b: { c: true }, d: null }];
		expect(msgpackCodec.decode(msgpackCodec.encode(frame))).toEqual(frame);
	});

	it("decodes from an ArrayBuffer (browser binaryType)", () => {
		const encoded = msgpackCodec.encode([0, "evt", { x: true }]) as Uint8Array;
		const buf = encoded.buffer.slice(
			encoded.byteOffset,
			encoded.byteOffset + encoded.byteLength,
		);
		expect(msgpackCodec.decode(buf)).toEqual([0, "evt", { x: true }]);
	});

	it("rejects a string frame (it is a binary codec)", () => {
		expect(() => msgpackCodec.decode("not-binary")).toThrow();
	});

	it("drives the full protocol e2e over a real socket (binary frames)", async () => {
		const chat = new Channel("/room/:id", "room").rpc(
			"add",
			z.object({ a: z.number(), b: z.number() }),
			z.object({ sum: z.number() }),
			async ({ message }) => ({ sum: message.a + message.b }),
		);
		const srv = createNodeWsServer([chat], { port: 0, codec: msgpackCodec });
		const port = await new Promise<number>((resolve) =>
			srv.wss.on("listening", () => {
				const addr = srv.wss.address();
				resolve(typeof addr === "object" && addr ? addr.port : 0);
			}),
		);
		try {
			const c = createClient<typeof chat>(`ws://localhost:${port}`, "/room/1", {
				codec: msgpackCodec,
			});
			await c.opened;
			expect(await c.request("add", { a: 4, b: 5 })).toEqual({ sum: 9 });
			c.close();
		} finally {
			await srv.close();
		}
	});
});
