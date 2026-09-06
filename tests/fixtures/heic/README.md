# HEIC regression fixtures

- `demo-1.heic` and `demo-3.heic`: alexcorvi/heic2any demo corpus, MIT (LICENSE.md), https://github.com/alexcorvi/heic2any/tree/master/demo
- `iphone-xr-3578.heic` and `iphone-xr-3604.heic`: thorsted/digicam_corpus Apple/iPhone XR, CC0 (CAMERA-CORPUS-LICENSE), https://github.com/thorsted/digicam_corpus/tree/master/Apple/iPhone%20XR
- `portrait.heic`: a 90-degree rotation of MIT `demo-3.heic`, re-encoded using macOS sips to exercise portrait orientation.
- Reference JPGs were independently decoded with macOS `sips`, not the browser decoder under test. Browser outputs must match dimensions and a downsampled RGB mean absolute difference below 12/255. This checks image content and orientation in this corpus; it does not establish compatibility with every HEIF variant.

The camera corpus states that GPS metadata is suppressed. Tests do not upload these photos.
