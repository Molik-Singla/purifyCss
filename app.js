console.log("Working...");

let html = `  <body>
<main>
  <div class="group">
    <p>Paste HTML:</p>
    <textarea
      name="html-text"
      id="html-text"
      cols="50"
      rows="15"
      class="text-area"
    ></textarea>
  </div>
  <div class="group">
    <p>Paste CSS:</p>
    <textarea
      name="css-text"
      id="css-text"
      class="text-area"
      cols="50"
      rows="15"
    ></textarea>
  </div>
</main>
<button class="submit-btn">Submit</button>

<script src="app.js"></script>
</body>`;

let css = `* {
    margin: 0;
    padding: 0;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }
  
  body {
    min-height: 100vh;
    min-width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  main {
    width: 60rem;
    height: 30rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  
  p {
    font-size: 2rem;
    font-weight: lighter;
  }
  
  .group {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .text-area {
    padding-left: 1rem;
    padding-top: 1rem;
    position: relative;
    width: 90%;
  }
  
  .submit-btn {
    border: none;
    background-color: white;
    border: 1px solid black;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0px 3px 0.5px grey;
    transform: translateY(-3px);
  
    position: absolute;
    top: 70vh;
  
    transition: 100ms;
  }
  .submit-btn:hover {
    box-shadow: 0px 0px 0px grey;
    transform: translateY(0px);
  }
  
  .btn-background{
      background-image: linear-gradient(to bottom,#CFFFDC,#93FFD8);
  }\n`;

let ids = [];
let classes = [];

let unUsedIds = [];
let unUsedClasses = [];

let allHtmlClassesString = [];

let lines = 0;
let obj = {};

// let removeLinesClasses = [];
// let removeLinesIds = [];

//  get all ids
function getIds(i) {
    if (css[i] === "#") {
        let start = i;
        let end;
        for (end = i; css[end] != "\n"; ) {
            end++;
        }
        let str = css.substring(start, end).trim();
        console.log(str);
        str = str.split(",")[0].split(" ")[0];

        if (!str.includes(";")) {
            // str = str.substring(1);
            if (str[str.length - 1] === "{") str = str.substring(0, str.length - 1);
            if (str.includes(":")) str = str.split(":")[0];
            ids.push(str);
        }
    }
}

// get all classes
function getClasses(i) {
    if (css[i] === ".") {
        let start = i;
        let end;
        for (end = i; css[end] != "{"; ) {
            end++;
        }

        let str = css.substring(start, end).trim();
        if (!str.includes("\n")) {
            str = str.split(" ")[0];
            // str = str.substring(1);
            if (str.includes(":")) str = str.split(":")[0];
            classes.push(str);
        }
    }
}

for (let i = 0; i < css.length; i++) {
    getIds(i);
    getClasses(i);
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

// let str = [];
// const size = Object.keys(obj).length;

// // add lines number which we can remove ( where unused css holds )
// for (let unuse of unUsedClasses)
//     for (let i in obj) {
//         if (obj[i].includes(`.${unuse}`)) {
//             removeLinesClasses.push(i);
//         }
//     }
// for (let unuse of unUsedIds)
//     for (let i in obj) {
//         if (obj[i].includes(`#${unuse}`)) {
//             removeLinesIds.push(i);
//         }
//     }

// replace delete / unused code with  ""
// for (let s of str) {
//     if (css.includes(s)) {
//         css = css.replace(s, "");
//     }
// }
// // remove unwanted and useless lines and spaces from code
// css.replace(/(^[ \t]*\n)/gm, "");
// css = css.replace(/(^[ \t]*\n)/gm, "");

// // calculate lines of purified css
// lines = 0;
// start = 0;
// for (let i = 0; i < css.length; i++) {
//     if (css[i] === "\n") {
//         let str = css.substring(start, i);
//         start = i;
//         obj[++lines] = str;
//     }
// }

// css is final purified string
// console.log(css);

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
                    if (!splitter[inside].includes(useLessStuff)) {
                        answer += splitter[inside];
                    }
                }
                if (answer.length > 0) {
                    if (answer.includes("{") && answer.includes) {
                        purifiedCss = purifiedCss.replace(cssObject[i], answer);
                        console.log(cssObject[i]);
                    } else {
                        answer = answer + cssObject[i].slice(cssObject[i].indexOf("{"), cssObject[i].indexOf("}") + 1);
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
// console.log("------------------------------------/");
// console.log(purifiedCss);
