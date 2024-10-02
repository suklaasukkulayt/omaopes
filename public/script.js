document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(e){
    if(e.key === 'Enter'){
        sendMessage();
    }
});
async function sendMessage(){
    const userInput = document.getElementById('user-input').value;
    //poistaa tyhjät merkit alusta ja lopusta
    if(userInput.trim() === '') return;
    console.log(userInput);
    //lisätään viesti chatboxiin
    addMessageToChatbox(userInput);

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
    }catch(error){
        console.error('Virhe on tapahtunut.', error);
        addMessageToChatbox('Virhe on tapahtunut')
    }
   

  //tyhjennetään tekstikenttä
    document.getElementById('user-input').value = '';
}

function addMessageToChatbox(message){
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    document.getElementById('chatbox').appendChild(messageElement);

    console.log(messageElement);
}