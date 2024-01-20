
// Fields, IncomingRequest, OutgoingBody, OutgoingResponse, ResponseOutparam

import { Fields, OutgoingBody, OutgoingResponse, ResponseOutparam, WasiHttpTypes } from "@bytecodealliance/preview2-shim/types/interfaces/wasi-http-types";

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

export const incomingHandler = {
  handle(_request, _response) {

    let encoder = new TextEncoder();

    const resp = new OutgoingResponse(
      new Fields()
    );
    console.log("Received the request....");

    const hiThere = "Hello from JavaScript thanks to @bytecodealliance/jco!";

    const body = resp.body().write();
    
    ResponseOutparam.set(_response, new WasiHttpTypes.httpErrorCode("ok"));
    body.blockingWriteAndFlush(encoder.encode(hiThere));
    
    // TODO: we should explicitly drop the bodyStream here
    //       when we have support for Symbol.dispose
    console.info("Almost done....");
    // RUST: ResponseOutparam::set(outparam, Ok(resp));
   
    OutgoingBody.finish(body);
    console.info("About to return....");

  },
};
