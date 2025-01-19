//--- Showcase Work presentation ---

// number of showcase frames 0-based
const showcaseItems = 4;
let activeShowcaseNumber = -1;
let nextShowcaseNumber = -1;
export let showcaseAnimationState = false;


//--- frequently used DOM elements
const startContent = $(".startContent"); 
const showcaseContent = $(".showcaseContent");
const showcaseTitle = $(".showcaseTitle");
const showcaseFrame = $(".showcaseFrame");
const showcaseBox = $(".showcaseBox");
const showcaseSidebar = $(".showcaseSidebar");
const showcaseSidebarButton = $(".showcaseSidebarButton");
const showcaseBackToStartButton = $(".showcaseBackToStartButton");
const projectReturnButton = $(".projectReturnButton");
const projectView = $(".projectView");
const projectBox = $(".projectBox");

//--- resolve promise when animation ends on element and pot add animation class and delete it afterwards ---
function waitForAnimation(elementSelectorOrObject, animationClass = null, removeAnimationClassAfterwards = false) {
    return new Promise((resolve) => {
        // check if the passed argument is selector string or cached jQuery object
        const element = typeof elementSelectorOrObject === "string" 
                        ? $(elementSelectorOrObject) 
                        : elementSelectorOrObject;

        if (animationClass) {
            element.addClass(animationClass);
        }
        // event listener to resolve at one animationend
        element.one("animationend", () => {
            if (animationClass && removeAnimationClassAfterwards) {
                element.removeClass(animationClass);
            }
            resolve();
        });
    });
}

//--- initiate showcase view ---
//#region
    //--- TODO move to main--- remove elements of start view and call function startShowcase() ---
    export async function toShowcaseView() {
        //--- remove landing/start page --- 
        startContent.addClass("displayNone");
        startShowcase();        
    } 
    //--- start showcase view + initial animations ---
    async function startShowcase() {
        nextShowcaseNumber = 0;
        //--- display showcase page ---
        showcaseContent.removeClass("displayNone");   
        //--- play animation for first showcase frame (transition frame 0 to 1) ---
        nextShowcaseFrame();
        //--- add padding after first part of animation ---
        await waitForAnimation(showcaseBox);
            showcaseTitle.addClass("showcaseTitleDeco");     
            showcaseBackToStartButton.removeClass("opacityNone");                  
            //--- animate sidebar und sidebar buttons in ---
            $(".showcaseSidebarNavigation").css({"display": "block"});
            await waitForAnimation(showcaseSidebar, "showcaseSidebarIn", true)               
                showcaseSidebarButtons();
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
            $(".showcaseSidebarNavigation").css({"display": ""});
            showcaseBackToStartButton.addClass("opacityNone");
        });        
        //--- play animation to end showcase frame (transition frame X to 0) ---
        prevShowcaseFrame(); 
        await waitForAnimation(showcaseBox);
            //--- remove padding after first part of animation ---
            showcaseTitle.removeClass("showcaseTitleDeco");
            //*edits
            

            await waitForAnimation(showcaseBox)
                //--- reset animation classes and initialize start view after second part of animation ---
                resetShowcaseAnimation();
                toStartView();                    
    }    
    //--- TODO move to main //remove showcase and show start view ---
    function toStartView() {   
        startContent.removeClass("displayNone opacityNone"); 
        showcaseContent.addClass("displayNone");
            
    }
    //--- work sidebar navigation initializing each button + animation ---
    function showcaseSidebarButtons(){        
        showcaseSidebarButton.each(function(index) {
            //--- delay between each button animation start ---
            let delay = (index * 250) + "ms";    
            //--- display and start each button ---
            $(this).find(".showcaseSidebarButtonDesign").css({
                "display": "block",
                "animation-delay": delay
            }).addClass("showcaseSidebarButtonDesignLoad");
        });       
    }    
    //--- work sidebar navigation set active button ---
    function activeShowcaseSidebarButton() {
        showcaseSidebarButton.eq(activeShowcaseNumber).find(".showcaseSidebarButtonDesign").removeClass("showcaseSidebarButtonActive");
        //--- true when called by closeShowcase() ---
        if (nextShowcaseNumber < 0) return;
        showcaseSidebarButton.eq(nextShowcaseNumber).find(".showcaseSidebarButtonDesign").addClass("showcaseSidebarButtonActive");
    }
