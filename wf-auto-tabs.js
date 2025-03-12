/**
 * Webflow Auto Tab Rotation
 * ------------------------
 * This script enables automatic rotation of Webflow tabs with configurable options
 * for speed, pause on hover, and progress indicators.
 *
 * Required HTML Structure:
 * ----------------------
 * <div fb-tabs [fb-tabs-pauseable] [fb-tabs-progress] [fb-tabs-speed]>
 *   <!-- Standard Webflow Tabs Component structure -->
 *   <div class="w-tab-menu">
 *     <a class="w-tab-link w--current">Tab 1</a>
 *     <a class="w-tab-link">Tab 2</a>
 *     <!-- ... more tabs ... -->
 *   </div>
 *   <div class="w-tab-content">
 *     <!-- Tab content panes -->
 *   </div>
 * </div>
 *
 * Available Attributes:
 * -------------------
 * 1. fb-tabs (required)
 *    - Main attribute to initialize the auto tab rotation
 *
 * 2. fb-tabs-pauseable (optional)
 *    - Type: boolean ("true" or "false")
 *    - Default: false
 *    - When set to "true", tabs will pause rotation on hover
 *
 * 3. fb-tabs-progress (optional)
 *    - Type: boolean ("true" or "false")
 *    - Default: false
 *    - When set to "true", shows a progress bar for each tab
 *
 * 4. fb-tabs-speed (optional)
 *    - Type: number (milliseconds)
 *    - Default: 5000 (5 seconds)
 *    - Controls the rotation speed between tabs
 *
 * Example Usage:
 * -------------
 * <!-- Basic auto-rotating tabs -->
 * <div fb-tabs>
 *   <!-- Webflow tabs structure -->
 * </div>
 *
 * <!-- Advanced configuration -->
 * <div fb-tabs
 *      fb-tabs-pauseable="true"
 *      fb-tabs-progress="true"
 *      fb-tabs-speed="3000">
 *   <!-- Webflow tabs structure -->
 * </div>
 */

