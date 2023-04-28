/* Bits.js - Alec Tuchscherer - 2023 */
// Bits.js is a small library file for bits of js code that don't deserve their own file (yet)
/**
*   When called, makes all elements with the class 'typed' type out with the specified duration.
*   Recommended to put in a document.onload(). Takes 2 optional arguements, delay and leader. 
*   Delay is the time between characters, and leader is the character placed in front. Can 
*   be omitted with an empty string.
*   @example
        window.onload = typingText(100);
    This will use the default leader "_" with a delay time of 100. 
*/
function typingText(delay=100, leader="_") {
    const typedElements = document.getElementsByClassName("typed");
    for (let i = 0; i < typedElements.length; i++) {
        const text = typedElements[i].textContent;
        typedElements[i].textContent = "";
        setTimeout(() => {
            typeText(typedElements[i], text, delay, leader);
        }, 100)
    }
}
async function typeText(element, text, delay, leader) {
    for (let i = 0; i < text.length; i++) {
        element.textContent += text.charAt(i) + leader;
        await sleep(delay);
        element.textContent = element.textContent.slice(0, i+leader.length)
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}