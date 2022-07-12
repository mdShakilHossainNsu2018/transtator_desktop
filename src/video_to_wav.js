const {transcodeMediaFile} = require('symbl-media');
const speech = require("@google-cloud/speech");
const fs = require('fs');
let dropArea = document.getElementById('drop-area');
const deepl = require("deepl-node");
const {Storage} = require("@google-cloud/storage");
const path = require('path');
// const $ = jQuery = require("jquery");
const homePage = document.getElementById("homePage");
const resultPage = document.getElementById("resultPage");
const dragAndDropIcon = document.getElementById("drag-and-drop-icon");
const submitBtn = document.getElementById("submitBtn")
const loadingSpinner = document.getElementById("loadingSpinner");
const btnStatus = document.getElementById("btnStatus");
const fileElem = document.getElementById("fileElem");
let resultText = "";
const hideClass = "visually-hidden";
let fileList = [];

const gc = new Storage({
    keyFilename: path.join(__dirname, "../keys/speech-to-text-to-translation-70c75135aace_storage.json"),
    projectId: "speech-to-text-to-translation"
})
// (async () => {
//     await gc.getBuckets().then(x => console.log(x));
// })()

gc.getBuckets().then(x => console.log(x));


function gotoResultPage() {
    homePage.style.display = "none";
    resultPage.style.display = "block";
}

function gotoHomePage() {
    resultPage.style.display = "none";
    homePage.style.display = "block";
}

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
})

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
})

;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
})

function highlight(e) {
    dropArea.classList.add('highlight')
}

function unhighlight(e) {
    dropArea.classList.remove('highlight')
}

dropArea.addEventListener('drop', handleDrop, false)

function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files

    handleFiles(files)
}

function handleFiles(files) {
    dragAndDropIcon.classList.add(hideClass);
    files = [...files]
    fileList = files;
    files.forEach(uploadFile)
    files.forEach(previewFile)
}


function uploadFile(file) {
    let url = 'YOUR URL HERE'
    let formData = new FormData()

    formData.append('file', file)
    // console.log(file);

    // fetch(url, {
    //     method: 'POST',
    //     body: formData
    // })
    //     .then(() => { /* Done. Inform the user */ })
    //     .catch(() => { /* Error. Inform the user */ })
}

function uploadFileToGC() {
     const bucket = gc.bucket("data_voice")
    bucket.upload("/Users/shakil/WebstormProjects/transtator_desktop/my-output-file.raw", function (err, file) {
        console.log("Success");
        console.log(file);
        console.log(err);
    })

    console.log(` uploaded to `);
}



function previewFile(file) {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = function () {
        let div = document.createElement("div")
        let img = document.createElement('img',)

        img.src = "../public/videofilepng.png";
        img.style.maxWidth = "100px";
        img.style.maxHeight = "100px";
        console.log(file)

        let fileP = document.createElement("p")
        let fileName = file.name.toString().slice(0, 10) + "..." + file.name.toString().slice(file.name.toString().length - 3, file.name.toString().length);

        fileP.innerText = fileName;
        div.style.maxWidth = "110px";
        div.style.maxHeight = "110px";
        div.style.display = "flex";
        div.style.flexDirection = "column";
        div.style.padding = "1rem";
        div.style.marginBottom = "1rem";
        div.appendChild(img);
        div.appendChild(fileP);
        document.getElementById('gallery').appendChild(div)
    }
}


async function upload_document(text) {
    const authKey = "aff6c53c-0c00-a7e5-01a8-bc65db9a474c"; // Replace with your key
    const translator = new deepl.Translator(authKey);
    return await translator.translateText(text, null, 'JA')// Bonjour, le monde !
}

function saveAsText() {
    let FileSaver = require('file-saver');
    let blob = new Blob([resultText], {type: "text/plain;charset=utf-8"});
    FileSaver.saveAs(blob, "text.txt");
}


function onSubmitButtonPressed() {
    event.preventDefault();
    console.log("test");
    // uploadFileToGC();


    if (!submitBtn.disabled) {
        submitBtn.disabled = true;
        loadingSpinner.classList.remove("visually-hidden");
        btnStatus.innerText = "Preprocessing...";

    }
    // const resultTextArea = document.getElementById("resultTextArea");

    console.log(fileList);

    convert(fileList[0].path).then(res => {
        btnStatus.innerText = "Translating...";
        translate().then(r => console.log(r)).catch(err => console.log(err));
        console.log(res)
    }).catch(err => {
        console.log(err);
    }).finally(() => {
        // dragAndDropIcon.classList.remove(hideClass);
    })


}

function msToHMS( ms ) {
    // 1- Convert to seconds:
    ms /= 1000000
    let seconds = ms / 1000;
    // 2- Extract hours:
    const hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    const minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    return `${hours}:${minutes}:${seconds},${ms}`
    // alert( hours+":"+minutes+":"+seconds);
}

const convert = async (inputFile) => {
    console.log("Convert Function called");
    try {
        await transcodeMediaFile(inputFile, 'my-output-file.raw', 'wav');
    } catch (e) {
        console.error(e);
    }
};



// todo
async function translate() {
    console.log("translation started");
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, "../keys/speech-to-text-to-translation-607e6f57d39d.json");
    const client = new speech.SpeechClient()
    const filename = path.join(__dirname, "../my-output-file.raw");

    const file = fs.readFileSync(filename);
    const audioBytes = file.toString('base64');
    // console.log(audioBytes.slice(0, 100))


    const audio = {
        content: audioBytes
    };

    const config = {
        encoding: 'LINEAR16',
        // sampleRateHertz: 16000,
        enableWordTimeOffsets: true,
        enableAutomaticPunctuation: true,
        languageCode: "en-US"
    }

    const request = {
        audio: audio,
        config: config
    }

    const [response] = await client.recognize(request);
    console.log(response);

    // response.results.forEach((result, index) => {
    //     result.alternatives[index].words.forEach(word => {
    //         console.log(msToHMS(word.startTime.nanos))
    //     })
    // })
    const transcription = response.results.map(result =>
        result.alternatives[0].transcript).join('\n');
    // console.log("translation done");

    btnStatus.innerText = "Almost Done Deepl Processing...";

    upload_document(transcription).then(res => {
        console.log(res);
        gotoResultPage();
        resultText = res.text;
        resultTextArea.value = res.text;
    }).catch(err => console.log(err)).finally(() => {
        submitBtn.disabled = false;
        btnStatus.innerText = "Submit";
        loadingSpinner.classList.add("visually-hidden")
    })

    return transcription;
}



