const htmlTestArea = document.querySelector("#html-text");
const cssTestArea = document.querySelector("#css-text");
const jsTestArea = document.querySelector("#js-text");
const cssPurifiedTextArea = document.querySelector("#html-purifiedText");
const cssUnusedTextArea = document.querySelector("#html-unusedText");
const cssLinesRemoveTextArea = document.querySelector("#html-linesRemove");

const submitButton = document.querySelector(".submit-btn");
const clearAllButton = document.querySelector(".clearAll-btn");

clearAllButton.addEventListener("click", () => {
    htmlTestArea.value = "";
    cssTestArea.value = "";
    jsTestArea.value = "";
    cssPurifiedTextArea.value = "";
    cssUnusedTextArea.value = "";
    cssLinesRemoveTextArea.value = "";
});

let html;
let css;
let js;

let allCssIds = [];
let allCssClasses = [];

let unUsedCssIds = [];
let unUsedCssClasses = [];

let allHtmlClasses = [];

let cssLinesCount = 0;

let collectedUnusedCss = [];
let unusedPropertyLineNumbers = [];
// let countForCollectedUnusedCss = 0;

let cssPropertyByProperty = {};

function getIds(characterIndex) {
    let start = characterIndex;
    let end;
    for (end = characterIndex; css[end] != "\n"; ) {
        end++;
    }
    let str = css.substring(start, end).trim();
    str = str.split(",")[0].split(" ")[0];

    if (!str.includes(";")) {
        if (str[str.length - 1] === "{") str = str.substring(0, str.length - 1);
        if (str.includes(":")) str = str.split(":")[0];
        allCssIds.push(str);
    }
}

// get all allCssClasses
function getClasses(characterIndex) {
    let start = characterIndex;
    let end;
    for (end = characterIndex; css[end] != "{"; ) {
        end++;
    }

    let str = css.substring(start, end).trim();
    if (!str.includes("\n")) {
        str = str.split(" ")[0];
        if (str.includes(":")) str = str.split(":")[0];
        str = str.split(",");
        allCssClasses.push(...str);
    }
}

submitButton.addEventListener("click", () => {
    // initialize all variables to default or empty value to use it again and again
    html = htmlTestArea.value;
    css = cssTestArea.value;
    js = jsTestArea.value;

    allCssIds = [];
    allCssClasses = [];

    unUsedCssIds = [];
    unUsedCssClasses = [];

    allHtmlClasses = [];

    cssLinesCount = 0;

    collectedUnusedCss = [];

    cssPropertyByProperty = {};
    unusedPropertyLineNumbers = [];

    // Calling getIds and getClasses function for extracting ids and classes from css
    for (let i = 0; i < css.length; i++) {
        if (css[i] === "#") {
            if (css.indexOf("{", i + 1) === -1) {
                continue;
            } else if (css.indexOf("{", i + 1) > css.indexOf("}", i + 1)) {
                continue;
            }
            getIds(i);
        }
        if (css[i] === ".") {
            getClasses(i);
        }
    }

    // remove duplicate ids and classes
    allCssIds = [...new Set(allCssIds)];
    allCssClasses = [...new Set(allCssClasses)];

    // getting unused ids from ccss ids array
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

    // for all unused classes from css classes array
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

    cssPropertyByProperty = {};
    let starting = 0;
    let previous = 0;
    let purifiedCss = "";

    // basically combined unused ids and classes in one single variable ( usefull for iterating )
    let combinesUseless = [...unUsedCssClasses, ...unUsedCssIds];

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

    // extract code by code or whole property by property of css in out object
    for (let i = 0; i < css.length; i++) {
        if (css[i] === "}") {
            starting++;
            let forCorrectionMedia = css.slice(previous, i + 1);
            cssPropertyByProperty[starting] = forCorrectionMedia;
            previous = i + 1;
        }
    }

    purifiedCss = "";

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

    let strt = 0;
    for (let i = 0; i < css.length; i++) {
        if (css[i] === "\n") {
            ++cssLinesCount;
            let answer = css.slice(strt, i);
            strt = i;
            for (let item of combinesUseless) {
                if (answer.includes(item)) {
                    unusedPropertyLineNumbers.push(cssLinesCount);
                }
            }
        }
    }

    for (let item of unusedPropertyLineNumbers) {
        cssLinesRemoveTextArea.value += item + " , ";
    }
    cssPurifiedTextArea.value = purifiedCss;
});