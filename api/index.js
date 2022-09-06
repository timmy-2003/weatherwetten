const express = require('express')
const app = express()
app.use(express.json())

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = { // Have the firebase config here
  apiKey: "AIzaSyCC5C4C57eUS6EXEfFx8yeWWBqBQ23OO3s",
  authDomain: "weatherwetten-4ad9c.firebaseapp.com",
  projectId: "weatherwetten-4ad9c",
  storageBucket: "weatherwetten-4ad9c.appspot.com",
  messagingSenderId: "426562372824",
  appId: "1:426562372824:web:fa152b660cf973cfd683ad"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();

app.get("/userdata/:id", async (req, res)=>{
  const fbDocument = db.collection("/users").doc(req.params.id)
  let document = fbDocument.get();
  let username = (await document).get("username")
  let weathercoin = (await document).get("weatherCoin")
  res.json({"username":username, "weathercoin":weathercoin}).status(200)
})


app.get("/leaderboard", async (req, res)=>{
  let userArray = [];
  const documents = db.collection('users');
  const snapshot = await documents.get();
  let i = 0;
  snapshot.forEach(doc => {
    userArray[i] = doc.data();
    i++;
  });
  userArray.sort(compareScores);
  for (let i = userArray.length; i>5; i--)
  {
    userArray.pop();
  }
  res.send(userArray)
})

app.post("/create/:id", async (req, res)=>{
  const reference = db.collection('users').doc(req.params.id);
  console.log(req.body)
  const document = {
    username: req.body.username,
    weatherCoin: 10
  }
  try {
    await reference.set(document)
  } catch (error) {
    console.log(error.message)
  }
  res.status(201) // 201 means "created", post request successful and resource created
})

app.patch("/edit/:id", async (req, res)=>{
  let newUsername = req.body.newUsername;
  const reference = db.collection('users').doc(req.params.id);
  await reference.update({username: newUsername})
  res.sendStatus(200)
})

app.patch("/edit/:id/:type", async (req, res)=>{
  let updatedCoins = req.body.weatherCoins;
  const reference = db.collection('users').doc(req.params.id);
  await reference.update({weatherCoin: updatedCoins})
  res.sendStatus(200)
})

app.put("/", (req, res)=>{

})

app.delete("/delete/:id", (req, res)=>{
  const document = db.collection("/bets").doc(req.params.id)
  document.delete()
    .then(()=>res.sendStatus(204));
})


function compareScores(a, b) {
  let scoreA = a.weatherCoin;
  let scoreB = b.weatherCoin;

  if (scoreA < scoreB) {
    return 1;
  }
  if (scoreA > scoreB) {
    return -1;
  }
  return 0; //same score
}


module.exports = {
  path: '/api',
  handler: app
}


