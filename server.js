// Simple HTTP server to handle few req & responses
const fs = require("fs");
const path = require("path");
const http = require("http");
const EventEmitter = require("events");
const url = require('url');

const filePath = path.join(__dirname,'db.json');

const server = http.createServer()
const handleRequests = new EventEmitter();

handleRequests.on('GET:articles', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if(err) {
      if (err.code === 'ENOENT') { // Error NO ENTry
        fs.writeFile(filePath, JSON.stringify({
          articles: []
        }), (err) => {
          if (err) {
            console.log(err)
            res.statusCode = 500;
            res.end(JSON.stringify(err));
          } else {
            res.write(JSON.stringify([]))
            res.end()
          }
        })
      } else {
        console.log(err)
        res.statusCode = 500;
        res.end(JSON.stringify(err));
      }
    } else {
      const result = JSON.parse(data);
      res.write(JSON.stringify(result?.articles))
      res.end()
    }
  })
})
handleRequests.on('POST:article', (req, res) => {
  const dataFromJsonFile = fs.readFileSync(filePath, 'utf8')
  const fileData = JSON.parse(dataFromJsonFile);
  let reqData = {};
  req.on("data", (body) => {
    reqData = JSON.parse(body.toString())
  })
  req.on('end', () => {
    if (Array.isArray(fileData?.articles)) {
      fileData.articles.push(reqData);
      fs.writeFile(filePath, JSON.stringify(fileData), (err) => {
        if(err) {
          res.statusCode = 500;
          res.end();
        } else {
          res.write(JSON.stringify({ status: 'success', message: 'Article added successfully' }))
          res.end()
        }
      })
    }
  })
})

//filtering single data using id
handleRequests.on('searchArticle', (req, res) => {
  console.log('Search article')
const request_url = new URL(`http://localhost/5000/${req.url}`);
const search_id = request_url.searchParams;

fs.readFileSync(filePath, 'utf8', (data) => {
  if(search_id.has('id')) {
  let filter_data = data.filter((user) => user.id == id)
  if(filter_data == ''){
   console.log("Requested Article is not found")
   res.statusCode =404;
  }
   else {
      res.write(JSON.stringify(filter_data))
      res.end()

    }
  }})
})
// Delete article using the id
handleRequests.on('deleteArticle', (req, res) => {
  console.log('Delete article')
const request_url = new URL(`http://localhost/5000/${req.url}`);
const search_id = request_url.searchParams;

fs.readFileSync(filePath, 'utf8', (err, data) => {
  if(search_id.has('id')) {
  let filter_data = data.filter((user) => user.id != id)
  fs.writeFile(filePath, JSON.stringify(filter_data), (err) => {
    if(err) {
      res.statusCode = 500;
      res.end();
    } else {
      res.write(JSON.stringify({ status: 'success', message: 'Article has been deleted successfully' }))
      res.end()
    }
  })
  }})
})
server.on('request', (req, res) => {
 request_url_method= `${req.method}:${req.url}`;
  if(req.url.includes(`/articles?id`)){
    console.log('articles SEARCH API')
      handleRequests.emit('searchArticle', req, res);
  }
  else if( request_url_method === 'GET:/articles'){
      console.log('articles GET API')
      handleRequests.emit('GET:articles', req, res)
  }
  else if( request_url_method ===  'POST:/articles'){
      console.log('articles POST API')
      handleRequests.emit('POST:articles', req, res)
}
else if(req.url.includes(`/Deletearticles?id`)){
  console.log('articles Delete API')
  handleRequests.emit('deleteArticle', req, res);
}
else {
      res.statusCode = 404;
      res.end('<h1>Page Not Found: 404</h1>')
  }
})

server.listen(5000, () => {
  console.log('Server is running on port 5000');
})
