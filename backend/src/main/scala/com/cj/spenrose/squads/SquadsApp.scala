package com.cj.spenrose.squads

import org.httpobjects.jetty.HttpObjectsJettyHandler
import org.httpobjects.DSL._
import org.httpobjects.HttpObject
import org.httpobjects.util.ClasspathResourceObject
import org.httpobjects.Request
import org.httpobjects.Representation
import java.io.OutputStream
import java.io.File

import scala.util.{Failure, Success, Try}
import org.httpobjects.client.ApacheCommons4xHttpClient
import org.httpobjects.header.GenericHeaderField
import com.cj.spenrose.squads.data.SimpleDatabase
import com.cj.spenrose.squads.data.Database
import com.cj.spenrose.squads.data.JacksonDatabase
import com.cj.spenrose.squads.data.SingletonDatabase
import com.cj.spenrose.squads.data.InMemoryDatabase
import com.opencsv.CSVWriter
import java.io.OutputStreamWriter

import com.cj.spenrose.squads.avatars.{AvatarSource, PersonAvatarResource}
import org.apache.commons.io.{FileUtils, IOUtils}

object SquadsApp {
  def readConfig(args:Array[String]):Configuration = {
    Jackson.mapper.readValue[Configuration](new java.io.File(args(0)))
  }
  
  def main(args: Array[String]): Unit = {
   val config = readConfig(args)
   val editable = args.contains("editable")
   
   val dataDotJson = if(args.contains("persistable")){
     new JacksonDatabase(
           bytes = new SingletonDatabase(new File(config.pathToOrgData), "data"),
           clazz = classOf[Data])
   }else{
     val data = new InMemoryDatabase[Data]()
     data.put("data", Jackson.mapper.readValue(new File(config.pathToOrgData), classOf[Data]))
     data
   }
   new SquadsApp(editable, config, dataDotJson)
  }
}

case class PersonMovement(who:String, maybeNewSquad:Option[String], maybeNewChapter:Option[String],  maybeNewLead:Option[String])
case class Settings(email:String, password:String, editable:Boolean)

class SquadsApp(initiallyEditable:Boolean, config:Configuration, dataDotJs:Database[Data]){
  
  var editable = initiallyEditable
  val primaryPort = config.httpPort

  val ldap = new LdapTool(
      url = config.ldapAuth.url,
      ldapUser = config.ldapAuth.user,
      ldapPassword = config.ldapAuth.password)
  
  val avatarCache = new SimpleDatabase(new File(config.pathToAvatarCache))
  val avatarSources = config.avatarSources.map(_.create)

