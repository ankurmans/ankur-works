import { createVoiceTurnDetector } from './voice-turn-detector.js';

const root = document.getElementById('ask-ankur');
const dock = document.getElementById('ask-ankur-dock');
const dockInput = document.getElementById('ask-ankur-dock-input');
const dockVoice = document.getElementById('ask-ankur-dock-voice');
const dockCall = document.getElementById('ask-ankur-dock-call');
const dockStatus = document.getElementById('ask-ankur-dock-status');
const dialog = document.getElementById('ask-ankur-dialog');
const close = document.getElementById('ask-ankur-close');
const hide = document.getElementById('ask-ankur-hide');
const form = document.getElementById('ask-ankur-form');
const input = document.getElementById('ask-ankur-input');
const send = document.getElementById('ask-ankur-send');
const voice = document.getElementById('ask-ankur-voice');
const call = document.getElementById('ask-ankur-call');
const voiceControls = document.getElementById('ask-ankur-voice-controls');
const voiceStatus = document.getElementById('ask-ankur-voice-status');
const endVoiceButton = document.getElementById('ask-ankur-end-voice');
const callScreen = document.getElementById('ask-ankur-call-screen');
const callStatus = document.getElementById('ask-ankur-call-status');
const callTimer = document.getElementById('ask-ankur-call-timer');
const callCaptions = document.getElementById('ask-ankur-call-captions');
const callHistory = document.getElementById('ask-ankur-call-history');
const callHistoryLabel = document.getElementById('ask-ankur-call-history-label');
const endCallButton = document.getElementById('ask-ankur-end-call');
const body = document.getElementById('ask-ankur-body');
const welcome = document.getElementById('ask-ankur-welcome');
const messages = document.getElementById('ask-ankur-messages');
const starters = document.getElementById('ask-ankur-starters');
const historyView = document.getElementById('ask-ankur-history');
const historyList = document.getElementById('ask-ankur-history-list');
const historyButton = document.getElementById('ask-ankur-show-history');
const newChatButton = document.getElementById('ask-ankur-new-chat');
const clearHistoryButton = document.getElementById('ask-ankur-clear-history');
const chatsKey = 'ankur:ai-twin:chats:v1';
const sections = ['top', 'work', 'story', 'contact'];
const prompts = {
  top: ['Which products have you built?', 'What do you do across the stack?', 'How can I get in touch?'],
  work: ['Tell me about Pepys', 'What is Whooshly?', 'Which projects are in closed beta?'],
  story: ['How do you work?', 'What public code can I see?', 'What have you built?'],
  contact: ['What kind of work do you do?', 'How can I book a call?', 'Which projects have you built?'],
  product: ['What kind of product can you build?', 'How would we start an MVP?', 'Which products have you shipped?'],
  search: ['How do you approach SEO and AI search?', 'What would you look at first?', 'How do you measure progress?'],
};
const page = ['/product-development/', '/seo-ai-search/'].includes(window.location.pathname) ? window.location.pathname : '';

let busy = false;
let chatState = loadChatState();
let recorder = null;
let recordingStream = null;
let recordingTimer = null;
let recordingCanceled = false;
let currentAudio = null;
let currentAudioUrl = null;
let speechAbort = null;
let resumeListeningTimer = null;
let startingVoice = false;
let voiceModeActive = false;
let voiceSession = 0;
let recordingMode = null;
let dockStatusTimer = null;
let voiceStatusTimer = null;
let callClock = null;
let callStartedAt = 0;
let activityContext = null;
let activityInterval = null;
let scrollTimer = null;
let callTurnCount = 0;
let voiceReady = false;
let realtimeConversation = null;

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

