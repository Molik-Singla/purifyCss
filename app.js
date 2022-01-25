const htmlTestArea = document.querySelector("#html-text");
const cssTestArea = document.querySelector("#css-text");
const submitButton = document.querySelector(".submit-btn");

let html;
let css;
let ids = [];
let classes = [];

let unUsedIds = [];
let unUsedClasses = [];

let allHtmlClassesString = [];

let lines = 0;
let obj = {};

//  get all ids
function getIds(i) {
    let start = i;
    let end;
    for (end = i; css[end] != "\n"; ) {
        end++;
    }
    let str = css.substring(start, end).trim();
    str = str.split(",")[0].split(" ")[0];

    if (!str.includes(";")) {
        if (str[str.length - 1] === "{") str = str.substring(0, str.length - 1);
        if (str.includes(":")) str = str.split(":")[0];
        ids.push(str);
    }
}

// get all classes
function getClasses(i) {
    let start = i;
    let end;
    for (end = i; css[end] != "{"; ) {
        end++;
    }

    let str = css.substring(start, end).trim();
    if (!str.includes("\n")) {
        str = str.split(" ")[0];
        if (str.includes(":")) str = str.split(":")[0];
        classes.push(str);
    }
}

submitButton.addEventListener("click", () => {
    html = htmlTestArea.value;
    css = cssTestArea.value;
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

    ids = [...new Set(ids)];
    classes = [...new Set(classes)];

    // for unused ids
    let idsCopy = [];
    ids.forEach(item => {
        idsCopy.push(item.slice(1));
    });
    for (let i = 0; i < idsCopy.length; i++) {
        if (
            html.includes(`id="${idsCopy[i]}"`) ||
            html.includes(`id ="${idsCopy[i]}"`) ||
            html.includes(`id= "${idsCopy[i]}"`) ||
            html.includes(`id = "${idsCopy[i]}"`) ||
            html.includes(`id='${idsCopy[i]}'`) ||
            html.includes(`id ='${idsCopy[i]}'`) ||
            html.includes(`id= '${idsCopy[i]}'`) ||
            html.includes(`id = '${idsCopy[i]}'`)
        )
            continue;
        else unUsedIds.push(ids[i]);
    }

    // for all unused classes
    const regex = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/gim;
    let m;

    while ((m = regex.exec(html)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        m.forEach(match => {
            if (!match.includes("class=")) {
                allHtmlClassesString.push(match);
            }
        });
    }

    let classesCopy = [];
    classes.forEach(item => {
        classesCopy.push(item.slice(1));
    });
    for (let i = 0; i < classesCopy.length; i++) {
        let flag = 1;
        for (let oneCls of allHtmlClassesString) {
            if (oneCls.includes(classesCopy[i])) {
                flag = 0;
                break;
            }
        }
        if (flag) {
            unUsedClasses.push(classes[i]);
        }
    }

    // count lines in css file
    let start = 0;
    for (let i = 0; i < css.length; i++) {
        if (css[i] === "\n") {
            let str = css.substring(start, i);
            start = i;
            obj[++lines] = str;
        }
    }

    let prop = 0;
    let cssObject = {};
    let previous = 0;
    let purifiedCss = "";

    let combinesUnless = [...unUsedClasses, ...unUsedIds];

    for (let i = 0; i < css.length; i++) {
        if (css[i] === "}") {
            prop++;
            cssObject[prop] = css.slice(previous, i + 1);
            previous = i + 1;
        }
    }

    for (let i in cssObject) {
        purifiedCss += cssObject[i];
    }
    for (let useLessStuff of combinesUnless) {
        for (let i in cssObject) {
            if (cssObject[i].includes(useLessStuff)) {
                let splitter = cssObject[i].split(",");
                if (splitter.length > 1) {
                    let answer = "";

                    for (let inside = 0; inside < splitter.length; inside++) {
                        if (!splitter[inside].includes(useLessStuff) && splitter[inside].indexOf("{") >= 0) {
                            answer += splitter[inside];
                        }
                    }
                    if (answer.length > 0) {
                        if (answer.includes("{") && answer.includes) {
                            purifiedCss = purifiedCss.replace(cssObject[i], answer);
                            console.log(cssObject[i]);
                        } else {
                            // console.log(answer);
                            answer =
                                answer + cssObject[i].slice(cssObject[i].indexOf("{"), cssObject[i].indexOf("}") + 1);
                            purifiedCss = purifiedCss.replace(cssObject[i], answer);
                            console.log(cssObject[i]);
                        }
                    } else {
                        purifiedCss = purifiedCss.replace(cssObject[i], answer);
                        console.log(cssObject[i]);
                    }
                } else {
                    purifiedCss = purifiedCss.replace(cssObject[i], "");
                    console.log(cssObject[i]);
                }
            }
        }
    }
    // returned this purifies css
    console.log(purifiedCss);
});

// //  get all ids
// function getIds(i) {
//     let start = i;
//     let end;
//     for (end = i; css[end] != "\n"; ) {
//         end++;
//     }
//     let str = css.substring(start, end).trim();
//     str = str.split(",")[0].split(" ")[0];

//     if (!str.includes(";")) {
//         if (str[str.length - 1] === "{") str = str.substring(0, str.length - 1);
//         if (str.includes(":")) str = str.split(":")[0];
//         ids.push(str);
//     }
// }

// // get all classes
// function getClasses(i) {
//     let start = i;
//     let end;
//     for (end = i; css[end] != "{"; ) {
//         end++;
//     }

//     let str = css.substring(start, end).trim();
//     if (!str.includes("\n")) {
//         str = str.split(" ")[0];
//         if (str.includes(":")) str = str.split(":")[0];
//         classes.push(str);
//     }
// }

// for (let i = 0; i < css.length; i++) {
//     if (css[i] === "#") {
//         if (css.indexOf("{", i + 1) === -1) {
//             continue;
//         } else if (css.indexOf("{", i + 1) > css.indexOf("}", i + 1)) {
//             continue;
//         }
//         getIds(i);
//     }
//     if (css[i] === ".") {
//         getClasses(i);
//     }
// }

// ids = [...new Set(ids)];
// classes = [...new Set(classes)];

// // for unused ids
// let idsCopy = [];
// ids.forEach(item => {
//     idsCopy.push(item.slice(1));
// });
// for (let i = 0; i < idsCopy.length; i++) {
//     if (
//         html.includes(`id="${idsCopy[i]}"`) ||
//         html.includes(`id ="${idsCopy[i]}"`) ||
//         html.includes(`id= "${idsCopy[i]}"`) ||
//         html.includes(`id = "${idsCopy[i]}"`) ||
//         html.includes(`id='${idsCopy[i]}'`) ||
//         html.includes(`id ='${idsCopy[i]}'`) ||
//         html.includes(`id= '${idsCopy[i]}'`) ||
//         html.includes(`id = '${idsCopy[i]}'`)
//     )
//         continue;
//     else unUsedIds.push(ids[i]);
// }

// // for all unused classes
// const regex = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/gim;
// let m;

// while ((m = regex.exec(html)) !== null) {
//     if (m.index === regex.lastIndex) {
//         regex.lastIndex++;
//     }
//     m.forEach(match => {
//         if (!match.includes("class=")) {
//             allHtmlClassesString.push(match);
//         }
//     });
// }

// let classesCopy = [];
// classes.forEach(item => {
//     classesCopy.push(item.slice(1));
// });
// for (let i = 0; i < classesCopy.length; i++) {
//     let flag = 1;
//     for (let oneCls of allHtmlClassesString) {
//         if (oneCls.includes(classesCopy[i])) {
//             flag = 0;
//             break;
//         }
//     }
//     if (flag) {
//         unUsedClasses.push(classes[i]);
//     }
// }

// // count lines in css file
// let start = 0;
// for (let i = 0; i < css.length; i++) {
//     if (css[i] === "\n") {
//         let str = css.substring(start, i);
//         start = i;
//         obj[++lines] = str;
//     }
// }

// let prop = 0;
// let cssObject = {};
// let previous = 0;
// let purifiedCss = "";

// let combinesUnless = [...unUsedClasses, ...unUsedIds];

// for (let i = 0; i < css.length; i++) {
//     if (css[i] === "}") {
//         prop++;
//         cssObject[prop] = css.slice(previous, i + 1);
//         previous = i + 1;
//     }
// }

// for (let i in cssObject) {
//     purifiedCss += cssObject[i];
// }
// for (let useLessStuff of combinesUnless) {
//     for (let i in cssObject) {
//         if (cssObject[i].includes(useLessStuff)) {
//             let splitter = cssObject[i].split(",");
//             if (splitter.length > 1) {
//                 let answer = "";

//                 for (let inside = 0; inside < splitter.length; inside++) {
//                     if (!splitter[inside].includes(useLessStuff) && splitter[inside].indexOf("{") >= 0) {
//                         answer += splitter[inside];
//                     }
//                 }
//                 if (answer.length > 0) {
//                     if (answer.includes("{") && answer.includes) {
//                         purifiedCss = purifiedCss.replace(cssObject[i], answer);
//                         console.log(cssObject[i]);
//                     } else {
//                         // console.log(answer);
//                         answer = answer + cssObject[i].slice(cssObject[i].indexOf("{"), cssObject[i].indexOf("}") + 1);
//                         purifiedCss = purifiedCss.replace(cssObject[i], answer);
//                         console.log(cssObject[i]);
//                     }
//                 } else {
//                     purifiedCss = purifiedCss.replace(cssObject[i], answer);
//                     console.log(cssObject[i]);
//                 }
//             } else {
//                 purifiedCss = purifiedCss.replace(cssObject[i], "");
//                 console.log(cssObject[i]);
//             }
//         }
//     }
// }
// console.log("------------------------------------/");
// // returned this purifies css
// console.log(purifiedCss);
// purifiedCss += " \n";
