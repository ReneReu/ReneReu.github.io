//--- loading screen ---

import {waitForAnimation, delay} from './util.js'; 

window.addEventListener("load", loaded);

const imagesToPreload = [
    "img/w10.avif",
    "img/w20.avif",
    "img/w30.avif",
    "img/w40.avif"
];
//--- non critical but important images ---
function preloadImages(imageUrls) {
    return Promise.all(
        imageUrls.map((url) => {
            //--- resolve on loaded / reject on error ---
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = url;
                img.onload = resolve;
                img.onerror = reject;
            });
        })
    );
}
/* --- loading completed --- */       
async function loaded() {
    const loadingScreen = document.querySelector(".loadingScreen");
    const loadingTime = 1000;
    // --- wait for all images to preload and the minimum loading time --- 
    await Promise.all([preloadImages(imagesToPreload), delay(loadingTime)]);
    // 
    await waitForAnimation(loadingScreen, "loadedAnimation");
    await delay(loadingTime);
    loadingScreen.style.willChange = "auto";
    loadingScreen.style.display = "none";          
}