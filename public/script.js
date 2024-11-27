let currentQuestion = '';
let correctAnswer = '';

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(e){
    if(e.key === 'Enter'){
        sendMessage();
    }
});
document.getElementById('send-images-button').addEventListener('click', sendImages);


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
    addMessageToChatbox('Sinä: ' + userInput, 'user-message');

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
        addMessageToChatbox(data.reply,'bot-message');
    }catch(error){
        console.error('Virhe on tapahtunut.', error);
        addMessageToChatbox('Virhe on tapahtunut', 'error-message')
    }
   

  //tyhjennetään tekstikenttä
    document.getElementById('user-input').value = '';
}

function addMessageToChatbox(message,className){
    const messageElement = document.createElement('div');
    messageElement.classList.add('message',className);

    messageElement.textContent = message;
    document.getElementById('chatbox').appendChild(messageElement);

    console.log(messageElement);
}