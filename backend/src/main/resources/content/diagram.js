
function parseQuery(){
	var s = window.location.search;
	var pairsString;
	if(s.indexOf('?')===0){
		pairsString = s.substring(1);
	}else{
		pairsString = s;
	}
	var pairs = {};
	_.each(pairsString.split("&"), function(pairString){
		var parts = pairString.split("=");
		var name = parts[0];
		if(name!==""){
			var value;
			if(parts.length>1){
				value = parts[1];
			}
			pairs[name] = value;
		}
	});
	
	return pairs;
}

function toQueryString(o){
	var string = "";
	
	_.each(o, function(value, name){
		var separator = "";
		
		if(string.length>0){
			separator = "&";
		}else{
			separator = "?";
		}
		
		var v = "";
		if(value){
			v = "=" + value;
		}
		
		string = string + separator + name + v;
		
	});
	
	return string;
}

function toggleParam(name, value){
	var parts = parseQuery();
	if(parts.hasOwnProperty(name)){
		delete parts[name];
	}else{
		parts[name] = value;
	}
	window.location = window.location.pathname + toQueryString(parts) + window.location.hash;
}

function paramCheckbox(selector, paramName, value){
	var checkbox = $(selector);
	var parts = parseQuery();
	
    console.log(parts[paramName] + " vs " + value)
    console.log(parts)
    
	checkbox.prop('checked', parts[paramName] === value);
	
	checkbox.click(function(e){
		toggleParam(paramName, value);
		e.stopPropagation();
	});
}


paramCheckbox(".real-people-checkbox", "onlyrealpeople", "true")
paramCheckbox(".faces-checkbox" , "nofaces", "true")



function addDragDropEvents(element){
	element.on("dragenter", function(e){
		//console.log("dragenter", idx);
		element.addClass("drophover");
	});
	element.on("dragleave", function(e){
		//console.log("dragleave", idx);
		element.removeClass("drophover");
	});

	element.on("dragover", function(e){
		//console.log("dragover", idx);
		e.preventDefault();
		element.addClass("drophover");
	});
}

var alumniBucket = $(".alumni-bucket");

alumniBucket.on("drop", function(e){
	var person = JSON.parse(e.originalEvent.dataTransfer.getData("person"));
	$.post("/alumni", JSON.stringify(person.name));
	window.location.reload();
});
addDragDropEvents(alumniBucket);



function getValueOnly(){
	var d = $.Deferred();
	
	var getPromise = $.get.apply($, arguments)
	getPromise.done(function(value){
		d.resolve(value);
	});
	getPromise.fail(function(value){
		d.reject(value);
	});
	
	return d;
}

function defaultOnError(promise, defaultValue){
	var p = $.Deferred();
	
	promise.done(function(){
		p.resolve.apply(this, arguments);
	});
	promise.fail(function(){
		p.resolve(defaultValue);
	});
	
	return p.promise();
}


$.get("/problems").done(function(problems){
	if(problems.length>0){
		var warningIcon = $('<a href="/problems" target="_blank"><img class="main-menu-item warning-icon" src="/warning.png"/></a>');
		makeTooltip(warningIcon, "There are " + problems.length + " problems.");
		$(".main-menu").append(warningIcon);
	}
	
});

var full = false;
$(".page-title").click(function(){

	
	
   
   $(".name").click();
   setTimeout(function(){
       if(full){
       $(".squad")
            .removeClass("maximized");
       $(".drawer, .people")
            .removeClass("maximized");

       }else{
       $(".squad")
            .addClass("maximized")
            .css("width", "initial");
       $(".drawer, .people")
            .addClass("maximized");

       }

       full = !full;
   
    }, 2000);

});



