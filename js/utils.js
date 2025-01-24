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
//--- same but for transistion ---
export function waitForTransition(element, transitionClass = null, removeTransitionClassAfterwards = false) {
    return new Promise((resolve) => {
        if (transitionClass) {
            element.classList.add(transitionClass);
        }
        //--- event listener to resolve once transition ends ---
        element.addEventListener('transitionend', function handler() {
            element.removeEventListener('transitionend', handler);
            if (transitionClass && removeTransitionClassAfterwards) {
                element.classList.remove(transitionClass);
            }
            resolve();
        });
    });
}
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function smoothScrollToElement(element, endY, duration) {
    const startY = element.scrollTop;
    const distanceY = endY - startY;
    const startTime = new Date().getTime();
    console.log("util: "+startY+" "+distanceY);

    duration = typeof duration !== 'undefined' ? duration : 400;

    const easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    const animateScroll = () => {
        const currentTime = new Date().getTime() - startTime;
        const newY = easeInOutQuad(currentTime, startY, distanceY, duration);
        element.scrollTop = newY;

        if (currentTime < duration) {
            requestAnimationFrame(animateScroll);
        } else {
            element.scrollTop = endY;
        }
    };
    animateScroll();
}
