package com.cj.spenrose.squads.data

import java.io.File

class SingletonDatabase(path:File, theKey:String = "instance") extends SimpleDatabase(path) {
  
  protected override def pathForKey(key:String) = {
    if(theKey == key) path
    else throw new Exception(s"Expected $theKey but you gave me $key")
  }
}