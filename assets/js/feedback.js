//Set default slider value 25
document.querySelector('input[name="age"]').value = 25;
document.querySelector('input[name="techComfort"]').value = 5;

function submitFeedback() {
    var validationStatus = 1; // 1 is pass, 0 is fail
    var inputObjectData = {
        //User Info
        "user": localStorage.getItem("user"),
        "email": localStorage.getItem("email"),

        //Questions
        "age": document.querySelector('input[name="age"]').value,
        "gender": document.querySelector('input[name="gender"]:checked').value,
        "programmeenrolled": document.querySelector('input[name="programmeEnrolled"]:checked').value,
        "ethnicity": document.querySelector('input[name="ethnicity"]:checked').value,
        "religion": document.querySelector('input[name="religion"]:checked').value,
        "highesteducation": document.querySelector('input[name="highestEducation"]:checked').value,
        "usedaibefore": document.querySelector('input[name="usedAIBefore"]:checked').value,
        "intimidatedbyai": document.querySelector('input[name="intimidatedByAI"]:checked').value,
        "comfortlevelwithtech": document.querySelector('input[name="techComfort"]').value,

        //SUS
        "susq1": document.querySelector('input[name="susq1"]:checked').value,
        "susq2": document.querySelector('input[name="susq2"]:checked').value,
        "susq3": document.querySelector('input[name="susq3"]:checked').value,
        "susq4": document.querySelector('input[name="susq4"]:checked').value,
        "susq5": document.querySelector('input[name="susq5"]:checked').value,
        "susq6": document.querySelector('input[name="susq6"]:checked').value,
        "susq7": document.querySelector('input[name="susq7"]:checked').value,
        "susq8": document.querySelector('input[name="susq8"]:checked').value,
        "susq9": document.querySelector('input[name="susq9"]:checked').value,
        "susq10": document.querySelector('input[name="susq10"]:checked').value,

        //Overall
        "overall": document.querySelector('input[name="overall"]:checked').value
    };
    //console.log(inputObjectData);

    //This loop catches any "none" value in the radio buttons and sets validationStatus to 0
    for (var key in inputObjectData) {
        //console.log(key + " -> " + inputObjectData[key]);

        //Check if the input contains the value "none"
        if (inputObjectData[key] == "none") {
            validationStatus = 0;
            break;
        }
    }

    console.log(validationStatus);
    if (validationStatus == 1){
        //Validation success
            (async () => {
                const response = await fetch('http://localhost:8000/api/resource/AITASFeedback', {
                    method: 'POST',
                    body: JSON.stringify(inputObjectData),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then((response) => {
                    //Bad response returned
                    if (response.status >= 400 && response.status < 600) {
                        throw new Error("Bad response from server");
                    }
                    return response;
                }).then(response => response.json())
                    .then((data) => {
                        //successful response
                        console.log('Submitted');
                        console.log('data: ' + JSON.stringify(data));
                        window.location.replace("feedback-success.html");
                    }).catch((error) => {
                        console.log(error);
                    });
            })();
    }
    else{
        document.getElementById("validationError").style.display = "block";
    }
}

function hideNotif() {
    document.getElementById('validationError').style.display = "none";
}