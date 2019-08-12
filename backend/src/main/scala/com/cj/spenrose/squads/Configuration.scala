package com.cj.spenrose.squads

import com.cj.spenrose.squads.avatars._
import com.cj.spenrose.squads.jira.JiraClient
import com.fasterxml.jackson.annotation.JsonSubTypes.Type
import com.fasterxml.jackson.annotation.{JsonSubTypes, JsonTypeInfo, JsonTypeName}

case class Configuration(
                        pathToAvatarCache:String,
                        avatarSources:Seq[AvatarSourceConfiguration],
                        pathToOrgData:String,
                        pathToMissionDescriptions:String,
                        emailSuffix:String,
                        ldapAuth:LdapAuthConfiguration,
                        httpPort:Int)

case class LdapAuthConfiguration(
                                  url:String,
                                  user:String,
                                  password:String)


@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "source")
@JsonSubTypes(
  value = Array(
    new Type(value = classOf[LdapAvatarSourceConfiguration], name = "ldap"),
    new Type(value = classOf[GitlabAvatarSourceConfiguration], name = "gitlab"),
    new Type(value = classOf[GravatarAvatarSourceConfiguration], name = "gravatar"),
    new Type(value = classOf[JiraAvatarSourceConfiguration], name = "jira"))
)
trait AvatarSourceConfiguration {
  def create():AvatarSource
}

case class LdapAvatarSourceConfiguration(
    url:String,
    user:String,
    password:String) extends AvatarSourceConfiguration {

  def create():AvatarSource = {
    val ldap = new LdapTool(
      url = url,
      ldapUser = user,
      ldapPassword = password)
    new LdapAvatarSource(ldap)
  }
}


case class GitlabAvatarSourceConfiguration(
    gitlabBaseUrl:String,
    gitlabAccessToken:String) extends AvatarSourceConfiguration {

  def create(): AvatarSource = {
    import com.cj.spenrose.squads.gitlab.GitlabClient
    val gitlab = new GitlabClient(gitlabBaseUrl, gitlabAccessToken)
    new GitlabAvatarSource(gitlab)
  }
}

case class GravatarAvatarSourceConfiguration() extends AvatarSourceConfiguration {
  def create(): AvatarSource = GravatarAvatarSource
}

case class JiraAvatarSourceConfiguration(
    jiraUsername:String,
    jiraPassword:String) extends AvatarSourceConfiguration {
  def create(): AvatarSource = {
    val jiraClient = new JiraClient(jiraUsername = jiraUsername, jiraPassword = jiraPassword)

    new JiraAvatarSource(jiraClient)
  }
}
