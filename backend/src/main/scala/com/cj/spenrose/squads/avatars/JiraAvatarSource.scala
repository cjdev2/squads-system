package com.cj.spenrose.squads.avatars

import com.cj.spenrose.squads.jira.JiraClient
import org.httpobjects._

class JiraAvatarSource(jiraClient: JiraClient) extends AvatarSource {

  def get(id:String, email:String):Option[Representation] = jiraClient.getJiraPhoto(id)
}
