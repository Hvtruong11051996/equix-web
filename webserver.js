var path = require('path');
var port = 80;
var express = require('express');

var app = express();
app.use(express.static(path.join(__dirname, '/dist'))); // use static files in ROOT/public folder

app.listen(port, () => {
    console.log(`LISTENING TO PORT ${port}`)
});
