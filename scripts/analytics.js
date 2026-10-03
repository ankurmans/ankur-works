import posthog from 'posthog-js';

posthog.init('phc_ISwqxtLsNG7uKjCWiwRtPzvw7ERG9xMIl148kEwRxch', {
  api_host: 'https://us.i.posthog.com',
  capture_pageview: true,
  autocapture: false,
  person_profiles: 'identified_only',
  disable_session_recording: true,
});

export default posthog;
