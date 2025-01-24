//--- Showcase Work presentation ---

import {waitForAnimation, delay, smoothScrollToElement} from './utils.js'; 

//--- frequently used DOM elements ---
const showcaseContent = document.querySelector(".showcaseContent");
const showcaseTitle = document.querySelector(".showcaseTitle");
const showcaseFrame = document.querySelector(".showcaseFrame");
const showcaseBox = document.querySelector(".showcaseBox");
const showcaseNavigation = document.querySelector(".showcaseNavigation");
const showcaseSidebar = document.querySelector(".showcaseSidebar");
const showcaseSidebarButtons = document.querySelectorAll(".showcaseSidebarButton");
const showcaseBackToStartButton = document.querySelector(".showcaseBackToStartButton");

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
        //--- add padding after first part of animation ---
        await waitForAnimation(showcaseBox);
            showcaseTitle.classList.add("showcaseTitleDeco");    
            showcaseBackToStartButton.classList.remove("opacityNone");                 
            //--- animate sidebar und sidebar buttons in ---
            showcaseSidebar.classList.add("displayBlock");
            await waitForAnimation(showcaseNavigation, "showcaseSidebarIn", true)               
                initShowcaseSidebarButtons();
                //--- activate scroll and touch event listener ---
                eventListenerShowcaseNavigationOn();
                // TODO remove listener later and what if mid animation
                //--- click on showcase frame to open detailed view ---
                showcaseFrame.addEventListener("click", enableProjectView);             
    }
    //--- close showcase view + animations and call toStartView() ---
    export async function closeShowcase() {
        nextShowcaseNumber = -1;
        //--- remove event listeners ---
        eventListenerShowcaseNavigationOff();      
        //--- animate sidebar und sidebar buttons out ---
        waitForAnimation(showcaseNavigation, "showcaseSidebarOut", true)
        .then(() => {
            showcaseSidebar.classList.remove("displayBlock");
            showcaseBackToStartButton.classList.add("opacityNone");
        });        
        //--- play animation to end showcase frame (transition frame X to 0) ---
        prevShowcaseFrame(); 
        await waitForAnimation(showcaseBox);
            //--- remove padding after first part of animation ---
            showcaseTitle.classList.remove("showcaseTitleDeco");
            await waitForAnimation(showcaseBox)
                //--- reset animation classes and initialize start view after second part of animation ---
                resetShowcaseAnimation();
                showcaseContent.classList.add("displayNone");                   
    }    
    //--- work sidebar navigation initializing each button + animation ---
    function initShowcaseSidebarButtons(){        
        showcaseSidebarButtons.forEach((button, index) => {
            //--- delay between each button animation start ---
            let delay = `${index * 250}ms`;    
            //--- display and start each button ---
            const designElement = button.querySelector(".showcaseSidebarButtonDesign");
            designElement.classList.add("displayBlock", "showcaseSidebarButtonDesignLoad");
            designElement.style.animationDelay = delay;
        });       
    }    
    //--- work sidebar navigation set active button ---
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

//--- TODO interface showcase frame and detailed project view --- 
//#region
const projectView = document.querySelector(".projectView");
const projectBox = document.querySelector(".projectBox");
const projectReturnButton = document.querySelector(".projectReturnButton");
const header = document.querySelector(".header");

let projectViewState = false;


function enableProjectView() {
    if (!projectViewState) {
        expandProjectView();  
        projectReturnButton.addEventListener("click", checkStateEventListener);
    }    
};
//--- click on return button to go back to correspondent frame --- 
async function checkStateEventListener() {
    //--- close detailed view and return to showcase frame ---
    //--- scroll back to top of site and then close projectview ---  
    if (projectViewState) {
        const projectView = document.querySelector(".projectView");
        const scrollAmount = projectView.scrollTop;

        if (scrollAmount === 0) {
            closeProjectView();
        } else {
            const animationDuration = (scrollAmount * 0.15) + 500;    

            projectView.scrollTo({ top: 0, behavior: "smooth" });
            await delay(animationDuration);
            closeProjectView();
            projectReturnButton.removeEventListener("click", checkStateEventListener);
        }
    }      
};
//--- open detailed project view --- 
async function expandProjectView() {            
    waitForAnimation(showcaseNavigation, "showcaseSidebarOut");
    //--- prevent switching of showcase frames ---
    showcaseAnimationState = true;
    eventListenerShowcaseNavigationOff();
    //--- animations for opening project view ---
    expandingProjectView(); 
    //--- backbutton transition 06 ---
    showcaseBackToStartButton.classList.add("opacityNone"); 
    //--- header animation ---
    header.classList.add("headerOut");
    //--- backButton animation 08 ---
    projectReturnButton.classList.remove("displayNone");
    waitForAnimation(projectReturnButton, "projectReturnButtonIn", true);
    //--- sidebar animation ---
        showcaseBackToStartButton.classList.add("displayNone");             
        showcaseNavigation.classList.remove("showcaseSidebarIn");
        showcaseTitle.classList.remove("showcaseTitleDeco");
        showcaseTitle.querySelectorAll("p").forEach((element) => {
            element.classList.add("displayNone");
            console.log(element);
        });                
}    
//--- animation opening project view --- 
async function expandingProjectView() {
    //--- grey filter animation 08 ---
    showcaseFrame.classList.add("showcaseGreyFilterRemove");
    showcaseContent.classList.add("projectView");    
    document.querySelector("#project" + activeShowcaseNumber).classList.remove("displayNone");
    projectBox.classList.replace("displayNone", "projectBoxIn");
    //const panel = document.querySelectorAll("projectBoxPanel");
    //panel.classList.add("snapable");
    //--- showcase frame animation 08 ---
    await waitForAnimation(showcaseBox, "projectOpening");
        //---  --- 
        //projectView.classList.add("snapable");  
        projectViewState = true;                                                                             
}        
//--- close detailed project view --- 
async function closeProjectView() {
    //--- animations for closing project view ---
    
    closingProjectView();

    waitForAnimation(showcaseNavigation, "showcaseSidebarIn");
    document.querySelector("#project" + activeShowcaseNumber).classList.add("displayNone");
    projectBox.classList.add("displayNone");

    await delay(200);
    showcaseTitle.classList.add("showcaseTitleDeco");

    //await delay(900);
    showcaseTitle.querySelectorAll("p").forEach((element) => {
        element.classList.remove("displayNone");
    });

    //await delay(500);
    await delay(500);
    showcaseContent.classList.remove("projectView");
    projectViewState = false;
    //--- enable switching of showcase frames ---
    showcaseAnimationState = false; 
    eventListenerShowcaseNavigationOn();
}
//--- animation closing project view --- 
async function closingProjectView() {                        
    showcaseFrame.classList.remove("showcaseGreyFilterRemove");
    projectReturnButton.classList.add("projectReturnButtonOut");
    projectBox.classList.replace("projectBoxIn", "projectBoxOut");
    showcaseBox.classList.replace("projectOpening", "projectClosing"); 
    await delay(200);
    showcaseBackToStartButton.classList.remove("displayNone");     
    projectReturnButton.classList.add("displayNone");
    projectBox.classList.remove("projectBoxOut");

    await delay(200);   
    //--- header animation 04 ---
    header.classList.remove("headerOut");

    await delay(200);
    //--- remove used animation and DOM classes ---
    showcaseBackToStartButton.classList.remove("opacityNone");
    showcaseNavigation.classList.remove("showcaseSidebarOut"); 
    projectReturnButton.classList.remove("projectReturnButtonOut");
    showcaseBox.classList.remove("projectClosing");
}
//#endregion 