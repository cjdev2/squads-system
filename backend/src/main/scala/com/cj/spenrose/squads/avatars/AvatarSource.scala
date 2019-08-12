package com.cj.spenrose.squads.avatars

import org.httpobjects.Representation

trait AvatarSource {
  def get(id:String, email:String):Option[Representation]
}
