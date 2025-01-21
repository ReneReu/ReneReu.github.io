//--- Showcase Work presentation ---

import {waitForAnimation, delay} from './util.js'; 

//--- number of showcase frames 0-based ---
const showcaseItems = 4;
let activeShowcaseNumber = -1;
let nextShowcaseNumber = -1;
export let showcaseAnimationState = false;


//--- frequently used DOM elements ---
const startContent = document.querySelector(".startContent");
const showcaseContent = document.querySelector(".showcaseContent");
const showcaseTitle = document.querySelector(".showcaseTitle");
const showcaseTitleItems = showcaseTitle.querySelectorAll("li");
const showcaseFrame = document.querySelector(".showcaseFrame");
const showcaseBox = document.querySelector(".showcaseBox");
const showcaseSidebar = document.querySelector(".showcaseSidebar");
const showcaseSidebarButtons = document.querySelectorAll(".showcaseSidebarButton");
const showcaseBackToStartButton = document.querySelector(".showcaseBackToStartButton");
const projectReturnButton = document.querySelector(".projectReturnButton");
const projectViewA = document.querySelector(".projectView");
const projectBoxA = document.querySelector(".projectBox");

const header = document.querySelector(".header");

//--- initiate showcase view ---
//#region
    //--- TODO move to main--- remove elements of start view and call function startShowcase() ---
    export async function toShowcaseView() {
        //--- remove landing/start page --- 
        startContent.classList.add("displayNone");
        startShowcase();        
    } 
    //--- start showcase view + initial animations ---
    async function startShowcase() {
        nextShowcaseNumber = 0;
        showcaseContent.classList.remove("displayNone"); 
        //--- play animation for first showcase frame (transition frame 0 to 1) ---
        nextShowcaseFrame();
        //--- add padding after first part of animation ---
        await waitForAnimation(showcaseBox);
            showcaseTitle.classList.add("showcaseTitleDeco");    
            showcaseBackToStartButton.classList.remove("opacityNone");                 
            //--- animate sidebar und sidebar buttons in ---
            document.querySelector(".showcaseSidebarNavigation").style.display = "block";
            await waitForAnimation(showcaseSidebar, "showcaseSidebarIn", true)               
                initShowcaseSidebarButtons();
                //--- activate scroll and touch event listener ---
                eventListenerShowcaseNavigationOn();               
    }
    //--- close showcase view + animations and call toStartView() ---
    export async function closeShowcase() {
        nextShowcaseNumber = -1;
        //--- remove event listeners ---
        eventListenerShowcaseNavigationOff();      
        //--- animate sidebar und sidebar buttons out ---
        waitForAnimation(showcaseSidebar, "showcaseSidebarOut", true)
        .then(() => {
            document.querySelector(".showcaseSidebarNavigation").style.display = "";
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
                toStartView();                    
    }    
    //--- TODO move to main //remove showcase and show start view ---
    function toStartView() {   
        showcaseContent.classList.add("displayNone");
        startContent.classList.remove("displayNone", "opacityNone");     
    }
    //--- work sidebar navigation initializing each button + animation ---
    function initShowcaseSidebarButtons(){        
        showcaseSidebarButtons.forEach((button, index) => {
            //--- delay between each button animation start ---
            let delay = `${index * 250}ms`;    
            //--- display and start each button ---
            const designElement = button.querySelector(".showcaseSidebarButtonDesign");
            designElement.style.display = "block";
            designElement.style.animationDelay = delay;
            designElement.classList.add("showcaseSidebarButtonDesignLoad");
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
    let scrollUp; 

    //--- showcase frame scroll/swipe listeners active --- 
    function eventListenerShowcaseNavigationOn() {
        let startY;
        //--- trigger next/prev showcase frame by scrolling ---        
        window.addEventListener("wheel", (event) => {
            //--- prevent input while a showcase switch is already ongoing ---
            if (!showcaseAnimationState) {
                scrollUp = event.deltaY < 0;
                showcaseDirection();
            }
        });    
        //--- trigger next/prev showcase frame by swipe up/down --- 
        //--- set start point when touch motion starts ---
        document.body.addEventListener("touchstart", (event) => {
            startY = event.touches[0].clientY;
        });
         //--- set end point when touch motion ends and no showcase switch is already going on --- 
        document.body.addEventListener("touchend", (event) => {
            if (!showcaseAnimationState) {
                const endY = event.changedTouches[0].clientY;
                 //--- true with downward swipe motion --> scroll frame up ---
                scrollUp = startY - endY <= -150;
                //--- check if minimum distance was swiped ---
                if (Math.abs(startY - endY) >= 150) showcaseDirection();
            }
        });
    }    
    //--- showcase frame scroll/swipe listeners off --- 
    function eventListenerShowcaseNavigationOff() {    
        window.removeEventListener("wheel", showcaseDirection);
        document.body.removeEventListener("touchstart", showcaseDirection);
        document.body.removeEventListener("touchend", showcaseDirection);
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
                showcaseTitleItems[activeShowcaseNumber].style.display = "none";
            }
            if (showcaseTitleItems[nextShowcaseNumber]) {
                showcaseTitleItems[nextShowcaseNumber].style.display = "block";
            }
        } else {  //--- when called by closeShowcase() ---
            if (showcaseTitleItems[activeShowcaseNumber]) {
                showcaseTitleItems[activeShowcaseNumber].style.display = "none";
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
const projectView = $(".projectView");
const projectBox = $(".projectBox");
let projectViewState = false;

//--- click on showcase frame to open detailed view --- 
showcaseFrame.addEventListener("click", () => {
    if (!projectViewState) {
        expandProjectView();  
    }       
});
//--- click on return button to go back to correspondent frame --- 
projectReturnButton.addEventListener("click", () => {
    //--- close detailed view and return to showcase frame ---
    if (projectViewState) {
        const scrollAmount = projectView.scrollTop;
        const animationDuration = (scrollAmount * 0.20) + 40;
        //--- scroll back to top of site and then close projectview ---               
        //projectViewA.classList.remove("snapable");
        //projectViewA.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
            closeProjectView();
        }, animationDuration);
    }          
});    
//--- open detailed project view --- 
async function expandProjectView() {            
    //--- prevent switching of showcase frames ---
    showcaseAnimationState = true;
    eventListenerShowcaseNavigationOff();
    //--- animations for opening project view ---
    expandingProjectView(); 
    //--- backbutton transition 06 ---
    //showcaseBackToStartButton.classList.add("opacityNone"); 
    //--- header animation ---
    header.classList.add("headerOut");
    //--- backButton animation 08 ---
    projectReturnButton.classList.remove("displayNone");
    waitForAnimation(".projectReturnButton", "projectReturnButtonIn", true);
    //--- sidebar animation ---
    await waitForAnimation(showcaseSidebar, "showcaseSidebarOut");
        showcaseBackToStartButton.classList.add("displayNone");             
        showcaseSidebar.classList.remove("showcaseSidebarIn");
       //showcaseTitle.removeClass("showcaseTitleDeco");
       //showcaseTitle.find("p").removeClass("displayNone");                  
}    
//--- animation opening project view --- 
async function expandingProjectView() {
    //--- grey filter animation 08 ---
    showcaseFrame.classList.add("showcaseGreyFilterRemove");
    /*await new Promise((resolve) => {
        showcaseFrame.one("transitionend", ({ originalEvent: { propertyName } }) => {
            if (propertyName === "filter") {
                resolve();
            }
        });
    });*/
    showcaseContent.classList.add("projectView"); 
    
    $("#project"+activeShowcaseNumber).removeClass("displayNone");
    projectBox.removeClass("displayNone").addClass("projectBoxIn");  
    //--- showcase frame animation 08 ---
    await waitForAnimation(showcaseBox, "projectOpening");
        //---  --- 
        $(".projectView").addClass("snapable");  
        projectViewState = true;                                                                             
}        
//--- close detailed project view --- 
async function closeProjectView() {
    //--- animations for closing project view ---
    closingProjectView();

    await waitForAnimation(showcaseSidebar, "showcaseSidebarIn");
    $("#project"+activeShowcaseNumber).addClass("displayNone"); 
    projectBox.addClass("displayNone"); 

    setTimeout(function(){         
        //$(".showcaseTitle").addClass("showcaseTitleDeco");
    }, 800);    
    setTimeout(function(){   
        $(".showcaseTitle p").removeClass("displayNone");
    }, 1700); 
    setTimeout(function(){
        showcaseContent.removeClass("projectView");
        projectViewState = false;
    }, 2200);
    setTimeout(function(){   
        //--- enable switching of showcase frames ---
        showcaseAnimationState = false; 
        eventListenerShowcaseNavigationOn();
    }, 2800); 
}
//--- animation closing project view --- 
function closingProjectView() {                        
    //--- use next showcase frame animations ---
    nextShowcaseFrame();
    //--- grey filter animation 08 ---
    showcaseFrame.classList.remove("showcaseGreyFilterRemove");
    //--- backButton animation 08 ---
    projectReturnButton.classList.add("projectReturnButtonOut");
    //---  ---
    projectBox
        .removeClass("projectBoxIn")
        .addClass("projectBoxOut");
    setTimeout(function(){
        showcaseBackToStartButton.classList.remove("displayNone"); 
        //--- showcase frame animation 08 ---
        showcaseBox.classList.add("projectClosing");
        showcaseBox.classList.remove("projectOpening");  
        projectReturnButton.classList.add("displayNone");
        projectBox.removeClass("projectBoxOut");
    }, 900); 
    setTimeout(function(){   
        //--- header animation 04 ---
        header.classList.remove("headerOut");  
    }, 1700); 
    setTimeout(function(){
        //--- remove used animation and DOM classes ---
        showcaseBackToStartButton.classList.remove("opacityNone");
        showcaseSidebar.classList.remove("showcaseSidebarOut"); 
        projectReturnButton.classList.remove("projectReturnButtonOut");
        showcaseBox.classList.remove("projectClosing");
    }, 2200);  
}
//#endregion 