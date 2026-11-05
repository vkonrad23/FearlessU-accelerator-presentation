# Local Draco decoder

Only needed when you configure a Draco-compressed GLB. Uncompressed GLB and the default procedural scene do not request a decoder.

Copy these files from the installed, pinned `three` package's `examples/jsm/libs/draco/gltf/` directory into this directory:

- `draco_wasm_wrapper.js`
- `draco_decoder.wasm`
- `draco_decoder.js`

Keep the package's license with the copied files. The loader uses the same-origin path in `sceneConfig.models.dracoPath`, with at most two workers. It does not use a Google/CDN decoder. Deploy the decoder files together with the GLB and test both successful loading and a missing-decoder fallback.
