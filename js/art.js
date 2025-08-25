//--- art gallery ---

import {} from "./utils.js"; 

//--- frequently used DOM elements ---
const artContent = document.querySelector(".artContent");

//--- star/close art view ---
//#region
    //--- start art view + initial animations ---
    export async function startArt() {
        artContent.classList.remove("displayNone");            
    }
    //--- close art view + animations ---
    export async function closeArt() {
        artContent.classList.add("displayNone");        
    }    


    document.addEventListener("DOMContentLoaded", function () {
  const mainImg = document.getElementById("gallery-main-img");
  const thumbs = document.getElementById("gallery-thumbs");
  const thumbImgs = Array.from(thumbs.querySelectorAll("img"));
  let current = 0;

  function select(index) {
    current = index;
    mainImg.src = thumbImgs[index].src;
    thumbImgs.forEach(img => img.classList.remove("active"));
    thumbImgs[index].classList.add("active");
  }

  // Looping logic
  function loopThumbs(direction) {
    if (direction === "left") {
      const first = thumbs.firstElementChild;
      thumbs.appendChild(first);
    } else {
      const last = thumbs.lastElementChild;
      thumbs.insertBefore(last, thumbs.firstElementChild);
    }
    // Update thumbImgs array
    thumbImgs.length = 0;
    thumbImgs.push(...thumbs.querySelectorAll("img"));
  }

  // Thumbnail click
  thumbImgs.forEach((img, i) => {
    img.addEventListener("click", () => select(i));
  });

  // Drag to scroll
  let isDown = false, startX, scrollLeft;
  thumbs.addEventListener("mousedown", (e) => {
    isDown = true;
    thumbs.classList.add("dragging");
    startX = e.pageX - thumbs.offsetLeft;
    scrollLeft = thumbs.scrollLeft;
  });
  thumbs.addEventListener("mouseleave", () => { isDown = false; thumbs.classList.remove("dragging"); });
  thumbs.addEventListener("mouseup", () => { isDown = false; thumbs.classList.remove("dragging"); });
  thumbs.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - thumbs.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    thumbs.scrollLeft = scrollLeft - walk;
    // Loop if scrolled to ends
    if (thumbs.scrollLeft <= 0) loopThumbs("right");
    if (thumbs.scrollLeft + thumbs.offsetWidth >= thumbs.scrollWidth) loopThumbs("left");
  });

  // Touch support
  thumbs.addEventListener("touchstart", (e) => {
    isDown = true;
    startX = e.touches[0].pageX - thumbs.offsetLeft;
    scrollLeft = thumbs.scrollLeft;
  });
  thumbs.addEventListener("touchend", () => { isDown = false; });
  thumbs.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - thumbs.offsetLeft;
    const walk = (x - startX) * 2;
    thumbs.scrollLeft = scrollLeft - walk;
    if (thumbs.scrollLeft <= 0) loopThumbs("right");
    if (thumbs.scrollLeft + thumbs.offsetWidth >= thumbs.scrollWidth) loopThumbs("left");
  });

  // Initial select
  select(0);
});