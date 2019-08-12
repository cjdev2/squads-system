package com.cj.spenrose.squads

object Util {

  def base64(string:String):String = javax.xml.bind.DatatypeConverter.printBase64Binary(string.getBytes("utf8"))
  
  def debounced[T](provider : => T, delay:Long) : () => T = {
    println("Creating debouncer")
    val mutex = new Object()
    var currentValue:Option[T] = None
    var lastTime:Long = -1;
    
    def next() = {
      mutex.synchronized{
        
        val now = System.currentTimeMillis()
        val expiration = (lastTime+delay);
        val timeRemaining = expiration - now;
        
    	  if(timeRemaining<0){
    		  println("INVOKING AGAIN! " + timeRemaining)
    		  currentValue = Some(provider)
    		  lastTime = System.currentTimeMillis()
    	  }else{
    		  println("Remaining:" + timeRemaining)
    	  }
      }
      
      currentValue.get
    }
    
    next
  }
  
  def runRepeatedly(intervalMillis:Long, fn:()=>_){
    new Thread(){
      override def run{
        while(true){
          try{
            fn()
          }finally{
            Thread.sleep(intervalMillis)
          }
          
        }
      }
    }.start()
      
  }
}