package com.cj.spenrose.squads.avatars

import java.net.URLDecoder

import com.cj.spenrose.squads.data._
import com.cj.spenrose.squads.{LdapTool, Person}
import org.httpobjects.DSL._
import org.httpobjects._
import org.httpobjects.util.HttpObjectUtil

case class JsonifiedRepresentation(contentType:String, data:Array[Byte]){
  def this(r:Representation) = this(r.contentType(), HttpObjectUtil.toByteArray(r))
  def toRepresentation = Bytes(contentType, data)
}


class PersonAvatarResource(
                          people : => Seq[Person],
                          emailSuffix:String,
                          sources:Seq[AvatarSource],
                          avatarCache:Database[Array[Byte]]) extends HttpObject("/people/{id}/logo"){
  
  private val avatars = new JacksonDatabase(avatarCache, classOf[JsonifiedRepresentation])



  
  private def fetchAvatar(id:String):Representation = {
        val email:String = id + emailSuffix

        class InferredFromName extends AvatarSource {
          def get(id:String, email:String) = {
            println("Loooking for icon for " + id)

            val maybeTitle = people.find(_.name == id).filter(_.kind=="requisition").flatMap(_.title)

            val maybeImage = maybeTitle.flatMap({
                case "Senior Software Engineer"=> Some("senior.png")
                case "Software Engineer" => Some("midlevel.jpg")
                case "Associate Software Engineer" => Some("junior.png")
                case "Associate Product Manager" => Some("junior-product-manager.png")
                case _ => None
            });

            maybeImage.map("/content/" + _).map(FromClasspath("image/png", _, getClass))
          }
        }


        class DefaultLogoSource extends AvatarSource {
          def get(id:String, email:String) = Some(FromClasspath("image/jpeg", "/content/stickfigure.jpg", getClass))
        }

        val mechanisms:Stream[AvatarSource] = new InferredFromName() +: sources.toStream :+ new DefaultLogoSource()

        mechanisms.flatMap{source=>
          try{
            println("Fetching using " + source.getClass.getSimpleName)
            source.get(id, email)
          }catch{
            case _:Throwable=>None
          }
        }.head
  }
  
  override def get(r:Request) = {
    val id = URLDecoder.decode(r.path().valueFor("id"))
    
    val oneDayAgo = System.currentTimeMillis() - (24 * 60 * 60 * 1000)
    val maybeRecentlyCachedAvatar = avatars.get(id).filter{a=>avatars.whenLastModified(id).get > oneDayAgo }
    
    val representation = maybeRecentlyCachedAvatar match {
      case Some(cached) => cached.toRepresentation
      case None => {
        val r = fetchAvatar(id)
        avatars.put(id, new JsonifiedRepresentation(r))
        avatars.get(id).get.toRepresentation
      }
    }
    OK(representation)
  }

 }