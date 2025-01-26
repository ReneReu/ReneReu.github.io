//--- Navigation ---

import {collapseMobileMenu} from './mobileMenu.js';
//--- interface with other view sections of the website ---
import {showcaseAnimationState, startShowcase, closeShowcase} from './showcase.js';
//--- interface with centerpiece section ---
//import { eventListenerCenterPieceOff, eventListenerCenterPieceOn } from './centerpiece.js';


//--- Functions for switching between start and showcase view ---
const header = document.querySelector(".header");
const menuButton = document.querySelectorAll(".menuButton");
const startContent = document.querySelector(".startContent");
//--- 0 Start - 1 Showcase - 2 Art - 3 Contact
let activeView = 0;

//--- call the correct transition functions between the views ---
const transitionFunctions = {
    0: { // Start View
        1: () => init(startShowcase),  
        //2: () => toArt(),          
        //3: () => toContact()          
    },
    1: { // Showcase View
        0: () => wrapUp(closeShowcase),
    },
    2: { // Art View
        //0: () => closeArt(),     
    }
};
function init (startFunction) {
    try {
        startContent.classList.add("displayNone");
        startFunction();
    } catch (e) {
        console.error("Error in init:", e);
    } 
};
async function wrapUp (closeFunction) {
    try {
        await closeFunction();
        startContent.classList.remove("displayNone", "opacityNone"); 
    } catch (e) {
        console.error("Error in wrapUp:", e);
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

