//--- contact form ---

import {} from "./utils.js"; 

//--- frequently used DOM elements ---
const contactContent = document.querySelector(".contactContent");

//--- star/close art view ---
//#region
    //--- start art view + initial animations ---
    export async function startContact() {
        contactContent.classList.remove("displayNone");            
    }
    //--- close art view + animations ---
    export async function closeContact() {
        contactContent.classList.add("displayNone");        
    }    