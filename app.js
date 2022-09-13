
const express = require('express')
const app = express()
var router = express.Router()
const port = 3000
const expressLayouts = require('express-ejs-layouts')
app.use(express.json())
const fs = require('fs')
app.use(expressLayouts);
app.set('view engine', 'ejs')
const { body, check, validationResult } = require('express-validator');
app.use('/public', express.static(__dirname + '/public'))

app.use((req, res, next) => {
  console.log('Time:', Date.now())
  next()
})

app.use(express.urlencoded({extended:true}));
const updateContact = (contactBaru) => {
  const contacts = getUserData();

  const filteredContacts = contacts.filter((contact) => contact.nama !== contactBaru.oldname);
  delete contactBaru.oldname;
  filteredContacts.push(contactBaru);
  saveUserData(filteredContacts);
};
const folder = './data'
const filepath = "./data/db.json";

if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
}
if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '[]')
}

const cekDuplikat = (name) => {
    const contacts = getUserData();
    return contacts.find((contact) => contact.name === name);
  };

  const saveUserData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('data/db.json', stringifyData)
}

const getUserData = () => {
    const jsonData = fs.readFileSync('data/db.json')
    return JSON.parse(jsonData)    
}

const findContact = (nama) => {
    const contacts = getUserData();
    const contact = contacts.find((contact) => contact.nama === nama);
    return contact;
  }

app.post('/', function (req, res) {
    const data = req.body;
    const filePath = require('./data/db.json')

    filePath.push(data)
    res.end();
});
 

app.get('/', (req, res) => {
    let dbPath = getUserData()
    res.render("index", {
        nama:'ronatio',
        layout:'layout/main',
        title : "web express",
        dbPath,
    })

})


app.post('/add', [
 
    body('name').custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error('Data already used!');
      }
      return true;
    }),

    check('email', 'Email doesnt valid!').isEmail(),

   
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('add', {
          isActive: 'home',
          layout: 'layout/add',
          title: 'Form tambah Contact',
          errors: errors.array(),
        });
      } else {
    const existUsers = getUserData()

    const data = req.body
  
    const userData = JSON.stringify(data)
    console.log("com",userData);
    datass = JSON.parse(userData)

    if (datass.name == null || datass.email == null ) {
        return res.status(401).send({error: true, msg: 'User data missing'})
    }
    
    const findExist = existUsers.find( user => user.name === userData.name )
    if (findExist) {
        return res.status(409).send({error: true, msg: 'username already exist'})
    }

    
    existUsers.push(datass)
 
    saveUserData(existUsers);
  res.redirect('/')
}
})



app.post('/contact/update', [
  body('nama').custom((value, { req }) => {
      const duplikat = cekDuplikat(value);
      if (value !== req.body.oldname && duplikat) {
          throw new Error('Nama sudah terdaftar!');
      }
      return true;
  }),
  check('email', 'Email tidak valid!').isEmail(),

  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('edit', {
            title: "ExpressJS",
            layout: "layout/edit",
            errors: errors.array(),
            contact: req.body,
        });
    } else{
        updateContact(req.body);
        // req.send('msg', 'Berhasil Mengupdate Data!');
        res.redirect('/');
    }
});

app.get('/delete/:name', (req, res) => {
    const name = req.params.name

    const existUsers = getUserData()

    console.log("coba",existUsers);

    const filterUser = existUsers.filter( user => user.name !== name )
    if ( existUsers.length === filterUser.length ) {
        return res.status(409).send({error: true, msg: 'username does not exist'})
    }
 
    saveUserData(filterUser)
    
    res.redirect('/')
    
})

app.get('/about', (req, res,next) => {
    
    res.render("about",{
        layout:'layout/main2',
    })
    next()
})

app.get('/contact', (req, res) => {
    const name = req.params.name
    let dbPath = getUserData()
    
    res.render("contact",{
        layout:'layout/main3',
        dbPath,
        name
       
    })
 
})


app.get('/contact/edit/:nama', (req, res) => {
  const contact = findContact(req.params.name);
    res.render("edit",{
        layout:'layout/edit',
        contact, 
    })
})




app.get('/add', (req, res) => {
    res.render("add",{
        layout:'layout/add',
    })
})

app.use('/', (req, res) => {
    res.status(404)
    res.send('Page Not Found : 404')
})
app.listen(port, () => {
    console.log(`example app listening on port ${port}`);
})



module.exports = router