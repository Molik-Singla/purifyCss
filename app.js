// All textareas
const htmlTestArea = document.querySelector("#html-text");
const cssTestArea = document.querySelector("#css-text");
const jsTestArea = document.querySelector("#js-text");
const cssPurifiedTextArea = document.querySelector("#html-purifiedText");
const cssUnusedTextArea = document.querySelector("#html-unusedText");
const cssLinesRemoveTextArea = document.querySelector("#html-linesRemove");

// buttons in HTML file
const copyPurifiedCssBtn = document.querySelector(".copyPurifiedCss");
const submitButton = document.querySelector(".submit-btn");
const clearAllButton = document.querySelector(".clearAll-btn");
const questionMarkBtn = document.querySelector(".questionMarkBtn");
const aboutManualDiv = document.querySelector(".aboutUsingThisApp");
const crossBtn = document.querySelector(".crossBtn");

// ALL FUNCTIONS
// copy to clipboard function
function copyToClipboard(value) {
    navigator.clipboard.writeText(value);
}

// check for some particular text areas is empty or filled
function isSomeTextAreasFilled() {
    if (htmlTestArea.value !== "" && cssTestArea.value !== "" && cssPurifiedTextArea.value !== "") return true;
    return false;
}

// function which is work as divider according to arguments and return array
function checkForSpecialCharacters(beforeBrace, specialCharacter) {
    let ansArray = [];
    let splitter = beforeBrace.split(specialCharacter);
    splitter.forEach(item => {
        if (item.includes(".") || item.includes("#")) {
            ansArray.push(item.trim());
        }
    });
    return ansArray;
}
function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}
// for check if class or id is correct means cls1 and cls1Used both are differ
function checkForExactPropertyMatched(str, unused) {
    str = str.toLocaleLowerCase();
    if (str[unused.length]) {
        if ((!isLetter(str[unused.length]) && str[unused.length] === " ") || str[unused.length] === ":") {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
}

// all button where event listner is attached
questionMarkBtn.addEventListener("click", () => {
    aboutManualDiv.classList.remove("fade-out-bck");
    aboutManualDiv.classList.remove("displaySwitchForUserManual");
    aboutManualDiv.classList.add("enableSwitchForUserManual");
});
crossBtn.addEventListener("click", () => {
    aboutManualDiv.classList.add("fade-out-bck");
    setTimeout(() => {
        aboutManualDiv.classList.remove("enableSwitchForUserManual");
        aboutManualDiv.classList.add("displaySwitchForUserManual");
    }, 700);
});
aboutManualDiv.addEventListener("mouseleave", () => {
    aboutManualDiv.classList.add("fade-out-bck");
    setTimeout(() => {
        aboutManualDiv.classList.remove("enableSwitchForUserManual");
        aboutManualDiv.classList.add("displaySwitchForUserManual");
    }, 700);
});
copyPurifiedCssBtn.addEventListener("click", () => {
    copyToClipboard(cssPurifiedTextArea.value);
    copyPurifiedCssBtn.textContent = "Copied";
});
clearAllButton.addEventListener("click", () => {
    htmlTestArea.value = "";
    cssTestArea.value = "";
    jsTestArea.value = "";
    cssPurifiedTextArea.value = "";
    cssUnusedTextArea.value = "";
    cssLinesRemoveTextArea.value = "";

    copyPurifiedCssBtn.textContent = "Copy";
    copyPurifiedCssBtn.classList.remove("activeCopybtn");
    copyPurifiedCssBtn.classList.add("disableCopyButton");
});

submitButton.addEventListener("click", () => {
    // for activation of copy button
    if (htmlTestArea.value !== "" && cssTestArea.value !== "") {
        copyPurifiedCssBtn.textContent = "Copy";
        copyPurifiedCssBtn.classList.add("activeCopybtn");
        copyPurifiedCssBtn.classList.remove("disableCopyButton");
    }

    if (isSomeTextAreasFilled()) {
        cssPurifiedTextArea.value = "";
        cssUnusedTextArea.value = "";
        cssLinesRemoveTextArea.value = "";
    }

    // all used variables
    let starting = 0;
    let purifiedCss = "";
    let combinesUseless = [];

    let html = htmlTestArea.value;
    let css = cssTestArea.value;
    let js = jsTestArea.value;

    let allCssIds = [];
    let allCssClasses = [];

    let unUsedCssIds = [];
    let unUsedCssClasses = [];

    let allHtmlClasses = [];

    let collectedUnusedCss = [];

    let cssPropertyByProperty = {};
    let unusedPropertyLineNumbers = [];

    // count occurences of } for getting all css properties as property by property in cssPropertyByProperty variable
    let count = (css.match(/}/g) || []).length;
    starting = 0;
    for (let i = 0; i < count; i++) {
        let index = css.indexOf("}", starting + 1) + 1;
        let current = css.slice(starting, index);
        starting = index;
        cssPropertyByProperty[i] = current;
    }

    // extract classes and ids of CSS
    let allCssClassesAndIds = [];
    for (let i in cssPropertyByProperty) {
        let beforeBrace = cssPropertyByProperty[i].slice(cssPropertyByProperty[i].indexOf("\n"), cssPropertyByProperty[i].indexOf("{"));
        if (beforeBrace.includes("*/")) {
            beforeBrace = beforeBrace.slice(beforeBrace.indexOf("*/"));
        }

        if (cssPropertyByProperty[i].includes("@media")) {
            beforeBrace = cssPropertyByProperty[i].slice(cssPropertyByProperty[i].indexOf("{") + 1, cssPropertyByProperty[i].length);
        }
        if (beforeBrace.includes(".") || beforeBrace.includes("#")) {
            beforeBrace = beforeBrace.trim();

            if (beforeBrace.includes(":") && beforeBrace.includes(",")) {
                let stored = [...checkForSpecialCharacters(beforeBrace, ",")].join(" ");
                beforeBrace = [...checkForSpecialCharacters(stored, ":")].join(" ");
            }
            if (beforeBrace.includes(",")) {
                beforeBrace = [...checkForSpecialCharacters(beforeBrace, ",")].join(" ");
            }
            if (beforeBrace.includes(":")) {
                beforeBrace = [...checkForSpecialCharacters(beforeBrace, ":")].join(" ");
            }
            if (beforeBrace.includes(" ")) {
                beforeBrace = [...checkForSpecialCharacters(beforeBrace, " ")].join(" ");
            }
            if (beforeBrace.includes("\n")) {
                beforeBrace = [...checkForSpecialCharacters(beforeBrace, "\n")].join(" ");
            }
            beforeBrace = beforeBrace.split(" ");
            allCssClassesAndIds.push(...beforeBrace);
        }
    }

    // remove duplicates in extracted classes and ids variable and save ids and classes in differ vars ( for check them in html )
    allCssClassesAndIds = [...new Set(allCssClassesAndIds)];
    for (let singleProperty of allCssClassesAndIds) {
        if (singleProperty.includes(".")) {
            allCssClasses.push(singleProperty);
        } else if (singleProperty.includes("#")) {
            allCssIds.push(singleProperty);
        }
    }

    // getting unused ids from css ids array
    let allCssIdsCopy = [];
    allCssIds.forEach(singleId => {
        allCssIdsCopy.push(singleId.slice(1));
    });

    for (let i = 0; i < allCssIdsCopy.length; i++) {
        if (
            html.includes(`id="${allCssIdsCopy[i]}"`) ||
            html.includes(`id ="${allCssIdsCopy[i]}"`) ||
            html.includes(`id= "${allCssIdsCopy[i]}"`) ||
            html.includes(`id = "${allCssIdsCopy[i]}"`) ||
            html.includes(`id='${allCssIdsCopy[i]}'`) ||
            html.includes(`id ='${allCssIdsCopy[i]}'`) ||
            html.includes(`id= '${allCssIdsCopy[i]}'`) ||
            html.includes(`id = '${allCssIdsCopy[i]}'`)
        )
            continue;
        else unUsedCssIds.push(allCssIds[i]);
    }

    // for all unused classes from css classes array ( basically first extract all classes from html and then match them )
    const regex = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/gim;
    let m;

    while ((m = regex.exec(html)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        m.forEach(match => {
            if (!match.includes("class=")) {
                allHtmlClasses.push(match);
            }
        });
    }

    // fetched unused classes by matching html and css classes and saved classes which is not used in html but exist in css
    let allCssClassesCopy = [];
    allCssClasses.forEach(singleClass => {
        allCssClassesCopy.push(singleClass.slice(1));
    });

    for (let i = 0; i < allCssClassesCopy.length; i++) {
        let flag = 1;
        for (let singleClass of allHtmlClasses) {
            if (singleClass.includes(allCssClassesCopy[i])) {
                flag = 0;
                break;
            }
        }
        if (flag) {
            unUsedCssClasses.push(allCssClasses[i]);
        }
    }

    // basically combined unused ids and classes in one single variable ( usefull for iterating )
    // combinesUseless = [...unUsedCssClasses, ...unUsedCssIds];
    combinesUseless = [...unUsedCssClasses, ...unUsedCssIds];

    // after having unused properties from html we test them if they are in javascript ( else totally unused , delete them , if in js then delete it from unused array)
    let solutionArray = [...combinesUseless];
    for (let singleUnused of solutionArray) {
        if (js.includes(`"${singleUnused}"`)) {
            let index = combinesUseless.indexOf(`${singleUnused}`);
            if (index !== -1) combinesUseless.splice(index, 1);
        } else if (js.includes(`"${singleUnused.substring(1)}"`)) {
            let index = combinesUseless.indexOf(`${singleUnused}`);
            if (index !== -1) combinesUseless.splice(index, 1);
        } else if (js.includes(`'${singleUnused}'`)) {
            let index = combinesUseless.indexOf(`${singleUnused}`);
            if (index !== -1) combinesUseless.splice(index, 1);
        } else if (js.includes(`'${singleUnused.substring(1)}'`)) {
            let index = combinesUseless.indexOf(`${singleUnused}`);
            if (index !== -1) combinesUseless.splice(index, 1);
        }
    }

    // Main Logic : extraction every unused property ,
    // collecting them in an array ,
    // Update our cssPropertyByProperty variale as it must only contains used properties
    for (let unusedStuff of combinesUseless) {
        for (let i in cssPropertyByProperty) {
            cssPropertyByProperty[i] = cssPropertyByProperty[i].trim();
            // if unused property are included in our css then in :
            if (cssPropertyByProperty[i].includes(unusedStuff)) {
                let beforeBrace = cssPropertyByProperty[i].slice(0, cssPropertyByProperty[i].indexOf("{"));
                // here we check every code property that if it only contain unused id , class or it also contain used id , class
                if (beforeBrace.includes(",")) {
                    let splitter = beforeBrace.split(",");
                    for (let j = 0; j < splitter.length; j++) {
                        if (unusedStuff == splitter[j].trim() && cssPropertyByProperty[i].includes(splitter[j].trim())) {
                            cssPropertyByProperty[i] = cssPropertyByProperty[i].replace(unusedStuff, "");

                            let beforeBraceInside = cssPropertyByProperty[i].slice(0, cssPropertyByProperty[i].indexOf("{"));
                            let copy = beforeBraceInside.trim();
                            if (copy[copy.length - 1] === ",") {
                                if (copy[0] === ".") copy = copy.slice(0, copy.length - 1);
                                else copy = copy.slice(1, copy.length - 1);
                            } else {
                                if (copy[0] === ".") copy = copy.slice(0, copy.length);
                                else copy = copy.slice(1, copy.length);
                            }
                            cssPropertyByProperty[i] = cssPropertyByProperty[i].replace(beforeBraceInside, copy);

                            //  collect unused css
                            let codeBlockOfUnused = cssPropertyByProperty[i].slice(
                                cssPropertyByProperty[i].indexOf("{"),
                                cssPropertyByProperty[i].indexOf("}") + 1
                            );
                            let flag = 0;
                            for (let i = 0; i < collectedUnusedCss.length; i++) {
                                if (collectedUnusedCss[i].includes(codeBlockOfUnused)) {
                                    let ind = collectedUnusedCss[i].indexOf("{");
                                    let ans = collectedUnusedCss[i].slice(0, ind) + " , " + unusedStuff + collectedUnusedCss[i].slice(ind);
                                    collectedUnusedCss[i] = ans;
                                    flag = 1;
                                }
                            }
                            if (flag === 0) {
                                collectedUnusedCss.push(unusedStuff + codeBlockOfUnused + "\n");
                            }
                        }
                    }
                    // else if only one class , ids was there then delete or remove it as it is unused
                    // settings for if our code contains @ ( media or keyframes )
                } else {
                    if (cssPropertyByProperty[i].includes("@")) {
                        let adding = cssPropertyByProperty[i].slice(0, cssPropertyByProperty[i].indexOf("{") + 1);
                        cssPropertyByProperty[i] = cssPropertyByProperty[i].slice(cssPropertyByProperty[i].indexOf("{") + 1);
                        if (checkForExactPropertyMatched(cssPropertyByProperty[i].trimStart().slice(0, cssPropertyByProperty[i].indexOf("{")), unusedStuff)) {
                            collectedUnusedCss.push(cssPropertyByProperty[i].trim());
                            cssPropertyByProperty[i] = adding;
                        }
                    } else if (
                        checkForExactPropertyMatched(cssPropertyByProperty[i].trimStart().slice(0, cssPropertyByProperty[i].indexOf("{")), unusedStuff)
                    ) {
                        collectedUnusedCss.push(cssPropertyByProperty[i].trim());
                        cssPropertyByProperty[i] = "";
                    }
                }
            }
        }
    }
    // purified css
    for (let i in cssPropertyByProperty) {
        purifiedCss += cssPropertyByProperty[i].trim() + "\n";
    }

    // unused css
    for (let item of collectedUnusedCss) {
        cssUnusedTextArea.value += item + "\n";
    }

    // if no unused value is found then generally show this message
    if (!cssUnusedTextArea.value) {
        cssUnusedTextArea.value = " ***  No Unused Properties in your Files  ***";
    }
    // count lines in css files so that it will used to tell line number of unused property
    let cssSplitter = css.split("\n");
    for (let line = 0; line < cssSplitter.length; line++) {
        for (item of combinesUseless) {
            if (
                cssSplitter[line].includes(item) &&
                !cssSplitter[line].includes(",") &&
                checkForExactPropertyMatched(cssSplitter[line].trimStart().slice(0, cssSplitter[line].indexOf("{")), item)
            ) {
                unusedPropertyLineNumbers.push(line + 1);
            } else {
                let splitter = cssSplitter[line].split(",");
                for (let spl of splitter) {
                    if (spl.includes(item) && !spl.includes(",") && checkForExactPropertyMatched(spl.trimStart().slice(0, spl.indexOf("{")), item)) {
                        unusedPropertyLineNumbers.push(line + 1);
                    }
                }
            }
        }
    }
    unusedPropertyLineNumbers = new Set(unusedPropertyLineNumbers);
    for (let item of unusedPropertyLineNumbers) {
        cssLinesRemoveTextArea.value += item + " , ";
    }

    cssLinesRemoveTextArea.value = cssLinesRemoveTextArea.value.slice(0, cssLinesRemoveTextArea.value.length - 2);
    cssPurifiedTextArea.value = purifiedCss;
});
