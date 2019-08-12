package com.cj.spenrose.squads.gitlab

import org.httpobjects.client.ApacheCommons4xHttpClient
import com.cj.spenrose.squads.Jackson
import java.net.URLEncoder

class GitlabClient(baseUrl:String, token:String){
  def searchForUser(search:String) = {
    val encodedSearch = URLEncoder.encode(search)
    val data = new ApacheCommons4xHttpClient().resource(s"$baseUrl/api/v3/users?search=$encodedSearch&private_token=$token").get()
    val bytes = org.httpobjects.util.HttpObjectUtil.toByteArray(data.representation())
    val users = Jackson.mapper.readValue(bytes, classOf[Array[GitlabUserInfo]])
    users.headOption
  }
}