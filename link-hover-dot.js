// Link Hover Dot Animation
//
// This code requires GSAP core.
//
// Required HTML Structure:
// <a data-gsap="nav-link" href="#">
//   <div data-gsap="active-dot"></div>
//   <div data-gsap="link-text">Link Text</div>
// </a>
//
// Required CSS:
//
// [data-gsap="nav-link"] {
//   position: relative;  /* Container for absolute positioning */
//   display: flex;      /* For vertical centering */
//   align-items: center; /* Centers dot vertically with text */
// }
//
// [data-gsap="active-dot"] {
//   position: absolute;
//   top: auto;
//   bottom: auto;
//   right: auto;
//   left: 0;           /* Position where dot ends up on hover (translateX(0)) */
//   /* Add any additional styling for the dot */
// }
//
// [data-gsap="link-text"] {
//   /* No specific styling needed */
//   /* Text styling should be applied to the nav-link instead */
//   /* This element only needs the data attribute for animation */
// }

document.addEventListener("DOMContentLoaded", function () {
  // Select all nav links
  const navLinks = document.querySelectorAll("[data-gsap='nav-link']");

  navLinks.forEach((link) => {
    const activeDot = link.querySelector("[data-gsap='active-dot']");
    const linkText = link.querySelector("[data-gsap='link-text']");

    if (activeDot && linkText) {
      // Set initial styles
      activeDot.style.opacity = "0";
      activeDot.style.transform = "translateX(12px)";
      activeDot.style.transition =
        "opacity 0.3s ease, transform 0.3s ease-in-out";

      linkText.style.transform = "translateX(0)";
      linkText.style.transition = "transform 0.3s ease-out";

      // Show and animate the dot if it's the current page
      if (link.classList.contains("w--current")) {
        activeDot.style.opacity = "1";
        activeDot.style.transform = "translateX(0)";
        linkText.style.transform = "translateX(12px)";
      }

      // Add hover effects
      link.addEventListener("mouseenter", () => {
        activeDot.style.opacity = "1";
        activeDot.style.transform = "translateX(0px)";
        linkText.style.transform = "translateX(12px)";
      });

      link.addEventListener("mouseleave", () => {
        if (!link.classList.contains("w--current")) {
          activeDot.style.opacity = "0";
          activeDot.style.transform = "translateX(12px)";
          linkText.style.transform = "translateX(0)";
        } else {
          activeDot.style.transform = "translateX(0)";
          linkText.style.transform = "translateX(12px)";
        }
      });
    }
  });
});
