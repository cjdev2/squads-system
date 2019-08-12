package com.cj.spenrose.squads

import java.net.URL
import java.util.Base64
import com.fasterxml.jackson.module.scala.experimental.ScalaObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.DeserializationFeature
import org.httpobjects.client.ApacheCommons4xHttpClient
import org.httpobjects.header.GenericHeaderField
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.core.`type`.TypeReference

//TODO: Delete me

case class JiraAgileQueryResult(
  @JsonProperty("issues")
  issues:List[JiraBacklogItem],
  total:Int
)

case class JiraPriority (
		id:String,
    name:String,
    iconUrl:String
)

case class JiraBacklogItem (
  id:String,
  self:String,
  key:String,
  fields:JiraItemFields
)

case class JiraComponentInfo (
    id:String,
    name:String
)

case class JiraItemFields (
  project:JiraProjectInfo,
  summary:String,
  created:String,
  components:List[JiraComponentInfo],
  priority:Option[JiraPriority]
){
  def primaryComponentName = components.headOption.map(_.name).getOrElse(null)
}

case class JiraProjectInfo(
  self: String,
  id: String,
  key: String,
  name: String,
  avatarUrls: Map[String, String]
)

object JiraProjectBacklog {
  
  def main(args: Array[String]): Unit = {
    val jira = new JiraProjectBacklog(args(0), args(1))

    jira.listComponents().foreach(println)
  }
}

class JiraProjectBacklog(username:String, password:String) {
  private val baseUrl = "http://jira.cnvrmedia.net"
  
  val credentials = s"$username:$password"
  val encoded = "Basic " + Util.base64(credentials)
  
  
  def listComponents() = {
    val client = new ApacheCommons4xHttpClient()
    val url = baseUrl + "/rest/api/2/project/13123/components"
    val response = client
                    .resource(url)
                    .get(new GenericHeaderField("Authorization", encoded))
                    
//    val listType = Jackson.mapper.getTypeFactory().constructCollectionType(classOf[java.util.List], classOf[JiraComponentInfo]);
//    val components  = pipeThrough(response.representation, Jackson.mapper.readValue(_, new TypeReference[List[JiraComponentInfo]](){}))
//    components
     pipeThrough(response.representation,Jackson.readSeq(_, classOf[Array[JiraComponentInfo]]))
     
  }
  
  def get() = {
    val client = new ApacheCommons4xHttpClient()
    
    
    
    def fetchPage(num:Int = 1) = {
      val url = baseUrl + "/rest/agile/1.0/board/539/backlog?fields=id,self,key,summary,components,priority,customfield_15427,created&maxResults=200&startAt=" + num
      println(url)
       val response = client
                    .resource(url)
                    .get(new GenericHeaderField("Authorization", encoded))
                    
       pipeThrough(response.representation, Jackson.mapper.readValue(_, classOf[JiraAgileQueryResult]))
    }
    
    var lastPage = fetchPage()
    var r = lastPage.issues
    while(r.size < lastPage.total){
      lastPage = fetchPage(r.size)
      r = r ++ lastPage.issues
    }
    r
    
  }
  
  import org.httpobjects.Representation
  import java.io.{InputStream, PipedOutputStream, PipedInputStream}
  def pipeThrough[T](r:Representation, fn:(InputStream)=>T):T = {
    val pipedOut = new PipedOutputStream()
    val pipedIn = new PipedInputStream(pipedOut)
    new Thread(){
      override def run() = r.write(pipedOut)
    }.start();
    fn(pipedIn)
  }
}