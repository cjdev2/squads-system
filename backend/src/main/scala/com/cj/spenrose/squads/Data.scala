package com.cj.spenrose.squads

import java.time.LocalDate

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonInclude.Include
import com.fasterxml.jackson.annotation.JsonIgnore

case class Data(
    chapters:List[Chapter],
    squads:List[Squad],
    people:List[Person],
    missions:List[Mission] = List(),
    alumni:Option[List[Person]] = Some(List())) {
  
  
  @JsonIgnore
  def everyoneWhoReportsTo(name:String):Seq[Person] = {
    val directSlots = people.filter(_.lead == Some(name))
    val directs = directSlots.filter(_.kind == "person")
    val indirects = directSlots.map(_.name).flatMap(everyoneWhoReportsTo)
    directs ++ indirects
  }
}

case class Mission(
    key:String,
    name:String,
    label:String,
    aliases:Option[List[String]] = None,
    people:List[Person] = List(),
    domain:SquadDomain = SquadDomain()){
  
    @JsonIgnore
    def matches(n:String) = {
     val m = this
     val identifiers = (m.key +: m.name +: m.aliases.toList.flatten).map(_.trim.toLowerCase)
     val x = n.trim.toLowerCase()
     val result = identifiers.toSet.contains(x)
     result
   }
  
}

case class Squad(
    id:String,
    aliases:List[String],
    location:String,
    people:List[String] = List(),
    lead:String,
    missions:List[String] = List(),
    label:String
)

@JsonInclude(Include.NON_NULL)
case class Person(
   @JsonProperty("employeeId")
    maybeEmployeeID:Option[String],
    name:String,
    kind:String,
    first:String,
    last:String,
    title:Option[String],
    chapter:String, 
    lead:Option[String], 
    location:String,
    @JsonProperty("requisitionNumber")
    maybeRequisitionNumber:Option[String],
    @JsonProperty("hireDate")
    maybeHireDateString:Option[String],
    googleAccountEmail:Option[String]){


  @JsonIgnore
  def getNumericEmployeeIdOrBomb():Long = maybeEmployeeID.map(_.toLong).getOrElse( throw new RuntimeException(s"No employee ID for '${name}'"))

  @JsonIgnore
  def maybeHireDate():Option[LocalDate] = {
    maybeHireDateString.map{str=>
      val Array(year, month, day) = str.split("-").map(_.toInt)
      LocalDate.of(year, month, day)
    }
  }
  
  @JsonIgnore
  def isPlaceholder = name.contains("open")

  @JsonIgnore
  def requisitionNumberByNamePattern:Option[Int] = {
    val Pattern = """open-[^0-9]*([0-9]+)[^0-9]*""".r
    name match {
      case Pattern(number) if (number.length > 3) => Some(number.toInt)
      case _ =>  None
    }
  }

  @JsonIgnore
  def requisitionNumber:Option[Int] = {
    val numbers = (maybeRequisitionNumber.map(_.toInt) ++ requisitionNumberByNamePattern)

    numbers.headOption
  }
}

case class SquadDomain(
    existingFeatures:List[String] = List(),
    existingArchitecture:List[String] = List(),
    businessUnits:List[String] = List()) {
  
  @JsonIgnore
  def isEmpty = existingFeatures.isEmpty && existingArchitecture.isEmpty && businessUnits.isEmpty
}

case class Chapter(
    name:String, 
    @JsonProperty("core-skills")
    coreSkills:List[String],
    lead:String)