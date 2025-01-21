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