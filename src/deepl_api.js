const API_KEY = "aff6c53c-0c00-a7e5-01a8-bc65db9a474c";

function upload_document(formData) {
    console.log("Form data called");
    const baseUrl = "https://api-free.deepl.com/v2/document";
    let data = new FormData()
    data.append("file", formData.files[0]);
    data.append("auth_key", API_KEY);
    data.append("source_lang", "EN");
    data.append("target_lang", "JA");
    fetch(baseUrl,
        {
            method: "POST",
            body: data
        }).then(res => console.log(res)).catch(err => console.log(err));
}
