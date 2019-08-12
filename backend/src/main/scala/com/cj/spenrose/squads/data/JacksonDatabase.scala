package com.cj.spenrose.squads.data

import com.cj.spenrose.squads.Jackson

class JacksonDatabase[T](bytes:Database[Array[Byte]], clazz:Class[T]) extends Database[T]{

  def get(key:String):Option[T] = {
    bytes.get(key).map(Jackson.mapper.readValue(_, clazz))
  }
  
  def put(key:String, value:T) = {
    bytes.put(key, Jackson.mapper.writer.withDefaultPrettyPrinter().writeValueAsBytes(value))
  }
  def whenLastModified(key:String) = bytes.whenLastModified(key)
}