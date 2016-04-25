var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').createServer(app);

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

var fakePosts = [];

app.get('/posts', function (req, res) {
    fakePosts = [{
            title: 'title 1',
            content: 'content 1'
        }, {
            title: 'title 2',
            content: 'content 2'
    }];
    res.json({
        posts: fakePosts
    });
});
app.post('/posts', function (req, res) {
    fakePosts.push(req.body.post);
    res.json({
        posts: fakePosts
    });
});
app.put('/posts', function (req, res) {
    fakePosts[req.body.index] = req.body.post;
    res.json({
        posts: fakePosts
    });
});
app.delete('/posts', function (req, res) {
    fakePosts.splice(req.query.index, 1);
    res.json({
        posts: fakePosts
    });
});

var server = app.listen(4080, 'localhost', function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});