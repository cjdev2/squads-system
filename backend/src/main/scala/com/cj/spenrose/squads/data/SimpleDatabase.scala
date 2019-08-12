package com.cj.spenrose.squads.data

import java.io.File
import java.io.FileOutputStream

class SimpleDatabase(path:File) extends Database[Array[Byte]] {
  if(!path.exists() && !path.mkdirs()) 
      throw new Exception("Could not create directory at " + path.getAbsolutePath)
  
  protected def pathForKey(key:String) = {
    val p = new File(path, key);
    
    if(p.getParentFile.getAbsolutePath != path.getAbsolutePath) throw new Exception("Illegal key")
    
    p
  }
  
  def whenLastModified(key:String):Option[Long] = {
    val path = pathForKey(key)
    if(path.exists()){
      Some(path.lastModified())
    }else{
      None
    }
  }
  override def get(key:String) = {
    val path = pathForKey(key)
    if(path.exists()){
    	val source = scala.io.Source.fromFile(pathForKey(key))
 			Some(source.map(_.toByte).toArray)
    }else{
      None
    }
  }
  
  override def put(key:String, value:Array[Byte]) = {
    val path = pathForKey(key)
    if(!path.exists) {
      path.getParentFile.mkdirs()
      path.createNewFile()
    }
    val out = new FileOutputStream(path)
    try{
      out.write(value)
    }finally{
      out.close()
    }
  }
}