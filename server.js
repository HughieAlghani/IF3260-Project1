const express = require('express');
const app = express();
const fs = require('fs');

// const bodyParser = require('body-parser');
// var router = express.Router()

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


// app.use(
//     express.urlencoded({
//       extended: true
//     })
//   )  
// app.use(bodyParser.json())

app.post('/export', (request, response) => {
    let req = request.body;
    export_data(req.file_name,req.data);
    response.sendStatus(200);
});

// app.use(router)
app.listen(3000);


function export_data(file_name, data){
      
    // Write data in 'Output.txt' .
    fs.writeFile("./public/data/" + file_name, data, (err) => {
          
        // In case of a error throw err.
        if (err) throw err;
    })

}