package com.cj.spenrose.squads.jira

case class JiraUserInfo (
  key:String, 
  name: String,
  avatarUrls: Map[String, String]
)