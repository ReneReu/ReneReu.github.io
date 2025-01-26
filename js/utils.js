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
//--- check if triggerElement is in viewport and callback on targerElement
export function elementViewportObserver(targetElement, triggerElement, transformClass) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    targetElement.classList.add(transformClass);
                } else {
                    targetElement.classList.remove(transformClass);
                }
            });
        },
        {
            root: null, // viewport
            threshold: 0.5, // trigger on 50% visible
        }
    );
    observer.observe(triggerElement);
    //--- cleanup on empty call ---
    return () => observer.disconnect();
}
