package com.cj.spenrose.squads

case class CompiledMission(
    staticData:Mission,
    jiraNames:List[String], 
    jiraBacklog:List[JiraBacklogItem])
    
case class CompiledSquad(
    staticData:Squad,
    missions:List[CompiledMission])
    
case class CompilationProblem(component:String, issues:List[String])
  
case class CompiledData(
    missions:List[Mission],
    squads:List[CompiledSquad], 
    problems:List[CompilationProblem],
    people:List[Person])
    
object CompiledData {    
  def compile(staticData: => Data):CompiledData = {
//      val jiraSquadNames = issues.map(_.fields.primaryComponentName).distinct
//
//      println(jiraSquadNames + ":" + jiraSquadNames.mkString(","))
      
      val compiledSquads = staticData.squads.map{s=>
        
        val compiledMissions = s.missions.map{m=>
          val mission = staticData.missions.find(_.key == m).getOrElse(throw new Exception("No mission named " + m))
//          val jiraNames = jiraSquadNames.filter{
//              case null => false
//              case name => mission.matches(name)
//          }
          
//          val backlogIssues = jiraNames.flatMap({jiraName => issues.filter(_.fields.primaryComponentName == jiraName)})
          CompiledMission(mission, jiraNames = List(), jiraBacklog=List())
        }
        
        
        CompiledSquad(staticData = s, missions = compiledMissions)
      }
      
      val mappedJiraNames = compiledSquads.flatMap(_.missions).flatMap(_.jiraNames)
//      val jiraImpliedSquadNames = jiraSquadNames.filterNot{n=>mappedJiraNames.contains(n)}
//      println("mapped jira names: " + mappedJiraNames.mkString("\n"))
          
//      val unmappedJiraIssues = issues.filter{issue=>
//          val swimlaneValue = issue.fields.primaryComponentName
//          swimlaneValue == null || !mappedJiraNames.contains(swimlaneValue)
//      }
//      val jiraProblems = CompilationProblem("JIRA",
//            jiraImpliedSquadNames.map{name=>s"JIRA refers to a squad named '$name', but there is no mapping from that to my list of squads."}
//            ++
//            unmappedJiraIssues.map{issue=>s"JIRA Issue is not assosciated with a squad: ${issue.key} - ${issue.fields.summary}"}
//            )
      
//      val staticDataProblems = CompilationProblem("Static Data",
//              staticData.missions
//               .filterNot(mission=> jiraSquadNames.filter(_!=null).exists(mission.matches))
//               .map(_.key + " is not present in JIRA")
//               )
//            
//      val managementHeirarchyProblem = CompilationProblem(
//          "heirarchy", 
//          issues=staticData.people.flatMap{person=>
//            val directReports = staticData.people.filter(_.lead.getOrElse(null) == person.name )
//            val maybeLead = person.lead.flatMap(leadName=>staticData.people.find( _.name == leadName))
//            maybeLead match {
//              case Some(lead) => {
//                if(directReports.size == 0 && lead.chapter != person.chapter){
//                  Some(person.name + " doesn't have the same chapter as their supervisor")
//                }else{
//                  None
//                }
//              }
//              case None => None
//            }
//          })
      val unassignedMissions =staticData.missions.filterNot({mission=> 
         val assignedMissionNames = staticData.squads.flatMap(_.missions)
         assignedMissionNames.toSet.contains(mission.key)
      })
      println("Unassigned Missions:" + unassignedMissions.mkString(","))
      
      val unassignedMissionsProblem = CompilationProblem(
          "orphaned missions", 
          issues=unassignedMissions.map(_ + " is not assigned to a squad"))
          
      val otherProblems = compiledSquads.flatMap(_.missions).map{m=>
        val emptyBacklog = if(m.jiraBacklog.size == 0) Seq("Backlog is empty") else Seq()
        
        val maybeMission = Option(getClass().getResource("/content/missions/" + m.staticData.key + ".md"))
        val missingMission = maybeMission match {
          case Some(_) => List()
          case None => List("Doesn't have a mission")
        }
        
        val noDomain = if(m.staticData.domain.isEmpty) List("Has no business/architectural/feature domain") else List()
        
        CompilationProblem(
            component = m.staticData.key, 
            issues = noDomain ++ missingMission ++ emptyBacklog)
      }
      
      val assignedPeople = staticData.squads.flatMap(_.people).toSet
      val missingAssignments = staticData.people.map({person=>
        if(assignedPeople.contains(person.name)){
          None
        }else{
          Some(person.name + " is not assigned to a squad")
        }
        
      }).flatten
      
      val assignmentProblems = List(CompilationProblem(component="assignments", issues = missingAssignments))
      
      CompiledData(
          missions = staticData.missions,
          people = staticData.people,
          squads = compiledSquads,
          problems = (
//            managementHeirarchyProblem
//            +:
            unassignedMissionsProblem
            +:
            otherProblems
            :::
            assignmentProblems).filterNot(_.issues.isEmpty)
      )
  }
}