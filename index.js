"use strict";
// Fields, IncomingRequest, OutgoingBody, OutgoingResponse, ResponseOutparam
Object.defineProperty(exports, "__esModule", { value: true });
exports.incomingHandler = void 0;
var wasi_http_types_1 = require("@bytecodealliance/preview2-shim/types/interfaces/wasi-http-types");
/* RUST
    fn handle(_request: IncomingRequest, outparam: ResponseOutparam) {
        let hdrs = Fields::new();
        let resp = OutgoingResponse::new(hdrs);
        let body = resp.body().expect("outgoing response");

        ResponseOutparam::set(outparam, Ok(resp));

        let out = body.write().expect("outgoing stream");
        out.blocking_write_and_flush(b"Hello, wasi:http/proxy world!\n")
            .expect("writing response");

        drop(out);
        OutgoingBody::finish(body, None).unwrap();
*/
/* JS client, not server
import { handle } from 'wasi:http/outgoing-handler@0.2.0-rc-2024-01-16';
import {
  Fields,
  OutgoingRequest,
  OutgoingBody,
} from 'wasi:http/types@0.2.0-rc-2024-01-16';

const sendRequest = (
  method,
  scheme,
  authority,
  pathWithQuery,
  body,
) => {
  try {
    let incomingResponse;
    {
      let encoder = new TextEncoder();

      const req = new OutgoingRequest(
        new Fields([
          ['User-agent', encoder.encode('WASI-HTTP/0.0.1')],
          ['Content-type', encoder.encode('application/json')],
        ])
      );
      req.setScheme(scheme);
      req.setMethod(method);
      req.setPathWithQuery(pathWithQuery);
      req.setAuthority(authority);

      if (body) {
        const outgoingBody = req.body();
        {
          const bodyStream = outgoingBody.write();
          bodyStream.blockingWriteAndFlush(encoder.encode(body));
        }
        // TODO: we should explicitly drop the bodyStream here
        //       when we have support for Symbol.dispose
        OutgoingBody.finish(outgoingBody);
      }

      const futureIncomingResponse = handle(req);
      futureIncomingResponse.subscribe().block();
      incomingResponse = futureIncomingResponse.get().val.val;
    }

    const status = incomingResponse.status();
    const responseHeaders = incomingResponse.headers().entries();

    const decoder = new TextDecoder();
    const headers = responseHeaders.map(([k, v]) => [k, decoder.decode(v)]);

    let responseBody;
    const incomingBody = incomingResponse.consume();
    {
      const bodyStream = incomingBody.stream();
      bodyStream.subscribe().block();
      const buf = bodyStream.read(50n);
      responseBody = buf.length > 0 ? new TextDecoder().decode(buf) : undefined;
    }

    return JSON.stringify({
      status,
      headers,
      body: responseBody,
    });
  } catch (err) {
    throw new Error(err);
  }
}


*/
exports.incomingHandler = {
    handle: function (_request, _response) {
        var encoder = new TextEncoder();
        var resp = new wasi_http_types_1.OutgoingResponse(new wasi_http_types_1.Fields([
            ['User-agent', encoder.encode('WASI-HTTP/0.0.1')],
            ['Content-type', encoder.encode('text/plain')],
        ]));
        console.log("Received the request....");
        hiThere = "Hello from JavaScript thanks to @bytecodealliance/jco!";
        var body = resp.body();
        resp.ResponseOutparam.set(_response);
        wasi_http_types_1.OutgoingBody.blockingWriteAndFlush(encoder.encode(body));
        // TODO: we should explicitly drop the bodyStream here
        //       when we have support for Symbol.dispose
        console.info("Almost done....");
        // RUST: ResponseOutparam::set(outparam, Ok(resp));
        wasi_http_types_1.OutgoingBody.finish(body);
        console.info("About to return....");
    },
};
