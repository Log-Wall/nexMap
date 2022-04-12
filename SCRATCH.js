var worker_fn = function(e) 
{
    self.postMessage('msg from worker');            
};

var blob = new Blob(["onmessage ="+worker_fn.toString()], { type: "text/javascript" });

var worker = new Worker(window.URL.createObjectURL(blob));
worker.onmessage = function(e) 
{
   alert(e.data);
};
worker.postMessage("start"); 


/////////////////////////////////////////

function fn2workerURL(fn) {
    let blob = new Blob(['('+fn.toString()+')()'], {type: 'text/javascript'})
    return URL.createObjectURL(blob)
  }