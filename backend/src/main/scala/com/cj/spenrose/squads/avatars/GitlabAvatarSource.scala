package com.cj.spenrose.squads.avatars

import com.cj.spenrose.squads.gitlab.GitlabClient
import org.httpobjects.Representation
import org.httpobjects.DSL._
import org.httpobjects.client.ApacheCommons4xHttpClient
import org.httpobjects.util.HttpObjectUtil

class GitlabAvatarSource(gitlab:GitlabClient) extends AvatarSource {

  private val http = new ApacheCommons4xHttpClient()
  def get(id:String, email:String):Option[Representation] = {
    gitlab
      .searchForUser(id)
      .map(_.avatar_url)
      .filterNot(_.contains("d=identicon"))
      .map{url=>
        fullyFetched(http.resource(url).get().representation())
      }
  }

  private def fullyFetched(r:Representation):Representation = {
    val bytes = HttpObjectUtil.toByteArray(r)
    Bytes(r.contentType(), bytes)
  }
}
