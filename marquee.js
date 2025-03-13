/**
 * Infinite Marquee Scroll
 *
 * This code requires GSAP core.
 * HTML Structure Requirements:
 * @example
 * <div data-gsap-marquee="marquee" data-marquee-duration="6" class="marquee">
 *   <div data-gsap-marquee="inner" class="marquee_inner">
 *     <!-- Your repeating content goes here -->
 *   </div>
 * </div>
 *
 * Required Attributes:
 * - data-gsap-marquee="marquee": Add to the outer wrapper
 * - data-gsap-marquee="inner": Add to the inner container that holds the content
 * - data-marquee-duration: Time in seconds for one complete scroll (default: 20)
 *
 * Required CSS Setup:
 * @description
 * The marquee wrapper needs:
 * - display: flex
 * - overflow: hidden
 * - width: 100% (or any fixed width)
 *
 * The marquee_inner needs:
 * - display: flex
 * - flex-shrink: 0 (prevents content from shrinking)
 * - gap: 32px (optional, adds space between items)
 *
 * Dependencies:
 * - GSAP library must be included via CDN or npm
 * @example
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
 */

class Marquee {
  constructor(rootElement) {
    console.log("Marquee Initialized");
    this.rootElement = rootElement;
    this.marqueeInner = this.rootElement.querySelector(
      "[data-gsap-marquee='inner']"
    );
    this.marqueeInnerWidth = this.marqueeInner.offsetWidth;
    this.marqueeWidth = this.rootElement.offsetWidth;
    this.gap = parseFloat(getComputedStyle(this.marqueeInner).gap) || 0;

    // Get duration from data attribute (now in seconds)
    this.duration =
      parseFloat(this.rootElement.getAttribute("data-marquee-duration")) || 20;

    this.setup();
    this.animate();
  }

  setup() {
    //clear any existing clones
    const existingClones = this.rootElement.querySelectorAll(
      "[data-gsap-marquee='inner']:not(:first-child)"
    );
    existingClones.forEach((clone) => clone.remove());

    //Calculate how many copies we need to fill the container plus one extra
    // to ensure smooth infinite scrolling
    const numCopies = Math.ceil(this.marqueeWidth / this.marqueeInnerWidth) + 1;

    //Create a wrapper for all marquee inners
    this.wrapper = document.createElement("div");
    this.wrapper.style.display = "flex";
    this.wrapper.style.gap = `${this.gap}px`;
    this.wrapper.setAttribute("data-gsap-marquee", "wrapper");

    // Move the original marquee inner to the wrapper
    this.marqueeInner.remove();
    this.wrapper.appendChild(this.marqueeInner);

    // Add necessary copies
    for (let i = 0; i < numCopies; i++) {
      const clone = this.marqueeInner.cloneNode(true);
      this.wrapper.appendChild(clone);
    }

    //Append the wrapper to the root element
    this.rootElement.appendChild(this.wrapper);
  }

  animate() {
    // Calculate the total width of one item (including gap)
    const itemWidth = this.marqueeInnerWidth + this.gap;

    // Animation Timeline
    gsap.to(this.wrapper, {
      x: -itemWidth,
      duration: this.duration,
      ease: "none",
      repeat: -1,
      onRepeat: () => {
        // Immediately reset the position when the animation completes
        gsap.set(this.wrapper, { x: 0 });
      },
    });
  }
}

// Initialize all marquees on the page
document.addEventListener("DOMContentLoaded", () => {
  const marquees = document.querySelectorAll('[data-gsap-marquee="marquee"]');
  marquees.forEach((marquee) => new Marquee(marquee));
});
