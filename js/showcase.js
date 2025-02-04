//--- Showcase Work presentation ---

import {waitForAnimation, elementViewportObserver, waitForScrollTop} from "./utils.js"; 

//--- frequently used DOM elements ---
const showcaseContent = document.querySelector(".showcaseContent");
const showcaseBox = showcaseContent.querySelector(".showcaseBox");
const showcaseFrame = showcaseBox.querySelector(".showcaseFrame");
const showcaseTitle = showcaseBox.querySelector(".showcaseTitle");
const showcaseBackToStartButton = showcaseContent.querySelector(".showcaseBackToStartButton");
const showcaseSidebar = showcaseContent.querySelector(".showcaseSidebar");
const showcaseSidebarButtons = showcaseSidebar.querySelectorAll(".showcaseSidebarButton");
const showcaseSidebarButtonDesign = showcaseSidebar.querySelectorAll(".showcaseSidebarButtonDesign");

const showcaseItems = 4; //0 to 4
let activeShowcaseNumber = -1;
let nextShowcaseNumber = -1;
export let showcaseAnimationState = false;

//--- star/close showcase view ---
//#region
    //--- start showcase view + initial animations ---
    export async function startShowcase() {
        nextShowcaseNumber = 0;
        showcaseContent.classList.remove("displayNone"); 
        //--- play animation for first showcase frame (transition frame 0 to 1) ---
        nextShowcaseFrame();
        //--- after first part of animation ---
        await waitForAnimation(showcaseBox)
        showcaseTitle.classList.add("showcaseTitleDeco");  
        showcaseBackToStartButton.classList.remove("opacityNone");
        showcaseSidebar.classList.add("showcaseSidebarIn");
        initShowcaseSidebarButtons();
        //--- activate scroll and touch event listener ---
        eventListenerShowcaseNavigationOn();
        //--- click on showcase frame to open detailed view ---     
        showcaseFrame.addEventListener("click", enableProjectView);              
    }
    //--- close showcase view + animations and call toStartView() ---
    export async function closeShowcase() {
        nextShowcaseNumber = -1;
        showcaseBackToStartButton.classList.add("opacityNone");        
        showcaseSidebar.classList.remove("showcaseSidebarIn");
        removeShowcaseSidebarButtons();
        //--- remove event listeners ---
        eventListenerShowcaseNavigationOff();  
        showcaseFrame.removeEventListener("click", enableProjectView);
        //--- play animation to end showcase frame (transition frame X to 0) ---
        prevShowcaseFrame(); 
        await waitForAnimation(showcaseBox);
        //--- remove padding after first part of animation ---
        showcaseTitle.classList.remove("showcaseTitleDeco");
        await waitForAnimation(showcaseBox);
        //--- reset animation classes and initialize start view after second part of animation ---
        resetShowcaseAnimation();
        showcaseContent.classList.add("displayNone");        
    }    
    //--- sidebar navigation initializing each button + animation ---
    function initShowcaseSidebarButtons() {        
        showcaseSidebarButtons.forEach((button, index) => {
            const delay = (index + 1) * 150;    
            //--- display and start each button delayed ---
            const designElement = button.querySelector(".showcaseSidebarButtonDesign");
            setTimeout(() => {
                designElement.classList.add("showcaseSidebarButtonDesignLoad");
            }, delay);
        });       
    }    
    function removeShowcaseSidebarButtons() {        
        showcaseSidebarButtonDesign.forEach((button) => {
            button.classList.remove("showcaseSidebarButtonDesignLoad");
        });
    } 
    //--- set active button for sidebar navigation  ---
    function activeShowcaseSidebarButton() {
        showcaseSidebarButtons[activeShowcaseNumber]?.querySelector(".showcaseSidebarButtonDesign")?.classList.remove("showcaseSidebarButtonActive");
        //--- true when called by closeShowcase() ---        
        if (nextShowcaseNumber < 0) return;
        showcaseSidebarButtons[nextShowcaseNumber]?.querySelector(".showcaseSidebarButtonDesign")?.classList.add("showcaseSidebarButtonActive");
    }
//#endregion

