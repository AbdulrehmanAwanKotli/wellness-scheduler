document.addEventListener('DOMContentLoaded', () => {
  // Global States
  let activeSelectedComment = null;
  let allComments = [];
  let scheduledPosts = [];

  // DOM Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const apiIndicator = document.getElementById('apiIndicator');
  const apiStatusText = document.getElementById('apiStatusText');
  const apiSettingsDropdown = document.getElementById('apiSettingsDropdown');
  const settingsBackdrop = document.getElementById('settingsBackdrop');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveKeyBtn = document.getElementById('saveKeyBtn');
  const clearKeyBtn = document.getElementById('clearKeyBtn');

  // Script Generator Elements
  const scriptForm = document.getElementById('scriptForm');
  const videoTopicInput = document.getElementById('videoTopic');
  const targetAudienceInput = document.getElementById('targetAudience');
  const generateScriptBtn = document.getElementById('generateScriptBtn');
  const scriptOutputBox = document.getElementById('scriptOutputBox');
  const scriptPlaceholder = document.getElementById('scriptPlaceholder');
  const scriptContentArea = document.getElementById('scriptContentArea');
  const scriptText = document.getElementById('scriptText');
  const copyScriptBtn = document.getElementById('copyScriptBtn');
  const sendToSchedulerBtn = document.getElementById('sendToSchedulerBtn');
  const scriptModelLabel = document.getElementById('scriptModelLabel');

  // Thumbnail Strategist Elements
  const thumbnailForm = document.getElementById('thumbnailForm');
  const thumbTopicInput = document.getElementById('thumbTopic');
  const generateThumbBtn = document.getElementById('generateThumbBtn');
  const thumbPlaceholder = document.getElementById('thumbPlaceholder');
  const thumbContentArea = document.getElementById('thumbContentArea');
  const promptText = document.getElementById('promptText');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const mockTitle = document.getElementById('mockTitle');
  const thumbModelLabel = document.getElementById('thumbModelLabel');
  const generatedThumbImg = document.getElementById('generatedThumbImg');

  // Scheduler Elements
  const schedulerForm = document.getElementById('schedulerForm');
  const schedTopicInput = document.getElementById('schedTopic');
  const schedCaptionInput = document.getElementById('schedCaption');
  const schedPlatformInput = document.getElementById('schedPlatform');
  const schedTimeInput = document.getElementById('schedTime');
  const queueList = document.getElementById('queueList');
  const refreshQueueBtn = document.getElementById('refreshQueueBtn');
  const scheduleBtn = document.getElementById('scheduleBtn');

  // Comment Manager Elements
  const newCommentForm = document.getElementById('newCommentForm');
  const newCommentText = document.getElementById('newCommentText');
  const commentInboxContainer = document.getElementById('commentInboxContainer');
  const workspacePlaceholder = document.getElementById('workspacePlaceholder');
  const workspaceContent = document.getElementById('workspaceContent');
  const selectedCommentDetailCard = document.getElementById('selectedCommentDetailCard');
  const analyzeCommentBtn = document.getElementById('analyzeCommentBtn');
  const replyBox = document.getElementById('replyBox');
  const workspaceBadge = document.getElementById('workspaceBadge');
  const workspaceReplyText = document.getElementById('workspaceReplyText');
  const copyReplyBtn = document.getElementById('copyReplyBtn');
  const approveReplyBtn = document.getElementById('approveReplyBtn');

  // Set default datetime to tomorrow 10:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const localIsoString = new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  schedTimeInput.value = localIsoString;

  // ----------------------------------------------------
  // LOCALSTORAGE DATABASE INITIALIZATION
  // ----------------------------------------------------
  function initLocalStorageData() {
    // 1. Gemini Key
    const key = localStorage.getItem('gemini_api_key');
    if (key) {
      apiKeyInput.value = key;
      setApiStatusUI(true);
    } else {
      setApiStatusUI(false);
    }

    // 2. Comments Feed Prepopulation
    const commentsData = localStorage.getItem('ananta_comments');
    if (!commentsData) {
      const seedComments = [
        {
          id: "c1",
          author: "Zainab Ahmed",
          profilePic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
          content: "Hello! I am highly interested in the NLP Practitioner Training Batch 17. Could you please share the fee structure and certification details?",
          timestamp: "10 minutes ago",
          status: "Unprocessed",
          response: "",
          classification: ""
        },
        {
          id: "c2",
          author: "Adnan Malik",
          profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
          content: "Lately, work stress has been unbearable. I feel constantly anxious and can't focus on my tasks or find mental peace. Does coaching help with this?",
          timestamp: "1 hour ago",
          status: "Unprocessed",
          response: "",
          classification: ""
        },
        {
          id: "c3",
          author: "Sarah Khan",
          profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
          content: "Absolutely loved the tip on auditory anchoring in your last video! Applying it daily now.",
          timestamp: "3 hours ago",
          status: "Processed",
          response: "Thank you so much, Sarah! Anchoring is a powerful tool to shift states instantly. Keep practicing!",
          classification: "General Feedback"
        }
      ];
      localStorage.setItem('ananta_comments', JSON.stringify(seedComments));
      allComments = seedComments;
    } else {
      allComments = JSON.parse(commentsData);
    }

    // 3. Scheduled Posts
    const postsData = localStorage.getItem('ananta_scheduled_posts');
    if (!postsData) {
      localStorage.setItem('ananta_scheduled_posts', JSON.stringify([]));
      scheduledPosts = [];
    } else {
      scheduledPosts = JSON.parse(postsData);
    }
  }

  // ----------------------------------------------------
  // NAVIGATION & TAB SYSTEM
  // ----------------------------------------------------
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');

      // Update Navigation styling
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Toggle panels
      tabPanels.forEach(panel => panel.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
    });
  });

  function switchToTab(tabId) {
    const targetButton = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (targetButton) {
      targetButton.click();
    }
  }

  // ----------------------------------------------------
  // API KEY SETTINGS CONTROL
  // ----------------------------------------------------
  apiIndicator.addEventListener('click', () => {
    const isVisible = apiSettingsDropdown.style.display === 'block';
    if (isVisible) {
      closeSettingsDropdown();
    } else {
      apiSettingsDropdown.style.display = 'block';
      settingsBackdrop.style.display = 'block';
      apiKeyInput.focus();
    }
  });

  settingsBackdrop.addEventListener('click', closeSettingsDropdown);

  function closeSettingsDropdown() {
    apiSettingsDropdown.style.display = 'none';
    settingsBackdrop.style.display = 'none';
  }

  saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      setApiStatusUI(true);
      alert('Gemini API key saved! Live AI features are now active.');
    } else {
      alert('Please enter a valid key.');
    }
    closeSettingsDropdown();
  });

  clearKeyBtn.addEventListener('click', () => {
    localStorage.removeItem('gemini_api_key');
    apiKeyInput.value = '';
    setApiStatusUI(false);
    alert('API Key cleared. Application running in Demonstration Mode.');
    closeSettingsDropdown();
  });

  function setApiStatusUI(hasKey) {
    if (hasKey) {
      apiIndicator.className = 'api-indicator';
      apiStatusText.innerText = 'AI Engine Active';
    } else {
      apiIndicator.className = 'api-indicator warning';
      apiStatusText.innerText = 'Setup API Key';
    }
  }

  // Helper: Get key from storage
  function getGeminiKey() {
    return localStorage.getItem('gemini_api_key') || '';
  }

  // ----------------------------------------------------
  // CALL GEMINI VIA FETCH
  // ----------------------------------------------------
  async function callGeminiAPI(prompt) {
    const key = getGeminiKey();
    if (!key) {
      throw new Error('API Key Missing');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Gemini API connection failed.');
    }

    const resData = await response.json();
    if (resData.candidates && resData.candidates[0]?.content?.parts[0]?.text) {
      return resData.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response structure from Gemini API');
    }
  }

  // ----------------------------------------------------
  // CONTENT ENGINE (SCRIPT GENERATION)
  // ----------------------------------------------------
  scriptForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const topic = videoTopicInput.value.trim();
    const targetAudience = targetAudienceInput.value;

    if (!topic) return;

    // Show loading states
    generateScriptBtn.disabled = true;
    generateScriptBtn.querySelector('span').innerText = 'Crafting Script...';
    scriptPlaceholder.style.display = 'none';
    scriptContentArea.style.display = 'none';

    // Show spinner inside script box
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.margin = '4rem auto';
    scriptOutputBox.appendChild(spinner);

    const key = getGeminiKey();

    try {
      if (key) {
        // Live Gemini Prompt
        const prompt = `
          You are an expert NLP Master Practitioner, Wellness Coach, and Copywriter.
          Create a highly converting short-form video script (suitable for TikTok, Reels, YouTube Shorts) about the topic: "${topic}".
          The target audience is: "${targetAudience}".
          
          The script MUST be structured exactly into three sections:
          1. [HOOK] (0-5 seconds): High-impact, scroll-stopping emotional hook using NLP pacing.
          2. [BODY] (5-50 seconds): Empathetic, value-packed insights. Offer 1 practical NLP technique (like reframing, submodalities, or anchoring) written in simple, engaging language. Use rich sensory descriptions (visual, auditory, kinesthetic).
          3. [CTA]: Connect the topic back to the upcoming "NLP Practitioner Training Batch 17" or invite them to book a discovery session.

          Format the response clearly with markers [HOOK], [BODY], and [CTA] preceding each section. Keep it warm, therapeutic, and deeply professional.
        `;
        
        const responseText = await callGeminiAPI(prompt);
        spinner.remove();
        scriptContentArea.style.display = 'block';
        scriptModelLabel.innerText = 'GEMINI 1.5 FLASH';
        formatScriptOutput(responseText);
      } else {
        // Mock Response (Demonstration Mode)
        setTimeout(() => {
          spinner.remove();
          scriptContentArea.style.display = 'block';
          scriptModelLabel.innerText = 'DEMO MODE (NO KEY)';
          
          const mockScript = `[HOOK]
"Have you ever noticed how a single critical word from someone can completely ruin your mood for the entire day? That's not just a reaction—it's your brain running an automated script. What if you could hit pause?"

[BODY]
"In NLP wellness coaching, we call this 'submodality shifting'. When an anxious thought enters your mind, it's usually represented as a mental image. Is it big, bright, and close? If so, try this wellness hack: in your mind's eye, shrink that picture down. Make it black and white, and push it far away into the distance until it's a tiny speck. Notice how the anxiety melts when you change the visual details of your thoughts. You are the coder of your mind."

[CTA]
"If you want to master the art of emotional freedom and help others do the same, join us for the NLP Practitioner Training Batch 17. Send us a message or contact us on WhatsApp to secure your spot today."`;
          formatScriptOutput(mockScript);
        }, 1500);
      }
    } catch (err) {
      spinner.remove();
      scriptPlaceholder.style.display = 'flex';
      scriptPlaceholder.querySelector('p').innerHTML = `<span style="color:#d4a373">${escapeHTML(err.message)}</span>`;
    } finally {
      generateScriptBtn.disabled = false;
      generateScriptBtn.querySelector('span').innerText = 'Generate Wellness Script';
    }
  });

  function formatScriptOutput(text) {
    let html = '';
    const sections = text.split(/\[(HOOK|BODY|CTA)\]/gi);
    
    if (sections.length > 1) {
      for (let i = 1; i < sections.length; i += 2) {
        const type = sections[i].toUpperCase();
        const content = sections[i + 1] ? sections[i + 1].trim() : '';
        
        html += `<div class="script-section-title">${type}</div>`;
        html += `<div class="script-section-content">${content.replace(/\n/g, '<br>')}</div>`;
      }
      scriptText.innerHTML = html;
    } else {
      scriptText.innerHTML = `<div class="script-section-content">${text.replace(/\n/g, '<br>')}</div>`;
    }
  }

  copyScriptBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(scriptText.innerText).then(() => {
      const origText = copyScriptBtn.querySelector('span').innerText;
      copyScriptBtn.querySelector('span').innerText = 'Copied!';
      setTimeout(() => {
        copyScriptBtn.querySelector('span').innerText = origText;
      }, 2000);
    });
  });

  sendToSchedulerBtn.addEventListener('click', () => {
    schedTopicInput.value = videoTopicInput.value.trim();
    schedCaptionInput.value = scriptText.innerText;
    switchToTab('auto-scheduler');
  });

  // ----------------------------------------------------
  // THUMBNAIL STRATEGIST
  // ----------------------------------------------------
  thumbnailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const topic = thumbTopicInput.value.trim();
    if (!topic) return;

    generateThumbBtn.disabled = true;
    generateThumbBtn.querySelector('span').innerText = 'Designing Concept...';
    thumbPlaceholder.style.display = 'none';
    thumbContentArea.style.display = 'none';

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.margin = '4rem auto';
    thumbOutputBox.appendChild(spinner);

    const key = getGeminiKey();

    try {
      if (key) {
        const prompt = `
          You are an expert design strategist for wellness and NLP content creators.
          Create a highly professional, studio-level image generation prompt for a video thumbnail on the topic: "${topic}".
          
          The prompt MUST strictly follow these guidelines:
          - Colors: Olive green background, subtle warm gold lighting/accents, pure white elements.
          - Style: Ultra-minimalist, deep, artistic, high-end studio photography.
          - Subject: Artistic representations, e.g., a serene professional, subtle lotus-inspired structural elegance, organic leaves with golden morning dew, or abstract golden waves of energy.
          - No Cheap CGI: Avoid cheesy corporate icons, neon arrows, futuristic hologram brains, or heavy text overlay.
          
          Return ONLY the final prompt text optimized for Midjourney/DALL-E, followed by a brief 2-sentence rationale for the design.
        `;

        const responseText = await callGeminiAPI(prompt);
        spinner.remove();
        
        let cleanPrompt = responseText;
        const promptMatch = responseText.match(/Prompt:\s*["']?([^"'\n]+)/i) || responseText.match(/["']([^"']+)["']/);
        if (promptMatch && promptMatch[1]) {
          cleanPrompt = promptMatch[1].trim();
        }

        thumbContentArea.style.display = 'flex';
        thumbModelLabel.innerText = 'GEMINI PROMPT DESIGN';
        promptText.innerText = responseText;
        mockTitle.innerText = topic.length > 25 ? topic.slice(0, 25) + '...' : topic;
        
        // Render image from Pollinations AI
        loadGeneratedImage(cleanPrompt);
      } else {
        // Mock Prompt Design
        setTimeout(() => {
          spinner.remove();
          thumbContentArea.style.display = 'flex';
          thumbModelLabel.innerText = 'DEMO PROMPT DESIGN (NO KEY)';
          
          const mockPrompt = `Prompt: "A high-end, minimalist studio photograph of a delicate golden metallic lotus flower sitting on a matte olive green surface. Warm golden rays of sunlight casting soft, elegant shadows. Calm, deep, and artistic composition. 8k resolution, cinematic lighting, photorealistic --ar 16:9"\n\nRationale: The olive green base creates a grounded, peaceful wellness tone, while the gold lotus flower serves as a premium symbol of growth and mental clarity. The soft shadows and minimalist style convey professional coaching quality rather than generic stock imagery.`;
          promptText.innerText = mockPrompt;
          mockTitle.innerText = topic.length > 25 ? topic.slice(0, 25) + '...' : topic;
          
          const cleanPrompt = "A high-end, minimalist studio photograph of a delicate golden metallic lotus flower sitting on a matte olive green surface, warm golden rays of sunlight casting soft elegant shadows, 8k resolution, cinematic lighting, photorealistic";
          loadGeneratedImage(cleanPrompt);
        }, 1500);
      }
    } catch (err) {
      spinner.remove();
      thumbPlaceholder.style.display = 'flex';
      thumbPlaceholder.querySelector('p').innerText = err.message;
    } finally {
      generateThumbBtn.disabled = false;
      generateThumbBtn.querySelector('span').innerText = 'Design Thumbnail Prompt';
    }
  });

  function loadGeneratedImage(prompt) {
    generatedThumbImg.style.display = 'none';
    
    // Create loading overlay in the mock preview box
    let loaderOverlay = thumbVisualMock.querySelector('.img-loader-overlay');
    if (!loaderOverlay) {
      loaderOverlay = document.createElement('div');
      loaderOverlay.className = 'img-loader-overlay';
      loaderOverlay.style.position = 'absolute';
      loaderOverlay.style.top = '0';
      loaderOverlay.style.left = '0';
      loaderOverlay.style.width = '100%';
      loaderOverlay.style.height = '100%';
      loaderOverlay.style.background = 'rgba(8, 19, 16, 0.8)';
      loaderOverlay.style.display = 'flex';
      loaderOverlay.style.alignItems = 'center';
      loaderOverlay.style.justifyContent = 'center';
      loaderOverlay.style.zIndex = '3';
      
      const textLoader = document.createElement('div');
      textLoader.innerHTML = `<div class="spinner" style="margin: 0 auto 0.5rem auto;"></div><p style="font-size:0.8rem; color:var(--color-gold);">Rendering visual mockup...</p>`;
      loaderOverlay.appendChild(textLoader);
      thumbVisualMock.appendChild(loaderOverlay);
    }
    loaderOverlay.style.display = 'flex';

    // Set the image src
    const encodedPrompt = encodeURIComponent(prompt);
    generatedThumbImg.src = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true`;
    
    generatedThumbImg.onload = () => {
      loaderOverlay.style.display = 'none';
      generatedThumbImg.style.display = 'block';
    };

    generatedThumbImg.onerror = () => {
      loaderOverlay.style.display = 'none';
      generatedThumbImg.style.display = 'none';
      console.error('Failed to load image from Pollinations AI.');
    };
  }

  copyPromptBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(promptText.innerText).then(() => {
      const origText = copyPromptBtn.querySelector('span').innerText;
      copyPromptBtn.querySelector('span').innerText = 'Copied!';
      setTimeout(() => {
        copyPromptBtn.querySelector('span').innerText = origText;
      }, 2000);
    });
  });

  // ----------------------------------------------------
  // AUTO-SCHEDULER
  // ----------------------------------------------------
  function renderQueue() {
    queueList.innerHTML = '';
    
    if (scheduledPosts.length === 0) {
      queueList.innerHTML = `
        <div style="color:var(--color-text-muted); text-align:center; padding: 3rem 1rem;">
          No posts queued. Generate a script or use the form to schedule a post.
        </div>
      `;
      return;
    }

    // Sort: soonest first
    scheduledPosts.sort((a,b) => new Date(a.scheduleTime) - new Date(b.scheduleTime));

    scheduledPosts.forEach(post => {
      const item = document.createElement('div');
      item.className = 'scheduler-item';

      const isPast = new Date(post.scheduleTime) < new Date();
      const statusText = isPast ? 'Published' : 'Scheduled';
      const statusClass = isPast ? 'status-published' : 'status-scheduled';

      const formattedDate = new Date(post.scheduleTime).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      item.innerHTML = `
        <div class="sched-details">
          <h4>${escapeHTML(post.topic)}</h4>
          <p>Scheduled: ${formattedDate}</p>
        </div>
        <div class="sched-meta">
          <span class="sched-platform">${escapeHTML(post.platform)}</span>
          <span class="sched-status ${statusClass}">${statusText}</span>
        </div>
      `;
      queueList.appendChild(item);
    });
  }

  schedulerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const topic = schedTopicInput.value.trim();
    const caption = schedCaptionInput.value.trim();
    const platform = schedPlatformInput.value;
    const scheduleTime = schedTimeInput.value;

    if (!topic || !scheduleTime) return;

    const newPost = {
      id: "p_" + Date.now(),
      topic,
      caption,
      platform,
      scheduleTime,
      status: "Scheduled"
    };

    scheduledPosts.push(newPost);
    localStorage.setItem('ananta_scheduled_posts', JSON.stringify(scheduledPosts));
    
    schedulerForm.reset();
    schedTimeInput.value = localIsoString; // Reset to tomorrow
    
    renderQueue();
    alert(`Post queued successfully for ${platform}!`);
  });

  refreshQueueBtn.addEventListener('click', () => {
    const postsData = localStorage.getItem('ananta_scheduled_posts');
    if (postsData) {
      scheduledPosts = JSON.parse(postsData);
    }
    renderQueue();
  });

  // ----------------------------------------------------
  // COMMENTS & LEAD MANAGER
  // ----------------------------------------------------
  function renderComments() {
    commentInboxContainer.innerHTML = '';
    
    if (allComments.length === 0) {
      commentInboxContainer.innerHTML = '<div style="color:var(--color-text-muted); text-align:center; padding:2rem;">No comments found.</div>';
      return;
    }

    allComments.forEach(comment => {
      const card = document.createElement('div');
      card.className = `comment-card ${activeSelectedComment && activeSelectedComment.id === comment.id ? 'selected' : ''}`;
      card.dataset.id = comment.id;

      let badgeHtml = '<span class="comment-badge badge-unprocessed">Unprocessed</span>';
      if (comment.status === 'Processed') {
        const cls = comment.classification || 'General Feedback';
        let badgeClass = 'badge-general';
        if (cls.includes('WhatsApp')) badgeClass = 'badge-lead';
        if (cls.includes('Empathetic')) badgeClass = 'badge-empathy';
        
        badgeHtml = `<span class="comment-badge ${badgeClass}">${cls}</span>`;
      }

      card.innerHTML = `
        <div class="comment-header">
          <img src="${comment.profilePic}" alt="" class="comment-avatar">
          <span class="comment-author">${escapeHTML(comment.author)}</span>
          <span class="comment-time">${comment.timestamp}</span>
        </div>
        <div class="comment-body">${escapeHTML(comment.content)}</div>
        <div class="comment-actions">
          ${badgeHtml}
        </div>
      `;

      card.addEventListener('click', () => {
        selectComment(comment);
      });

      commentInboxContainer.appendChild(card);
    });
  }

  function selectComment(comment) {
    activeSelectedComment = comment;
    renderComments(); // Update highlights

    workspacePlaceholder.style.display = 'none';
    workspaceContent.style.display = 'flex';

    selectedCommentDetailCard.innerHTML = `
      <div class="comment-header">
        <img src="${comment.profilePic}" alt="" class="comment-avatar">
        <span class="comment-author">${escapeHTML(comment.author)}</span>
        <span class="comment-time">${comment.timestamp}</span>
      </div>
      <div class="comment-body" style="font-size: 1.05rem; color: var(--color-text-primary); font-style: italic; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border-left: 3px solid var(--color-gold);">
        "${escapeHTML(comment.content)}"
      </div>
    `;

    if (comment.status === 'Processed') {
      analyzeCommentBtn.style.display = 'none';
      replyBox.style.display = 'block';
      workspaceReplyText.value = comment.response;
      
      const cls = comment.classification || 'General Feedback';
      let badgeClass = 'badge-general';
      if (cls.includes('WhatsApp')) badgeClass = 'badge-lead';
      if (cls.includes('Empathetic')) badgeClass = 'badge-empathy';
      
      workspaceBadge.className = `comment-badge ${badgeClass}`;
      workspaceBadge.innerText = cls;
      approveReplyBtn.querySelector('span').innerText = 'Update Saved Reply';
    } else {
      analyzeCommentBtn.style.display = 'flex';
      replyBox.style.display = 'none';
    }
  }

  analyzeCommentBtn.addEventListener('click', async () => {
    if (!activeSelectedComment) return;

    const commentContent = activeSelectedComment.content;
    const text = commentContent.toLowerCase();

    // Smart Comments Logic: check for fee, charges, session, admission
    const isLeadExtraction = text.includes("fee") || text.includes("charge") || text.includes("session") || text.includes("admission");

    analyzeCommentBtn.disabled = true;
    analyzeCommentBtn.querySelector('span').innerText = 'Analyzing with Gemini...';

    const key = getGeminiKey();

    try {
      let classification = '';
      let reply = '';

      if (isLeadExtraction) {
        classification = "Lead - WhatsApp Redirect";
        reply = "Thank you for contacting Wellness Centre. For details regarding admissions, batch dates, session charges, and Batch 17 certification fees, please contact our support desk directly on WhatsApp at +923263600497. We would be glad to assist you!";
      } else if (key) {
        // Live Gemini Analysis
        const prompt = `
          You are the community manager for Script Generator and Content Scheduler for Wellness Centre.
          Analyze this comment: "${commentContent}".

          RULES FOR REPLY & CLASSIFICATION:
          Rule 1 (Lead Extraction): If the user asks for fee details, admission, NLP certification, coaching prices, schedules, or session enrollments, classify as "Lead - WhatsApp Redirect" and strictly, politely direct them to contact our WhatsApp: +923263600497 for full details. Do NOT mention any pricing yourself.
          
          Rule 2 (Empathetic Support): If they share a personal problem (stress, anxiety, feeling overwhelmed, sadness, sleep issues), classify as "Empathetic Support" and write a short, highly warm, empathetic NLP-inspired reply (validate their state, offer a gentle reframing, and offer connection). Limit to 2-3 sentences.
          
          Rule 3 (General): For anything else, classify as "General Feedback" and write a short, grateful acknowledgment.

          You MUST return the output strictly in this JSON format. Do not use markdown wrappers:
          {
            "classification": "Lead - WhatsApp Redirect" | "Empathetic Support" | "General Feedback",
            "reply": "your drafted reply text"
          }
        `;

        let rawResponse = await callGeminiAPI(prompt);
        rawResponse = rawResponse.trim();
        
        // Clean markdown code blocks if returned
        if (rawResponse.startsWith('```json')) {
          rawResponse = rawResponse.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (rawResponse.startsWith('```')) {
          rawResponse = rawResponse.replace(/^```/, '').replace(/```$/, '').trim();
        }

        const parsed = JSON.parse(rawResponse);
        classification = parsed.classification;
        reply = parsed.reply;
      } else {
        // Local Rule Processor (Demonstration Mode)
        // Check Rule 2 matches
        const isSupport = text.includes("stress") || text.includes("anxiety") || text.includes("depressed") || text.includes("overwhelm") || text.includes("hard") || text.includes("struggle") || text.includes("sad") || text.includes("fear") || text.includes("focus");

        if (isSupport) {
          classification = "Empathetic Support";
          reply = "I hear you, and it takes real courage to share that level of overwhelm. Remember that stress is just a temporary state your mind is running, and states can be shifted with gentle care. We are here to walk with you; please feel free to message us directly so we can support your healing journey.";
        } else {
          classification = "General Feedback";
          reply = "Thank you so much for your comment! We are grateful to have you in our wellness community.";
        }
      }

      // Render workspace reply fields
      replyBox.style.display = 'block';
      workspaceReplyText.value = reply;
      workspaceBadge.innerText = classification;

      let badgeClass = 'badge-general';
      if (classification.includes('WhatsApp')) badgeClass = 'badge-lead';
      if (classification.includes('Empathetic')) badgeClass = 'badge-empathy';
      workspaceBadge.className = `comment-badge ${badgeClass}`;

      // Update state in active comment (temporary)
      activeSelectedComment.classification = classification;
      activeSelectedComment.response = reply;

    } catch (err) {
      alert('Analysis failed: ' + err.message);
    } finally {
      analyzeCommentBtn.disabled = false;
      analyzeCommentBtn.querySelector('span').innerText = 'Analyze Comment with Gemini';
    }
  });

  approveReplyBtn.addEventListener('click', () => {
    if (!activeSelectedComment) return;

    const finalReply = workspaceReplyText.value.trim();
    if (!finalReply) return;

    // Save processed state back to localStorage
    allComments = allComments.map(c => {
      if (c.id === activeSelectedComment.id) {
        c.response = finalReply;
        c.classification = activeSelectedComment.classification || "General Feedback";
        c.status = "Processed";
      }
      return c;
    });

    localStorage.setItem('ananta_comments', JSON.stringify(allComments));
    renderComments();
    
    // Refresh select view
    const updated = allComments.find(c => c.id === activeSelectedComment.id);
    if (updated) selectComment(updated);

    alert('Community reply approved and marked as sent!');
  });

  copyReplyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(workspaceReplyText.value).then(() => {
      const origText = copyReplyBtn.querySelector('span').innerText;
      copyReplyBtn.querySelector('span').innerText = 'Copied!';
      setTimeout(() => {
        copyReplyBtn.querySelector('span').innerText = origText;
      }, 2000);
    });
  });

  // Add Test Comment Form
  newCommentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = newCommentText.value.trim();
    if (!content) return;

    const newComment = {
      id: "c_" + Date.now(),
      author: "Community Guest",
      profilePic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      content: content,
      timestamp: "Just now",
      status: "Unprocessed",
      response: "",
      classification: ""
    };

    allComments.unshift(newComment);
    localStorage.setItem('ananta_comments', JSON.stringify(allComments));
    newCommentText.value = '';
    
    renderComments();
    selectComment(newComment); // Open immediately
  });


  // Helper: Escape HTML
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ----------------------------------------------------
  // INITIAL RUN
  // ----------------------------------------------------
  initLocalStorageData();
  renderQueue();
  renderComments();
});
