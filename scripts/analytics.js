import posthog from 'posthog-js';

const token = import.meta.env.VITE_POSTHOG_TOKEN;
if (token) {
  posthog.init(token, {
    api_host: 'https://us.i.posthog.com',
    capture_pageview: true,
    autocapture: false,
    person_profiles: 'identified_only',
    disable_session_recording: true,
  });
}

export default posthog;
