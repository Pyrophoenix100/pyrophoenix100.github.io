/* Bits.js - Alec Tuchscherer - 2023 */
// Bits.js is a small library file for bits of js code that don't deserve their own file (yet)

/**
*   When called, makes all elements with the class 'typed' type out with the specified duration.
*   Recommended to put in a document.onload(). Takes 2 optional arguements, delay and leader. 
*   Delay is the time between characters, and leader is the character placed in front. Can 
*   be omitted with an empty string.
*   @example
*        window.onload = typingText(100);
*   This will use the default leader "_" with a delay time of 100. 
*/
function typingText(delay=100, leader="_") {
    const typedElements = document.getElementsByClassName("typed");
    for (let i = 0; i < typedElements.length; i++) {
        const text = typedElements[i].textContent;
        typedElements[i].textContent = "";
        typeText(typedElements[i], text, delay, leader);
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

function typeThis() {
    console.log(this)
    const typedElements = this;
    for (let i = 0; i < typedElements.length; i++) {
        const text = typedElements[i].textContent;
        typedElements[i].textContent = "";
        typeText(typedElements[i], text, delay, leader);
    }
}

async function getRecentPages(containerId, category="", limit=undefined) {
    let includes = ""
    return fetch("/markdown/metadata.json")
    .then((response) => {
        return response.json();
    })
    .then((responseObject) => {
        let articles = [];
        Object.keys(responseObject).forEach((articleName) => {
            if (articleName.includes(category)) {
                responseObject[articleName].path = articleName
                articles.push(responseObject[articleName]);
            }
        })
        console.log(articles)
        //(a, b) => {new Date(b.createdDate) > new Date(a.createdDate)}
        articles = articles.sort((a, b) => (new Date(a.createdDate) < new Date(b.createdDate)) ? 1 : (new Date(a.createdDate) > new Date(b.createdDate)) ? -1 : 0);
        articles = articles.slice(0,limit);
        articles.forEach((article) => {
            let include = "<include src='/assets/components/article-block.html' vars='";
            include = include + `title:${article.title};`;
            include = include + `subTitle:${article.subTitle};`;
            include = include + `image:${article.splashImage};`;
            include = include + `path:${article.path.replace("markdown/", "").replace("/markdown.tmd", "")};`;
            include = include + `date:${article.createdDate}';></include>`;
            includes = includes + include;
        })
        console.log(articles)
    })
    .then((responseObject) => {
        console.log(includes)
        document.getElementById(containerId).innerHTML = includes;
    })
}