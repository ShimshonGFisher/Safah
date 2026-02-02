(function() {
  'use strict';

  // ==========================================
  // Amira WIDGET - KAY THE SHAPESHIFTER
  // ==========================================
  
  const CONFIG = {
    // Webhook URLs - UPDATE THESE after importing workflows to n8n
    webhookUrl: 'https://YOUR-N8N-INSTANCE.app.n8n.cloud/webhook/safa-chat',
    voiceTokenWebhookUrl: 'https://YOUR-N8N-INSTANCE.app.n8n.cloud/webhook/safa-voice/start',
    
    // Branding
    companyName: 'Amira',
    agentName: 'Kay',
    agentAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    
    // Colors - Warm, elegant, white-glove feel
    primaryColor: '#B91C1C',      // Deep warm red
    secondaryColor: '#FEF2F2',    // Soft cream/blush
    accentColor: '#DC2626',       // Brighter red for CTAs
    
    // Positioning
    position: 'right',
    
    // Greeting
    greeting: "Hi! I'm here to help?",
    
    // Timing
    autoOpenDelay: 4000,
    
    // Privacy
    privacyNotice: 'Your conversation helps us understand how to serve you better. We respect your privacy.',
    
    // Features
    voiceEnabled: true,
    retellAgentId: 'agent_82fefa0de1c6c2ca70526f2f50',
    
    // Demo mode
    showDemoBanner: true,
    showPoweredBy: true
  };

  // State management
  let state = {
    stage: 'small',
    messages: [],
    collectedData: {},
    conversationId: generateId(),
    userLocation: null,
    isTyping: false,
    callActive: false,
    callConnecting: false,
    aiSpeaking: false,
    demoMode: false
  };

  let retellClient = null;

  function generateId() {
    return 'safa_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  async function detectLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      state.userLocation = {
        state: data.region,
        stateCode: data.region_code,
        city: data.city,
        country: data.country_name
      };
    } catch (error) {
      console.log('Could not detect location:', error);
    }
  }

  function getTrafficSource() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      source: urlParams.get('utm_source') || 'direct',
      medium: urlParams.get('utm_medium') || 'none',
      campaign: urlParams.get('utm_campaign') || 'none',
      referrer: document.referrer || 'direct',
      landingPage: window.location.href
    };
  }

  function injectStyles() {
    const styles = `
      #safa-chat-widget * {
        box-sizing: border-box;
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, sans-serif;
      }

      /* Small circle launcher */
      #safa-chat-launcher {
        position: fixed;
        bottom: 24px;
        ${CONFIG.position}: 24px;
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: white;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        z-index: 999998;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        padding: 3px;
        border: 3px solid ${CONFIG.primaryColor};
      }

      #safa-chat-launcher:hover {
        transform: scale(1.08);
        box-shadow: 0 8px 32px rgba(185, 28, 28, 0.25);
      }

      #safa-chat-launcher img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      #safa-chat-launcher .notification-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: ${CONFIG.accentColor};
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
        border: 2px solid white;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }

      /* Medium popup */
      #safa-medium-popup {
        position: fixed;
        bottom: 24px;
        ${CONFIG.position}: 24px;
        width: 360px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
        z-index: 999999;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: popIn 0.4s ease;
      }

      @keyframes popIn {
        from {
          opacity: 0;
          transform: scale(0.85) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      #safa-medium-popup.open {
        display: flex;
      }

      /* Demo Banner */
      .safa-demo-banner {
        background: linear-gradient(135deg, ${CONFIG.primaryColor} 0%, #991B1B 100%);
        color: white;
        padding: 12px 16px;
        text-align: center;
        font-size: 12px;
        font-weight: 500;
      }

      .safa-demo-banner strong {
        color: #FCD34D;
      }

      .safa-medium-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px 0;
      }

      .safa-medium-close {
        background: none;
        border: none;
        color: #9CA3AF;
        cursor: pointer;
        font-size: 24px;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
      }

      .safa-medium-close:hover {
        color: #374151;
      }

      .safa-powered-by {
        font-size: 11px;
        color: #9CA3AF;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .safa-powered-by span {
        color: ${CONFIG.primaryColor};
        font-weight: 600;
      }

      .safa-medium-content {
        padding: 8px 24px 24px;
        text-align: center;
      }

      .safa-medium-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 12px;
        border: 4px solid white;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }

      .safa-medium-agent-info {
        margin-bottom: 16px;
      }

      .safa-medium-name {
        font-weight: 700;
        font-size: 20px;
        color: #1F2937;
        margin-bottom: 4px;
      }

      .safa-medium-role {
        font-size: 13px;
        color: #6B7280;
      }

      .safa-medium-company-badge {
        display: inline-block;
        background: ${CONFIG.secondaryColor};
        color: ${CONFIG.primaryColor};
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-top: 8px;
        border: 1px solid ${CONFIG.primaryColor}20;
      }

      .safa-medium-message {
        background: #F9FAFB;
        padding: 16px 20px;
        border-radius: 16px;
        font-size: 15px;
        color: #374151;
        margin-bottom: 20px;
        text-align: left;
        line-height: 1.5;
      }

      .safa-medium-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        margin-bottom: 16px;
      }

      .safa-medium-button {
        background: white;
        border: 2px solid ${CONFIG.primaryColor};
        color: ${CONFIG.primaryColor};
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .safa-medium-button:hover {
        background: ${CONFIG.primaryColor};
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(185, 28, 28, 0.3);
      }

      /* Voice Call Button */
      .safa-voice-call-button {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        color: white;
        padding: 14px 28px;
        border-radius: 25px;
        border: none;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        margin-top: 8px;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
      }

      .safa-voice-call-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
      }

      .safa-voice-call-button:disabled {
        background: #9CA3AF;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .safa-medium-input {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        background: #F3F4F6;
        border-radius: 25px;
        padding: 4px 4px 4px 20px;
      }

      .safa-medium-input input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 14px;
        outline: none;
        padding: 10px 0;
      }

      .safa-medium-input button {
        background: ${CONFIG.primaryColor};
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }

      .safa-medium-input button:hover {
        transform: scale(1.05);
      }

      .safa-medium-input button svg {
        width: 16px;
        height: 16px;
        fill: white;
      }

      .safa-mode-hint {
        margin-top: 12px;
        font-size: 12px;
        color: #9CA3AF;
      }

      /* Voice Call Modal */
      .safa-voice-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9999998;
        display: none;
      }

      .safa-voice-modal-overlay.active {
        display: block;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .safa-voice-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(180deg, #1F1F1F 0%, #111111 100%);
        border-radius: 24px;
        padding: 48px 40px;
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
        z-index: 9999999;
        display: none;
        flex-direction: column;
        align-items: center;
        min-width: 340px;
        border: 1px solid #333;
      }

      .safa-voice-modal.active {
        display: flex;
        animation: modalIn 0.3s ease;
      }

      @keyframes modalIn {
        from {
          opacity: 0;
          transform: translate(-50%, -45%);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%);
        }
      }

      .voice-avatar-container {
        position: relative;
        width: 140px;
        height: 140px;
        margin-bottom: 24px;
      }

      .voice-avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid ${CONFIG.primaryColor};
        box-shadow: 0 8px 32px rgba(185, 28, 28, 0.3);
        transition: all 0.3s ease;
      }

      .voice-avatar-container.speaking .voice-avatar {
        box-shadow: 0 8px 40px rgba(185, 28, 28, 0.5), 0 0 60px rgba(185, 28, 28, 0.3);
      }

      .voice-avatar-container.connecting .voice-avatar {
        animation: gentlePulse 2s ease-in-out infinite;
      }

      @keyframes gentlePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }

      .voice-modal-status {
        color: #9CA3AF;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 8px;
      }

      .voice-modal-agent-name {
        color: white;
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .voice-modal-message {
        color: #9CA3AF;
        font-size: 14px;
        margin-bottom: 32px;
        text-align: center;
      }

      .voice-end-call-btn {
        background: #DC2626;
        color: white;
        border: none;
        padding: 16px 48px;
        border-radius: 30px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .voice-end-call-btn:hover {
        background: #B91C1C;
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(220, 38, 38, 0.4);
      }

      /* Full chat window */
      #safa-chat-window {
        position: fixed;
        bottom: 24px;
        ${CONFIG.position}: 24px;
        width: 400px;
        height: 600px;
        background: white;
        border-radius: 20px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
        z-index: 999999;
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: expandIn 0.4s ease;
      }

      @keyframes expandIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      #safa-chat-window.open {
        display: flex;
      }

      .safa-chat-header {
        background: ${CONFIG.primaryColor};
        color: white;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .safa-chat-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .safa-chat-header-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid white;
      }

      .safa-chat-header-title {
        font-weight: 600;
        font-size: 16px;
      }

      .safa-chat-header-subtitle {
        font-size: 12px;
        opacity: 0.9;
      }

      .safa-chat-close {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        font-size: 18px;
        line-height: 1;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .safa-chat-close:hover {
        background: rgba(255,255,255,0.3);
      }

      .safa-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #FAFAFA;
      }

      .safa-message {
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .safa-message.bot {
        flex-direction: row;
      }

      .safa-message.user {
        flex-direction: row-reverse;
      }

      .safa-message-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .safa-message.user .safa-message-avatar {
        display: none;
      }

      .safa-message-content {
        display: flex;
        flex-direction: column;
        max-width: 75%;
      }

      .safa-message.user .safa-message-content {
        align-items: flex-end;
      }

      .safa-message-bubble {
        padding: 12px 16px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
      }

      .safa-message.bot .safa-message-bubble {
        background: white;
        color: #374151;
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      }

      .safa-message.user .safa-message-bubble {
        background: ${CONFIG.primaryColor};
        color: white;
        border-bottom-right-radius: 4px;
      }

      .safa-quick-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }

      .safa-quick-button {
        background: ${CONFIG.primaryColor};
        border: none;
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(185, 28, 28, 0.2);
      }

      .safa-quick-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(185, 28, 28, 0.3);
      }

      .safa-typing-indicator {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        background: white;
        border-radius: 18px;
        border-bottom-left-radius: 4px;
        width: fit-content;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      }

      .safa-typing-dot {
        width: 8px;
        height: 8px;
        background: #9CA3AF;
        border-radius: 50%;
        animation: typingBounce 1.4s infinite;
      }

      .safa-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .safa-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-6px); }
      }

      .safa-chat-input-area {
        padding: 16px 20px;
        background: white;
        border-top: 1px solid #E5E7EB;
      }

      .safa-chat-input-wrapper {
        display: flex;
        gap: 12px;
        align-items: center;
        background: #F3F4F6;
        border-radius: 25px;
        padding: 4px 4px 4px 20px;
      }

      .safa-chat-input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 12px 0;
        font-size: 14px;
        outline: none;
      }

      .safa-chat-input::placeholder {
        color: #9CA3AF;
      }

      .safa-chat-send {
        background: ${CONFIG.primaryColor};
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .safa-chat-send:hover {
        transform: scale(1.05);
      }

      .safa-chat-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .safa-chat-send svg {
        width: 16px;
        height: 16px;
        fill: white;
      }

      @media (max-width: 480px) {
        #safa-chat-window {
          width: calc(100% - 16px);
          height: calc(100% - 80px);
          bottom: 8px;
          ${CONFIG.position}: 8px;
          border-radius: 16px;
        }

        #safa-medium-popup {
          width: calc(100% - 32px);
          ${CONFIG.position}: 16px;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'safa-chat-widget';
    
    const demoBannerHTML = CONFIG.showDemoBanner ? `
      <div class="safa-demo-banner">
        <strong>DEMO:</strong> Experience Amira in action
      </div>
    ` : '';

    const poweredByHTML = CONFIG.showPoweredBy ? `
      <div class="safa-powered-by">Powered by <span>Amira</span></div>
    ` : '<div></div>';

    const voiceButtonHTML = CONFIG.voiceEnabled ? `
      <button class="safa-voice-call-button" id="start-voice-call">
        📞 Talk to ${CONFIG.agentName} Now
      </button>
      <div class="safa-mode-hint">
        Chat or call - your choice!
      </div>
    ` : '';

    const voiceModalHTML = CONFIG.voiceEnabled ? `
      <div class="safa-voice-modal-overlay" id="voice-modal-overlay"></div>
      <div class="safa-voice-modal" id="voice-modal">
        <div class="voice-avatar-container" id="voice-avatar-container">
          <img src="${CONFIG.agentAvatar}" alt="${CONFIG.agentName}" class="voice-avatar">
        </div>
        
        <div class="voice-modal-status" id="call-status">CONNECTING</div>
        <div class="voice-modal-agent-name">${CONFIG.agentName}</div>
        <div class="voice-modal-message" id="call-message">Connecting...</div>

        <button class="voice-end-call-btn" id="end-call-btn">End Call</button>
      </div>
    ` : '';
    
    widget.innerHTML = `
      <!-- Small circle launcher -->
      <div id="safa-chat-launcher">
        <img src="${CONFIG.agentAvatar}" alt="${CONFIG.agentName}">
        <div class="notification-badge">1</div>
      </div>

      <!-- Medium popup -->
      <div id="safa-medium-popup">
        ${demoBannerHTML}
        <div class="safa-medium-header">
          ${poweredByHTML}
          <button class="safa-medium-close">&times;</button>
        </div>
        <div class="safa-medium-content">
          <img src="${CONFIG.agentAvatar}" alt="${CONFIG.agentName}" class="safa-medium-avatar">
          <div class="safa-medium-agent-info">
            <div class="safa-medium-name">${CONFIG.agentName}</div>
            <div class="safa-medium-role">AI Assistant</div>
            <div class="safa-medium-company-badge">${CONFIG.companyName}</div>
          </div>
          <div class="safa-medium-message">${CONFIG.greeting}</div>
          <div class="safa-medium-buttons">
            <button class="safa-medium-button" data-value="Security">Security</button>
            <button class="safa-medium-button" data-value="Logistics">Logistics</button>
            <button class="safa-medium-button" data-value="Healthcare">Healthcare</button>
            <button class="safa-medium-button" data-value="Other">Other</button>
          </div>
          ${voiceButtonHTML}
          <div class="safa-medium-input">
            <input type="text" placeholder="Or type your message..." id="safa-medium-input-field">
            <button id="safa-medium-send">
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      ${voiceModalHTML}

      <!-- Full chat window -->
      <div id="safa-chat-window">
        <div class="safa-chat-header">
          <div class="safa-chat-header-info">
            <img src="${CONFIG.agentAvatar}" alt="${CONFIG.agentName}" class="safa-chat-header-avatar">
            <div>
              <div class="safa-chat-header-title">${CONFIG.agentName}</div>
              <div class="safa-chat-header-subtitle">${CONFIG.companyName} AI</div>
            </div>
          </div>
          <button class="safa-chat-close">&times;</button>
        </div>
        
        <div class="safa-chat-messages" id="safa-messages-container">
        </div>

        <div class="safa-chat-input-area">
          <div class="safa-chat-input-wrapper">
            <input type="text" class="safa-chat-input" id="safa-user-input" placeholder="Type your message..." />
            <button class="safa-chat-send" id="safa-send-button">
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widget);
  }

  // Voice Functions
  function loadRetellSDK() {
    return new Promise(async (resolve, reject) => {
      if (window.RetellWebClient) {
        resolve();
        return;
      }

      try {
        const module = await import('https://cdn.jsdelivr.net/npm/retell-client-js-sdk@2.0.7/+esm');
        window.RetellWebClient = module.RetellWebClient;
        console.log('Retell SDK loaded');
        resolve();
      } catch (error) {
        reject(new Error('Failed to load Retell SDK: ' + error.message));
      }
    });
  }

  async function getRetellAccessToken() {
    const response = await fetch(CONFIG.voiceTokenWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'safa-widget',
        conversationId: state.conversationId,
        userLocation: state.userLocation,
        trafficSource: getTrafficSource()
      })
    });

    if (!response.ok) {
      throw new Error('Token request failed: ' + response.status);
    }

    const data = await response.json();
    
    if (!data.success || !data.access_token) {
      throw new Error('No access token in response');
    }

    return data.access_token;
  }

  async function startVoiceCall() {
    if (!CONFIG.voiceEnabled) return;
    
    const voiceButton = document.getElementById('start-voice-call');
    
    try {
      state.callConnecting = true;
      voiceButton.disabled = true;
      voiceButton.textContent = 'Connecting...';
      
      const voiceModal = document.getElementById('voice-modal');
      const overlay = document.getElementById('voice-modal-overlay');
      const avatarContainer = document.getElementById('voice-avatar-container');
      
      voiceModal.classList.add('active');
      overlay.classList.add('active');
      avatarContainer.classList.add('connecting');
      
      document.getElementById('call-status').textContent = 'CONNECTING';
      document.getElementById('call-message').textContent = 'Setting up your call...';
      
      setStage('small');

      await loadRetellSDK();
      document.getElementById('call-message').textContent = 'Almost there...';

      if (!retellClient) {
        retellClient = new window.RetellWebClient();
        
        retellClient.on('call_started', () => {
          state.callActive = true;
          state.callConnecting = false;
          avatarContainer.classList.remove('connecting');
          document.getElementById('call-status').textContent = 'CONNECTED';
          document.getElementById('call-message').textContent = 'Start speaking...';
        });

        retellClient.on('agent_start_talking', () => {
          state.aiSpeaking = true;
          document.getElementById('voice-avatar-container').classList.add('speaking');
          document.getElementById('call-status').textContent = 'KAY SPEAKING';
        });

        retellClient.on('agent_stop_talking', () => {
          state.aiSpeaking = false;
          document.getElementById('voice-avatar-container').classList.remove('speaking');
          document.getElementById('call-status').textContent = 'LISTENING';
        });

        retellClient.on('call_ended', () => {
          endVoiceCall();
        });

        retellClient.on('error', (error) => {
          console.error('Retell error:', error);
          document.getElementById('call-message').textContent = 'Connection error';
          setTimeout(() => endVoiceCall(), 2000);
        });
      }

      document.getElementById('call-message').textContent = 'Connecting to ' + CONFIG.agentName + '...';
      const accessToken = await getRetellAccessToken();

      await retellClient.startCall({
        accessToken: accessToken,
        sampleRate: 24000,
      });
      
    } catch (error) {
      console.error('Failed to start call:', error);
      document.getElementById('call-status').textContent = 'ERROR';
      document.getElementById('call-message').textContent = 'Failed to connect';
      setTimeout(() => endVoiceCall(), 3000);
    } finally {
      voiceButton.disabled = false;
      voiceButton.textContent = '📞 Talk to ' + CONFIG.agentName + ' Now';
    }
  }

  function endVoiceCall() {
    if (retellClient && state.callActive) {
      try {
        retellClient.stopCall();
      } catch (e) {}
    }
    
    state.callActive = false;
    state.callConnecting = false;
    state.aiSpeaking = false;
    
    const voiceModal = document.getElementById('voice-modal');
    const overlay = document.getElementById('voice-modal-overlay');
    const avatarContainer = document.getElementById('voice-avatar-container');
    
    if (voiceModal) voiceModal.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    if (avatarContainer) avatarContainer.classList.remove('speaking', 'connecting');

    const voiceButton = document.getElementById('start-voice-call');
    if (voiceButton) {
      voiceButton.disabled = false;
      voiceButton.textContent = '📞 Talk to ' + CONFIG.agentName + ' Now';
    }
  }

  function setStage(newStage) {
    const launcher = document.getElementById('safa-chat-launcher');
    const mediumPopup = document.getElementById('safa-medium-popup');
    const fullWindow = document.getElementById('safa-chat-window');
    const badge = document.querySelector('.notification-badge');

    launcher.style.display = 'none';
    mediumPopup.classList.remove('open');
    fullWindow.classList.remove('open');

    state.stage = newStage;

    switch (newStage) {
      case 'small':
        launcher.style.display = 'block';
        badge.style.display = 'flex';
        break;
      case 'medium':
        mediumPopup.classList.add('open');
        badge.style.display = 'none';
        break;
      case 'full':
        fullWindow.classList.add('open');
        badge.style.display = 'none';
        break;
    }
  }

  function addMessage(text, isBot = true, buttons = null) {
    const container = document.getElementById('safa-messages-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'safa-message ' + (isBot ? 'bot' : 'user');

    let html = '';
    
    if (isBot) {
      html += '<img src="' + CONFIG.agentAvatar + '" alt="' + CONFIG.agentName + '" class="safa-message-avatar">';
    }
    
    html += '<div class="safa-message-content">';
    html += '<div class="safa-message-bubble">' + text + '</div>';

    if (buttons && isBot) {
      html += '<div class="safa-quick-buttons">';
      buttons.forEach(btn => {
        html += '<button class="safa-quick-button" data-value="' + btn.value + '">' + btn.label + '</button>';
      });
      html += '</div>';
    }
    
    html += '</div>';

    messageDiv.innerHTML = html;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;

    state.messages.push({
      role: isBot ? 'assistant' : 'user',
      content: text,
      timestamp: Date.now()
    });
  }

  function showTyping() {
    state.isTyping = true;
    const container = document.getElementById('safa-messages-container');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'safa-message bot';
    typingDiv.id = 'safa-typing';
    typingDiv.innerHTML = `
      <img src="${CONFIG.agentAvatar}" alt="${CONFIG.agentName}" class="safa-message-avatar">
      <div class="safa-message-content">
        <div class="safa-typing-indicator">
          <div class="safa-typing-dot"></div>
          <div class="safa-typing-dot"></div>
          <div class="safa-typing-dot"></div>
        </div>
      </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    state.isTyping = false;
    const typing = document.getElementById('safa-typing');
    if (typing) typing.remove();
  }

  async function sendToWebhook(userMessage) {
    showTyping();

    try {
      const payload = {
        conversationId: state.conversationId,
        message: userMessage,
        messages: state.messages,
        collectedData: state.collectedData,
        userLocation: state.userLocation,
        trafficSource: getTrafficSource(),
        timestamp: Date.now()
      };

      const response = await fetch(CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      hideTyping();

      if (data.collectedData) {
        state.collectedData = { ...state.collectedData, ...data.collectedData };
      }

      if (data.demoMode !== undefined) {
        state.demoMode = data.demoMode;
      }

      if (data.response) {
        setTimeout(() => {
          addMessage(data.response, true, data.buttons || null);
        }, 300);
      }

    } catch (error) {
      console.error('Webhook error:', error);
      hideTyping();
      addMessage("Sorry, I'm having trouble connecting. Please try again in a moment.", true);
    }
  }

  function handleUserInput(text) {
    if (!text.trim()) return;
    
    addMessage(text, false);
    document.getElementById('safa-user-input').value = '';
    sendToWebhook(text);
  }

  function openFullChat(initialMessage) {
    setStage('full');
    addMessage(CONFIG.greeting, true);
    addMessage(initialMessage, false);
    sendToWebhook(initialMessage);
  }

  function initEventListeners() {
    document.getElementById('safa-chat-launcher').addEventListener('click', () => {
      setStage('medium');
    });

    document.querySelector('.safa-medium-close').addEventListener('click', () => {
      setStage('small');
    });

    document.querySelectorAll('.safa-medium-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const value = e.target.getAttribute('data-value');
        openFullChat("I'm in the " + value + " industry");
      });
    });

    document.getElementById('safa-medium-send').addEventListener('click', () => {
      const input = document.getElementById('safa-medium-input-field');
      if (input.value.trim()) {
        openFullChat(input.value.trim());
      }
    });

    document.getElementById('safa-medium-input-field').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        openFullChat(e.target.value.trim());
      }
    });

    document.querySelector('.safa-chat-close').addEventListener('click', () => {
      setStage('small');
    });

    document.getElementById('safa-send-button').addEventListener('click', () => {
      const input = document.getElementById('safa-user-input');
      handleUserInput(input.value);
    });

    document.getElementById('safa-user-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleUserInput(e.target.value);
      }
    });

    document.getElementById('safa-messages-container').addEventListener('click', (e) => {
      if (e.target.classList.contains('safa-quick-button')) {
        const value = e.target.getAttribute('data-value');
        const buttonsContainer = e.target.closest('.safa-quick-buttons');
        if (buttonsContainer) buttonsContainer.remove();
        handleUserInput(value);
      }
    });

    // Voice event listeners
    if (CONFIG.voiceEnabled) {
      document.getElementById('start-voice-call').addEventListener('click', startVoiceCall);
      document.getElementById('end-call-btn').addEventListener('click', endVoiceCall);
      document.getElementById('voice-modal-overlay').addEventListener('click', endVoiceCall);
    }
  }

  function setupAutoOpen() {
    if (CONFIG.autoOpenDelay > 0) {
      setTimeout(() => {
        if (state.stage === 'small') {
          setStage('medium');
        }
      }, CONFIG.autoOpenDelay);
    }
  }

  async function init() {
    injectStyles();
    createWidget();
    initEventListeners();
    await detectLocation();
    setupAutoOpen();
    
    console.log('Amira Widget initialized');
    console.log('Voice enabled:', CONFIG.voiceEnabled);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
