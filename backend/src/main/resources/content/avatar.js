
	function blankIfUndefined(v){
		if(v) return v;
		else return "";	
	}
	

	function parseQueryString(){
		var query = window.location.search;
		var q = query.length>1?query.substring(1):"";
		var pairStrings = q.split("&");
		var map = {};
		
		_.each(pairStrings, function(str){
			var kv = str.split("=");
			var key = kv[0];
			var value = kv.length>0?kv[1]:undefined;
			map[key] = value;
		});
		
		return map;
	}
	function firstTwoWords(n){
		var words = n.split(" ");
		if(words.length>=2){
			return words[0] + " " + words[1];
		}else {
			return words[0];
		}
	}
	function renderAvatar(person, view, opts){
		var name;
		if(!opts) opts = {};
		var badges = opts["badges"];
		var mouseover = opts["mouseover"];
		var mouseout = opts["mouseout"];
		
		
		if(person.kind == "requisition"){
			name = firstTwoWords(person.title);
		}else {
			name =  blankIfUndefined(person.first) + ' ' + blankIfUndefined(person.last);
		}
        var f = $('<div class="avatar person" >' + 
    			    '<div class="badge-holder">' + 
    			    '</div>' +
        			'<img class="picture" draggable="true"/>' +
        			'<div class="name">' + name + '</div>' + 
        		  '</div>');
        
        var object = {
			person:person,
			view:f
		};
        
        if(badges){
        	var icons = {
        		"SquadLead" : "squad-lead.png",
        		"ChapterLead" : "chapter-lead.png",
        		"Telecommute" : "telecommute.png", 
        		"Manager" : "whistle.png"
        	};
        	
            _.each(badges, function(badgeName){
            	var badgeUrl = icons[badgeName];
            	if(badgeUrl) {
                	f.find(".badge-holder").append('<img class="badge" src="' + badgeUrl + '" style=""/>');
            	}
            });
        	
        }else{
        	f.find(".badge-holder").remove();
        }
        
        if(mouseover) {
        	f.on("mouseover", function(){
        		mouseover(object);
        	});
        }
        if(mouseout){
        	f.on("mouseout", function(){
        		mouseout(object);
        	});
        }
        
        var imageUrl; 
        if(parseQueryString().hasOwnProperty("nofaces")){
        	imageUrl = "stickfigure.jpg"
        }else{
        	imageUrl = "/people/" + person.name + "/logo";
        }
        
        if(person.name.indexOf("need") == 0){
        	f.addClass("needed");
        }
        
        f.find("img.picture").attr("src", imageUrl);

        var badgeList = "";
        _.each(badges, function(badgeName){
        	if(badgeList.length>0){
        		badgeList += ", "
        	}
        	badgeList += badgeName;
        });
        if(badgeList.length>0){
        	badgeList = " [" + badgeList + "]";
        }
        
		makeTooltip(f, person.name + " " + badgeList + "(" + person.chapter + ", " + person.lead + ") (" + blankIfUndefined(person.title) + " " + person.location + ")")
		f.on("dragstart", function(ev){
			ev.originalEvent.dataTransfer.setData("person", JSON.stringify(person));
		});
		
		f.appendTo(view);
		
		return object;
	}