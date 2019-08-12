package com.cj.spenrose.squads

import org.httpobjects._
import org.httpobjects.DSL._

class OrgChartResource(path:String, staticData : => CompiledData) extends HttpObject(path) {
    private def dotSafeName(name:String) = '"' + name + '"' //name.replaceAll("\\s", "_")
  
    override def get(r:Request) = {
      val lines = staticData.people.map{person=>
        val supervisor = person.lead.getOrElse("nobody")
        s"${dotSafeName(supervisor)} -> ${dotSafeName(person.name)};"
      }
      
      OK(Text(s""" 
digraph G {
  ${lines.mkString("\n")}
 }"""))
    }
}