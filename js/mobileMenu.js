//--- mobileMenu - expand/collapse mobile menu ------

import {handleClickOutside} from "./utils.js"; 

const header = document.querySelector(".header");
const headerBot = document.querySelector(".headerBot");
const menu = document.querySelector(".menu");
const expandMenu = document.querySelector(".expandMenu");

let mobileMenuState = false;

//--- function to expand / collapse mobile menu and switch mobile menu button icon---
function expandMobileMenu() {
    headerBot.style.overflow = "visible";         
    expandMenu.classList.add("switchButtonIconOther");
    menu.classList.add("mobileMenu");
    mobileMenuState = true;
}
export function collapseMobileMenu() {
    if (!mobileMenuState) return;
    headerBot.style.overflow = "hidden";   
    expandMenu.classList.remove("switchButtonIconOther");
    menu.classList.remove("mobileMenu");
    mobileMenuState = false;
}   
//--- expand / collapse mobile menu based on current mobileMenuState ---
function toggleMobileMenu() {
    if (mobileMenuState) {
        collapseMobileMenu();
    } else {
        expandMobileMenu();
    }
}
//--- event listerner - expand/collapse mobile menu ---
expandMenu.addEventListener("click", toggleMobileMenu);
//--- collapse mobile menu when clicked outside of header ---
document.addEventListener("click", (e) => {
    if (mobileMenuState) {
        handleClickOutside(e, header, collapseMobileMenu);
    }
});
//--- collapse mobile menu when screen wider than 800 ---
function wideScreenCollapseMenu() {
    if (window.innerWidth > 800) {
        collapseMobileMenu();
    }
}
window.addEventListener("resize", wideScreenCollapseMenu);