# @ws-asyncapi/codec-msgpack

[![npm](https://img.shields.io/npm/v/@ws-asyncapi/codec-msgpack?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/@ws-asyncapi/codec-msgpack)
[![npm downloads](https://img.shields.io/npm/dw/@ws-asyncapi/codec-msgpack?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/@ws-asyncapi/codec-msgpack)

[MessagePack](https://msgpack.org) codec for **ws-asyncapi** — compact binary
framing, a drop-in replacement for the default JSON codec.

The wire format in ws-asyncapi is pluggable: a `Codec` is the only thing that
touches bytes. Swap JSON for msgpack to get smaller frames with no other changes —
the frames are plain arrays, so nothing else about the protocol moves.

## Installation

```bash
npm install @ws-asyncapi/codec-msgpack ws-asyncapi
# peer: @msgpack/msgpack
```

## Usage

Pass the **same** codec instance to both the server adapter and the client. The
whole cluster and all clients must share one codec — it's confirmed in the
connection handshake, so a mismatch fails fast.

```ts
import { msgpackCodec } from "@ws-asyncapi/codec-msgpack";

// server (Node)
import { createNodeWsServer } from "@ws-asyncapi/adapter-node";
createNodeWsServer([chat], { port: 3000, codec: msgpackCodec });

// server (Elysia)
import { wsAsyncAPIAdapter } from "@ws-asyncapi/adapter-elysia";
new Elysia().use(wsAsyncAPIAdapter([chat], { codec: msgpackCodec }));

// client
import { createClient } from "@ws-asyncapi/client";
const client = createClient<typeof chat>("ws://localhost:3000", "/chat/1", {
  codec: msgpackCodec,
});

// external emitter — must match the servers' codec too
createEmitter<typeof chat>(backplane, { codec: msgpackCodec });
```

## API

- `msgpackCodec: Codec` — `{ name: "msgpack", encode, decode }`. Encodes frames to a
  `Uint8Array` and decodes binary frames; throws if handed a string frame.

## License

MIT
