//--- Navigation ---

import {collapseMobileMenu} from "./mobileMenu.js";
//--- interface with other view sections of the website ---
import {showcaseAnimationState, startShowcase, closeShowcase} from "./showcase.js";
import {startArt, closeArt} from "./art.js";
import {startContact, closeContact} from "./contact.js";
//--- interface with centerpiece section ---
import {setupCenterpiece, closeCenterpiece} from "./centerpiece.js";


//--- Functions for switching between start and showcase view ---
const header = document.querySelector(".header");
const menuButton = document.querySelectorAll(".menuButton");
const startContent = document.querySelector(".startContent");
//--- 0 Start - 1 Showcase - 2 Art - 3 Contact
let activeView = 0;

//--- call the correct transition functions between the views ---
const transitionFunctions = {
    0: { // Start View
        1: () => switchView(closeLanding, startShowcase),
        2: () => switchView(closeLanding, startArt),
        3: () => switchView(closeLanding, startContact),
    },
    1: { // Showcase View
        0: () => switchView(closeShowcase, startLanding),
        2: () => switchView(closeShowcase, startArt),
        3: () => switchView(closeShowcase, startContact),
    },
    2: { // Art View
        0: () => switchView(closeArt, startLanding),
        1: () => switchView(closeArt, startShowcase),
        3: () => switchView(closeArt, startContact),
    },
    3: { // Contact View
        0: () => switchView(closeContact, startLanding),
        1: () => switchView(closeContact, startShowcase),
        2: () => switchView(closeContact, startArt),
    }
};
function startLanding() {
    startContent.classList.remove("displayNone");
    setupCenterpiece();
}
async function closeLanding() {
    await closeCenterpiece();
    startContent.classList.add("displayNone");
}
//--- helper to switch between views with async close and start functions ---
async function switchView (closeFunction, startFunction) {
    try {
        await closeFunction();
        startFunction();
    } catch (e) {
        console.error("Error in switch:", e);
    } 
};
//--- update header state and menu ---
function updateHeader(targetView) {
    activeView = targetView;
    //--- normal header on start view - other views have minimized header ---
    if (activeView === 0) {
        header.classList.remove("headerMinimized");           
    } else {
        header.classList.add("headerMinimized");
    }
    //--- highlight menu button of active view ---
    menuButton.forEach(button => {
        button.classList.remove("menuButtonActive");
    });
    const activeMenuButton = document.querySelector(`.menu [data-nav-zone="${activeView}"]`);
    activeMenuButton.classList.add("menuButtonActive");
    collapseMobileMenu();
};
//--- navigate from active to target view and transition 
async function navigateTo(targetView) {
    if (activeView !== targetView && !showcaseAnimationState) {
        const transitionFunction = transitionFunctions[activeView]?.[targetView];
        if (transitionFunction) {
            transitionFunction(); 
            updateHeader(targetView);
        } else {
            console.warn("No transition defined for this view change.");
        }
    }
}
//--- nav event listeners ---
document.querySelectorAll("[data-nav-zone]").forEach(element => {
    //--- get the value of data-nav-zone from the element ---
    const targetView = parseInt(element.dataset.navZone, 10);
    element.addEventListener("click", () => navigateTo(targetView));
});

