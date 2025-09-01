//--- Navigation ---

import {collapseMobileMenu} from "./mobileMenu.js";
//--- interface with other view sections of the website ---
import {startShowcase, closeShowcase, showcaseAnimationState, jumpToProjectView} from "./showcase.js";
import {startArt, closeArt} from "./art.js";
import {startContact, closeContact} from "./contact.js";
//--- interface with centerpiece section ---
import {startCenterpiece, closeCenterpiece} from "./centerpiece.js";

import {addLoadingTime} from "./loading.js";
import {setViewParamURL} from "./utils.js";


//--- Functions for switching between start and showcase view ---
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
//--- start/close landing view ---
function startLanding() {
    startContent.classList.remove("displayNone");
    startCenterpiece();
}
function closeLanding() {
    closeCenterpiece();
    startContent.classList.add("displayNone");
}
//--- helper to switch between views with async close and start functions ---
async function switchView (closeFunction, startFunction) {
    try {
        await closeFunction();
        await startFunction();
    } catch (e) {
        console.error("Error in switching views:", e);
    } 
};
//--- update header state and menu ---
function updateHeader(targetView) {
    const header = document.querySelector(".header");
    const menuButton = document.querySelectorAll(".menuButton");
    
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
async function navigateToView(targetView) {
    if (activeView !== targetView && !activeAnimation()) {
        const transitionFunction = transitionFunctions[activeView]?.[targetView];
        if (transitionFunction) {
            updateHeader(targetView);
            setViewParamURL(targetView);
            await transitionFunction();            
        } else {
            console.warn("No transition defined for this view change.");
        }
    }
}
//--- check if any animation is active // expand with other animationStates ---
function activeAnimation() {
    return showcaseAnimationState;
}
//--- nav event listeners ---
document.querySelectorAll("[data-nav-zone]").forEach(element => {
    //--- get the value of data-nav-zone from the element ---
    const targetView = parseInt(element.dataset.navZone, 10);
    element.addEventListener("click", () => navigateToView(targetView));
});

//--- check URL parameters -> direct navigation to a specific view or project ---
window.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    const projectParam = params.get("project");

    const isProjectViewJump = (projectParam !== null && viewParam === '1');
    
    if (isProjectViewJump) {
        addLoadingTime(750);
        //addLoadingTime(350);
    }

    if (viewParam !== null && viewParam !== '0') {
        await navigateToView(parseInt(viewParam, 10));

        if (isProjectViewJump) {     
            await jumpToProjectView(parseInt(projectParam, 10));
        }  
    }    
});