//#endregion

//--- showcase frame selector --- 
//#region  
    let scrollUp; 

    //--- showcase frame scroll/swipe listeners active --- 
    function eventListenerShowcaseNavigationOn() {
        let startY;
        //--- trigger next/prev showcase frame by scrolling ---        
        $(window).on("mousewheel DOMMouseScroll", function(eventMouse){
            //--- prevent input while a showcase switch is already ongoing ---
            if (!showcaseAnimationState) {
                if (eventMouse.originalEvent.wheelDelta > 0 || eventMouse.originalEvent.detail < 0) {
                    scrollUp = true;
                } else {
                    scrollUp = false;
                }
                showcaseDirection();
            }
        });    
        //--- trigger next/prev showcase frame by swipe up/down --- 
        $(document).on("touchstart touchend", "body", function (eventTouch) {             
            let endY;
            //--- set start point when touch motion starts ---
            if (eventTouch.type === "touchstart") {
                startY = eventTouch.originalEvent.touches[0].clientY;
            //--- set end point when touch motion ends and no showcase switch is already going on --- 
            } else if (!showcaseAnimationState && eventTouch.type === "touchend") {
                endY = eventTouch.originalEvent.changedTouches[0].clientY;
                //--- true with downward swipe motion --> scroll frame up ---
                scrollUp = startY - endY <= -150;
                //--- check if minimum distance was swiped ---
                if (Math.abs(startY - endY) >= 150) showcaseDirection();
            }
        });
    }    
    //--- showcase frame scroll/swipe listeners off --- 
    function eventListenerShowcaseNavigationOff() {    
        $(window).off("mousewheel DOMMouseScroll");
        $(document).off("touchstart touchend", "body");
    }
    //--- showcase frame sidebar direct selection --- 
    showcaseSidebarButton.click(function() {
        if (!showcaseAnimationState) {
            //--- choose next showcase frame by button clicked ---
            nextShowcaseNumber = ($(this).index());
            let distanceShowcaseNumbers = nextShowcaseNumber-activeShowcaseNumber; 
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
    //--- scroll/swipe determine next/prev showcase frame animation ---
    function showcaseDirection() {
        if (scrollUp) {
            //--- frame 0 is already endpoint for scrolling up ---
            if (activeShowcaseNumber === 0) {
                endShowcaseFrame();  
            } 
            else {
                nextShowcaseNumber = activeShowcaseNumber - 1;
                prevShowcaseFrame();
            }             
        } else {
            //--- last frame is endpoint for scrolling down ---
            if (activeShowcaseNumber === showcaseItems) {
                endShowcaseFrame();  
            } 
            else {
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
        await waitForAnimation(showcaseBox, "showcaseNextA")
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
        await waitForAnimation(showcaseBox, "showcasePrevA")
            changeShowcase();
            //--- animation for new frame coming ---
            await waitForAnimation(showcaseBox, "showcasePrevB");
                resetShowcaseAnimation();
    }        
    //--- animation dead end no next/prev showcase frame --- 
    async function endShowcaseFrame()  {
        showcaseAnimationState = true;
        await waitForAnimation(showcaseBox, "showcaseShake")
            // --- wait till animation is done and remove animation classes ---
            resetShowcaseAnimation();
    }
    //--- update next showcase frame picture and title and set active frame ---
    function changeShowcase() {
        const showcaseFrame = document.querySelector('.showcaseFrame');
        //--- get next picture and provide alt description for it from the showcaseFrame data ---
        const nextBackgroundImage = showcaseFrame.getAttribute(`data-pic${nextShowcaseNumber}`);
        const nextDescription = showcaseFrame.getAttribute(`data-desc${nextShowcaseNumber}`);
        //--- update pic and desc ---
        showcaseFrame.style.backgroundImage = nextBackgroundImage;
        showcaseFrame.setAttribute('aria-label', nextDescription);

        //--- true when called by closeShowcase() ---
        if (nextShowcaseNumber < 0) {  
            showcaseTitle.find("li").eq(activeShowcaseNumber).css({"display": "none"});
        }  else {
            showcaseTitle.find("li").eq(activeShowcaseNumber).css({"display": "none"});
            showcaseTitle.find("li").eq(nextShowcaseNumber).css({"display": "block"});
        }         
        activeShowcaseNumber = nextShowcaseNumber;        
    }
    //--- remove showcase frame animation classes and set animation status to false --- 
    function resetShowcaseAnimation() {
        showcaseBox.removeClass("showcaseNextA showcaseNextB showcasePrevA showcasePrevB showcaseShake");
        showcaseAnimationState = false;
    }
//#endregion 

//--- TODO interface showcase frame and detailed project view --- 
//#region
    let projectViewState = false;

    //--- click on showcase frame to open detailed view --- 
    showcaseFrame.click(function() {
        if (!projectViewState) {
            expandProjectView();  
        }       
    });
    //--- click on return button to go back to correspondent frame --- 
    projectReturnButton.click(function() {
        //--- close detailed view and return to showcase frame ---
        if (projectViewState) {
            const scrollAmount = $(".projectView").scrollTop();
            const animationDuration = (scrollAmount * 0.20) + 40;
            //--- scroll back to top of site and then close projectview ---               
            $(".projectView").removeClass("snapable").animate({ scrollTop: 0 }, animationDuration, function() {     
                    closeProjectView();
            });
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
        showcaseBackToStartButton.addClass("opacityNone"); 
        //--- header animation ---
        $("header").addClass("headerOut");
        //--- backButton animation 08 ---
        projectReturnButton.removeClass("displayNone")
        waitForAnimation(".projectReturnButton", "projectReturnButtonIn", true);
        //--- sidebar animation ---
        await waitForAnimation(showcaseSidebar, "showcaseSidebarOut");
            showcaseBackToStartButton.addClass("displayNone");             
            showcaseSidebar.removeClass("showcaseSidebarIn");                 
    }    
    //--- animation opening project view --- 
    async function expandingProjectView() {
        //--- grey filter animation 08 ---
        showcaseFrame.addClass("showcaseGreyFilterRemove");
        await new Promise((resolve) => {
            showcaseFrame.one("transitionend", ({ originalEvent: { propertyName } }) => {
                if (propertyName === "filter") {
                    resolve();
                }
            });
        });
        showcaseContent.addClass("projectView"); 
        
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
        showcaseFrame.removeClass("showcaseGreyFilterRemove");
        //--- backButton animation 08 ---
        projectReturnButton.addClass("projectReturnButtonOut");
        //---  ---
        projectBox
            .removeClass("projectBoxIn")
            .addClass("projectBoxOut");
        setTimeout(function(){
            showcaseBackToStartButton.removeClass("displayNone"); 
            //--- showcase frame animation 08 ---
            showcaseBox
                .addClass("projectClosing")
                .removeClass("projectOpening");  
            projectReturnButton.addClass("displayNone");
            projectBox.removeClass("projectBoxOut");
        }, 900); 
        setTimeout(function(){   
            //--- header animation 04 ---
            $("header").removeClass("headerOut");  
        }, 1700); 
        setTimeout(function(){
            //--- remove used animation and DOM classes ---
            showcaseBackToStartButton.removeClass("opacityNone");
            showcaseSidebar.removeClass("showcaseSidebarOut"); 
            projectReturnButton.removeClass("projectReturnButtonOut");
            showcaseBox.removeClass("projectClosing");
        }, 2200);  
    }
//#endregion 