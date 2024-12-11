import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import multer from 'multer';
import vision from '@google-cloud/vision';

dotenv.config();

const app = express()
const port = 3000;

const upload = multer({dest:'uploads/'});

app.use(express.static('public'));
app.use(bodyParser.json());

const client = new vision.ImageAnnotatorClient({keyFilename:'omaope-vision.json'});

let koealueTekstina = '';
let context = [] //chatgpt keskustelulista
//muuttujat kysmyksen ja vastauksen tallentamiseen
let currentQuestion = '';
let correctAnswer = '';

app.post('/check-answer', async(req,res)=>{
    const userAnswer = req.body.user_answer;
    console.log(userAnswer);
    try{
        const response = await fetch('https://api.openai.com/v1/chat/completions',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model:'gpt-4o-mini',
                messages:[
                    {role:'system', content: 'ole aina ystävällinen opettaja, joka arvioi oppilaan vastauksen kohteliaasti'},
                    {role:'user', content:`Kysymys ${currentQuestion}`},
                    {role:'user', content:`Oikea vastaus ${correctAnswer}`},
                    {role:'user', content:`Opiskelijan vastaus ${userAnswer}`},
                    {role:'user', content:'Arvioi opiskelijan vastaus asteikolla 0-10 ja anna lyhyt selitys ystävällisin ja kannustavin sanoin.'},
                ],
                max_tokens:150
            })
            });
            const data = await response.json();
            const evaluation = data.choices[0].message.content.trim();
            console.log("Arvio: ", evaluation);
            res.json({evaluation});
    }catch(error){
        console.error(error);
    }
});


app.use(express.static('public'));
app.post('/chat', async(req,res) =>{
    const question = req.body.question;
    console.log(question);

    try{    
        const response = await fetch('https://api.openai.com/v1/chat/completions',{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model:'gpt-4o-mini',
            messages:[
                {role:'user', content: question}
            ],
            max_tokens:150
        })
        });

        const data = await response.json();
        console.log(data.choices[0].message);
        const reply = data.choices[0].message.content;
        res.json({reply});

    }catch(error){
        console.error('Virhe on tapahtunut', error.message);
        res.status(500).json({error:server.message});
    }
    // if (question){
    //     res.json({question:`Käyttäjä sanoi ${question}`});
    // }else{
    //     res.status(400).json({error:'Kysymys puuttuu.'})
    // }
   
});

app.post('/upload-Images',upload.array('images',10) ,async(req,res)=>{
    const files = req.files;
    console.log(files);
    if(!files || files.length === 0){
        return res.status(400).json({error:'No files uploaded'});
    }
    try{
        const texts = await Promise.all(files.map(async file =>{
            const imagePath = file.path;
            const [result] = await client.textDetection(imagePath);
            const detections = result.textAnnotations;
            return detections.length > 0 ? detections[0].description : '';
        }))

        koealueTekstina = texts.join('');
        console.log(koealueTekstina);
        context =[{role:'user', content:koealueTekstina}];


        const response = await fetch('https://api.openai.com/v1/chat/completions',{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model:'gpt-4o-mini',
                messages: context.concat([
                    {role:'user', content: 'Luo yksinkertainen ja selkeä kysymys ja sen vastaus yllä olevasta tekstistä suomeksi. Kysy vain yksi asia kerrallaan'}
                ]),
                max_tokens:150
            })
        });

        const data = await response.json();
        console.log(data.choices[0].message.content);
        const responseText = data.choices[0].message.content.trim();

        const [question, answer] = responseText.includes('Vastaus') ? responseText.split('Vastaus') : [response.null];

        console.log("Kysymys:" + question);
        console.log("Vastaus:" + answer)

        if(!question || !answer){
            return res.status(400).json({error:'Model could not generate valid question. Please provide a clearer text.'});
        }
        currentQuestion = question.trim();
        correctAnswer = answer.trim();

        context.push({role: 'assistant', content: `Kysymys: ${currentQuestion}`});
        context.push({role: 'assistant', content: `Vastaus: ${correctAnswer}`});

        res.json({question: currentQuestion, answer: correctAnswer});
        

    }catch(error){
        console.error('Virhe on tapahtunut', error.message);
        res.status(500).json({error:error.message})
    }
});


app.listen(port,() =>{
    console.log(`server running at http://localhost:${port}`);
});