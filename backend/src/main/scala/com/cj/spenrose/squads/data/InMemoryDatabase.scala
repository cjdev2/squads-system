package com.cj.spenrose.squads.data

class InMemoryDatabase[T] extends Database[T] {
  private case class Entry(value:T, whenLastModified:Long)
  private var instances = Map[String, Entry]()
  
  def get(key:String) = instances.get(key).map(_.value)
  
  private def now = System.currentTimeMillis()
  
  def put(key:String, value:T){
    instances = instances + (key -> Entry(value, now))
  }
  
  def whenLastModified(key:String) = instances.get(key).map(_.whenLastModified)
}