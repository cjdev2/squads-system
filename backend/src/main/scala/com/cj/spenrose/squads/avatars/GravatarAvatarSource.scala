package com.cj.spenrose.squads.avatars

import org.httpobjects._
import org.httpobjects.client.ApacheCommons4xHttpClient
import org.apache.commons.codec.digest.DigestUtils.md5Hex

object GravatarAvatarSource extends AvatarSource {

  private val http = new ApacheCommons4xHttpClient()

  def get(id:String, email:String):Option[Representation] = {
    try{
      val hash = md5Hex(email.toLowerCase.getBytes)
      val response = http.resource( s"http://www.gravatar.com/avatar/$hash?d=404").get()
      SuccessIfOK(response)
    }catch{
      case _:Throwable => None
    }
  }

  private def SuccessIfOK(response:Response):Option[Representation] = {
    if(response.code().value() == 200){
      Some(response.representation())
    }else{
      None
    }
  }
}
