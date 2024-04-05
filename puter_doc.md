## sign in

```
const isSignedIn=puter.auth.isSignedIn();
if (!isSignedIn){
    puter.auth.signIn();
}
puter.auth.getUser().then(function(user) {
    const username=user.username;
    console.log(username);
});
```


## Key-Value Store

```
puter.kv.set('name', 'Puter Smith').then((success) => {
  console.log(\`Key-value pair created/updated: Success\`);
});

//or 
const name = await puter.kv.get('name');

//or
puter.kv.del('name').then((success) => {
  console.log(\`Key-value pair deleted: Success\`);
});

//or 

puter.kv.list().then((keys) => {
  console.log(\`Keys are: \${keys}\<br><br>\`);
});
//or
puter.kv.list(true).then((key_vals) => {
  console.log(\`Keys and values are: \${(key_vals).map((key_val) => key_val.key + ' => ' + key_val.value)}\<br><br>\`);
});
```


## To use Ai Chat :

```

const messageList = [{ role: "system", content: "A system message that tells the Ai what role to play and how to respond" },{ role: "user", content: "The message to send" }];
puter.ai.chat(messageList).then((response) => {
    const chatResponse=response.toString();
    //do something with the response
    //append the chatResponse to the messageList for history
    const toAppend={role: "assistant", content: chatResponse};
    messageList.push(toAppend);
  });
```


## to generate an image : 
```
puter.ai.txt2img('description of the image').then((image)=>{
    //image.src is the url of the image in base64
    //image is a DOM element
    document.body.appendChild(image);
});

```

## To handle a file :
```
puter.ui.showOpenFilePicker().then(async (file)=>{
    
    const fileName=file.name;
    const fileContent=await (await file.read()).text();
});

or

puter.ui.showSaveFilePicker("Hello world! I'm the content of this file.", 'fileName.txt').then(async (file)=>{
    const fileName=file.name;
    const fileContent=await (await file.read()).text();
});
```

## to speak aloud : 
```
puter.ai.txt2speech(\`the text to speak\`).then((audio)=>{
    audio.play();
});
```


## to save file:
```
const file=await puter.fs.write('hello.txt', 'Hello, world!', { dedupeName: true },{ createMissingParents: true });

```

## to get filenames in a directory: 
```
puter.fs.readdir('./').then((items) => {
    // print the path of each item in the directory
    puter.print(\`Items in the directory:<br>\${items.map((item) => item.path)}<br>\`);
}).catch((error) => {
    puter.print(\`Error reading directory: \${error}\`);
});

//file.is_dir //true if directory
//file.is_dir && file.subdomains.length>0 //true if the folder is a hosted subdomain
//if file.is_dir, file.subdomains is an array of subdomain {address:string, uuid:string}
```


## to read file:
```
let file = await puter.fs.read(filename);
let content=await file.text(); //for text file
```


## to get the apps:
```
const list=await puter.apps.list(); //array of {"title":string,"name":string,"description":string,"icon":string,"created_at":Date,stats:{"open_count":number,"user_count"number}}
```

## launch app :
```
await puter.ui.launchApp(appName)  // Editor, France_Info , Code
```

## Create Window : 
You can change the settings if needed
```
puter.ui.createWindow({
            title: 'Cool Title',  //title of window
            content: '<h1 style="text-align:center;">My little test window!</h1>', 
            disable_parent_window: true, //if true, the parent window will be disabled until this window is closed
            width: 300,
            height: 300,
            is_resizable: false,
            has_head: true, //if false, the window will not have a header
            center: true,
            show_in_taskbar: true,
})
```

## to prompt user : (blocking use only if you know why you are doing it)
```
const promptResult=await parent.puter.ui.prompt("What is your name?");
```


## to alert user:
```
puter.ui.alert(message)  //message is a string example : "File saved successfully"
```


## to alert user with buttons:
```
const result=await parent.puter.ui.alert('Save file ... to ... ?', [
  {
      label: 'Yes :)',
      value: 'yes',
      type: 'primary',
  },
  {
      label: 'No :(',
      value: 'no',
      type: 'danger',
  },
  {
      label: 'Cancel',
  },
]);
```