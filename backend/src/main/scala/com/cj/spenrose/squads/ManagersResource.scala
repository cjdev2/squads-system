package com.cj.spenrose.squads

import org.httpobjects._
import org.httpobjects.DSL._

class ManagersResource(staticData : => Data) extends HttpObject("/managers"){
  override def get(req:Request) = {
    val maybeRoot = Option(req.query().valueFor("under"))
    
    val people = maybeRoot match {
      case Some(person) => staticData.everyoneWhoReportsTo(person)
      case None => staticData.people
    }
    
    val csv = people.filterNot(_.isPlaceholder).sortBy(_.last).map{person=>
      person.name + ", " + person.lead.getOrElse("")
    }.mkString("\n")
    
    OK(Bytes("text/csv", csv.getBytes("ASCII")))
  }
}