  val httpResources = Seq(
      new HttpObject("/people.csv"){
        override def get(r:Request) = {
          type Property = (Person) => String
          
          val people = if(r.query().paramNames().contains("open")){
            staticData.people.filter(_.kind == "requisition")
          }else{
            staticData.people
          }
          
          val props:Map[String, Property] = Map(
              "email" -> {p => p.name},
              "first" -> {p => p.first},
              "last" -> {p => p.last},
              "supervisor" -> {p => p.lead.getOrElse("")},
              "location" -> {p => p.location},
              "chapter" -> {p => p.chapter},
              "title" -> {p => p.title.getOrElse("")}
          )
          
          val rows = people.map{p=>
            props.map{case (k, fn)=>
              fn(p)
            }
          }
          
          
          OK(new Representation(){
            val contentType = "application/csv"
            
            override def write(o:OutputStream){

              val writer = new CSVWriter(new OutputStreamWriter(o));
              
              writer.writeNext(props.keys.toArray)
              rows.foreach(values => writer.writeNext(values.toArray))
              writer.close()
            }
          })
            
        }
      },
      new HttpObject("/googleAccounts"){
        override def get(r:Request) = {
          val emails = staticData.people.filterNot(_.isPlaceholder).map{person=>
            person.googleAccountEmail.getOrElse(person.name + config.emailSuffix)
          }
          OK(Text(emails.mkString("\n")))
        }
      },
      new HttpObject("/settings"){
        override def get(r:Request) = {
          OK(JacksonJson(Settings(editable=editable, email=null, password=null)))
        }
        override def post(r:Request) = {
            val data = org.httpobjects.util.HttpObjectUtil.toByteArray(r.representation())
            val settings = Jackson.mapper.readValue(data, classOf[Settings])
            
            if(ldap.authenticateEmail(settings.email, settings.password)){
            	editable = settings.editable
              OK(Text("okey dokey"))
            }else{
              UNAUTHORIZED
            }
        }
      },
      new HttpObject("/alumni"){
        override def post(r:Request) = {
          if(editable){
        	  val data = org.httpobjects.util.HttpObjectUtil.toByteArray(r.representation())
        		val name = Jackson.mapper.readValue(data, classOf[String])
            println(s"$name is an alumni now")

            val person:Person = staticData.people.find(_.name == name).get
            val backfill = person.copy(
                maybeEmployeeID = None,
                name = s"open-$name-backfill",
                kind = "requisition",
                first = null,
                last = null)

            def withUpdatedManager(p:Person) = {
              if(p.lead == Some(person.name)){
                p.copy(lead = person.lead)
              }else{
                p
              }
           }

            val updatedSquads = staticData.squads.map{squad=>
              if(squad.people.contains(name)){
                squad.copy(people = squad.people.filter(_ != name) :+ backfill.name)
              }else {
                squad
              }
            }

            val idx = staticData.people.indexOf(person)
            val updatedPeople = staticData.people.patch(idx, List(backfill), 1).map(withUpdatedManager)
            
        	  save(staticData.copy(
        			  squads = updatedSquads,
        			  people = updatedPeople,
        			  alumni = Some(staticData.alumni.map(List(person) ::: _).getOrElse(List(person)))
        			  ))
            OK(Text(name))
          }else{
            UNAUTHORIZED
          }
        }
        
      },
      new HttpObject("/moves"){
        override def post(r:Request) = {
          if(editable){
        	  val data = org.httpobjects.util.HttpObjectUtil.toByteArray(r.representation())
        		val movement = Jackson.mapper.readValue(data, classOf[PersonMovement])
        		
  			    val updatedSquads = staticData.squads.map{squad=>
        			  val peopleMinusPerson = squad.people.filterNot(_ == movement.who && movement.maybeNewSquad.isDefined)  
        			  
        			  val people = if(movement.maybeNewSquad.map(_ == squad.id).getOrElse(false)){
        				  movement.who +: peopleMinusPerson
        			  }else{
        				  peopleMinusPerson
        			  }
        			  
        			  squad.copy(people = people)
        	  }
        	  
        	  val updatedPeople = staticData.people.map{p=>
        	      if(p.name == movement.who) {
        	          val newLead = movement.maybeNewLead match {
        	            case Some(p.name) => {
        	              // can't be one's own manager
        	              println("My own grandpa!")
        	              p.lead
        	            }
        	            case Some(newLead) => Some(newLead)
        	            case None => p.lead
        	          }
        	          println("Lead Change: from " + p.lead + " to " + newLead)
        	          p.copy(
      	                chapter = movement.maybeNewChapter.getOrElse(p.chapter),
      	                lead = newLead
    	              )
        	      } else p
        	  }
        	  
        	  save(staticData.copy(
        			  squads = updatedSquads,
        			  people = updatedPeople
        			  ))
          }
          SEE_OTHER(Location("/data.js"))
        }
      },
      new OrgChartResource("/arrows", {compiledData()}),
      new ManagersResource(staticData),
      new PersonAvatarResource(
          staticData.people,
          emailSuffix = config.emailSuffix,
          avatarSources,
          avatarCache = avatarCache),
      new HttpObject("/data.js"){
        override def get(r:Request) = OK(JacksonJson(data()))
      },
      new HttpObject("/problems"){
        override def get(r:Request) = {
          val compilationProblems = compiledData().problems

          val allProblems = compilationProblems
          OK(JacksonJson(allProblems))
        }
      },
      new HttpObject("/missions/{squad-key}/mission"){
        override def get(r:Request) = {
          val key = r.path().valueFor("squad-key")
          val data = compiledData()
          
          println(staticData.missions.map(_.key).mkString(","))
          println( staticData.missions
             .find(_.key == key))
          val maybeMarkdown = staticData.missions
             .find(_.key == key)
             .flatMap{squad=>
               val path = new File(s"${config.pathToMissionDescriptions}/" + squad.key + ".md")
               if(path.exists() && path.isFile) {
                 Some(FileUtils.readFileToString(path, "UTF8"))
               } else {
                 None
               }
             }
          
          maybeMarkdown match {
            case Some(markdown) => OK(Text(markdown))
            case None => NOT_FOUND
          }
        }
      },
      new ClasspathResourceObject("/", "/content/diagram.html", getClass()),
      new ClasspathResourceObject("/constituencies", "/content/constituencies.html", getClass()),
      new ClasspathResourceObject("/orgchart", "/content/orgchart.html", getClass()),
      new ClasspathResourceObject("/locations", "/content/locations.html", getClass()),
      classpathResourcesAt("/content/").servedAt("/")
  )
  
  HttpObjectsJettyHandler.launchServer(primaryPort, httpResources :_*)
  
  def print(t:Throwable) = {
    val out = new java.io.ByteArrayOutputStream()
    val pw = new java.io.PrintWriter(out)
    t.printStackTrace(pw)
    pw.close();
    new String(out.toByteArray())
  }
  
  
  def save(data:Data) = dataDotJs.put("data", data)
  def modifiedData = dataDotJs.get("data").get
  def staticData = modifiedData
   
  val JiraSquadNamePattern = "(.*) - (.*)".r
  
  
 def data() = {
   
   val mergedData = staticData.copy(
       squads = compiledData().squads.map(_.staticData).distinct
   )
   
   mergedData
 }
  
 
 def JacksonJson(data:AnyRef) = new Representation(){
   override val contentType = "application/json"
   override def write(o:OutputStream) = {
     Jackson.mapper.writerWithDefaultPrettyPrinter().writeValue(o, data);
   }
 }
 
 case class BacklogItem(name:String, link:String, iconUrl:String)
 
  def compiledData() = CompiledData.compile(staticData)
}
