var express= require('express');
var fs= require('fs');
var path= require('path');
var URL= require('url');
var bodyParser= require('body-parser');
var multer= require('multer');
var multiparty = require('connect-multiparty');
var mysql = require('mysql');
var moment = require('moment');

var connection = mysql.createConnection({
  host:'localhost',
  user:'root',
  password: '@123456',
  database: 'userPrivate'
});
connection.connect();

var len = "create table if not exists `userImage`("+
  "`user_id` int AUTO_INCREMENT,"+
  "`user_name` varchar(50) NOT NULL,"+
  "`image_name` varchar(50) NOT NULL,"+
  "`imageUrl` varchar(400),"+
  "`uploadTime` DATE,"+
  "primary key(`user_id`))engine=InnoDB default charset=utf8;"

/*var len = CREATE TABLE `user_t` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(40) NOT NULL,
  `password` varchar(255) NOT NULL,
  `age` int(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;*/
connection.query(len,(err,res)=>{
  if(err){
    console.log("error:"+err.message);
    return;
  }
  // console.log(res);
})

var changQuery = 'ALTER TABLE `userImage` ADD UNIQUE KEY(`user_name`);alter table `userImage` modify column `user_name` datetime;';
connection.query(changQuery,(err,res)=>{
  if(err){
    console.log("error:"+err.message);
    return;
  }
  })
// var multiparty = require('multiparty');

var app= express();
var multipartMiddleware = multiparty();

// app.use(express.static('images'));
app.use(bodyParser.json({limit:'50mb'}));
// app.use(bodyParser.urlencoded({limit:'50mb',extended:false}));
// 上传文件大小设置
app.use(multiparty({uploadDir:'public' }));//设置上传文件存放的地址



app.post('/',function(req,res){
  console.log('主页POST请求');
  res.send('hello monday');
})

app.get('/:filename',function(req,res){
  // var hh=path.resolve(__dirname, '../..')
  // console.log(folder+','+filename)
  // console.log(req.params);
  res.sendFile(__dirname+'/'+req.params.filename);
})

app.get('/:folder/:filename',function(req,res){
  // console.log(folder+','+filename)
  res.sendFile(__dirname+'/'+req.params.folder+'/'+req.params.filename);
})

app.get('/canvas.html',function(req,res){
  var hh=path.resolve(__dirname, '../..')
  res.sendFile(hh+'/H5/canvas.html');
})


app.get('/process_get',function(req,res){
  var response= {
    'first_name':req.query.first_name,
    'last_name':req.query.last_name
  }
  console.log(response);
  res.end(JSON.stringify(response));
})

app.post('/process_post',function(req,res){
  var response= {
    'firstname':req.body.first_name,
    'last_name':req.body.last_name
  }
  console.log(response);
  res.end(JSON.stringify(response));
})


var fs = require('fs');
var router = express.Router();
// var formidable = require("formidable");


 app.post('/file_upload',multipartMiddleware,function(req,res){
  /*const bufferFile = Buffer.alloc(1000000);
  var len = bufferFile.write(JSON.stringify(req.files));
  fs.writeFile('console.txt',JSON.stringify(req.files),function(err){
    if(err){
      return console.error(err);
    }
    console.log("存储body成功");
  })*/
  // console.log(req.files);
  fs.writeFileSync('public/'+req.files.file.originalFilename,fs.readFileSync(req.files.file.path),function(err){
     if(err){
      throw err;
     }
     // console.log('copy done!');
   });
  // fs.writeFileSync(to, fs.readFileSync(from));
  // 复制文件
  fs.rename(req.files.file.path,'temp/'+req.files.file.originalFilename, function(err){
     if(err){
      throw err;
     }
    });
     // console.log('rename done!');
    var len_insert = "insert into userImage values(?,?,?,?,?);"
    var uploadTime = moment().format('YYYY-MM-DD HH:MM:SS');
    var uploadUrl = 'http://'+req.headers.host+'/public/'+req.files.file.originalFilename;
    var insertParser = [,'first','headImage',uploadUrl,uploadTime];
    connection.query(len_insert,insertParser,(err,res)=>{
      if(err){
        console.log('[inset error]-',err.message);
        // console.log(req.headers.host,uploadTime);
        console.log(uploadUrl.length);
        return;
      }
      console.log('***********insert***********');
      console.log('inset ID:',res,uploadTime);
    })
    res.json({result: 'success', data: {imageUrl: 'http://'+req.headers.host+'/public/'+req.files.file.originalFilename}});

  // var des_file=__dirname+'/'+req.files[0].originalname;
/* fs.readFile(req.files[0].path,function(err,data){
    if(err){
      console.log(err);
    }else{
      response={
        message:'File uploaded successfully',
        filename:req.files[0].originalname
      }
    }
    console.log(response);
    res.end(JSON.stringify(response));
  })*/
})

/*router.use(function firstFunc(req,res,next){
    console.log("Time: ",Date.now());
    console.log(req.files);
    // next();
})*/

/*router.post('/file_upload',function(req,res,next){
  router.form = new formidable.IncomingForm();
  router.form.parse(req,function(err,fields,files){
    if(err){
      return next(err);
    }
    console.log(111111);
    console.log(req,err,fields,files);
    // modifyUserHeader(req,res,fields,files);
  })
  res.send('thanks');
})*/


/*app.post('/file_upload2', upload.fields([{name: 'inputFile', maxCount: 1}]),function(req,res,next){
     var inputFiles = req.files; //未传时为undefined
     console.log(req.files);
     //读取文件内容
     // var content = inputFiles['inputFile'][0].buffer.toString();

})*/


app.get('/ab*cd',function(req,res){
  console.log('/ab*cd GET请求');
  res.send('正则匹配');
})

app.use('',function(req,res){
   console.log(req,req.host,req.port);
})


var cook= require('cookie-parser');

// var app=express()
app.use(cook());

app.get('/',function(req,res){
  console.log('cookies:',req.cookies);
  res.write('ooooooooooo');
  res.end('hhhhhhhhhhhhh');
})


var server= app.listen(8081,function(req,res){
  console.log(JSON.stringify(server.address())+'\n');
  console.log('应用实例，访问地址为http://%s:%s',server.address().address,server.address().port);
})

// app.listen(8082);
