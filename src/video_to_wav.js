const {transcodeMediaFile} = require('symbl-media');
const speech = require("@google-cloud/speech");
const fs = require('fs');
let dropArea = document.getElementById('drop-area');
const deepl = require("deepl-node");
// const $ = jQuery = require("jquery");
const homePage = document.getElementById("homePage");
const resultPage = document.getElementById("resultPage");

function gotoResultPage(){
    homePage.style.display = "none";
    resultPage.style.display = "block";
}

function gotoHomePage(){
    resultPage.style.display = "none";
    homePage.style.display = "block";
}

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
})

function preventDefaults (e) {
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
    files = [...files]
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

function previewFile(file) {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = function() {
        let div = document.createElement("div")
        let img = document.createElement('img',)

        img.src = reader.result
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
    return await translator.translateText(text, null, 'fr')// Bonjour, le monde !
}



function test(){
    event.preventDefault();
    console.log("test");
    const resultTextArea = document.getElementById("resultTextArea");
    const file = document.getElementById("file");
    upload_document("Hello World").then(res => {
        console.log(res);
        gotoResultPage()
        resultTextArea.value = res.text;
    }).catch(err => console.log(err))

    // console.log(file.files[0].path)

    // convert(file.files[0].path).then(res => {
    //     console.log(res)
    // })
}

const convert = async (inputFile) => {
    try {
         await transcodeMediaFile(inputFile, 'my-output-file.raw', 'wav');
        translate().catch(error => console.log(error));

    } catch (e) {
        console.error(e);
    }

};

async function translate(){
    console.log("translatsion started");
    process.env.GOOGLE_APPLICATION_CREDENTIALS = "/Users/shakil/WebstormProjects/transtator_desktop/keys/speech-to-text-to-translation-607e6f57d39d.json"
    const client = new speech.SpeechClient()
    const filename = "/Users/shakil/WebstormProjects/transtator_desktop/my-output-file.raw";

    const file = fs.readFileSync(filename);
    const audioBytes = file.toString('base64');
    console.log(audioBytes.slice(0, 100))



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
    const transcription = response.results.map( result =>
        result.alternatives[0].transcript).join('\n');

    console.log(transcription)
}