function loadChatState() {
  try {
    const stored = JSON.parse(localStorage.getItem(chatsKey) || '{}');
    if (!Array.isArray(stored.chats)) return { activeId: null, chats: [] };
    const chats = stored.chats.slice(0, 12).filter((chat) => chat && typeof chat.id === 'string' && Array.isArray(chat.messages)).map((chat) => ({
      id: chat.id,
      title: typeof chat.title === 'string' ? chat.title.slice(0, 80) : 'New chat',
      updatedAt: Number.isFinite(chat.updatedAt) ? chat.updatedAt : Date.now(),
      messages: chat.messages.slice(-30).filter((message) => message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string').map((message) => ({
        role: message.role,
        content: message.content.slice(0, 700),
        sources: Array.isArray(message.sources) ? message.sources.slice(0, 3) : [],
        voiceToken: typeof message.voiceToken === 'string' && Number(message.voiceToken.split('.')[0]) > Date.now() ? message.voiceToken : null,
        error: message.error === true,
      })),
    }));
    return { activeId: chats.some((chat) => chat.id === stored.activeId) ? stored.activeId : chats[0]?.id || null, chats };
  } catch { return { activeId: null, chats: [] }; }
}
function saveChatState() {
  try { localStorage.setItem(chatsKey, JSON.stringify(chatState)); }
  catch { /* Chat works when browser storage is unavailable. */ }
}
function currentChat() { return chatState.chats.find((chat) => chat.id === chatState.activeId); }
function createChat() {
  const chat = { id: crypto.randomUUID(), title: 'New chat', updatedAt: Date.now(), messages: [] };
  chatState.chats.unshift(chat);
  chatState.chats = chatState.chats.slice(0, 12);
  chatState.activeId = chat.id;
  saveChatState();
  return chat;
}
function persistMessage(role, content, sources = [], error = false, chatId = chatState.activeId, voiceToken = null) {
  const chat = chatState.chats.find((item) => item.id === chatId);
  if (!chat) return;
  chat.messages.push({ role, content, sources, error, voiceToken });
  chat.messages = chat.messages.slice(-30);
  if (role === 'user' && chat.title === 'New chat') chat.title = content.slice(0, 72);
  chat.updatedAt = Date.now();
  chatState.chats.sort((a, b) => b.updatedAt - a.updatedAt);
  saveChatState();
}
function sectionNow() {
  const marker = window.innerHeight * 0.35;
  let current = 'top';
  for (const id of sections.slice(1)) {
    if (document.getElementById(id)?.getBoundingClientRect().top < marker) current = id;
  }
  return current;
}
function refreshStarters() {
  starters.replaceChildren();
  const set = page === '/product-development/' ? prompts.product : page === '/seo-ai-search/' ? prompts.search : prompts[sectionNow()];
  for (const text of set) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.addEventListener('click', () => ask(text));
    starters.append(button);
  }
}
function setVoiceStatus(text = '', clearAfter = 0) {
  clearTimeout(voiceStatusTimer);
  voiceStatus.textContent = text;
  callStatus.textContent = text || 'Connecting…';
  callScreen.hidden = !voiceModeActive;
  dialog.classList.toggle('is-calling', voiceModeActive);
  callScreen.dataset.phase = /playing|speaking/i.test(text) ? 'speaking'
    : /listening/i.test(text) ? 'listening'
    : /moment|sec|thinking|answer/i.test(text) ? 'thinking' : 'connecting';
  endVoiceButton.hidden = !voiceModeActive;
  voiceControls.hidden = !text && !voiceModeActive;
  for (const button of [call, dockCall]) {
    button.classList.toggle('is-active', voiceModeActive);
    button.setAttribute('aria-label', voiceModeActive ? 'End voice call with Ankur’s AI Twin' : 'Start voice call with Ankur’s AI Twin');
    button.title = voiceModeActive ? 'End voice call' : 'Talk with my AI Twin';
    button.setAttribute('aria-pressed', String(voiceModeActive));
  }
  if (text && clearAfter) voiceStatusTimer = setTimeout(() => setVoiceStatus(), clearAfter);
}
function addCallHistory(role, content) {
  const entry = document.createElement('p');
  const label = document.createElement('strong');
  label.textContent = role === 'user' ? 'You' : 'AI Twin';
  entry.append(label, document.createTextNode(content));
  callHistory.append(entry);
  if (role === 'user') callTurnCount++;
  callHistoryLabel.textContent = `Conversation history · ${callTurnCount} ${callTurnCount === 1 ? 'question' : 'questions'}`;
  callCaptions.hidden = false;
  callHistory.scrollTop = callHistory.scrollHeight;
}
function startCallClock() {
  callStartedAt = Date.now();
  callTimer.textContent = '00:00';
  clearInterval(callClock);
  callClock = setInterval(() => {
    const seconds = Math.floor((Date.now() - callStartedAt) / 1000);
    callTimer.textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }, 1000);
}
function setDockStatus(text = '', clearAfter = 0) {
  clearTimeout(dockStatusTimer);
  dockStatus.textContent = text;
  dockStatus.hidden = !text;
  if (text && clearAfter) dockStatusTimer = setTimeout(() => setDockStatus(), clearAfter);
}
function setRecordingStatus(mode, target, text, clearAfter = 0) {
  if (mode === 'call' || target === input) setVoiceStatus(text, clearAfter);
  else setDockStatus(text, clearAfter);
}
function openChat() {
  if (!dialog.open) {
    refreshStarters();
    renderChat();
    dialog.showModal();
  }
  root.classList.add('is-open');
  root.classList.remove('is-scrolling');
  input.focus();
}
function stopAudio() {
  clearTimeout(resumeListeningTimer);
  resumeListeningTimer = null;
  speechAbort?.abort();
  speechAbort = null;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }
  document.querySelectorAll('.ask-ankur__play[aria-pressed="true"]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
}
function listenAgain(message = 'Listening again in a moment…') {
  if (!voiceModeActive || !dialog.open) return;
  clearTimeout(resumeListeningTimer);
  setVoiceStatus(message);
  resumeListeningTimer = setTimeout(() => {
    resumeListeningTimer = null;
    if (voiceModeActive && dialog.open) void startRecording('call', input);
  }, 300);
}
function closeChat() {
  endVoiceMode();
  if (dialog.open) dialog.close();
}
function appendSources(item, sources = []) {
  if (!Array.isArray(sources) || !sources.length) return;
  const list = document.createElement('div');
  list.className = 'ask-ankur__sources';
  for (const source of sources) {
    if (!source || !/^\/(?:#(?:top|work|story|contact|claude-listings|shiplog-title)|(?:product-development|seo-ai-search)\/(?:#[a-z][a-z0-9-]*)?)$/.test(source.url) || typeof source.title !== 'string') continue;
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.title;
    link.addEventListener('click', closeChat);
    list.append(link);
  }
  if (list.childElementCount) item.append(list);
}
function appendLocalUsage(item, usage) {
  if (!['localhost', '127.0.0.1'].includes(window.location.hostname) || !usage) return;
  const line = document.createElement('small');
  line.className = 'ask-ankur__usage';
  line.textContent = `${usage.model}: ${usage.inputTokens} input + ${usage.outputTokens} output tokens`;
  item.append(line);
}
function appendPlayback(item, text, token) {
  if (!token || Number(token.split('.')[0]) <= Date.now()) return null;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ask-ankur__play';
  button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 9a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Play voice reply</span>';
  button.setAttribute('aria-label', 'Play this answer aloud');
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => speak(text, token, button));
  item.append(button);
  return button;
}
function addMessage(text, kind, sources = [], voiceToken = null) {
  const item = document.createElement('div');
  item.className = `ask-ankur__message ask-ankur__message--${kind}`;
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  item.append(paragraph);
  appendSources(item, sources);
  if (kind === 'assistant') appendPlayback(item, text, voiceToken);
  messages.append(item);
  body.scrollTop = body.scrollHeight;
  return paragraph;
}
function renderChat() {
  historyView.hidden = true;
  messages.hidden = false;
  form.hidden = false;
  historyButton.setAttribute('aria-expanded', 'false');
  messages.replaceChildren();
  const chat = currentChat();
  for (const message of chat?.messages || []) addMessage(message.content, message.role, message.sources, message.voiceToken);
  welcome.hidden = Boolean(chat?.messages.length);
  body.scrollTop = body.scrollHeight;
}
function renderHistory() {
  historyList.replaceChildren();
  const chats = chatState.chats.filter((chat) => chat.messages.length);
  if (!chats.length) {
    const empty = document.createElement('p');
    empty.className = 'ask-ankur__history-empty';
    empty.textContent = 'No saved chats yet.';
    historyList.append(empty);
    return;
  }
  for (const chat of chats) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-current', String(chat.id === chatState.activeId));
    const title = document.createElement('strong');
    title.textContent = chat.title;
    const date = document.createElement('small');
    date.textContent = new Date(chat.updatedAt).toLocaleDateString();
    button.append(title, date);
    button.addEventListener('click', () => {
      chatState.activeId = chat.id;
      saveChatState();
      renderChat();
      input.focus();
    });
    historyList.append(button);
  }
}
function showHistory() {
  endVoiceMode();
  renderHistory();
  historyView.hidden = false;
  messages.hidden = true;
  welcome.hidden = true;
  form.hidden = true;
  historyButton.setAttribute('aria-expanded', 'true');
  clearHistoryButton.focus();
}
function newChat() {
  endVoiceMode();
  if (currentChat()?.messages.length) createChat();
  renderChat();
  setVoiceStatus();
  input.focus();
}
async function postVoice(payload, signal) {
  let response;
  try {
    response = await fetch('/api/assistant-voice', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('Voice connection failed. Please try again.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Voice is unavailable right now.');
  return data;
}
async function speak(text, token, button = null) {
  if (currentAudio && button?.getAttribute('aria-pressed') === 'true') { stopAudio(); return; }
  stopAudio();
  const controller = new AbortController();
  speechAbort = controller;
  setVoiceStatus('One sec…');
  try {
    if (window.MediaSource?.isTypeSupported('audio/mpeg')) {
      const mediaSource = new MediaSource();
      currentAudioUrl = URL.createObjectURL(mediaSource);
      currentAudio = new Audio(currentAudioUrl);
      const audio = currentAudio;
      audio.onended = () => {
        const continueVoice = voiceModeActive && dialog.open;
        stopAudio();
        setVoiceStatus();
        if (continueVoice) listenAgain();
      };
      audio.onplaying = () => {
        button?.setAttribute('aria-pressed', 'true');
        setVoiceStatus('Speaking…');
      };
      const ready = new Promise((resolve, reject) => {
        mediaSource.addEventListener('sourceopen', resolve, { once: true });
        mediaSource.addEventListener('error', () => reject(new Error('Voice playback failed.')), { once: true });
      });
      const responsePromise = fetch('/api/assistant-voice-stream', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, token }), signal: controller.signal,
      });
      await ready;
      const response = await responsePromise;
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Voice is unavailable right now.');
      }
      if (speechAbort !== controller) return;
      const source = mediaSource.addSourceBuffer('audio/mpeg');
      const queue = [];
      let finished = false;
      let started = false;
      const flush = () => {
        if (controller.signal.aborted || mediaSource.readyState !== 'open' || source.updating) return;
        if (queue.length) {
          source.appendBuffer(queue.shift());
          if (!started) {
            started = true;
            void audio.play().catch(() => {
              if (speechAbort !== controller) return;
              stopAudio();
              setVoiceStatus('Voice playback could not start. The reply is in conversation history.', 4500);
              if (voiceModeActive) listenAgain('Listening for your next question…');
            });
          }
        } else if (finished) mediaSource.endOfStream();
      };
      source.addEventListener('updateend', flush);
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        queue.push(value);
        flush();
      }
      finished = true;
      flush();
    } else {
      const data = await postVoice({ action: 'speak', text, token }, controller.signal);
      if (speechAbort !== controller) return;
      speechAbort = null;
      const binary = atob(data.audio);
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      currentAudioUrl = URL.createObjectURL(new Blob([bytes], { type: data.mime || 'audio/mpeg' }));
      currentAudio = new Audio(currentAudioUrl);
      currentAudio.onended = () => {
        const continueVoice = voiceModeActive && dialog.open;
        stopAudio();
        setVoiceStatus();
        if (continueVoice) listenAgain();
      };
      await currentAudio.play();
      button?.setAttribute('aria-pressed', 'true');
      setVoiceStatus('Speaking…');
    }
  } catch (error) {
    if (controller.signal.aborted) return;
    stopAudio();
    const message = error instanceof Error ? error.message : 'Voice playback failed.';
    if (voiceModeActive) {
      setVoiceStatus(`${message} The reply is in conversation history.`, 4500);
      listenAgain('Listening for your next question…');
    }
    else setVoiceStatus(message);
  }
}
async function ask(raw, spoken = voiceModeActive, channel = spoken ? 'voice_call' : 'chat') {
  const question = raw.trim();
  if (!question || busy) return;
  busy = true;
  send.disabled = true;
  const chatId = currentChat()?.id || createChat().id;
  const turnId = crypto.randomUUID();
  const priorMessages = currentChat()?.messages || [];
  const completedTurns = [];
  for (let i = 0; i < priorMessages.length - 1; i++) {
    if (priorMessages[i].role === 'user' && priorMessages[i + 1].role === 'assistant' && !priorMessages[i + 1].error) {
      completedTurns.push(priorMessages[i], priorMessages[i + 1]);
      i++;
    }
  }
  const previous = completedTurns.slice(-4).map(({ role, content }) => ({ role, content: content.slice(0, 600) }));
  welcome.hidden = true;
  input.value = '';
  dockInput.value = '';
  stopAudio();
  addMessage(question, 'user');
  persistMessage('user', question, [], false, chatId);
  if (voiceModeActive && spoken) addCallHistory('user', question);
  const reply = addMessage('Let me think…', 'assistant');
  try {
    let response;
    try {
      response = await fetchWithTimeout('/api/assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, section: sectionNow(), page, history: previous, conversationId: chatId, turnId, channel }),
      });
    } catch {
      throw new Error('The chat lost its connection. Your question is back in the text box – tap send to retry.');
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "I can't answer right now. You can email me directly.");
    reply.textContent = data.answer;
    if (voiceModeActive && spoken) addCallHistory('assistant', data.answer);
    appendSources(reply.parentElement, data.sources);
    appendLocalUsage(reply.parentElement, data.usage);
    const playButton = appendPlayback(reply.parentElement, data.answer, data.voiceToken);
    persistMessage('assistant', data.answer, data.sources, false, chatId, data.voiceToken);
    if (spoken && data.voiceToken) void speak(data.answer, data.voiceToken, playButton);
    else if (spoken) {
      setVoiceStatus('Voice playback is unavailable. The reply is in conversation history.', 4500);
      listenAgain('Listening for your next question…');
    }
  } catch (error) {
    reply.textContent = error instanceof Error ? error.message : "I can't answer right now. You can email me directly.";
    if (!spoken) input.value = question;
    persistMessage('assistant', reply.textContent, [], true, chatId);
    if (voiceModeActive && spoken) addCallHistory('assistant', reply.textContent);
    if (spoken) {
      setVoiceStatus('I couldn’t answer that right now. You can try another question.', 4500);
      listenAgain('Listening for your next question…');
    }
  } finally {
    busy = false;
    send.disabled = false;
    if (!form.hidden && dialog.open && !spoken) input.focus();
    body.scrollTop = body.scrollHeight;
  }
}
function setRecordingUi(active, target = null) {
  for (const button of [voice, dockVoice]) {
    const recordingHere = active && (button === voice ? target === input : target === dockInput);
    button.classList.toggle('is-recording', recordingHere);
    button.setAttribute('aria-label', recordingHere ? 'Finish dictation' : 'Dictate a question');
    button.title = recordingHere ? 'Finish dictation' : 'Dictate a question';
  }
}
function stopActivityDetector() {
  clearInterval(activityInterval);
  activityInterval = null;
  activityContext?.close().catch(() => {});
  activityContext = null;
}
function startActivityDetector(stream) {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  try {
    const context = new Context();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const samples = new Float32Array(analyser.fftSize);
    const detector = createVoiceTurnDetector();
    activityContext = context;
    context.resume().catch(() => {});
    activityInterval = setInterval(() => {
      if (recorder?.state !== 'recording' || context.state !== 'running') return;
      analyser.getFloatTimeDomainData(samples);
      let squares = 0;
      for (const sample of samples) squares += sample * sample;
      const level = Math.sqrt(squares / samples.length);
      if (detector.update(level, performance.now())) stopRecording();
    }, 100);
  } catch { stopActivityDetector(); }
}
function releaseMicrophone() {
  clearTimeout(recordingTimer);
  recordingTimer = null;
  stopActivityDetector();
  recordingStream?.getTracks().forEach((track) => track.stop());
  recordingStream = null;
  recorder = null;
  setRecordingUi(false);
}
function cancelRecording() {
  voiceSession++;
  recordingMode = null;
  if (!recorder) return;
  recordingCanceled = true;
  if (recorder.state === 'recording') recorder.stop();
  releaseMicrophone();
}
function endVoiceMode() {
  voiceModeActive = false;
  const session = realtimeConversation;
  realtimeConversation = null;
  if (session) {
    const vendorConversationId = session.getId();
    const conversationId = currentChat()?.id;
    void session.endSession().catch(() => {}).finally(async () => {
      if (!vendorConversationId || !conversationId) return;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const result = await fetch('/api/assistant-realtime-log', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
            body: JSON.stringify({ vendorConversationId, conversationId, page: window.location.pathname }),
          });
          if (result.ok && result.status !== 202) return;
        } catch { /* Retry while the page remains open. */ }
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    });
  }
  clearInterval(callClock);
  callClock = null;
  cancelRecording();
  stopAudio();
  setVoiceStatus();
  setDockStatus();
}
async function startRealtimeCall() {
  if (voiceModeActive || startingVoice) return;
  startingVoice = true;
  const session = ++voiceSession;
  voiceModeActive = true;
  callHistory.replaceChildren();
  callTurnCount = 0;
  callHistoryLabel.textContent = 'Conversation history';
  callCaptions.open = false;
  callCaptions.hidden = true;
  startCallClock();
  openChat();
  setVoiceStatus('Connecting…');
  endCallButton.focus({ preventScroll: true });
  const chatId = currentChat()?.id || createChat().id;
  try {
    const response = await fetchWithTimeout('/api/assistant-realtime-token', { method: 'POST' }, 15000);
    const data = await response.json();
    if (!response.ok || !data.token) throw new Error(data.error || 'Real-time voice could not connect.');
    if (session !== voiceSession || !voiceModeActive) return;
    const { Conversation } = await import('@elevenlabs/client');
    if (session !== voiceSession || !voiceModeActive) return;
    const connection = Conversation.startSession({
      conversationToken: data.token,
      onConnect: () => { if (session === voiceSession) setVoiceStatus('Listening…'); },
      onModeChange: ({ mode }) => { if (session === voiceSession) setVoiceStatus(mode === 'speaking' ? 'Speaking…' : 'Listening…'); },
      onMessage: ({ role, message }) => {
        if (session !== voiceSession || !message?.trim()) return;
        const kind = role === 'user' ? 'user' : 'assistant';
        addCallHistory(kind, message);
        addMessage(message, kind);
        persistMessage(kind, message, [], false, chatId);
        welcome.hidden = true;
      },
      onError: (message) => { if (session === voiceSession) setVoiceStatus(message || 'The call lost its connection.'); },
      onDisconnect: () => { if (session === voiceSession && voiceModeActive) endVoiceMode(); },
    });
    void connection.then((lateSession) => {
      if (session !== voiceSession || !voiceModeActive) return lateSession.endSession();
    }).catch(() => {});
    const conversation = await Promise.race([
      connection,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Microphone connection timed out. Please check browser permission and try again.')), 15000)),
    ]);
    if (session !== voiceSession || !voiceModeActive) await conversation.endSession();
    else realtimeConversation = conversation;
  } catch (error) {
    if (session !== voiceSession) return;
    endVoiceMode();
    const message = error instanceof TypeError || error?.name === 'AbortError' || /(?:loading failed|failed to fetch|dynamically imported)/i.test(String(error?.message || ''))
      ? 'The live call could not load on this connection. Try again or switch networks.'
      : error instanceof Error ? error.message : 'Real-time voice could not connect.';
    if (dialog.open) addMessage(message, 'assistant');
    else setDockStatus(message, 4500);
  } finally {
    startingVoice = false;
  }
}
function stopRecording() {
  if (recorder?.state === 'recording') recorder.stop();
}
async function startRecording(mode, target) {
  if (busy || startingVoice) return;
  startingVoice = true;
  const session = ++voiceSession;
  recordingMode = mode;
  if (mode === 'call') {
    if (!voiceModeActive) {
      voiceModeActive = true;
      callHistory.replaceChildren();
      callTurnCount = 0;
      callHistoryLabel.textContent = 'Conversation history';
      callCaptions.open = false;
      callCaptions.hidden = true;
      startCallClock();
      openChat();
      endCallButton.focus({ preventScroll: true });
    }
  }
  setRecordingStatus(mode, target, mode === 'dictation' ? 'Mic to type: connecting…' : 'Connecting…');
  try {
    let status;
    try { status = voiceReady ? { ready: true } : await (await fetchWithTimeout('/api/assistant-voice', {}, 10000)).json(); }
    catch { throw new Error('The mic could not load on this connection. Try again or type your question.'); }
    if (session !== voiceSession || (mode === 'call' && !dialog.open)) return;
    if (!status.ready) throw new Error('Voice is being set up. Please type your question for now.');
    voiceReady = true;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('This browser cannot record audio here. Please type your question.');
    let microphoneTimedOut = false;
    const microphoneRequest = navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (microphoneTimedOut) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error('Microphone access took too long. Please try the call again.');
      }
      return stream;
    });
    let microphoneTimeout;
    const stream = await Promise.race([
      microphoneRequest,
      new Promise((_, reject) => {
        microphoneTimeout = setTimeout(() => {
          microphoneTimedOut = true;
          reject(new Error('Microphone access took too long. Please try the call again.'));
        }, 20000);
      }),
    ]).finally(() => clearTimeout(microphoneTimeout));
    if (session !== voiceSession || (mode === 'call' && !dialog.open)) { stream.getTracks().forEach((track) => track.stop()); return; }
    const preferred = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg'].find((type) => MediaRecorder.isTypeSupported(type));
    const mediaRecorder = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream);
    const chunks = [];
    recordingStream = stream;
    recorder = mediaRecorder;
    recordingCanceled = false;
    mediaRecorder.addEventListener('dataavailable', (event) => { if (event.data.size) chunks.push(event.data); });
    mediaRecorder.addEventListener('stop', async () => {
      const canceled = recordingCanceled;
      const recording = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      releaseMicrophone();
      if (canceled || session !== voiceSession || (mode === 'call' ? !voiceModeActive || !dialog.open : recordingMode !== 'dictation')) return;
      if (recording.size < 1000 || recording.size > 1_200_000) {
        recordingMode = null;
        if (mode === 'call') listenAgain('I missed that. Listening again…');
        else setRecordingStatus(mode, target, 'Please try a shorter question.', 4500);
        return;
      }
      setRecordingStatus(mode, target, 'One sec…');
      try {
        const bytes = new Uint8Array(await recording.arrayBuffer());
        let binary = '';
        for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
        const data = await postVoice({ action: 'transcribe', audio: btoa(binary), mime: recording.type });
        if (session !== voiceSession || (mode === 'call' ? !voiceModeActive || !dialog.open : recordingMode !== 'dictation')) return;
        if (mode === 'call') {
          input.value = data.text;
          setVoiceStatus('Got it. One sec…');
          await ask(data.text, true);
        } else {
          const transcript = data.text?.trim();
          if (!transcript) throw new Error('I could not hear that. Please try again.');
          target.value = [target.value.trim(), transcript].filter(Boolean).join(' ');
          target.dataset.dictated = 'true';
          target.focus();
          recordingMode = null;
          setRecordingStatus(mode, target, 'Question added. Edit it or tap send.', 4500);
        }
      } catch (error) {
        recordingMode = null;
        const message = error instanceof Error ? error.message : 'I could not hear that. Please try again or type it.';
        if (mode === 'call') setVoiceStatus(`${message} End the call to type your question.`);
        else setRecordingStatus(mode, target, message, 4500);
      }
    }, { once: true });
    mediaRecorder.start();
    startActivityDetector(stream);
    setRecordingUi(true, mode === 'dictation' ? target : null);
    setRecordingStatus(mode, target, mode === 'call'
      ? 'Listening… I’ll respond when you pause.'
      : 'Mic to type: speak now. Pause or tap the mic to finish.');
    recordingTimer = setTimeout(stopRecording, 20000);
  } catch (error) {
    if (session !== voiceSession) return;
    releaseMicrophone();
    recordingMode = null;
    if (mode === 'call') endVoiceMode();
    setRecordingStatus(mode, target, error instanceof Error ? error.message : 'Microphone unavailable. Please type your question.', 4500);
  } finally {
    startingVoice = false;
  }
}
function toggleDictation(target) {
  if (recorder && recordingMode === 'dictation') { stopRecording(); return; }
  if (voiceModeActive) endVoiceMode();
  else stopAudio();
  void startRecording('dictation', target);
}
function toggleCall() {
  if (voiceModeActive) { endVoiceMode(); return; }
  if (recordingMode === 'dictation') cancelRecording();
  setDockStatus();
  stopAudio();
  void startRealtimeCall();
}
function onScroll() {
  if (dialog.open || recordingMode === 'dictation') return;
  if (document.activeElement === dockInput) dockInput.blur();
  root.classList.add('is-scrolling');
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => root.classList.remove('is-scrolling'), 700);
}

