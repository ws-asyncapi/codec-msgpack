import { decode, encode } from "@msgpack/msgpack";
import type { AnyFrame, Codec } from "ws-asyncapi/wire";

/**
 * MessagePack codec — compact binary framing. Drop-in replacement for the
 * default JSON codec; pass the same instance to both the adapter and the
 * client (the whole cluster must share one codec).
 *
 * ```ts
 * import { msgpackCodec } from "@ws-asyncapi/codec-msgpack";
 * wsAsyncAPIAdapter(channels, { codec: msgpackCodec });
 * websocketAsyncAPI(url, path, { codec: msgpackCodec });
 * ```
 */
export const msgpackCodec: Codec = {
    name: "msgpack",
    encode: (frame) => encode(frame),
    decode: (raw) => {
        if (typeof raw === "string")
            throw new Error("msgpackCodec received a string frame");
        const bytes = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
        return decode(bytes) as AnyFrame;
    },
};
