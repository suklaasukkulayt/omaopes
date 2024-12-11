let currentQuestion = '';
let correctAnswer = '';

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(e){
    if(e.key === 'Enter'){
        sendMessage();
    }
});
document.getElementById('send-images-button').addEventListener('click', sendImages);
document.getElementById('send-answer-button').addEventListener('click', sendAnswer);


async function sendAnswer(){
    //console.log("Lähetetään vastausta");
    const answerInput = document.getElementById('answer-input').value;
    if(answerInput.trim() === '') return;

    console.log(answerInput);
    addMessageToChatbox('Sinä: ' + answerInput,'user-message', 'omaopeboxi');

    try{
        const response = await fetch('/check-answer',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({user_answer: answerInput, correct_answer: correctAnswer})
        });
        const data = await response.json();
        addMessageToChatbox('OmaOpe: ' + data.evaluation,'bot-message', 'omaopeboxi');
    }catch(error){
        console.log('Virhe on jotenkin tapahtunut;',error);
    }
    document.getElementById('answer-input').value ='';
}


async function sendImages(){
    console.log("tiedostoja lähetetty(ainakin yritetty emt jos se menee perille :D)");
    const imageInput = document.getElementById('image-input');
    console.log(imageInput.files); 
    const files = imageInput.files;
    if(files.length === 0){
        alert('Valitse lähetettävä(t) tiedosto(t)!');
        return;
    }


const formData = new FormData();


for(let i = 0; i<files.length; i++){
    formData.append('images', files[i]);
}

console.log(formData);

try{
    const response = await fetch('/upload-Images',{
        method:'POST',
        body:formData
    })

    const data = await response.json();
    console.log(data);
    currentQuestion = data.question;
    correctAnswer = data.answer;
    console.log('Current question: ' + currentQuestion);
    console.log('Correct answer: ' + correctAnswer);
    addMessageToChatbox('OmaOpe: ' + currentQuestion, 'bot-message','omaopeboxi');


}catch(error){
    console.error('Virhe on tapahtunut(miten tämä on mahdollista):',error);
}

}
async function sendMessage(){
    const userInput = document.getElementById('user-input').value;
    //poistaa tyhjät merkit alusta ja lopusta
    if(userInput.trim() === '') return;
    console.log(userInput);
    //lisätään viesti chatboxiin
    addMessageToChatbox('Sinä: ' + userInput, 'user-message', 'chatbox');

    //post-rajapinnan pyyntö
    try{
        const response = await fetch('/chat',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
    
            },
            body: JSON.stringify({question:userInput})
        });
    
        const data = await response.json();
    
        console.log(data);
        addMessageToChatbox(data.reply,'bot-message','chatbox');
    }catch(error){
        console.error('Virhe on tapahtunut.', error);
        addMessageToChatbox('Virhe on tapahtunut', 'error-message','chatbox')
    }
   

  //tyhjennetään tekstikenttä
    document.getElementById('user-input').value = '';
}

function addMessageToChatbox(message,className,box){
    const messageElement = document.createElement('div');
    messageElement.classList.add('message',className);

    messageElement.textContent = message;
    console.log(messageElement);
    document.getElementById(box).appendChild(messageElement);
    
}