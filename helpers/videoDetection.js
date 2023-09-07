const video = require('@google-cloud/video-intelligence').v1;
const {secondsToMins } = require('./secondsToMins')
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const client = new video.VideoIntelligenceServiceClient({keyFilename:credentialsPath});

const likelihoods = [
  'UNKNOWN',
  'VERY_UNLIKELY',
  'UNLIKELY',
  'POSSIBLE',
  'LIKELY',
  'VERY_LIKELY',
];

const videoDetection = async(gcsUri) => {

  let containsExplicitContent = false;

  const request = {
    inputUri: gcsUri,
    features: ['EXPLICIT_CONTENT_DETECTION'],
  };

  // Detects unsafe content
  const [operation] = await client.annotateVideo(request);
  console.log('Waiting for operation to complete...');

  const [operationResult] = await operation.promise();
  
  // Gets unsafe content
  const explicitContentResults = operationResult.annotationResults[0].explicitAnnotation;
  console.log('Explicit annotation results:');

  const explicitContentTimes = [];

  explicitContentResults.frames.forEach(result => {

    if (result.timeOffset === undefined) {
      result.timeOffset = {};
    }
    if (result.timeOffset.seconds === undefined) {
      result.timeOffset.seconds = 0;
    }
    if (result.timeOffset.nanos === undefined) {
      result.timeOffset.nanos = 0;
    }

    if(likelihoods[result.pornographyLikelihood] == 'VERY_LIKELY') {
      containsExplicitContent = true
      explicitContentTimes.push({
        minute: secondsToMins(result.timeOffset.seconds),
        type: likelihoods[result.pornographyLikelihood]
      })
    }
  });

  return {
    explicitContentTimes,
    containsExplicitContent
  }
}

module.exports = {
  videoDetection
}