//--- showcase frame selector --- 
//#region  
    const showcaseTitleItems = showcaseTitle.querySelectorAll("li");
    let scrollUp;
    let startY;

    //--- trigger next/prev showcase frame by scrolling ---  
    function onWheel(event) {
        //--- prevent input while a showcase switch is already ongoing ---
        if (!showcaseAnimationState) {
            scrollUp = event.deltaY < 0;
            showcaseDirection();
        }
    }
    //--- trigger next/prev showcase frame by swipe up/down --- 
    //--- set start point when touch motion starts ---
    function onTouchStart(event) {
        startY = event.touches[0].clientY;
    }
    //--- set end point when touch motion ends and no showcase switch is already going on --- 
    function onTouchEnd(event) {
        if (!showcaseAnimationState) {
            const endY = event.changedTouches[0].clientY;
            scrollUp = startY - endY <= -150; // True with downward swipe motion
            if (Math.abs(startY - endY) >= 150) showcaseDirection(); // Check swipe distance
        }
    }       
    //--- showcase frame scroll/swipe listeners on ---  
    function eventListenerShowcaseNavigationOn() {
        window.addEventListener("wheel", onWheel);
        document.body.addEventListener("touchstart", onTouchStart);
        document.body.addEventListener("touchend", onTouchEnd);
    }
    //--- showcase frame scroll/swipe listeners off --- 
    function eventListenerShowcaseNavigationOff() {
        window.removeEventListener("wheel", onWheel);
        document.body.removeEventListener("touchstart", onTouchStart);
        document.body.removeEventListener("touchend", onTouchEnd);
    }
    //--- showcase frame sidebar direct selection --- 
    showcaseSidebarButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            if (!showcaseAnimationState) {
                //--- choose next showcase frame by button clicked ---
                nextShowcaseNumber = index;
                const distanceShowcaseNumbers = nextShowcaseNumber-activeShowcaseNumber; 
                //--- animate transition from current to selected frame ---
                //--- selected frame is ahead ---
                if ((distanceShowcaseNumbers) > 0) {
                    nextShowcaseFrame();
                //--- selected frame is behind ---
                } else if ((distanceShowcaseNumbers) < 0) {
                    prevShowcaseFrame();
                //--- selected frame is already current frame ---
                } else {
                    endShowcaseFrame();
                } 
            }
        });
    });
    //--- scroll/swipe determine next/prev showcase frame animation ---
    function showcaseDirection() {
        if (scrollUp) {
            //--- frame 0 is already endpoint for scrolling up ---
            if (activeShowcaseNumber === 0) {
                endShowcaseFrame();  
            } else {
                nextShowcaseNumber = activeShowcaseNumber - 1;
                prevShowcaseFrame();
            }             
        } else {
            //--- last frame is endpoint for scrolling down ---
            if (activeShowcaseNumber === showcaseItems) {
                endShowcaseFrame();  
            } else {
                nextShowcaseNumber = activeShowcaseNumber + 1;
                nextShowcaseFrame();
            }
        }
    }
    //--- animation next showcase frame --- 
    async function nextShowcaseFrame()  {
        showcaseAnimationState = true;
        activeShowcaseSidebarButton();
        //--- animation for current frame leaving ---
        await waitForAnimation(showcaseBox, "showcaseNextA");
            changeShowcase();
            //--- animation for new frame coming ---
            await waitForAnimation(showcaseBox, "showcaseNextB");
                resetShowcaseAnimation();     
    }
    //--- animation prev showcase frame --- 
    async function prevShowcaseFrame()  {      
        showcaseAnimationState = true;  
        activeShowcaseSidebarButton();
        //--- animation for current frame leaving ---
        await waitForAnimation(showcaseBox, "showcasePrevA");
            changeShowcase();
            //--- animation for new frame coming ---
            await waitForAnimation(showcaseBox, "showcasePrevB");
                resetShowcaseAnimation();
    }        
    //--- animation dead end no next/prev showcase frame --- 
    async function endShowcaseFrame()  {
        showcaseAnimationState = true;
        await waitForAnimation(showcaseBox, "showcaseShake");
            // --- wait till animation is done and remove animation classes ---
            resetShowcaseAnimation();
    }
    //--- update next showcase frame picture and title and set active frame ---
    function changeShowcase() {
        //--- get next picture and provide alt description for it from the showcaseFrame data ---
        const nextBackgroundImage = showcaseFrame.getAttribute(`data-pic${nextShowcaseNumber}`);
        const nextDescription = showcaseFrame.getAttribute(`data-desc${nextShowcaseNumber}`);
        //--- update pic and desc ---
        showcaseFrame.style.backgroundImage = nextBackgroundImage;
        showcaseFrame.setAttribute('aria-label', nextDescription);
        //--- update title
        if (showcaseTitleItems[nextShowcaseNumber]) {
            if (showcaseTitleItems[activeShowcaseNumber]) {
                showcaseTitleItems[activeShowcaseNumber].classList.remove("displayBlock");
            }
            if (showcaseTitleItems[nextShowcaseNumber]) {
                showcaseTitleItems[nextShowcaseNumber].classList.add("displayBlock");
            }
        } else {  //--- when called by closeShowcase() ---
            if (showcaseTitleItems[activeShowcaseNumber]) {
                showcaseTitleItems[activeShowcaseNumber].classList.remove("displayBlock");
            }
        }
        activeShowcaseNumber = nextShowcaseNumber; 
    }
    //--- remove showcase frame animation classes and set animation status to false --- 
    function resetShowcaseAnimation() {
        showcaseBox.classList.remove("showcaseNextA", "showcaseNextB", "showcasePrevA", "showcasePrevB", "showcaseShake");
        showcaseAnimationState = false;
    }
