import {
  useEffect,
  useState,
} from "react";

import "../styles/settings.css";

function Settings({
  onBack,
  onOpenProfile,
}) {

  // ======================================================
  // ACTIVE SETTINGS SECTION
  // ======================================================

  const [
    activeSection,
    setActiveSection,
  ] = useState("account");

  // ======================================================
  // APPEARANCE
  // ======================================================

  const [
    themeMode,
    setThemeMode,
  ] = useState(() => {
    const savedTheme =
      localStorage.getItem("garuda_theme");

    return [
      "light",
      "dark",
      "system",
    ].includes(savedTheme)
      ? savedTheme
      : "dark";
  });

  const [
    accentColor,
    setAccentColor,
  ] = useState(() => {
    const saved =
      localStorage.getItem("garuda_accent");

    return [
      "blue",
      "purple",
      "green",
      "orange",
      "red",
    ].includes(saved)
      ? saved
      : "blue";
  });

  const [
    textSize,
    setTextSize,
  ] = useState(() => {
    const saved =
      localStorage.getItem("garuda_text_size");

    return [
      "small",
      "medium",
      "large",
    ].includes(saved)
      ? saved
      : "medium";
  });

  const [
    chatDensity,
    setChatDensity,
  ] = useState(() => {
    const saved =
      localStorage.getItem("garuda_chat_density");

    return [
      "compact",
      "comfortable",
      "spacious",
    ].includes(saved)
      ? saved
      : "comfortable";
  });

  const [
    reducedMotion,
    setReducedMotion,
  ] = useState(() =>
    localStorage.getItem(
      "garuda_reduced_motion"
    ) === "true"
  );

  const [
    highContrast,
    setHighContrast,
  ] = useState(() =>
    localStorage.getItem(
      "garuda_high_contrast"
    ) === "true"
  );

  // ======================================================
  // VOICE
  // ======================================================

  const [
    voiceEnabled,
    setVoiceEnabled,
  ] = useState(() => {
    const savedVoice =
      localStorage.getItem(
        "garuda_voice_enabled"
      );

    return (
      savedVoice === "true"
    );
  });

  // ======================================================
  // AI RESPONSE STYLE
  // ======================================================

  const [
    responseStyle,
    setResponseStyle,
  ] = useState(() => {
    const savedStyle =
      localStorage.getItem(
        "garuda_response_style"
      );

    const allowedStyles = [
      "Concise",
      "Balanced",
      "Detailed",
    ];

    if (
      allowedStyles.includes(
        savedStyle
      )
    ) {
      return savedStyle;
    }

    return "Balanced";
  });

  // ======================================================
  // APPLY APPEARANCE
  // ======================================================

  useEffect(() => {
    const root =
      document.documentElement;

    let resolvedTheme =
      themeMode;

    if (
      themeMode === "system"
    ) {
      resolvedTheme =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
          ? "dark"
          : "light";
    }

    root.setAttribute(
      "data-theme",
      resolvedTheme
    );

    root.setAttribute(
      "data-theme-mode",
      themeMode
    );

    root.setAttribute(
      "data-accent",
      accentColor
    );

    root.setAttribute(
      "data-text-size",
      textSize
    );

    root.setAttribute(
      "data-chat-density",
      chatDensity
    );

    root.setAttribute(
      "data-reduced-motion",
      String(reducedMotion)
    );

    root.setAttribute(
      "data-high-contrast",
      String(highContrast)
    );

    localStorage.setItem(
      "garuda_theme",
      themeMode
    );

    localStorage.setItem(
      "garuda_accent",
      accentColor
    );

    localStorage.setItem(
      "garuda_text_size",
      textSize
    );

    localStorage.setItem(
      "garuda_chat_density",
      chatDensity
    );

    localStorage.setItem(
      "garuda_reduced_motion",
      String(reducedMotion)
    );

    localStorage.setItem(
      "garuda_high_contrast",
      String(highContrast)
    );

  }, [
    themeMode,
    accentColor,
    textSize,
    chatDensity,
    reducedMotion,
    highContrast,
  ]);

  // ======================================================
  // FOLLOW SYSTEM THEME
  // ======================================================

  useEffect(() => {
    if (
      themeMode !== "system"
    ) {
      return;
    }

    const media =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const updateTheme = () => {
      document.documentElement.setAttribute(
        "data-theme",
        media.matches
          ? "dark"
          : "light"
      );
    };

    media.addEventListener(
      "change",
      updateTheme
    );

    return () => {
      media.removeEventListener(
        "change",
        updateTheme
      );
    };
  }, [themeMode]);

  // ======================================================
  // SAVE VOICE SETTING
  // ======================================================

  useEffect(() => {
    localStorage.setItem(
      "garuda_voice_enabled",
      String(
        voiceEnabled
      )
    );
  }, [
    voiceEnabled,
  ]);

  // ======================================================
  // SETTINGS SECTIONS
  // ======================================================

  const sections = [
    {
      id: "account",
      icon: "👤",
      title: "Account",
      description:
        "Manage your Garuda AI account and profile.",
    },
    {
      id: "appearance",
      icon: "🎨",
      title: "Appearance",
      description:
        "Customize the look and feel of Garuda AI.",
    },
    {
      id: "voice",
      icon: "🎙️",
      title: "Voice",
      description:
        "Configure voice assistant and speech features.",
    },
    {
      id: "ai",
      icon: "🤖",
      title: "AI Preferences",
      description:
        "Control Garuda's AI behaviour and response style.",
    },
    {
      id: "about",
      icon: "🦅",
      title: "About Garuda AI",
      description:
        "Information about your Garuda AI assistant.",
    },
  ];

  // ======================================================
  // THEME MODE
  // ======================================================

  function handleThemeModeChange(
    mode
  ) {
    if (
      ![
        "light",
        "dark",
        "system",
      ].includes(mode)
    ) {
      return;
    }

    setThemeMode(mode);
  }

  // ======================================================
  // AI RESPONSE STYLE
  // ======================================================

  function handleResponseStyleChange(
    style
  ) {
    const allowedStyles = [
      "Concise",
      "Balanced",
      "Detailed",
    ];

    if (
      !allowedStyles.includes(
        style
      )
    ) {
      return;
    }

    setResponseStyle(
      style
    );

    localStorage.setItem(
      "garuda_response_style",
      style
    );

    console.log(
      `🤖 Garuda response style: ${style}`
    );
  }

  // ======================================================
  // RENDER ACTIVE CONTENT
  // ======================================================

  function renderContent() {

    // ==================================================
    // ACCOUNT
    // ==================================================

    if (
      activeSection === "account"
    ) {
      return (
        <div className="settings-content">
          <div className="settings-content-header">
            <span className="settings-large-icon">
              👤
            </span>

            <div>
              <h2>
                Account
              </h2>

              <p>
                Manage your Garuda AI account and profile.
              </p>
            </div>
          </div>

          {/* ============================================
              PROFILE
          ============================================ */}

          <div className="settings-option">
            <div>
              <h3>
                Profile
              </h3>

              <p>
                View your Garuda AI profile information.
              </p>
            </div>

            <button
              type="button"
              className="settings-action-btn"
              onClick={() => {
                if (
                  onOpenProfile
                ) {
                  onOpenProfile();
                }
              }}
            >
              Manage
            </button>
          </div>

          {/* ============================================
              ACCOUNT STATUS
          ============================================ */}

          <div className="settings-option">
            <div>
              <h3>
                Account Status
              </h3>

              <p>
                Your Garuda AI account is currently active.
              </p>
            </div>

            <span className="status-badge success">
              Active
            </span>
          </div>
        </div>
      );
    }

    // ==================================================
    // APPEARANCE
    // ==================================================

    if (
      activeSection === "appearance"
    ) {
      const themes = [
        ["light", "☀️", "Light", "Bright and clean"],
        ["dark", "🌙", "Dark", "Comfortable dark interface"],
        ["system", "🖥️", "System", "Follow your device theme"],
      ];

      const accents = [
        ["blue", "Blue", "#2563EB"],
        ["purple", "Purple", "#7C3AED"],
        ["green", "Green", "#16A34A"],
        ["orange", "Orange", "#EA580C"],
        ["red", "Red", "#DC2626"],
      ];

      return (
        <div className="settings-content">
          <div className="settings-content-header">
            <span className="settings-large-icon">
              🎨
            </span>

            <div>
              <h2>Appearance</h2>
              <p>
                Customize the look, feel and accessibility of Garuda AI.
              </p>
            </div>
          </div>

          <div className="settings-option-column appearance-group">
            <h3>Theme</h3>

            <p>
              Choose Light, Dark, or automatically follow your system.
            </p>

            <div className="theme-mode-options">
              {themes.map(
                ([id, icon, title, description]) => (
                  <button
                    type="button"
                    key={id}
                    className={
                      themeMode === id
                        ? "theme-mode-btn selected"
                        : "theme-mode-btn"
                    }
                    onClick={() =>
                      handleThemeModeChange(id)
                    }
                    aria-pressed={
                      themeMode === id
                    }
                  >
                    <span className="theme-mode-icon">
                      {icon}
                    </span>

                    <span className="theme-mode-text">
                      <strong>
                        {title}
                      </strong>

                      <small>
                        {description}
                      </small>
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          <div className="settings-option-column appearance-group">
            <h3>Accent Color</h3>

            <p>
              Personalize Garuda's primary interface accent.
            </p>

            <div className="accent-options">
              {accents.map(
                ([id, label, color]) => (
                  <button
                    type="button"
                    key={id}
                    className={
                      accentColor === id
                        ? "accent-color-btn selected"
                        : "accent-color-btn"
                    }
                    onClick={() =>
                      setAccentColor(id)
                    }
                    aria-pressed={
                      accentColor === id
                    }
                    aria-label={
                      `Use ${label} accent`
                    }
                  >
                    <span
                      className="accent-swatch"
                      style={{
                        "--swatch-color": color,
                      }}
                    />

                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="settings-option-column appearance-group">
            <h3>Text Size</h3>

            <p>
              Adjust interface text size.
            </p>

            <div className="segmented-options">
              {[
                ["small", "Small"],
                ["medium", "Medium"],
                ["large", "Large"],
              ].map(
                ([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    className={
                      textSize === id
                        ? "segment-btn selected"
                        : "segment-btn"
                    }
                    onClick={() =>
                      setTextSize(id)
                    }
                    aria-pressed={
                      textSize === id
                    }
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="settings-option-column appearance-group">
            <h3>Chat Density</h3>

            <p>
              Control spacing throughout the conversation interface.
            </p>

            <div className="segmented-options">
              {[
                ["compact", "Compact"],
                ["comfortable", "Comfortable"],
                ["spacious", "Spacious"],
              ].map(
                ([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    className={
                      chatDensity === id
                        ? "segment-btn selected"
                        : "segment-btn"
                    }
                    onClick={() =>
                      setChatDensity(id)
                    }
                    aria-pressed={
                      chatDensity === id
                    }
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="settings-option-column appearance-group">
            <h3>Accessibility</h3>

            <p>
              Make Garuda more comfortable and accessible to use.
            </p>

            <div className="settings-option nested-option">
              <div>
                <h3>Reduced Motion</h3>
                <p>
                  Reduce interface animations and transitions.
                </p>
              </div>

              <button
                type="button"
                className={
                  reducedMotion
                    ? "toggle active"
                    : "toggle"
                }
                onClick={() =>
                  setReducedMotion(
                    previous => !previous
                  )
                }
                aria-pressed={reducedMotion}
                aria-label={
                  reducedMotion
                    ? "Disable reduced motion"
                    : "Enable reduced motion"
                }
              >
                <span />
              </button>
            </div>

            <div className="settings-option nested-option">
              <div>
                <h3>High Contrast</h3>
                <p>
                  Increase contrast between interface elements and text.
                </p>
              </div>

              <button
                type="button"
                className={
                  highContrast
                    ? "toggle active"
                    : "toggle"
                }
                onClick={() =>
                  setHighContrast(
                    previous => !previous
                  )
                }
                aria-pressed={highContrast}
                aria-label={
                  highContrast
                    ? "Disable high contrast"
                    : "Enable high contrast"
                }
              >
                <span />
              </button>
            </div>
          </div>

          <div className="settings-option appearance-summary">
            <div>
              <h3>Current Appearance</h3>

              <p>
                {themeMode === "system"
                  ? "System"
                  : themeMode === "dark"
                    ? "Dark"
                    : "Light"}
                {" • "}
                {accentColor}
                {" • "}
                {textSize}
                {" • "}
                {chatDensity}
              </p>
            </div>

            <span className="status-badge">
              {themeMode === "system"
                ? "Auto"
                : themeMode === "dark"
                  ? "Dark"
                  : "Light"}
            </span>
          </div>
        </div>
      );
    }

    // ==================================================
    // VOICE
    // ==================================================

    if (
      activeSection === "voice"
    ) {
      return (
        <div className="settings-content">
          <div className="settings-content-header">
            <span className="settings-large-icon">
              🎙️
            </span>

            <div>
              <h2>
                Voice
              </h2>

              <p>
                Configure Garuda's voice assistant.
              </p>
            </div>
          </div>

          {/* ============================================
              VOICE ASSISTANT
          ============================================ */}

          <div className="settings-option">
            <div>
              <h3>
                Voice Assistant
              </h3>

              <p>
                Enable voice commands and speech interaction.
              </p>
            </div>

            <button
              type="button"
              className={
                voiceEnabled
                  ? "toggle active"
                  : "toggle"
              }
              onClick={() =>
                setVoiceEnabled(
                  (previous) =>
                    !previous
                )
              }
              aria-label={
                voiceEnabled
                  ? "Disable voice assistant"
                  : "Enable voice assistant"
              }
              aria-pressed={
                voiceEnabled
              }
            >
              <span />
            </button>
          </div>

          {/* ============================================
              VOICE STATUS
          ============================================ */}

          <div className="settings-option">
            <div>
              <h3>
                Voice Status
              </h3>

              <p>
                {voiceEnabled
                  ? "Voice assistant is enabled."
                  : "Voice assistant is disabled."}
              </p>
            </div>

            <span
              className={
                voiceEnabled
                  ? "status-badge success"
                  : "status-badge"
              }
            >
              {voiceEnabled
                ? "Enabled"
                : "Disabled"}
            </span>
          </div>
        </div>
      );
    }

    // ==================================================
    // AI PREFERENCES
    // ==================================================

    if (
      activeSection === "ai"
    ) {
      return (
        <div className="settings-content">
          <div className="settings-content-header">
            <span className="settings-large-icon">
              🤖
            </span>

            <div>
              <h2>
                AI Preferences
              </h2>

              <p>
                Customize how Garuda responds to you.
              </p>
            </div>
          </div>

          {/* ============================================
              RESPONSE STYLE
          ============================================ */}

          <div className="settings-option-column">
            <h3>
              Response Style
            </h3>

            <p>
              Choose how detailed Garuda's answers should be.
            </p>

            <div className="response-style-options">
              {[
                "Concise",
                "Balanced",
                "Detailed",
              ].map(
                (style) => (
                  <button
                    type="button"
                    key={style}
                    className={
                      responseStyle === style
                        ? "style-btn selected"
                        : "style-btn"
                    }
                    onClick={() =>
                      handleResponseStyleChange(
                        style
                      )
                    }
                    aria-pressed={
                      responseStyle === style
                    }
                  >
                    {style}
                  </button>
                )
              )}
            </div>
          </div>

          {/* ============================================
              BEHAVIOUR DESCRIPTION
          ============================================ */}

          <div className="settings-option-column">
            <h3>
              Garuda Behaviour
            </h3>

            <p>
              {responseStyle === "Concise" && (
                <>
                  Garuda will give direct answers with
                  minimal unnecessary explanation.
                </>
              )}

              {responseStyle === "Balanced" && (
                <>
                  Garuda will give clear answers with the
                  right amount of explanation and examples.
                </>
              )}

              {responseStyle === "Detailed" && (
                <>
                  Garuda will provide comprehensive
                  explanations, examples and useful context.
                </>
              )}
            </p>
          </div>

          {/* ============================================
              SELECTED STYLE
          ============================================ */}

          <div className="settings-option">
            <div>
              <h3>
                Selected Style
              </h3>

              <p>
                This preference is saved for future chats.
              </p>
            </div>

            <span className="status-badge">
              {responseStyle}
            </span>
          </div>

        </div>
      );
    }

    // ==================================================
    // ABOUT
    // ==================================================

    if (
      activeSection === "about"
    ) {
      return (
        <div className="settings-content">
          <div className="settings-content-header">
            <span className="settings-large-icon">
              🦅
            </span>

            <div>
              <h2>
                About Garuda AI
              </h2>

              <p>
                Your personal AI assistant.
              </p>
            </div>
          </div>

          {/* ============================================
              ABOUT CARD
          ============================================ */}

          <div className="about-card">
            <div className="about-logo">
              🦅
            </div>

            <h2>
              Garuda AI
            </h2>

            <p>
              Your intelligent assistant for
              conversations, programming,
              documents and productivity.
            </p>

            <div className="version">
              Version 1.0.0
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  // ======================================================
  // MAIN UI
  // ======================================================

  return (
    <div className="settings-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="settings-header">
        <button
          type="button"
          className="back-settings-btn"
          onClick={onBack}
          title="Back to chat"
          aria-label="Back to chat"
        >
          ←
        </button>

        <div>
          <h1>
            ⚙ Settings
          </h1>

          <p>
            Customize your Garuda AI experience
          </p>
        </div>
      </div>

      {/* ==================================================
          SETTINGS BODY
      ================================================== */}

      <div className="settings-body">

        {/* ==================================================
            LEFT MENU
        ================================================== */}

        <div className="settings-menu">
          {sections.map(
            (section) => (
              <button
                type="button"
                key={section.id}
                className={
                  activeSection === section.id
                    ? "settings-menu-item active"
                    : "settings-menu-item"
                }
                onClick={() =>
                  setActiveSection(
                    section.id
                  )
                }
              >
                <span className="menu-icon">
                  {section.icon}
                </span>

                <span className="menu-text">
                  <strong>
                    {section.title}
                  </strong>

                  <small>
                    {section.description}
                  </small>
                </span>

                <span className="menu-arrow">
                  →
                </span>
              </button>
            )
          )}
        </div>

        {/* ==================================================
            RIGHT PANEL
        ================================================== */}

        <div className="settings-panel">
          {renderContent()}
        </div>

      </div>

    </div>
  );
}

export default Settings;