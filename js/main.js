//--- interface with work section of the website ---
import { toShowcaseView, closeShowcase, showcaseAnimationState} from './work.js';
//--- interface with centerpiece section ---
//import { eventListenerCenterPieceOff, eventListenerCenterPieceOn } from './centerpiece.js';

//--- expand/collapse mobile menu ---
//#region
    let mobileMenuState = false;

    //--- function to expand / collapse mobile menu and switch mobile menu button icon---
    function expandMobileMenu() {
        $(".headerBot").css({"overflow": "visible"});         
        $(".expandMenu").addClass("switchButtonIconOther");
        $(".menu").addClass("mobileMenu");
        mobileMenuState = true;
    }
    export function collapseMobileMenu() {
        $(".headerBot").css({"overflow": "hidden"});
        $(".expandMenu").removeClass("switchButtonIconOther");
        $(".menu").removeClass("mobileMenu");
        mobileMenuState = false;
    }   
    //--- expand / collapse mobile menu based on current mobileMenuState ---
    $(".expandMenu").click(function() {
        if (mobileMenuState === false) {
            expandMobileMenu();
            //--- collapse mobile menu on click outside menu ---
            $(".content").click(function() {
                collapseMobileMenu();
            }); 
        }
        else if (mobileMenuState === true) {
            collapseMobileMenu();
        }
    });
    //--- collapse mobile menu when screen wider than 800 (scrollbar-length 17) ---
    $(window).on("resize", function() {
        if ($(window).width() > 800) {
            collapseMobileMenu();
        }
    });
//#endregion

//--- Functions for switching between start and showcase view ---
//#region
    //--- 3 Start- 4 Work- 5 Art- 6 Contact
    let activeMenuZone = 3;

    //--- Switching to showcase screen via "Work" area / menu ---
    $(".startToShowcase, .menu li:nth-child(4) div").click(function() {
        if (activeMenuZone!=4 && !showcaseAnimationState) {
            activeMenuZone=4;
            toShowcaseView();
            //eventListenerCenterPieceOff();
            //--- mini header & highlight correct menu button ----
            $("header").addClass("headerMinimized");
            $(".menuButton").removeClass("menuButtonActive");
            $(".menu li:nth-child(" + activeMenuZone + ") div").addClass("menuButtonActive");
            
            setTimeout(function() {
                collapseMobileMenu();
            }, 50); 
            
        }        
    });
    //--- Switching to start screen via "back" area / menu ---
    $(".showcaseBackToStartButton, .menu li:nth-child(3) div").click(function() {
        if (activeMenuZone!=3 && !showcaseAnimationState) {
            activeMenuZone=3;
            closeShowcase();
            //eventListenerCenterPieceOn(); 
            //--- default header & highlight correct menu button ---
            $("header").removeClass("headerMinimized");
            $(".menuButton").removeClass("menuButtonActive");
            $(".menu li:nth-child(" + activeMenuZone + ") div").addClass("menuButtonActive");
            
            setTimeout(function() {
                collapseMobileMenu();
            }, 50); 
        }
    });
//#endregion 