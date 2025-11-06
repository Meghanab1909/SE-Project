# Face-api.js Models

The emotion detection feature requires face-api.js models. 
These should be downloaded from: https://github.com/justadudewhohacks/face-api.js-models

Required models:
- tiny_face_detector_model-weights_manifest.json
- tiny_face_detector_model-shard1
- face_expression_model-weights_manifest.json
- face_expression_model-shard1

Since we're using the models, the feature will gracefully degrade if models are not available.
