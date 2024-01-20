// Query Selector Element    
let categorySpan = document.querySelector(".game-info .category .category-name");
let questionsCountSpan = document.querySelector(".game-info .questions-count .questions-count-span");
let questionsArea = document.querySelector(".game-container .question-area");
let answersArea = document.querySelector(".game-container .answers-area .asnwers");
let bulletsSpans = document.querySelector(".game-container .footer .bullets .spans");
let btnSubmit = document.querySelector(".game-container .btn-submit");
let btnPrev = document.querySelector(".game-container .prev");
let minutesLabel = document.getElementById("minutes");
let secondsLabel = document.getElementById("seconds");

function suppressJSError() {
    return true;
}

window.onerror = suppressJSError;

let currentIndex = 0;
let score = 0;
let totalSeconds = 0;
let countUp = setInterval(setTime, 1000);
let examUrl;

Swal.fire({
    title: "Choose Exam For Web?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "HTML",
    denyButtonText: "JS",
    cancelButtonText:"PHP",
    cancelButtonColor:"#474A8A",
    denyButtonColor:"#F8E559",
    confirmButtonColor:"#FE7A36"
}).then((result) => {
    if (result.isConfirmed) {
        examUrl = "html";
        getQuestions();
    } else if (result.isDenied) {
        examUrl = "js";
        getQuestions();
    } else if (result.isDismissed) {
        examUrl = "php";
        getQuestions();
    }
});

function getQuestions() {
    let myRequest = new XMLHttpRequest();

    myRequest.onreadystatechange = function () {
        if (this.readyState === 4 & this.status === 200) {
            let questionsObject = JSON.parse(this.responseText);

            // Game Info Code

            // Create TextNode category Span
            let categoryTxtNode = document.createTextNode(questionsObject[0].category);
            categorySpan.appendChild(categoryTxtNode);

            // Create TextNode Questions Span
            let questionSpanTxtNode = document.createTextNode(questionsObject.length);
            questionsCountSpan.appendChild(questionSpanTxtNode);


            // Questions Area
            getQuestionsData(questionsObject[currentIndex], questionsObject.length);

            // Game Footer Code

            // Create Bullets 
            createBullets(questionsObject.length);

            // Active Bullets
            activeBullets();

            // Click Btn Submit
            btnSubmit.onclick = function () {
                let theRightAns = questionsObject[currentIndex].right_answer;

                saveAnswer(currentIndex);
                checkAnswer(theRightAns);
                score++;
                
                currentIndex++;
                activeBullets();
                questionsArea.innerHTML = "";
                answersArea.innerHTML = "";

                getQuestionsData(questionsObject[currentIndex], questionsObject.length);

                showResult(questionsObject.length, score, `${minutesLabel.textContent}:${secondsLabel.textContent}`);
            };

            btnPrev.onclick = function () {
                if (!currentIndex <= 0) {
                    currentIndex--;
                } else if (!score <=0) {
                    score--;
                }

                disableBullets();
                
                questionsArea.innerHTML = "";
                answersArea.innerHTML = "";

                getQuestionsData(questionsObject[currentIndex], questionsObject.length);
                returnAnswer(currentIndex);
            }

        }
    }

    if (examUrl == "html") {
        myRequest.open("GET", "JSON/html-questions.json", true);
        myRequest.send();
    } else if (examUrl == "js"){
        myRequest.open("GET", "JSON/javaScript-questions.json", true);
        myRequest.send();
    } else if (examUrl == "php"){
        myRequest.open("GET", "JSON/php-questions.json", true);
        myRequest.send();
    } 
}

function getQuestionsData(object, count) {
    if (count > currentIndex) {
        let createH3 = document.createElement("h3");
        let h3TxtNode = document.createTextNode(object.question);

        createH3.appendChild(h3TxtNode);
        questionsArea.appendChild(createH3);

        for (let i = 1; i <= 4; i++) {

            // Create Answer Div
            let answerDiv = document.createElement("div");
            answerDiv.classList.add(`answer_${i}`, "answer");

            // Create Radio Input 
            let radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.id = `answer_${i}`;
            radioInput.name = "question";
            radioInput.dataset.answers = object[`answer_${i}`];

            // Create Label 
            let label = document.createElement("label");
            label.htmlFor = `answer_${i}`;

            // Create Answer Title
            let answerTitle = document.createElement("p");
            let answerTxtNode = document.createTextNode(object[`answer_${i}`]);

            answerTitle.append(answerTxtNode);
            label.appendChild(answerTitle);

            answerDiv.appendChild(radioInput);
            answerDiv.appendChild(label);

            answersArea.appendChild(answerDiv);
        }
    }
}

function createBullets(count) {
    for (let i = 0; i < count; i++) {
        // Create Span Bullets 
        let span = document.createElement("span");
        bulletsSpans.appendChild(span);
    }
}

function activeBullets() {
    let spansBullets = document.querySelectorAll(".game-container .footer .bullets .spans span");
    let bulletsArray = Array.from(spansBullets);

    bulletsArray.forEach((span, index) => {
        if (currentIndex === index) {
            span.classList.add("active");
        }
    })
}

function disableBullets() {
    let spansBullets = document.querySelectorAll(".game-container .footer .bullets .spans span");
    let bulletsArray = Array.from(spansBullets);

    bulletsArray.forEach((span, index) => {
        if (currentIndex < index) {
            span.classList.remove("active");
        }
    })
}

function checkAnswer(rigthAnswer) {
    let answers = document.getElementsByName("question");
    let label = document.querySelectorAll("label");
    let theChoosenAnswer;

    for (let i = 0; i < answers.length; i++) {
        if (answers[i].checked) {
            theChoosenAnswer = answers[i].dataset.answers;
            label[i].style.color = "#009688";
        }
    };

    if (theChoosenAnswer == rigthAnswer) {
        score++;
    }
}

function showResult(count, rAnswer, time) {
    if (currentIndex == count) {
        Swal.fire({
            title: "Good job!",
            text: `You Get ${rAnswer} From ${count - 1}`,
            confirmButtonText: "Agine Game",
            footer: `You Are Passed Exam In ${time}`,
            icon: "success"
        }).then((result) => {
            if (result.isConfirmed) {
                currentIndex = 0;
                location.reload();
            }
        });

        clearInterval(countUp);
    }
}

function saveAnswer(count) {
    let inputs = document.querySelectorAll("input");
    inputs.forEach((input, index) => {
        if (input.checked) {
            window.localStorage.setItem(`ask_${count}`, index);
        }
    })
}

function returnAnswer(count) {
    let inputs = document.querySelectorAll("input");
    let answer = window.localStorage.getItem(`ask_${count}`);

    inputs[answer].checked = true;
};

function setTime() {
    ++totalSeconds;
    secondsLabel.innerHTML = pad(totalSeconds % 60);
    minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));

    function pad(val) {
        let valString = val + "";
        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }
}

window.localStorage.clear();