//#endregion 

//--- interface showcase frame and detailed project view --- 
//#region
const header = document.querySelector(".header");
const projectBox = document.querySelector(".projectBox");
const projectReturnButton = projectBox.querySelector(".projectReturnButton");

let projectViewState = false;
let activeProject;
let projectBoxInfo;
let projectBoxEnd;

function enableProjectView() {
    if (!showcaseAnimationState && !projectViewState) {
        activeProject = document.querySelector("#project" + activeShowcaseNumber); 

        expandProjectView();
        showcaseFrame.removeEventListener("click", enableProjectView);
        //--- click on return button to go back to correspondent frame ---
        projectReturnButton.addEventListener("click", disableProjectView);
        //--- prevent switching of showcase frames ---
        showcaseAnimationState = true;
        eventListenerShowcaseNavigationOff();
    }    
};
async function disableProjectView() {
    //--- scroll back to top of site and then close projectview and return to showcase frame ---  
    if (projectViewState) {
        const projectView = document.querySelector(".projectView");
        const scrollAmount = projectView.scrollTop;

        if (scrollAmount === 0) {
            closeProjectView();
        } else {
            projectView.scrollTo({ top: 0, behavior: "smooth" });
            await waitForScrollTop(projectView);
            closeProjectView();   
        }
        projectReturnButton.removeEventListener("click", disableProjectView);
        showcaseFrame.addEventListener("click", enableProjectView);
        //--- add listener back again ---
        showcaseAnimationState = false; 
        eventListenerShowcaseNavigationOn();
    }      
};
//--- open detailed project view --- 
function expandProjectView() {
    showcaseSidebar.classList.remove("showcaseSidebarIn");
    showcaseBackToStartButton.classList.add("opacityNone");
    header.classList.add("headerOut");   
    showcaseTitle.classList.add("opacityNone");
    showcaseFrame.classList.add("imgFilterNone");
    expandingProjectView();           
}
//--- close detailed project view --- 
function closeProjectView() {
    showcaseSidebar.classList.add("showcaseSidebarIn");
    showcaseBackToStartButton.classList.remove("opacityNone");
    header.classList.remove("headerOut");
    showcaseTitle.classList.remove("opacityNone");
    showcaseFrame.classList.remove("imgFilterNone");
    closingProjectView();
}
let scrolledToEndObserver;
//--- animation opening project view --- 
async function expandingProjectView() {
    projectBox.classList.remove("displayNone");
    showcaseContent.classList.add("projectView");
    projectViewState = true;
    //--- animations ---
    activeProject.classList.add("projectBoxIn", "displayBlock");   
    await waitForAnimation(showcaseBox, "projectOpening", true);
    projectReturnButton.classList.add("projectReturnButtonIn");
    //--- add observer for projectBoxEnd to remove info about scrolling ---
    projectBoxInfo = activeProject.querySelector(".projectBoxInfo");
    projectBoxEnd = activeProject.querySelector(".projectBoxPanelEnd");
    scrolledToEndObserver = elementViewportObserver(projectBoxInfo, projectBoxEnd, "opacityNone");
}        
//--- animation closing project view --- 
async function closingProjectView() {
    //--- remove observer ---
    if (scrolledToEndObserver) {
        scrolledToEndObserver();
        scrolledToEndObserver = null;
    }
    //--- animations ---
    projectReturnButton.classList.remove("projectReturnButtonIn");
    waitForAnimation(showcaseBox, "projectClosing", true);
    await waitForAnimation(activeProject, "projectBoxOut", true)
    activeProject.classList.remove("projectBoxIn", "displayBlock");

    projectBox.classList.add("displayNone");
    showcaseContent.classList.remove("projectView");
    projectViewState = false;
}
//#endregion