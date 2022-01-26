const htmlTestArea = document.querySelector("#html-text");
const cssTestArea = document.querySelector("#css-text");
const jsTestArea = document.querySelector("#js-text");
const submitButton = document.querySelector(".submit-btn");

let html;
let css;
let js;

let allCssIds = [];
let allCssClasses = [];

let unUsedCssIds = [];
let unUsedCssClasses = [];

let allHtmlClasses = [];

let cssLinesCount = 0;

let collectedUnusedCss = {};
let countForCollectedUnusedCss = 0;

let cssLineByLineObject = {};

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

    collectedUnusedCss = {};
    countForCollectedUnusedCss = 0;

    cssLineByLineObject = {};

    // Calling getIds and getClasses function
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

    allCssIds = [...new Set(allCssIds)];
    allCssClasses = [...new Set(allCssClasses)];

    // for unused allCssIds
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

    // for all unused allCssClasses
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
    allCssClasses = allCssClassesCopy;

    // count cssLinesCount in css file
    let start = 0;
    for (let i = 0; i < css.length; i++) {
        if (css[i] === "\n") {
            ++cssLinesCount;
        }
    }

    let starting = 0;
    cssLineByLineObject = {};
    let previous = 0;
    let purifiedCss = "";

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

    for (let i = 0; i < css.length; i++) {
        if (css[i] === "}") {
            starting++;
            let forCorrectionMedia = css.slice(previous, i + 1);
            cssLineByLineObject[starting] = forCorrectionMedia;
            previous = i + 1;
        }
    }

    for (let i in cssLineByLineObject) {
        purifiedCss += cssLineByLineObject[i];
    }
    for (let useLessStuff of combinesUseless) {
        for (let i in cssLineByLineObject) {
            if (cssLineByLineObject[i].includes(useLessStuff)) {
                let splitter = cssLineByLineObject[i].split(",");
                if (splitter.length > 1) {
                    let answer = "";

                    for (let inside = 0; inside < splitter.length; inside++) {
                        if (!splitter[inside].includes(useLessStuff) && splitter[inside].indexOf("{") >= 0) {
                            answer += splitter[inside];
                        }
                    }
                    if (answer.length > 0) {
                        if (answer.includes("{") && answer.includes) {
                            purifiedCss = purifiedCss.replace(cssLineByLineObject[i], answer);
                            // console.log(cssLineByLineObject[i]);
                            collectedUnusedCss[++countForCollectedUnusedCss] = cssLineByLineObject[i];
                        } else {
                            answer = answer + cssLineByLineObject[i].slice(cssLineByLineObject[i].indexOf("{"), cssLineByLineObject[i].indexOf("}") + 1);
                            purifiedCss = purifiedCss.replace(cssLineByLineObject[i], answer);
                            // console.log(cssLineByLineObject[i]);
                            collectedUnusedCss[++countForCollectedUnusedCss] = cssLineByLineObject[i];
                        }
                    } else {
                        purifiedCss = purifiedCss.replace(cssLineByLineObject[i], answer);
                        // console.log(cssLineByLineObject[i]);
                        collectedUnusedCss[++countForCollectedUnusedCss] = cssLineByLineObject[i];
                    }
                } else {
                    if (cssLineByLineObject[i].includes("@media")) {
                        let fakeVar = cssLineByLineObject[i].slice(cssLineByLineObject[i].indexOf("{") + 1);
                        purifiedCss = purifiedCss.replace(fakeVar, "");
                        collectedUnusedCss[++countForCollectedUnusedCss] = fakeVar;
                    } else {
                        purifiedCss = purifiedCss.replace(cssLineByLineObject[i], "");
                        // console.log(cssLineByLineObject[i]);
                        collectedUnusedCss[++countForCollectedUnusedCss] = cssLineByLineObject[i];
                    }
                }
            }
        }
    }

    // returned this purifies css
    console.log("---------------  Purified Css  -----------------");
    console.log(purifiedCss);
    console.log("---------------  Unused Css  -----------------");
    for (let singleUnused in collectedUnusedCss) {
        console.log(collectedUnusedCss[singleUnused].trim());
    }
    // console.log(unUsedCssClasses);
    // console.log(unUsedCssIds);
});
