package com.cj.spenrose.squads.avatars

import com.cj.spenrose.squads.LdapTool
import org.httpobjects.Representation
import org.httpobjects.DSL._

class LdapAvatarSource(ldap:LdapTool) extends AvatarSource {

  def get(id:String, email:String):Option[Representation] = {

    ldap
      .getLogo(email)
      .map{data=>Bytes("image/jpeg", data)}
  }
}
