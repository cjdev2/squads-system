package com.cj.spenrose.squads.data

trait Database[T] {
  def get(key:String):Option[T]
  def put(key:String, value:T)
  def whenLastModified(key:String):Option[Long]
}