(function () {
  "use strict";

  // Data storage class
  class DataStore {
    constructor() {
      this.data = {};
    }
    set(key, value) {
      this.data[key] = value;
    }
    get(key) {
      return this.data[key];
    }
  }

  // Booster class for managing attributes and validation
  class Booster {
    constructor(options) {
      this.options = options;
    }

    log(message, details) {
      const logMessage = [
        `%c[${this.options.title}] ${message}. Link to documentation: ${this.options.documentationLink}`,
        "display: inline-block; padding: 4px 6px; border-radius: 4px; line-height: 1.5em; color: #282735; background: linear-gradient(45deg, rgba(185, 205, 255, 0.4) 0%, rgba(201, 182, 255, 0.4) 33%, rgba(239, 184, 255, 0.4) 66%, rgba(255, 210, 177, 0.4) 100%);",
      ];
      if (details) {
        console.group(...logMessage);
        Array.isArray(details) ? console.log(...details) : console.log(details);
        console.groupEnd();
      } else {
        console.log(...logMessage);
      }
    }

    validate(attribute, name, value) {
      if (!attribute.validate) return true;
      if (typeof attribute.validate === "function") {
        if (!attribute.validate(value)) {
          this.log(`Invalid value "${value}" for attribute "${name}"`);
          return false;
        }
      } else if (!attribute.validate.includes(value)) {
        this.log(`Invalid value "${value}" for attribute "${name}"`, [
          "%cPossible values:%c\n" +
            attribute.validate.map((v) => `• ${v}`).join("\n"),
          "font-weight: 700;",
          "font-weight: initial;",
        ]);
        return false;
      }
      return true;
    }

    parse(element) {
      const dataStore = new DataStore();
      for (const key in this.options.attributes) {
        const attribute = this.options.attributes[key];
        const value = element.getAttribute(key);
        if (!value) {
          dataStore.set(key, attribute.defaultValue);
          continue;
        }
        if (!this.validate(attribute, key, value)) continue;
        let parsedValue = value;
        if (attribute.parse) {
          parsedValue = attribute.parse(value) ?? attribute.defaultValue;
        }
        dataStore.set(key, parsedValue);
      }
      this.options.apply.call(this, element, dataStore);
    }

    getElements() {
      return document.querySelectorAll(`[${this.options.name}]`);
    }

    init() {
      this.getElements().forEach((element) => this.parse(element));
    }
  }

  // Utility functions
  const parse = {
    stringToBoolean: (value) => value !== "false",
  };

  const validation = {
    isBoolean: (value) => /^(true|false)$/.test(value),
    isNumber: (value) => !isNaN(Number(value)),
  };

  const progressVar = "--fb-tab-progress";
  const progressOpacityVar = "--fb-tab-progress-opacity";

  // Timer class with smooth progress update
  class Timer {
    constructor(callback, delay, tick) {
      this.cb = callback;
      this.delay = delay;
      this.tick = tick;
      this.remaining = delay;
      this.start = 0;
    }

    clear() {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }

    reset() {
      this.clear();
      this.remaining = this.delay;
      this.start = 0;
    }

    pause() {
      if (this.start) {
        this.remaining -= Date.now() - this.start;
        this.start = 0;
        this.clear();
      }
    }

    resume() {
      if (!this.timerId) {
        this.timerId = setTimeout(() => this.cb(), this.remaining);
        if (this.tick) {
          this.start = Date.now();
          requestAnimationFrame(() => this.tick(0));
          this.runProgressAnimation();
        }
      }
    }

    runProgressAnimation() {
      let start;
      const animate = (timestamp) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / this.delay, 1) * 100;

        if (this.tick) this.tick(progress);

        if (elapsed < this.delay) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }

  // Auto Tab Rotation Booster
  const autoTabBooster = new Booster({
    name: "fb-tabs",
    attributes: {
      "fb-tabs-pauseable": {
        defaultValue: false,
        validate: validation.isBoolean,
        parse: parse.stringToBoolean,
      },
      "fb-tabs-progress": {
        defaultValue: false,
        validate: validation.isBoolean,
        parse: parse.stringToBoolean,
      },
      "fb-tabs-speed": {
        defaultValue: 5000,
        validate: validation.isNumber,
        parse: Number,
      },
    },
    apply(element, dataStore) {
      const tabs = Array.from(element.querySelectorAll(".w-tab-link"));
      if (!tabs.length) return this.log("Required attribute is missing");

      // Add CSS for smooth progress bar animations
      const style = document.createElement("style");
      style.textContent = `
        .tab-progress-bar {
          transition: width linear, opacity 0.3s ease;
        }
      `;
      document.head.appendChild(style);

      const speed = dataStore.get("fb-tabs-speed");
      const showProgress = dataStore.get("fb-tabs-progress");
      let currentTab = tabs.find((tab) => tab.classList.contains("w--current"));

      const timer = new Timer(
        () => {
          if (!currentTab) return;
          let nextIndex = tabs.indexOf(currentTab) + 1;
          if (nextIndex >= tabs.length) nextIndex = 0;
          const nextTab = tabs[nextIndex];
          const href = nextTab.href;
          nextTab.removeAttribute("href");
          nextTab.click();
          currentTab = nextTab;
          if (href) nextTab.href = href;
        },
        speed,
        showProgress
          ? (progress) =>
              requestAnimationFrame(() => {
                if (currentTab) {
                  const progressBar =
                    currentTab.querySelector(".tab-progress-bar");
                  if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                    progressBar.style.opacity = "1";
                  }
                }
              })
          : undefined
      );

      const activateTab = (tab) => {
        if (tab !== currentTab) {
          if (showProgress && currentTab) {
            const progressBar = currentTab.querySelector(".tab-progress-bar");
            if (progressBar) {
              progressBar.style.opacity = "0";
              setTimeout(() => {
                progressBar.style.width = "0";
              }, 400);
            }
          }
          currentTab = tab;
        }
        timer.reset();
        timer.resume();
      };

      tabs.forEach((tab) => {
        tab.addEventListener(
          "click",
          (event) => {
            if (!event.isTrusted) event.stopPropagation();
            activateTab(tab);
          },
          { passive: true }
        );
        tab.addEventListener(
          "focus",
          () => {
            if (tab !== currentTab) activateTab(tab);
          },
          { passive: true }
        );
      });

      if (dataStore.get("fb-tabs-pauseable")) {
        element.addEventListener("mouseenter", () => timer.pause(), {
          passive: true,
        });
        element.addEventListener("mouseleave", () => timer.resume(), {
          passive: true,
        });
      }

      if (currentTab) timer.resume();
    },
    title: "Auto Tab Rotation Booster",
    documentationLink:
      "https://www.flowbase.co/booster/webflow-auto-tab-rotation",
  });

  const init = () => autoTabBooster.init();
  document.readyState === "complete"
    ? init()
    : window.addEventListener("load", init);
})();
