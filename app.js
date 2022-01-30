// All textareas
const htmlTestArea = document.querySelector("#html-text");
const cssTestArea = document.querySelector("#css-text");
const jsTestArea = document.querySelector("#js-text");
const cssPurifiedTextArea = document.querySelector("#html-purifiedText");
const cssUnusedTextArea = document.querySelector("#html-unusedText");
const cssLinesRemoveTextArea = document.querySelector("#html-linesRemove");

// copy buttons
const copyPurifiedCssBtn = document.querySelector(".copyPurifiedCss");

// submit and clear all button
const submitButton = document.querySelector(".submit-btn");
const clearAllButton = document.querySelector(".clearAll-btn");

// ALL FUNCTIONS
// copy to clipboard function
function copyToClipboard(value) {
    navigator.clipboard.writeText(value);
}

function isSomeTextAreasFilled() {
    if (htmlTestArea.value !== "" && cssTestArea.value !== "" && cssPurifiedTextArea.value !== "") return true;
    return false;
}

// sub working function extrect all css classes and ids
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
    let previous = 0;
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

    let cssLinesCount = 0;

    let collectedUnusedCss = [];

    let cssPropertyByProperty = {};
    let unusedPropertyLineNumbers = [];

    // get all css property in "cssPropertyByProperty" variable
    for (let i = 0; i < css.length; i++) {
        if (css[i] === "}") {
            starting++;
            let forCorrectionMedia = css.slice(previous, i + 1);
            cssPropertyByProperty[starting] = forCorrectionMedia;
            previous = i + 1;
        }
    }

    // extrect all css classes and ids
    let allCssClassesAndIds = [];
    for (let i in cssPropertyByProperty) {
        let beforeBrace = cssPropertyByProperty[i].slice(cssPropertyByProperty[i].indexOf("\n"), cssPropertyByProperty[i].indexOf("{"));
        if (beforeBrace.includes(".") || beforeBrace.includes("#")) {
            beforeBrace = beforeBrace.trim();
            if (beforeBrace.includes(",")) {
                allCssClassesAndIds.push(...checkForSpecialCharacters(beforeBrace, ","));
            } else if (beforeBrace.includes(":")) {
                allCssClassesAndIds.push(...checkForSpecialCharacters(beforeBrace, ":"));
            } else if (beforeBrace.includes(" ")) {
                allCssClassesAndIds.push(...checkForSpecialCharacters(beforeBrace, "\n"));
            } else {
                allCssClassesAndIds.push(beforeBrace.trim());
            }
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
    for (let singleUnused of combinesUseless) {
        if (js.includes(`"${singleUnused}"`)) {
            let index = combinesUseless.indexOf(`${singleUnused}`);
            if (index >= 0) combinesUseless.splice(index, 1);
        } else if (js.includes(`"${singleUnused.substring(1)}"`)) {
            let index = combinesUseless.indexOf(`${singleUnused}`);
            if (index !== -1) combinesUseless.splice(index, 1);
        } else if (js.includes(`'${singleUnused}'`)) {
            let index = combinesUseless.indexOf(`${singleUnused}`);
            if (index >= 0) combinesUseless.splice(index, 1);
        } else if (js.includes(`'${singleUnused.substring(1)}'`)) {
            let index = combinesUseless.indexOf(`${singleUnused}`);
            if (index >= 0) combinesUseless.splice(index, 1);
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
                } else {
                    // else if only one class , ids was there then delete or remove it as it is unused
                    // settings for if our code contains @ ( media or keyframes )
                    if (cssPropertyByProperty[i].includes("@")) {
                        let adding = cssPropertyByProperty[i].slice(0, cssPropertyByProperty[i].indexOf("{") + 1);
                        cssPropertyByProperty[i] = cssPropertyByProperty[i].slice(cssPropertyByProperty[i].indexOf("{") + 1);
                        collectedUnusedCss.push(cssPropertyByProperty[i].trim());
                        cssPropertyByProperty[i] = adding;
                    } else {
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

    // count lines in css files so that it will used to tell line number of unused property
    let cssSplitter = css.split("\n");
    for (let line = 0; line < cssSplitter.length; line++) {
        for (item of combinesUseless) {
            if (cssSplitter[line].includes(item)) {
                unusedPropertyLineNumbers.push(line + 1);
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