$.ajax({url:"data.js", dataType:"json"})
.fail(function( x, y, z){
	console.log( y, z);
})
.done(function(data){
	var squads = _.sortBy(data.squads, "label");

	function isRealPerson(person){
		return person.name.toLowerCase().indexOf("open")==-1 && person.name.toLowerCase().indexOf("need")==-1;
	}
	function personShouldShow(person){
		if(parseQueryString().hasOwnProperty("onlyrealpeople")){
			return isRealPerson(person);
		}else{
			return true;
		}
	}
	
	var everyone = data.people;	
			       
	function getPersonByName(name){
		var person = _.find(everyone, function(p){
			return p.name === name;
		});
		
		if(!person){
			throw "Could not find record for " + name;
		}
		return person;
	}
	function isChapter(type){
		return function (person){
			return person.chapter === type;
		}
	}
	
	function percentage(n){
		return Math.floor(n * 100) + "%";
	}

    function runChain(chain){
        var promise = $.Deferred().resolve().promise();
        _.each(chain, function(t){
            promise = promise.pipe(t);
        });
    }

    function mkString(array, initial, separator, last){
       if(array.length > 0){
           return initial + array.join(separator) + last;
       } else {
           return "";
       }
    }

	function renderStats(squads){
		var everyone = _.filter(data.people, personShouldShow);
		function chapterMembers(){
			return _.flatten(_.map(arguments, function(chapter){
				return _.filter(everyone, isChapter(chapter));
			}));
		}
		
		var engineers = chapterMembers("operations", "apis", "security", "data", "frontend");
		var products = chapterMembers("product");
		var others = _.difference(everyone, _.union(engineers, products));
		var totalEngineers = engineers.length;

		var totalproducts = products.length;
		var numSquads = Object.keys(squads).length;

		var stats = $('<div class="stats"></div>');

		stats.append(
				totalproducts + " product owners, " + 
				totalEngineers + " engineers, " +
				others.length + " others, " +
				numSquads + " missions, ",
				percentage(totalEngineers / (numSquads*6)) 
                    + " engineering staffed (assuming 6/squad), " + 
				percentage(totalproducts / numSquads) 
                    + " product owner staffed (assuming 1/squad) " 
				
				);
		return stats;
	}

	renderStats(squads).appendTo($("body").find(".stats"))

	
	function renderSquads(squads, where){

		var specialKinds = ["product", "frontend", "operations", "apis", "security", "data"];
		var tiers = makeTiers();

		function makeTiers(){
			var tiers = [];
			var allKinds = _.unique(_.pluck(everyone, "chapter"));
			var otherKinds = _.difference(allKinds, specialKinds);
			
			_.each(specialKinds, function(kind){
				tiers.push({chapters:[kind]});
			}); 

			tiers.push({chapters:otherKinds});
			
			
			_.each(tiers, function(tier){
				function personIsInTier(name){
					var person = getPersonByName(name);
					var chapter = person.chapter;
					var idx = tier.chapters.indexOf(chapter);
					return idx != -1;
				}
				var max =_.max(_.map(squads, function(squad){
					var numPeopleInTier = _.filter(squad.people, personIsInTier).length;
					return numPeopleInTier;
				})); 
				
				tier.size = max > 1? max : 1;
				
			});
			return tiers;
		}

		var sidebar = $('<div class="squad labelsquad">' + 
                '<div class="people">' + 
                '<div class="name">&nbsp;</div>' + 
				'</div>' +  
                '</div>');
		
		_.each(tiers, function(displayTier){
			var name = displayTier.chapters.length == 1 ? displayTier.chapters[0] : "other";
			var view = $('<div class="tier" ><div class="chapter-name">' + name + '</div></div>');
			var placeholder = '<img class="avatar placeholder" src="placeholder.png"/>';
			function addPlaceholder(){
				var f = $(placeholder);
				f.appendTo(view);
			}
			
//			for(x=0;x<displayTier.size;x++){
//				addPlaceholder();
//			}
			view.appendTo(sidebar.find(".people"));
		});
		
		where.append(sidebar);
		
		function mailtoLinkForSquad(squad){

			var people = _.map(squad.people, getPersonByName);
			var realPeople = _.filter(people, isRealPerson)
			var emailAddressesSorted = _.map(realPeople, function(person){return person.name + "@cj.com";}).sort();
			return 'mailto:' + emailAddressesSorted;
		}
		
		var tribeAvatars = _.flatten(_.map(squads, function(squad, idx){
			//console.log(squad);
			var missionNames = _.map(squad.missions, function(missionKey){
				return _.findWhere(data.missions, {key:missionKey}).name;
			});
			
			var quotedAliases = _.map(squad.aliases, function(alias){
				return '"' + alias + '"';
			});
			
			var allNames = quotedAliases.concat(missionNames);
			
			var labelClass = squad.label.replace("/", "_") + "-squad";
			var view = $('<div class="squad ' + labelClass + '">' + 
                    '<div class="people">' + 
                        '<div class="name squad-name">' + mkString(allNames, "", ",<br/>", "") + '</div>' + 
					'</div>' +  
                    '<div class="drawer"></div>' + 
                    '</div>');
            var people = view.find(".people");

            var drawer = view.find(".drawer");
            
            
			function renderType(squadName, chapterName, people, expectedCount, where, squadLead, mouseover, mouseout){
				var view = $('<div class="tier" ></div>');
	
				var avatars = _.map(people, function(person){
					var badges = [];
					
					if(squadLead == person.name){
						badges.push("SquadLead");
					}
					if(person.location != squad.location){
						badges.push("Telecommute");
					}
					/* if(_.some(everyone, function(p){return p.lead == person.name})){
						badges.push("Manager");
					} */
					
					if(_.some(data.chapters, function(c){return c.lead == person.name})){
						badges.push("ChapterLead")
					}
					
					return renderAvatar(person, view, {
						badges:badges,
						mouseover:mouseover,
						mouseout:mouseout});
				});
				/*
				var placeholder = '<img class="avatar placeholder" src="placeholder.png"/>';
				function addPlaceholder(){
					var f = $(placeholder);
					f.appendTo(view);
				}
				
				for(x=0;x<(expectedCount - people.length);x++){
					addPlaceholder();
				}
				*/
				
				view.on("drop", function(e){
					var person = JSON.parse(e.originalEvent.dataTransfer.getData("person"));
					e.originalEvent.preventDefault();
					var change = {who:person.name, maybeNewSquad:squadName,
							maybeNewChapter:chapterName};
					$.post("/moves", JSON.stringify(change));
					window.location.reload();
				});
				
				where.append(view);
				
				return {avatars:avatars};
			}

			drawer.hide();
			
            var expanded = false;

			view.find(".name").click(function(){
            	
				drawer.html('<a class="email-squad-button" href="' + mailtoLinkForSquad(squad) + '"><img src="email.png"></a>');
	            
                
                _.each(squad.missions, function(missionKey){
                	var mission = _.findWhere(data.missions, {key: missionKey});
                	
                	
                	function render(missionText, backlog){
                        var domainSections = {
                            "Feature Domain":mission.domain.existingFeatures,
                            "Architectural Domain":mission.domain.existingArchitecture,
                            "Business Units":mission.domain.businessUnits
                        };

                        var numSections = _.flatten(_.values(domainSections)).length;

                        var domainMarkdown = numSections === 0 ? "\n\n# Domain\nNot Yet Defined" :                                
                                   _.map(domainSections, function(items, name){
                                       return mkString(items, "\n\n# " + name + "\n - ", "\n - ", "");
                                   }).join(""); 

                        var backlogLines = _.map(backlog, function(item){
                        	var icon = item.iconUrl && item.iconUrl!=="" ? "![Alt text](" + item.iconUrl + ")" : ""
                        	return icon + "[" + item.name + "](" + item.link + ")";
                        });
                        
                        var markdown = '# Mission\n' + 
                                   missionText + '\n' + 
                                   domainMarkdown + '\n' + 
                                   "\n# Upcoming Projects\n" + 
                                   mkString(backlogLines, "\n - ", "\n - ", "\n")
                                   ;

                        var existing = drawer.html() 
                        if(drawer.text().length>0) existing += "<hr>";
                        drawer.html(existing + marked(markdown)); 
                        
                        window.foo = backlog;
                    }
                	
            		$.when(
            				defaultOnError(getValueOnly("/missions/" + mission.key + "/mission"), "Not Yet Defined"),
            				defaultOnError(getValueOnly("/missions/" + mission.key + "/backlog"), []))
            		 .done(render);
                });
                
                /*
                var width = expanded ? 120 : 500;

                var chain = [
                   function(){
                       return view.animate({width:width}, {duration:500});
                   },
                   function(){
                        return drawer.fadeToggle();
                   }
                ];

                if(expanded){chain.reverse();}
                
                runChain(chain);
                expanded = !expanded;
                */
                drawer.slideToggle()
			});
			
			
			
			var members = _.filter(_.map(squad.people, getPersonByName), personShouldShow);
			
			
			var mouseover = function(avatar){
				
				var reports = _.filter(avatars, function(a){
					return a.person.lead == avatar.person.name;
				});
				
				_.each(avatars, function(a){
					a.view.toggleClass("highlighted", a.person.lead == avatar.person.name || a.person.name == avatar.person.name);
				});
				
			};
			
			var mouseout = function(person){
				_.each(avatars, function(a){
					a.view.toggleClass("highlighted", false);
				});
			};
			
			var squadAvatars = _.flatten(_.map(tiers, function(displayTier, chapterName){
				function membersForChapter(chapter){
					return _.filter(members, isChapter(chapter));
				}
				var peeps = _.flatten(_.map(displayTier.chapters, membersForChapter));
				return renderType(
						squad.id,
						displayTier.chapters[0],
						peeps, 
						displayTier.size, 
						people,
						squad.lead,
						mouseover,
						mouseout).avatars;
			}));
			function addDragDropEvents(element){
				element.on("dragenter", function(e){
					//console.log("dragenter", idx);
					view.addClass("drophover");
				});
				element.on("dragleave", function(e){
					//console.log("dragleave", idx);
					view.removeClass("drophover");
				});
	
				element.on("dragover", function(e){
					//console.log("dragover", idx);
					e.preventDefault();
					view.addClass("drophover");
				});
			}
			function r(v){
				addDragDropEvents(v);
				v.children().each(function(e){
					r($(e));
				});
			}
			
			r(view);
			
			
			where.append(view);
			
			return squadAvatars;
		}));
		
		avatars = _.union(avatars, tribeAvatars);
		
		//
	}

	var avatars = [];
//	renderSquads(squads, $("body"));
	/*
	*/

	var sortSelect = $("body").find(".sort-select");
	
	function squadNames(squad){
		return (squad.aliases?squad.aliases:[]).concat(squad.missions);
	}
	
	function firstSquadName(squad){
		var names = squadNames(squad);
		var n =  names[0];
		return n.toLowerCase();
	}
	var squadsByLabel = _.groupBy(squads, "location");
	
	function redraw(){
		var sortFunctions = {
				name:firstSquadName,
				location:"location",
				size:function(s){return - s.people.length;}
		}
		var sortSelection = sortSelect.val();
		if(sortSelection==="awesomeness"){
			alert("All the teams are awesome");
			window.location = "https://www.latlmes.com/tech/we-love-all-the-teams-1";
			return;
		}
		var sortFn = sortFunctions[sortSelection]
		var sortedSquads = _.sortBy(squads, sortFn);
		

		var where = $("body").find(".squads");
		where.empty();
		renderSquads(sortedSquads, where);
	}
	
	redraw();
	
	sortSelect.bind("change", redraw)
	
//	_.each(_.keys(squadsByLabel).sort().reverse(), function(label){
//		var squads = squadsByLabel[label];
//		var labelArea = $('<div class="label"><h2>' + label + '</h2></div>');
//		//renderStats(squads).appendTo(labelArea);
//
//		renderSquads(squads, labelArea);
//		$("body").find(".squads").append(labelArea);	
//	});

	var assignedPeople = _.flatten(_.pluck(squads, "people"));
	var allPeople = _.pluck(data.people, "name");
	var unassignedPeople = _.difference(allPeople, assignedPeople)
	
	var peeps = _.map(unassignedPeople, getPersonByName);
	_.each(peeps, function(person){
		var dugoutDiv = $("body").find(".dugout");
		//console.log("dugoutDiv", dugoutDiv);
		renderAvatar(person, dugoutDiv);
	});
	//console.log("People", unassignedPeople )
});