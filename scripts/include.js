/**
 * This is a HTML include library, entirely in JS. You can utilize it by creating an
 * <import src="[path to html file]"> tag and importing the library. Nothing else needs to be done.
 * This library includes no safety features and is very likely horribly unsafe. This is only intended for 
 * static sites and homebrew projects. That being said, if you can make money off this, I encourage it. 
 
 * @example
 * index.html
 *      <h1> Above header </h1>
 *      <include src="header.html">
 *      <h1> Underneath header </h1>
 * 
 * You can also add variables to your pages and do simple static site generation. This feature only supports 
 * simple variables with literals infixed in html. You can use the vars attribute to do this. 
 * 
 * @example
 * index.html
 *      <include src="header.html" vars="first-name: John; last-name: Doe">
 * header.html
 *      <p> Name: {{ first-name }} {{ last-name }} </p>
 **/

/* Version is V0.03 */
/* 
Changelog: 
(V0.03): 
- Added 'outer' attribute to completely remove the include tag.
- Cleaned up code.
- Moved some things to functions.
*/
/* push = ffe3123e2cbb4d04bd5193bda11684c3 */
function attributesToKeyValuePairs(attributeString) { 
 // Split the string into an array of key-value pairs
  let pairs = string.split(';').map(pair => pair.trim()).filter(pair => pair != "");
  // Convert the array into a dictionary object
  let vars = {};
  pairs.forEach(pair => {
      let [key, value] = pair.split(':').map(part => part.trim());
      vars[key] = value;
  });
  return vars;
}

function HTMLFileBody(fileUrl) {
  return new Promise((resolve, reject) => {
    fetch(fileUrl)
      .then(response => response.text())
      .then(htmlString => {
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(htmlString, 'text/html');
        let bodyTag = htmlDoc.getElementsByTagName('*');
        resolve(bodyTag);
      })
      .catch(error => {
        reject(error);
      });
  });
}

window.addEventListener("load", (event) => {
    let includes = document.getElementsByTagName("include");
    var includeElem = document.getElementsByTagName('include')[document.getElementsByTagName('include').length - 1];
    includesArray = Array.from(includes);
    let pairs = []
    includesArray.forEach((element) => {
        HTMLFileBody(element.attributes['src'].value)
        .then(collection => {
            let HTMLBuffer = collection[0].innerHTML;
            if (attributeVars = element.getAttribute('vars') && attributeVars != null) {
                let vars = attributesToKeyValuePairs(attributes);
                for (const [key, value] of Object.entries(vars)) {
                    HTMLBuffer = HTMLBuffer.replace("{{ " + key + " }}", value);
                };
            } 
            if (element.getAttribute('outer') == "true") {
              element.outerHTML = HTMLBuffer;
            } else {
              element.innerHTML = HTMLBuffer;
            }
        })        
    });
});