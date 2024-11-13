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
        console.log('ocr: ' + texts);
    }catch(error){
        console.error('Virhe on tapahtunut', error.message);
        res.status(500).json({error:error.message})
    }
});


app.listen(port,() =>{
    console.log(`server running at http://localhost:${port}`);
});