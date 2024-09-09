let blocked = false;
let leetCodeUserName = localStorage.getItem("leetCodeUserName") ?? "";
let userQuestion = '';
let seenQuestions = [];

const setMinuteTimer = (duration) => {
    let timer = duration, minutes, seconds;
    const interval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        console.log(`${minutes}:${seconds}`);

        if (--timer < 0) {
            clearInterval(interval);
            console.log("Timer finished");
            blocked = true;

            document.body.innerHTML = `
                <div style="height: 100vh; width: 100vw; background-color: #2D3FFF; display: flex; justify-content: center; align-items: center; text-align: center; flex-direction: column;">
                    <h1 style="color: #FFFFFF; font-size: 5rem;">It's time to leetcode!!</h1>
                    <h2 style="color: #FFFFFF; font-size: 3rem;">Go solve this question: ${userQuestion}</h2>
                    <button id="unblockButton" style="margin-top: 5vh; padding: 2vw; background-color: #FFFFFF; color: black;">Solved it!</button>
                </div>
            `;

            document.getElementById('unblockButton').addEventListener('click', () => {
                checkIfSolved();
            });
        }
    }, 1000);
}

const checkIfSolved = () => {
    fetch(`https://alfa-leetcode-api.onrender.com/${leetCodeUserName}/submission?limit=5`)
        .then(response => response.json())
        .then(data => {
            console.log("list of submissions: ", data);
            if (data.submission[0].title === userQuestion) {
                blocked = false;
                document.body.innerHTML = ''; 
                location.reload();
            } else {
                const errorMessage = document.createElement('h1');
                errorMessage.textContent = `Sorry, your last submission didn't match: ${data.submission[0].title}`;
                document.body.appendChild(errorMessage);
            }
        })
        .catch(error => alert("Error checking: ", error));
}

const loadLeetCodeInfo = async () => {
    console.log("loading questions");
    fetch('https://alfa-leetcode-api.onrender.com/problems')
        .then(response => response.json())
        .then(data => {
            console.log("list of problems: ", data);

            let questionOptions = data.problemsetQuestionList.filter(question => question.difficulty === "Medium");
            getRandomQuestion(questionOptions);
        })
        .catch(error => {
            alert("Error: ", error);
        });
    console.log("done");
}

const getRandomQuestion = (questionOptions) => {
    let index = Math.floor(Math.random() * questionOptions.length);
    let question = questionOptions[index].title;

    if (seenQuestions.includes(question)) {
        getRandomQuestion(questionOptions);
    } else {
        console.log(userQuestion);
        userQuestion = question;
        seenQuestions = [...seenQuestions, question];
    }
}

(async () => {
    if (leetCodeUserName === "") {
        leetCodeUserName = window.prompt("Please Enter Your LeetCode User Name: ");
        localStorage.setItem("leetCodeUserName", leetCodeUserName);
    }

    console.log("timer started");
    await loadLeetCodeInfo();

    if (!blocked) {
        setMinuteTimer(60 * 60);
    }
})();
