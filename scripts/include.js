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
 * 
 * Another feature of this library is simple conditional blocks. You can choose to include or disinclude chunks 
 * of the document based on whether a variable is set. You can choose to include an else block that will be 
 * failed over to if the variable is not present. The syntax is as follows:
 * 
 * @example
 * include.html
 *      <include src="header.html" vars="dark: true;">
 * header.html
 *      <img src="github-{? if dark ?}dark{? else ?}light{? endif dark ?}"
 *                       |    spec.  |true|  else  |false|     /spec.   |
 * 
 **/

/* Version is V0.05 */
/* 

Planned
- Add meta processing (special tag for outer handling?)
- OOPs

Changelog:
(V0.05):
- OOP Refactor
- Add Tag Optionality (v0.05 dependency)
- Add simple conditionals

(V0.04):
- Changed attribute handling slightly
- Cleaned up code
- Considered implementing unit testing
 
(V0.03): 
- Added 'outer' attribute to completely remove the include tag.
- Cleaned up code.
- Moved some things to functions.
*/
function main() {}
const subRegex = /{{ (.*?) }}/sg;
const ifRegex = /{\? if (.*?) \?}.*?{\? endif \1 \?}/sg;
const ifElseRegex = /{\? if (.*?) \?}.*?{\? else \?}.*?{\? endif \1 \?}/sg;
class Tag {
  static idIncrement = Math.round(Math.random()*10000);
  id;
  variable;
  outerHTML;
  constructor(variable, outerHTML = false) {
    this.variable = variable;
    this.outerHTML = outerHTML;
    this.id = 'sub-'+Tag.idIncrement++;
  }
  toString() {
    return "{{ " + this.id + " }}";
  }
  modifyBuffer(HTMLBuffer, vars) {
    HTMLBuffer = HTMLBuffer.replace(this.toString(), vars[this.variable]);
    return HTMLBuffer;
  }
}

class IfTag extends Tag {
  content;
  constructor(variable, content) {
    super(variable);
    this.content = content;
    this.id = 'if-'+Tag.idIncrement++;
  }
  toString() {
    return "{? " + this.id + " ?}";
  }
  modifyBuffer(HTMLBuffer, vars) {
    if (vars[this.variable] !== undefined) {
      HTMLBuffer = HTMLBuffer.replace(this.toString(), this.content);
    } else {
      HTMLBuffer = HTMLBuffer.replace(this.toString(), '');
    }
    return HTMLBuffer;
  }
}

class IfElseTag extends IfTag {
  elseContent;
  constructor(variable, content, elseContent) {
    super(variable, content);
    this.elseContent = elseContent;
  }
  modifyBuffer(HTMLBuffer, vars) {
    if (vars[this.variable] !== undefined) {
      HTMLBuffer = HTMLBuffer.replace(this.toString(), this.content);
    } else {
      HTMLBuffer = HTMLBuffer.replace(this.toString(), this.elseContent);
    }
    return HTMLBuffer;
  }
}

function replaceIncludes() {
  let includes = document.getElementsByTagName("include");
  var includeElem = document.getElementsByTagName('include')[document.getElementsByTagName('include').length - 1];
  includesArray = Array.from(includes);
  let vars
  let pairs = []
  includesArray.forEach((element) => {
      HTMLFileBody(element.attributes['src'].value)
      .then(collection => {
          let tags = []
          let HTMLBuffer = collection[0].innerHTML;
          let attributeVars = element.getAttribute('vars')
          if (typeof(attributeVars) == 'string') {
              vars = attributesToVars(attributeVars);
              [tags, HTMLBuffer] = tagsToObjects(HTMLBuffer);
          }
          tags.forEach((e) => {
            HTMLBuffer = e.modifyBuffer(HTMLBuffer,vars);
          });
          if (element.getAttribute('outer') == "true") {
            element.outerHTML = HTMLBuffer;
          } else {
            element.innerHTML = HTMLBuffer;
          }
      })        
  });
}

function tagsToObjects(HTMLBuffer) {
  //Sub Tags
  objTags = []
  ifElseTextTags = [...HTMLBuffer.matchAll(ifElseRegex)];
  ifElseTextTags.forEach((e) => {
    f = e[0].split("{? else ?}");
    content = f[0].substring(("{? if " + e[1] + " ?}").length);
    elseContent = f[1].substring(0, f[1].length - ("{? endif " + e[1] + " ?}").length);
    tempTag = new IfElseTag(e[1], content, elseContent);
    objTags = objTags.concat(tempTag);
    HTMLBuffer = HTMLBuffer.substring(0, e.index) + tempTag + HTMLBuffer.substring(e.index+e[0].length);
  })
  ifTextTags = [...HTMLBuffer.matchAll(ifRegex)];
  ifTextTags.forEach((e) => {
    //Hell
    tempTag = new IfTag(e[1], e[0].substring(("{? if " + e[1] + " ?}").length, e[0].length - ("{? endif " + e[1] + " ?}").length));
    objTags = objTags.concat(tempTag);
    HTMLBuffer = HTMLBuffer.substring(0, e.index) + tempTag + HTMLBuffer.substring(e.index+e[0].length);
  })
  subTextTags = [...HTMLBuffer.matchAll(subRegex)]; //Get matches as array
  subTextTags.forEach((e) => {
    tempTag = new Tag(e[1])
    objTags = objTags.concat(tempTag)
    HTMLBuffer = HTMLBuffer.substring(0, e.index) + tempTag + HTMLBuffer.substring(e.index+e[0].length);
  })
  
  return [objTags, HTMLBuffer];
}

function attributesToVars(attributeString) { 
  // Split the string into an array of key-value pairs
   let pairs = attributeString.split(';').map(pair => pair.trim()).filter(pair => pair != "");
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
   replaceIncludes();
 });