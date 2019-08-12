package com.cj.spenrose.squads.jira

import org.httpobjects.client.ApacheCommons4xHttpClient
import com.cj.spenrose.squads.Util
import org.httpobjects.header.GenericHeaderField
import com.cj.spenrose.squads.Jackson

class JiraClient(jiraUsername:String, jiraPassword:String) {

  def getJiraPhoto(username:String) = {
    val client = new ApacheCommons4xHttpClient()
    
    val credentials = s"$jiraUsername:$jiraPassword"
    val encoded = "Basic " + Util.base64(credentials)
    
    
      val url = s"http://jira.cnvrmedia.net/rest/api/2/user/search?username=$username"
      println(url)
      val response = client
                    .resource(url)
                    .get(new GenericHeaderField("Authorization", encoded))

                    
      if(response.code().value() == 200) {
        val json = org.httpobjects.util.HttpObjectUtil.toAscii(response.representation())
        val users = Jackson.mapper.readValue(json, classOf[Array[JiraUserInfo]])
        
        users
          .headOption
          .map(_.avatarUrls("48x48"))
          .filter(_.contains(username))
          .flatMap{url=>
             val response = new ApacheCommons4xHttpClient()
                      .resource(url)
                      .get(new GenericHeaderField("Authorization", encoded))
             if(response.code().value()==200){
               Some(response.representation())
             }else{
               None
             }
           }
      } else None
  }
}