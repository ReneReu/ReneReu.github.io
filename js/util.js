//--- utility functions ---

//--- listen for click outside of specified element and fire callback
export function handleClickOutside(event, elementToExclude, callback) {
    function listener(e) {
        if (!elementToExclude.contains(e.target)) {
            callback();
            document.removeEventListener("click", listener);
        }
    }
    document.addEventListener("click", listener);
}
//--- resolve promise when animation ends on element and pot add animation class and delete it afterwards ---
export function waitForAnimation(element, animationClass = null, removeAnimationClassAfterwards = false) {
    return new Promise((resolve) => {
        if (animationClass) {
            element.classList.add(animationClass);
        }                        
        //--- event listener to resolve at one animationend ---
        element.addEventListener("animationend", function handler() {
            element.removeEventListener("animationend", handler);
            if (animationClass && removeAnimationClassAfterwards) {
                element.classList.remove(animationClass);
            }
            resolve();
        });
    });
}
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function smoothScrollTo(element, target, duration) {
    return new Promise((resolve) => {
        const start = 50//element.scrollTop; // Starting scroll position
        const distance = target - start; // Distance to scroll
        const startTime = performance.now(); // Start time of animation

        function scrollStep(currentTime) {
            const elapsedTime = currentTime - startTime; // Time elapsed
            const progress = Math.min(elapsedTime / duration, 1); // Progress (0 to 1)

            // Ease-out function for smooth effect
            const easeOut = 1 - Math.pow(1 - progress, 3);

            // Update the scroll position
            element.scrollTop = 20//start + (distance * easeOut);

            // Continue animation or resolve the promise
            if (elapsedTime < duration) {
                requestAnimationFrame(scrollStep);
            } else {
                resolve(); // Animation complete
            }
        }

        requestAnimationFrame(scrollStep);
    });
}