if (!currentChat()) createChat();
dock.addEventListener('submit', (event) => { event.preventDefault(); const question = dockInput.value.trim(); const channel = dockInput.dataset.dictated === 'true' ? 'dictation' : 'chat'; delete dockInput.dataset.dictated; openChat(); if (question) ask(question, false, channel); });
dockVoice.addEventListener('click', () => toggleDictation(dockInput));
voice.addEventListener('click', () => toggleDictation(input));
dockCall.addEventListener('click', toggleCall);
call.addEventListener('click', toggleCall);
endVoiceButton.addEventListener('click', endVoiceMode);
endCallButton.addEventListener('click', () => { endVoiceMode(); renderChat(); input.focus(); });
close.addEventListener('click', closeChat);
hide.addEventListener('click', closeChat);
dialog.addEventListener('close', () => {
  endVoiceMode();
  root.classList.remove('is-open');
  dockInput.focus();
});
dialog.addEventListener('click', (event) => { if (event.target === dialog) closeChat(); });
historyButton.addEventListener('click', () => historyView.hidden ? showHistory() : (renderChat(), input.focus()));
newChatButton.addEventListener('click', newChat);
clearHistoryButton.addEventListener('click', () => { chatState = { activeId: null, chats: [] }; createChat(); showHistory(); });
form.addEventListener('submit', (event) => { event.preventDefault(); const channel = input.dataset.dictated === 'true' ? 'dictation' : 'chat'; delete input.dataset.dictated; ask(input.value, false, channel); });
window.addEventListener('scroll', onScroll, { passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) endVoiceMode(); });
window.addEventListener('pagehide', endVoiceMode);
