Symphotech ={};
(function($){

 var sequensable_def= function(p_plugin) {
  this.id= Math.random();
  this.liste_events=new Array();
  this.liste_actions=new Array();
  this.handler=null;
  this.plugin=p_plugin;
 }
 sequensable_def.prototype.getEvents = function() {
  return this.liste_events;
 }
 sequensable_def.prototype.addEvent = function(p_event,p_label) {
  this.liste_events.push({val:p_event, label:p_label});
 }
 sequensable_def.prototype.addAction = function(p_action,p_label) {
  this.liste_actions.push({val:p_action, label:p_label});
 }
 sequensable_def.prototype.getId = function() {
  return this.id;
 }
 sequensable_def.prototype.setId = function(p_id) {
  if(this.handler)
   this.handler.newId(this,p_id);
  this.id= p_id;
 }
 sequensable_def.prototype.getActions = function() {
  return this.liste_actions;
 }
 sequensable_def.prototype.getHandler = function() {
  return this.handler;
 }
 sequensable_def.prototype.getNode = function() {
  return this.handler.getNode(this);
 }
 sequensable_def.prototype.getPlugin = function() {
  return this.plugin;
 }
 sequensable_def.prototype.setHandler = function(p_handler) {
  this.handler=p_handler;
 }
 sequensable_def.prototype.dispatch=function(p_event, parametre) {
  this.handler.dispatch(this,p_event,parametre);
 }
 sequensable_def.prototype.handle=function(p_action, parametre) {
  this[p_action](parametre);
 }
    Symphotech.Sequensable = sequensable_def;


 var sequensable_link_event_def =function(p_seq) {
        this.seq =p_seq;
  this.actions={};
 }
 sequensable_link_event_def.prototype.addAction = function(p_seq,p_action,p_time) {
  if(typeof this.actions[p_action] == 'undefined')
   this.actions[p_action]={};
  this.actions[p_action][p_seq.getId()]={seq:p_seq,time:p_time};
 };
 sequensable_link_event_def.prototype.eachAction = function(p_func) {
  for(var i in this.actions )
   for(var j in this.actions[i])
    p_func.call(this.actions[i][j],i);
 };
 sequensable_link_event_def.prototype.isEmpty = function() {
  return _.isEmpty(this.actions);
 };
 sequensable_link_event_def.prototype.removeActions = function(p_seq) {
  _.each(this.actions,function(p_action,index) {
   if(p_action[p_seq.getId()])
    this.removeAction(p_seq,index);
  },this)
 }
 sequensable_link_event_def.prototype.removeAction = function(p_seq,p_action) {
  if(this._handle(p_seq,p_action)) {
   delete this.actions[p_action][p_seq.getId()];
   if(_.isEmpty(this.actions[p_action]))
    delete this.actions[p_action];
  }
 };
 sequensable_link_event_def.prototype._handle = function(p_seq,p_action) {
  if(typeof this.actions[p_action] != 'undefined')
   if(typeof this.actions[p_action][p_seq.getId()] != 'undefined')
    return true;
  return false;
 };
 sequensable_link_event_def.prototype.toJSON = function() {
  var l_actions = [];
  _.each(this.actions,function(p_action,p_index) {
   _.each(p_action,function(p2_action) {
    l_actions.push({action:p_index,seq:p2_action.seq.getId(),time:p2_action.time});
   })
  })
  return l_actions;
 };
    sequensable_link_event_def.prototype.cleanup =function(p_seq) {
    }
 sequensable_link_event_def.prototype.fromJSON = function(data) {
  var parent = this;
  _.each(data,function(p_adata,p_name) {
   parent.addAction(p_adata.seq,p_adata.action ? p_adata.action : p_name ,p_adata.time);
  })
 };
 Symphotech.SequensableLinkEvent = sequensable_link_event_def;


 var sequensable_link_node_def =function(p_seq) {
  this.seq =p_seq;
  this.events={};
 }
 sequensable_link_node_def.prototype.addEvent = function(p_event,p_seq,p_action,p_time) {
  if(typeof this.events[p_event] == 'undefined')
   this.events[p_event]=new Symphotech.SequensableLinkEvent(this.seq);
  this.events[p_event].addAction(p_seq,p_action,p_time);
 };
 sequensable_link_node_def.prototype.removeEvent = function(p_event) {
  if(typeof this.events[p_event] != 'undefined')
   delete this.events[p_event];
 };
 sequensable_link_node_def.prototype.getEvent = function(p_event) {
        if(typeof this.events[p_event] != 'undefined')
            return this.events[p_event];
        return false;
    };
    sequensable_link_node_def.prototype.hasActions = function(p_event) {
  for(event in this.events) {
            return true;
        }
  return false;
 };
 sequensable_link_node_def.prototype.toJSON = function () {
  var json ={
   seq:this.seq.getId()
  };
  var l_events = {};
  _.each(this.events,function(p_event,p_name) {
   l_events[p_name]=p_event.toJSON();
  })
  json.events=l_events;
  return json;
 }
 sequensable_link_node_def.prototype.removeActions = function(p_seq) {
  _.each(this.events,function(p_event,n_event) {
   p_event.removeActions(p_seq);
   if( p_event.isEmpty() )
    this.removeEvent(n_event);
  },this)
 }
 sequensable_link_node_def.prototype.fromJSON = function (data) {
  var parent = this;
  _.each(data.events,function(p_event,p_name) {
   parent.events[p_name]=new Symphotech.SequensableLinkEvent(parent.seq);
   parent.events[p_name].fromJSON(p_event);
  })
 }
    sequensable_link_node_def.prototype.cleanup =function(p_seq) {
    }
 sequensable_link_node_def.prototype.getEvents = function () {
  var l_events = {};
  for(f_event in this.events ) {
   l_events[f_event]=[];
   this.events[f_event].eachAction(function(p_action) {
    l_events[f_event].push({action:p_action,seq:this.seq,time:this.time});
   });
  }
  return l_events;
 }
 Symphotech.SequensableLinkNode = sequensable_link_node_def;


 var sequensable_handler_def= function(argument) {
  this.list_links={};
  this.seqs={};
 }
 sequensable_handler_def.prototype._handle = function(p_seq) {
  return (typeof this.list_links[p_seq.getId()] != 'undefined');
 }
 sequensable_handler_def.prototype.removeActions = function(p_seq) {
  _.each(this.list_links,function(p_node) {
   p_node.removeActions(p_seq);
  })
 }
 sequensable_handler_def.prototype.add = function(p_seq) {
  this.seqs[p_seq.getId()]=p_seq;
  p_seq.setHandler(this);
 }
 sequensable_handler_def.prototype.newId = function(p_seq,p_id) {
  this.seqs[p_id]=p_seq;
 }
 sequensable_handler_def.prototype.link = function(p_sequensable1, p_event, p_sequensable2, p_action, p_time) {
  if(!this._handle(p_sequensable1))
   this.list_links[p_sequensable1.getId()] =new Symphotech.SequensableLinkNode(p_sequensable1);
  this.list_links[p_sequensable1.getId()].addEvent( p_event, p_sequensable2, p_action, p_time);
 }
 sequensable_handler_def.prototype.getNode = function(p_seq) {
  return this.list_links[p_seq.getId()];
 }
 sequensable_handler_def.prototype.getSeq = function(p_id) {
        if(this.seqs[p_id])
    return this.seqs[p_id];
 }
 sequensable_handler_def.prototype.unlinkEvent=function (p_sequensable,p_event) {
  if(this._handle(p_sequensable)) {
   this.list_links[p_sequensable.getId()].removeEvent(p_event);
  }
 }
 sequensable_handler_def.prototype.unlinkNode=function (p_sequensable) {
  if(this._handle(p_sequensable)) {
            delete this.list_links[p_sequensable.getId()];
            this.cleanup(p_sequensable);
  }
  this.removeActions(p_sequensable);
 }
    sequensable_handler_def.prototype.cleanup =function(p_seq) {
    }
 sequensable_handler_def.prototype.unlinkAction=function (p_sequensable1,p_event,p_sequensable2, p_action) {
  if(this._handle(p_sequensable1)){
   var e = this.getNode(p_sequensable1).getEvent(p_event);
   if (e){
    e.removeAction(p_sequensable2, p_action);
    if( e.isEmpty() )
     this.unlinkEvent(p_sequensable1,p_event);
   }
  }
 }
 sequensable_handler_def.prototype.dispatch = function (p_sender,p_event, parametre) {
  if(this._handle(p_sender)) {
   var node = this.list_links[p_sender.getId()];
   var m_event =node.getEvent(p_event);
   if(m_event){
    m_event.eachAction(function(action) {
     var parent =this;
     if(parseInt(this.time)){
                        setTimeout(function() {
                            parent.seq.handle(action,parametre);
                        },parseInt(this.time));
                    }
     else
      this.seq.handle(action,parametre);
    });
   }
  }
 }
 sequensable_handler_def.prototype.toJSON = function () {
  var json = [];
  _.each(this.list_links,function(p_node) {
   json.push(p_node.toJSON());
  })
  return json;
 }
 sequensable_handler_def.prototype.fromJSON = function (data) {
  this.list_links={};
  var parent =this;
  this._idToRef(data);
  _.each(data,function(p_ndata) {
            if(p_ndata.seq == undefined) return;
   var node = new Symphotech.SequensableLinkNode(p_ndata.seq);
   node.fromJSON(p_ndata);
   parent.list_links[p_ndata.seq.getId()] =node;
  })
 }
 sequensable_handler_def.prototype._idToRef = function (data) {
  var parent = this;
  _.each(data,function(p_ndata) {
            //p_ndata: node data
   p_ndata.seq = parent.getSeq(p_ndata.seq)
            _.each(p_ndata.events,function(p_edata) {
                // p_edata :event data
                _.each(p_edata,function(p_adata) {
                    p_adata.seq = parent.getSeq(p_adata.seq)
    })
   })
  })
 }
 Symphotech.SequensableHandler = sequensable_handler_def;

(function($) {
function createDom(settings){
    var $this = $(this);
    var events = ['click','mouseenter','mouseleave','mouseup touchend','mousedown touchstart'];
    for(l_event in events ){
        $this.on(events[l_event],null,events[l_event],function(event) {
            settings.seq.dispatch(event.data);
        });
    }
}
$.fn.SJDom = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJDom.defaults, options);
  return this.each(function() {
    createDom.call(this,opts);
  });
};
// default options
$.fn.SJDom.defaults = {
    seq:null,
};
})(jQuery);
(function($) {
// What does the SJErase plugin do?
    function onMove(event,settings,ctx)
    {
        var mx = null;
        var my = null;
        var canvasOffset = $(this).offset();
        // Les événements de souris doivent être gérés différemment pour la souris ou le tactile
        if ('ontouchstart' in document.documentElement) {
            event = event.originalEvent;
            mx = event.touches[0].pageX - canvasOffset.left;
            my = event.touches[0].pageY - canvasOffset.top;
        } else {
            mx = event.clientX + $(document).scrollLeft() - canvasOffset.left;
            my = event.clientY + $(document).scrollTop() - canvasOffset.top;
        }
        $('#text').html('my   ='+my+' my   ='+mx+'<br/>')
        // Crée un cercle
        ctx.beginPath();
        ctx.arc(mx, my, settings.radius, -Math.PI, Math.PI, false);
        ctx.fill();
        // Permet de faire des tracés plus fluides. Sans le bloc suivant on aurait que de gros points très espacés
        if( settings.oldx !== null && settings.oldy !== null)
        {
            ctx.beginPath();
            ctx.moveTo(settings.oldx,settings.oldy);
            ctx.lineTo(mx,my);
            ctx.stroke();
        }
        settings.oldx = mx, settings.oldy = my;
    }
function drawImage(canvas,image){
     var ctx = canvas.getContext('2d');
     ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}
function createErase(settings){
        var $this = $(this);
        var front = new Image;
        var load_callback = function() {
            var Hr = $this.height()/front.naturalHeight;
            var Wr = $this.width()/front.naturalWidth;
            var r =Math.min(Hr,Wr);
            var m_height = (r > 0) ? front.naturalHeight*r : front.naturalHeight;
            var m_width = (r > 0) ? front.naturalWidth*r : front.naturalWidth;
            var canvas = $('<canvas></canvas>',{height:m_height,width:m_width});
            canvas.attr('height',m_height);
            canvas.attr('width',m_width);
            drawImage(canvas.get(0),front);
            // Mode de composition permettant de "gommer l'image"
            var ctx = canvas.get(0).getContext('2d');
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = settings.radius*2;
            canvas.css('background-image','url("'+settings.backUrl+'")')
            canvas.css('background-size',''+canvas.width()+'px '+canvas.height()+'px')
            canvas.appendTo($this);
            if(settings.seq)
                settings.seq.reset=function(){
                ctx.globalCompositeOperation = 'source-over';
                drawImage(canvas.get(0),front);
                ctx.globalCompositeOperation = 'destination-out';
            }
            canvas.on("mousedown touchstart", function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    settings.oldx=null;settings.oldy=null;
                    onMove.call(this,event,settings,ctx);
                    canvas.on("mousemove touchmove", function(event){
                    event.preventDefault();
                    event.stopPropagation();
                    onMove.call(this,event,settings,ctx);
                });
            });
            $(document).on("mouseup touchend", function(event) {
                    canvas.off("mousemove touchmove");
            });
        }
            front.addEventListener('load',load_callback);
            front.src = settings.frontUrl;
    }
$.fn.SJErase = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJErase.defaults, options);
  return this.each(function() {
    createErase.call(this,opts);
  });
};
// default options
$.fn.SJErase.defaults = {
  radius:10
};
})(jQuery);
(function($) {
// What does the SJErase plugin do?
var createImage =function(settings) {
    var $this = $(this);
    var image = new Image;
    var load_callback = function() {
        var Hr = $this.height()/image.naturalHeight;
        var Wr = $this.width()/image.naturalWidth;
        var r =Math.min(Hr,Wr);
        var m_height = (r > 0) ? image.naturalHeight*r : image.naturalHeight;
        var m_width = (r > 0) ? image.naturalWidth*r : image.naturalWidth;
        $this.append(image);
        $(image).on('dragstart',function(event) {
            event.preventDefault()
        })
        image.style.height = m_height+'px';
        image.style.width = m_width+'px';
        image.alt = settings.alt;
    }
    image.addEventListener('load',load_callback);
    image.src = settings.url;
}
$.fn.SJImage = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJErase.defaults, options);
  return this.each(function() {
    createImage.call(this,opts);
  });
};
// default options
$.fn.SJImage.defaults = {
  seq:null,
};
})(jQuery);
(function($) {
// What does the SJMove plugin do?
var showfuncs={classique:'show',fade:'fadeIn',slidetop:'slideDown',slideleft:'slideRight'};
var hidefuncs={classique:'hide',fade:'fadeOut',slidetop:'slideUp',slideleft:'slideLeft'};
var togglefuncs={classique:'toggle',fade:'fadeToggle',slidetop:'slideToggle',slideleft:'slideLeftToggle'};
var create= function(settings) {
  var $this = $(this);
  if(settings.seq)
    settings.seq.move=function(){
      if(!settings.moves.length) return;
      this.dispatch('startmove');
      (function() {
        var i=0;
        var callback = function () {
          $this.animate({left:settings.moves[i].x,top:settings.moves[i].y},{
            duration:parseInt(settings.moves[i].time),
            easing :'linear',
            complete:function() {
              i++;
              if(i < settings.moves.length )
                callback();
              else
                settings.seq.dispatch('endmove')
            }
          })
        }
        callback();
      })();
    }
}
$.fn.SJMove = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJMove.defaults, options);
  return this.each(function() {
    create.call(this,opts);
  });
};
// default options
$.fn.SJMove.defaults = {
  time:0,
};
})(jQuery);
(function( $ ) {
$.fn.SJRot = function(options) {
    var settings = $.extend( {}, $.fn.SJRot.defaults, options );
    return this.each(function(){
        createRotate.call(this,settings);
    });
};
function getMousePos(canvas, e) {
    var parentOffset = $(canvas).offset();
    var touch = e.originalEvent.touches ? e.originalEvent.touches[0] : null;
    var mx = touch ? touch.pageX : e.pageX;
    var my = touch ? touch.pageY : e.pageY;
    var relX = mx - parentOffset.left;
    var relY = my - parentOffset.top;
        return {
          x: relX,
          y: relY
        };
    }
    function canPass(last,current,deltangle){
        // var lastid= last.x*last.y > 0 ? 1:-1;
        // var currentid= current.x*current.y > 0 ? 1:-1;
        var xid= last.x*current.x > 0 ? 1:-1;
        var yid= last.y*current.y > 0 ? 1:-1;
        if(xid == -1 && last.y < 0)
            return false;
        if(deltangle > Math.PI/2)
            return false;
        return true;
    }
function drawImage(canvas,image){
     var ctx = canvas.getContext('2d');
     ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}
function createRotate(settings){
    var calls=0;
    var $this = $(this);
    var front = new Image();
    var back = new Image();
    var load_callback = function() {
        calls++;
        if(calls < 2) return;
        var Hr = $this.height()/front.naturalHeight;
            var Wr = $this.width()/front.naturalWidth;
            var r =Math.min(Hr,Wr);
            var m_height = (r > 0) ? front.naturalHeight*r : front.naturalHeight;
            var m_width = (r > 0) ? front.naturalWidth*r : front.naturalWidth;
        var canvas = $('<canvas></canvas>',{height:m_height,width:m_width});
        canvas.attr('height',m_height);
        canvas.attr('width',m_width);
        if(typeof settings.center == 'undefined')
            settings.center={x:m_width/2,y:m_height/2};
        settings.R =Math.sqrt(Math.pow(m_height,2)+Math.pow(m_width,2));
        drawImage(canvas.get(0),front);
        // Mode de composition permettant de "gommer l'image"
        var ctx = canvas.get(0).getContext('2d');
        canvas.appendTo($this);
        settings.lastposition={x:1,y:1};
        settings.lastangle=-0.5*Math.PI;
        canvas.on("mousemove touchmove toucstart", function(event){
            event.preventDefault();
            event.stopPropagation();
            var pos = getMousePos(canvas,event);
            var Rp={x:pos.x- settings.center.x,y:pos.y- settings.center.y };
            var tan = Rp.y/Rp.x;
            var a =Math.atan(tan);
            if(Rp.x < 0 )
                a+=Math.PI;
            if(!canPass(settings.lastposition,Rp,Math.abs(settings.lastangle-a)))
                return;
            drawImage(canvas.get(0),front);
            ctx.save();
            ctx.beginPath();
            ctx.arc(settings.center.x, settings.center.y,settings.R, settings.start, a);
            ctx.lineTo(settings.center.x,settings.center.y);
            ctx.closePath();
            ctx.clip();
            drawImage(canvas.get(0),back);
            ctx.restore();
            settings.lastposition= Rp;
            settings.lastangle= a;
        });
    }
    front.addEventListener('load',load_callback);
    back.addEventListener('load',load_callback);
    back.src = settings.backUrl;
    front.src = settings.frontUrl;
}
$.fn.SJRot.defaults = {
    start:-0.5*Math.PI
};
})( jQuery );
(function($) {
// What does the SJShowHide plugin do?
var showfuncs={classique:'show',fade:'fadeIn',slidetop:'slideDown',slideleft:'slideRight'};
var hidefuncs={classique:'hide',fade:'fadeOut',slidetop:'slideUp',slideleft:'slideLeft'};
var togglefuncs={classique:'toggle',fade:'fadeToggle',slidetop:'slideToggle',slideleft:'slideLeftToggle'};
var create= function(settings) {
    var $this = $(this);
    if(settings.seq){
        settings.seq.show=function(){
            this.dispatch('startshow')
            $this[showfuncs[settings.effect]]({duration:parseInt(settings.time),queue:false,complete:function() {
                settings.seq.dispatch('endshow')
            }})
        }
        settings.seq.hide=function(){
            this.dispatch('starthide')
            $this[hidefuncs[settings.effect]]({duration:parseInt(settings.time),queue:false,complete:function() {
                settings.seq.dispatch('endhide')
            }})
        }
        settings.seq.toggle=function(){
            this.dispatch('starttoggle');
            var state = ($this.css('display') == 'none' ? 'show' : 'hide');
            this.dispatch('start'+state);
            $this[togglefuncs[settings.effect]]({duration:parseInt(settings.time),queue:false,complete:function() {
                settings.seq.dispatch('endtoggle')
                settings.seq.dispatch('end'+state);
            }} )
        }
    }
}
$.fn.SJShowHide = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJShowHide.defaults, options);
  return this.each(function() {
    create.call(this,opts);
  });
};
$.fn.slideLeftToggle = function(p_options) {
  return this.each(function() {
    $(this).animate({width:'toggle'},p_options)
  });
};
$.fn.slideLeft = function(p_options) {
  return this.each(function() {
    $(this).animate({width:'hide'},p_options)
  });
};
$.fn.slideRight = function(p_options) {
  return this.each(function() {
    $(this).animate({width:'show'},p_options)
  });
};
// default options
$.fn.SJShowHide.defaults = {
  time:0,
};
})(jQuery);
(function($) {
// What does the SJText plugin do?
var create= function(settings) {
    var $this = $(this);
    var $html =$('<div>'+settings.html+'</div>');
    if(settings.scrollbar){
    $html.css('max-height','100%')
    $html.css('overflow-x','hidden')
    }
    $this.append($html)
}
$.fn.SJText = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJText.defaults, options);
  return this.each(function() {
    create.call(this,opts);
  });
};
// default options
$.fn.SJText.defaults = {
  html:'',
};
})(jQuery);
(function( $ ){
    function moveCursor(event,settings) {
    var coords = getInnerPosition(event, this);
    var zoomFactor = settings.zoom; // Valeur de zoom entre les deux images
    var cursor = $(this).find('.cursor');
    var cursorWidth = cursor.width();
    var cursorHeight = cursor.height();
    //determination de la positon du curseur
    var cx = coords[0] - cursorWidth / 2;
    var cy = coords[1] - cursorHeight / 2;
    var maxCx = $(this).width() - cursorWidth;
    var maxCy = $(this).height() - cursorHeight;
    cx = Math.max(cx , 0);
    cy = Math.max(cy , 0);
    cx = Math.min(cx , maxCx);
    cy = Math.min(cy , maxCy);
    cursor.css("left", cx);
    cursor.css("top", cy);
    //calcule de la position du background
    var maxCx = $(this).width() - (cursorWidth/(zoomFactor * 2));
    var maxCy = $(this).height() - (cursorHeight/(zoomFactor * 2));
    cx = Math.max(coords[0] , cursorWidth/(zoomFactor * 2));
    cy = Math.max(coords[1] , cursorHeight/(zoomFactor * 2));
    cx = Math.min(cx, maxCx);
    cy = Math.min(cy , maxCy);
    cursor.css("background-position", ''+((-zoomFactor*cx)+(cursorWidth/2))+'px '+((-zoomFactor*cy)+(cursorHeight/2))+'px');
    settings.lastcx=cx;
    settings.lastcy=cy;
    }
function getInnerPosition(e, context) {
    var parentOffset = $(context).offset();
    var touch = e.originalEvent.touches ? e.originalEvent.touches[0] : null;
    var mx = touch ? touch.pageX : e.pageX;
    var my = touch ? touch.pageY : e.pageY;
    var relX = mx - parentOffset.left;
    var relY = my - parentOffset.top;
    return [relX, relY];
}
    function createZoom(settings){
        var $this = $(this);
        var front = new Image;
        var load_callback = function() {
            var Hr = $this.height()/front.naturalHeight;
            var Wr = $this.width()/front.naturalWidth;
            var r =Math.min(Hr,Wr);
            var m_height = (r > 0) ? front.naturalHeight*r : front.naturalHeight;
            var m_width = (r > 0) ? front.naturalWidth*r : front.naturalWidth;
            var div = $('<div></div>',{style:'position:relative;'});
            var cursor = $('<div></div>',{style:'opacity:0;height:'+settings.cursorsize_y+'px;width:'+settings.cursorsize_x+'px;position:absolute;top:0;','class':'cursor'});
            cursor.css('background-image','url("'+settings.backUrl+'")');
            cursor.css('background-size',(m_width*settings.zoom)+'px '+(m_height*settings.zoom)+'px');
            if(settings.shape == 'oval') {
                cursor.css('border-radius','50%');
            }
            div.height(m_height);
            div.width(m_width);
            div.append(front);
            front.style.height = m_height+'px';
            front.style.width = m_width+'px';
            div.append(cursor);
            div.appendTo($this);
            cursor.width(cursor.width());
            cursor.height(cursor.height());
            if(settings.seq){
                settings.seq.zoomin=function(){
                        settings.zoom++;
                        cursor.css('background-size',(m_width*settings.zoom)+'px '+(m_height*settings.zoom)+'px');
                        cursor.css("background-position", ''+((-settings.zoom*settings.lastcx)+(cursor.width()/2))+'px '+((-settings.zoom*settings.lastcy)+(cursor.height()/2))+'px');
                }
                settings.seq.zoomout=function(){
                        settings.zoom--;
                        if(settings.zoom < 1)settings.zoom=1;
                        cursor.css('background-size',(m_width*settings.zoom)+'px '+(m_height*settings.zoom)+'px');
                        cursor.css("background-position", ''+((-settings.zoom*settings.lastcx)+(cursor.width()/2))+'px '+((-settings.zoom*settings.lastcy)+(cursor.height()/2))+'px');
                }
            }
            div.bind("mousemove touchmove", function(event){
                event.preventDefault();
                moveCursor.call(this,event,settings);
            });
            div.bind("mouseenter touchstart", function (event) {
                event.preventDefault();
                moveCursor.call(this,event,settings);
                $(this).find('.cursor').css('display','block');
                $(this).find('.cursor').stop().animate({opacity: 1}, 200);
            } );
            div.bind("mouseleave touchend", function (event) {
                event.preventDefault();
                $(this).find('.cursor').stop().animate({opacity: 0}, 200,function(){$(this).css('display','none')});
            });
        }
        front.addEventListener('load',load_callback);
        front.src = settings.frontUrl;
}
$.fn.SJZoom = function(options) {
    options = options || {} ;
    var settings = $.extend({
        zoom : 1
        }, options );
    return this.each(function() {
        createZoom.call(this,settings);
    });
};
})( jQuery );
(function($) {
// What does the SJSound plugin do?
var createAudio= function(settings) {
    var $parent = $(this);
    var audio=$('<audio '+(settings.controls ? 'controls' :'')+'></audio>');
    if(!settings.controls)
    audio.css('display','none');
    if(settings.seq){
          settings.seq.reset=function(){
            audio[0].pause();
            audio[0].currentTime=0;
          }
          settings.seq.play=function(){
            if(audio[0].play)
                audio[0].play();
          }
          settings.seq.pause=function(){
            if(audio[0].pause)
                audio[0].pause();
          }
    }
    var load_callback = function() {
      var $this =$(this);
      if(settings.seq){
          $this.on('ended',function() {
            settings.seq.dispatch('end');
          })
          $this.on('play',function() {
            if( this.currentTime == 0)
              settings.seq.dispatch('start');
            settings.seq.dispatch('play');
          })
          $this.on('pause',function() {
            settings.seq.dispatch('pause');
          })
      }
    }
    $parent.append(audio);
    audio.on('loadedmetadata',load_callback);
    audio.attr('src',settings.src);
}
$.fn.SJSound = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJSound.defaults, options);
  return this.each(function() {
    createAudio.call(this,opts);
  });
};
// default options
$.fn.SJSound.defaults = {
  controls:false,
};
})(jQuery);
(function($) {
// What does the SJVideo plugin do?
var createYoutubePlayer = function(dom,height,width,settings) {
    var player = new YT.Player(dom, {
        height: height,
        width: width,
        videoId: settings.lien,
        events: {
            //'onReady': onPlayerReady,
            onStateChange: function (event) {
                switch(event.data) {
                    case YT.PlayerState.PLAYING:
                    settings.seq.dispatch('playing');
                    break;
                    case YT.PlayerState.PAUSED:
                    settings.seq.dispatch('paused');
                    break;
                    case YT.PlayerState.ENDED:
                    settings.seq.dispatch('ended');
                    break;
                }
            }
        }
    });
    settings.seq.play=function() {
        player.playVideo();
    }
    settings.seq.pause=function() {
        player.pauseVideo();
    }
    settings.seq.reset=function() {
        player.seekTo(0);
        player.pauseVideo();
    }
}
var createVimeoPlayer = function(dom,height,width,settings) {
    var id =Math.random()
    var iframe = $(' <iframe id="'+id+'" src="http://player.vimeo.com/video/'+settings.lien+'?api=1&player_id='+id+'" width="'+width+'" height="'+height+'" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
    iframe.appendTo(dom);
    player = $f(iframe[0]);
    player.addEvent('ready', function() {
    if(!iframe[0].contentWindow) return;
    player.addEvent('pause',function() {
        settings.seq.dispatch('paused');
    });
    player.addEvent('finish',function() {
        settings.seq.dispatch('ended');
    });
    player.addEvent('play', function() {
        settings.seq.dispatch('playing');
    });
    settings.seq.play=function() {
        player.api('play');
    }
    settings.seq.pause=function() {
        player.api('pause');
    }
     settings.seq.reset=function() {
        player.api('seekTo',0);
        player.api('pause');
    }
    });
}
var createDailymotionPlayer = function(dom,height,width,settings) {
    var player = new DM.player(dom, {
        height: height,
        width: width,
        video: settings.lien,
    });
    player.addEventListener("ended", function(e) {
        settings.seq.dispatch('ended');
    })
    player.addEventListener("playing", function(e) {
        settings.seq.dispatch('playing');
    })
    player.addEventListener("pause", function(e) {
        settings.seq.dispatch('pause');
    })
    settings.seq.play=function() {
        player.play();
    }
    settings.seq.pause=function() {
        player.pause();
    }
    settings.seq.reset=function() {
        player.seek(0);
        player.pause();
    }
}
var create= function(settings) {
    var $parent = $(this);
    var div=document.createElement('div');
    $parent.append(div);
    switch(settings.provider){
        case 'YT':
            createYoutubePlayer(div,$parent.height(),$parent.width(),settings);
        break;
        case 'DM':
            createDailymotionPlayer(div,$parent.height(),$parent.width(),settings);
        break;
        case 'VM':
            createVimeoPlayer(div,$parent.height(),$parent.width(),settings);
        break;
    }
}
$.fn.SJVideo = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJVideo.defaults, options);
  return this.each(function() {
    create.call(this,opts);
  });
};
// default options
$.fn.SJVideo.defaults = {
  controls:false,
};
})(jQuery);
(function($) {
// What does the SJPopup plugin do?
var create =function(settings) {
  var $this = $(this);
  //$this.css('box-shadow','0 0 25px 5px #999');
  if(settings.hasheader) {
    header = '<div class="popup-header" style="background-color:'+settings.header_color+'" >'+settings.header_title+'<span class="popup-close b-close"><span>X</span></span></div>'
  }
  else
    header = $('<span class="bbutton b-close"><span>X</span></span>');
  $this.append(header);
  if(settings.seq){
    settings.seq.close=function() {
      settings.seq.hide();
      settings.seq.dispatch('close');
    }
    settings.seq.open=function() {
      settings.seq.show();
      settings.seq.dispatch('open');
    }
    $this.find('.b-close').on('click',function() {
      settings.seq.close();
    });
  }
  // $this.append(span);
}
$.fn.SJPopup = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJPopup.defaults, options);
  return this.each(function() {
    create.call(this,opts);
  });
};
// default options
$.fn.SJPopup.defaults = {
};
})(jQuery);
(function( $ ) {
$.fn.SJSlideShow = function(options) {
    var settings = $.extend( {}, $.fn.SJSlideShow.defaults, options );
    return this.each(function(){
        createSlide.call(this,settings);
    });
};
function getMousePos(canvas, e) {
    var parentOffset = $(canvas).offset();
    var touch = e.originalEvent.touches ? e.originalEvent.touches[0] : null;
    var mx = touch ? touch.pageX : e.pageX;
    var my = touch ? touch.pageY : e.pageY;
    var relX = mx - parentOffset.left;
    var relY = my - parentOffset.top;
        return {
          x: relX,
          y: relY
        };
    }
function drawImage(canvas,image){
     var ctx = canvas.getContext('2d');
     ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}
function createSlide(settings){
    var calls=0;
    var $this = $(this);
    var front = new Image();
    var back = new Image();
    var load_callback = function() {
        calls++;
        if(calls < 2) return;
        var Hr = $this.height()/front.naturalHeight;
            var Wr = $this.width()/front.naturalWidth;
            var r =Math.min(Hr,Wr);
            var m_height = (r > 0) ? front.naturalHeight*r : front.naturalHeight;
            var m_width = (r > 0) ? front.naturalWidth*r : front.naturalWidth;
        var canvas = $('<canvas></canvas>',{height:m_height,width:m_width});
        canvas.attr('height',m_height);
        canvas.attr('width',m_width);
        settings.draw= true ;
        if(settings.event == 'drag') {
            settings.draw= false ;
            $(document).on('mouseup',function() {
                settings.draw=false;
            })
            $(canvas).on('mousedown touchmove',function() {
                settings.draw=true;
            })
        }
        settings.R =Math.sqrt(Math.pow(m_height,2)+Math.pow(m_width,2));
        drawImage(canvas.get(0),front);
        var ctx = canvas.get(0).getContext('2d');
        canvas.appendTo($this);
        var pos = {x:m_width*(100 - settings.opening)/100,y:m_height*(100 - settings.opening)/100};
        pos.x =Math.min(pos.x,m_width)
        pos.y =Math.min(pos.y,m_height)
        ctx.clearRect(0, 0, this.width, this.height)
        drawImage(canvas.get(0),front);
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x,pos.y,settings.R,settings.fi,settings.fi+Math.PI);
        ctx.lineTo(pos.x,pos.y);
        ctx.closePath();
        ctx.clip();
        drawImage(canvas.get(0),back);
        ctx.restore();
        if(settings.thikness != 0 ) {
            ctx.beginPath();
            ctx.moveTo(pos.x+settings.R*Math.cos(settings.fi),pos.y+settings.R*Math.sin(settings.fi));
            ctx.lineTo(pos.x-settings.R*Math.cos(settings.fi),pos.y-settings.R*Math.sin(settings.fi));
            ctx.lineWidth = settings.thikness;
            ctx.strokeStyle = settings.color;
            ctx.stroke();
        }
        delete pos;
        canvas.on("mousemove touchmove toucstart", function(event){
            event.preventDefault();
            if(!settings.draw) return;
            var pos = getMousePos(canvas,event);
            pos.x =Math.min(pos.x,m_width)
            pos.y =Math.min(pos.y,m_height)
            ctx.clearRect(0, 0, this.width, this.height)
            drawImage(canvas.get(0),front);
            ctx.save();
            ctx.beginPath();
            ctx.arc(pos.x,pos.y,settings.R,settings.fi,settings.fi+Math.PI);
            ctx.lineTo(pos.x,pos.y);
            ctx.closePath();
            ctx.clip();
            drawImage(canvas.get(0),back);
            ctx.restore();
            if(settings.thikness != 0 ) {
                ctx.beginPath();
                ctx.moveTo(pos.x+settings.R*Math.cos(settings.fi),pos.y+settings.R*Math.sin(settings.fi));
                ctx.lineTo(pos.x-settings.R*Math.cos(settings.fi),pos.y-settings.R*Math.sin(settings.fi));
                ctx.lineWidth = settings.thikness;
                ctx.strokeStyle = settings.color;
                ctx.stroke();
            }
        });
    }
    front.addEventListener('load',load_callback);
    back.addEventListener('load',load_callback);
    back.src = settings.backUrl;
    front.src = settings.frontUrl;
}
$.fn.SJSlideShow.defaults = {
    fi:0,
    thikness:5,
    opening:10,
    color:'#000',
};
})( jQuery );
(function($) {
function createLink(settings){
    if(settings.link != 'http://' && settings.link != '' )
    $(this).on('click',function() {
        window.open(settings.link,settings.window);
    })
}
$.fn.SJLink = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJLink.defaults, options);
  return this.each(function() {
    createLink.call(this,opts);
  });
};
// default options
$.fn.SJLink.defaults = {
    seq:null,
    link:'',
    window:'_blank',
};
})(jQuery);
(function($) {
// What does the SJFollowCursor plugin do?
function getInnerPosition(e, context) {
    var parentOffset = $(context).offset();
    var touch = e.originalEvent.touches ? e.originalEvent.touches[0] : null;
    var mx = touch ? touch.pageX : e.pageX;
    var my = touch ? touch.pageY : e.pageY;
    var relX = mx - parentOffset.left;
    var relY = my - parentOffset.top;
    return [relX, relY];
}
var create= function(settings) {
    var $this = $(this);
    var $parent = $this.parent()
    settings.z_index=$this.css('z-index')
    if($parent.length){
        settings.move= true;
        if(settings.event == 'drag') {
            settings.move= false ;
            $(document).on('mouseup touchend',function() {
                settings.move=false;
                $this.css('z-index',settings.z_index)
            })
            $this.on('mousedown touchstart',function(event) {
                settings.move=true;
                settings.mouse=getInnerPosition(event,this);
                $this.css('z-index','10000000')
            })
        }
        $parent.on("mousemove touchmove", function(event){
            if(!settings.move) return;
            event.preventDefault();
            var pos = getInnerPosition(event,this);
            var drawin =[pos[0],pos[1]]
            if(settings.vertical == 'mouse')
                drawin[0] -= settings.mouse[0];
            if(settings.horizontal == 'mouse')
                drawin[1] -= settings.mouse[1];
            if(settings.vertical == 'center')
                drawin[0] -= $this.width()/2;
            if(settings.horizontal == 'center')
                drawin[1] -= $this.height()/2;
            if(settings.vertical == 'right')
                drawin[0] -= $this.width();
            if(settings.horizontal == 'bottom')
                drawin[1] -= $this.height();
            if(pos[0] <= $parent.width() )
                $this.css('left',drawin[0]+'px')
            if(pos[1] <= $parent.height() )
                $this.css('top',drawin[1]+'px')
        });
    }
}
$.fn.SJFollowCursor = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJFollowCursor.defaults, options);
  return this.each(function() {
    create.call(this,opts);
  });
};
// default options
$.fn.SJFollowCursor.defaults = {
  html:'',
};
})(jQuery);
(function($) {
function createCursor(settings){
    $(this).css('cursor',settings.cursor);
}
$.fn.SJCursor = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJCursor.defaults, options);
  return this.each(function() {
    createCursor.call(this,opts);
  });
};
// default options
$.fn.SJCursor.defaults = {
    seq:null,
    cursor:'auto',
};
})(jQuery);
(function(jQuery) {
// What does the SJGoogleMap plugin do?
var listeners =[];
var loaded =false;
var loading =false;
var load = function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&callback=SJGoogleMapcallback';
    document.body.appendChild(script);
}
var create= function(settings) {
    var mapOptions = {
        zoom: parseInt(settings.zoom),
        center: new google.maps.LatLng(settings.latitude, settings.longitude)
    };
  var div =$('<div style="height:100%;width:100%"></div>').appendTo(this);
  var parent =this;
  setTimeout(function() {
    var map = new google.maps.Map(parent,mapOptions);
  },1000)
}
jQuery.fn.SJGoogleMap = function(options) {
    if (!this.length) { return this; }
    if (!loading){
        load();
        loading=true;
    }
    var opts = jQuery.extend(true, {}, jQuery.fn.SJGoogleMap.defaults, options);
    return this.each(function() {
        if(loaded)
            create.call(this,opts);
        else
           listeners.push({element:this,settings:opts})
    });
};
SJGoogleMapcallback=function() {
    loaded =true;
    for (var i = listeners.length - 1; i >= 0; i--) {
        create.call(listeners[i].element,listeners[i].settings)
    };
}
// default options
jQuery.fn.SJGoogleMap.defaults = {
    latitude:'',
    longitude:'',
    zoom:8,
};
})(jQuery);
(function($) {
// What does the pluginName plugin do?
checkremoval =function (img,settings) {
    if(document.body.contains(img)) {
        settings._added =true;
        return false;
    }
    if( !document.body.contains(img) && settings._added) return true;
    return false;
}
var nextFrame =function (img,settings){
    if(!settings.playing || checkremoval(img[0],settings)) return;
    settings.currentFrame++;
    var end = Math.min(settings.endat == '' ? settings.count : settings.endat ,settings.count);
    if(settings.currentFrame < end ){
        img.attr('src',settings.dir+settings.format.replace('%d',settings.currentFrame));
        setTimeout(function(){
            nextFrame(img,settings)
        },
        settings.delais[settings.currentFrame] ? settings.delais[settings.currentFrame] :settings.defaultDelai);
    }
    else if(!settings.loop) {
        settings.playing=false;
        if( typeof settings.onended == "function" )
            settings.onended.call(this,settings);
        settings.seq.dispatch('animationend')
    }
    if(settings.currentFrame >= end){
        settings.currentFrame=settings.startat;
        if(settings.loop)
            setTimeout(function(){
                nextFrame(img,settings)
                },
                settings.delais[settings.currentFrame] ? settings.delais[settings.currentFrame] :settings.defaultDelai
            );
    }
}
function createSequence(settings){
    var $this = $(this);
    var img = $('<img/>');
    var image = img[0];
    img.on('load',function (argument) {
        var Hr = $this.height()/image.naturalHeight;
        var Wr = $this.width()/image.naturalWidth;
        var r =Math.min(Hr,Wr);
        var m_height = (r > 0) ? image.naturalHeight*r : image.naturalHeight;
        var m_width = (r > 0) ? image.naturalWidth*r : image.naturalWidth;
        image.style.height = m_height+'px';
        image.style.width = m_width+'px';
        img.appendTo($this);
    })
    image.src = settings.dir+settings.format.replace('%d',settings.startat);
    settings.currentFrame=settings.startat;
    callback = function(event){
        if(settings.playing) return ;
        if( typeof settings.onstart == "function" )
            settings.onstart.call(this,event,settings);
        settings.playing=true;
        setTimeout(function(){
            nextFrame(img,settings)
        },
        settings.delais[settings.startat] ? settings.delais[settings.startat] :settings.defaultDelai);
    }
    settings.seq.play=function() {
        if(settings.playing) return ;
        settings.playing=true;
        setTimeout(function(){
            nextFrame(img,settings)
        },
        settings.delais[settings.currentFrame] ? settings.delais[settings.currentFrame] :settings.defaultDelai);
        settings.seq.dispatch('animationresume');
        if(settings.startat == settings.currentFrame )
        settings.seq.dispatch('animationstart')
    }
    settings.seq.pause=function(argument) {
        settings.playing=false;
    }
    settings.seq.stop=function(argument) {
        settings.playing=false;
        settings.currentFrame=settings.startat;
    }
    if(settings.autostart)
        callback.call(this);
}
function preloadImages(dir,format,count){
    images= new Array();
    for (var i = 1; i < count; i++) {
        images[i]=new Image();
        images[i].src =dir+format.replace('%d',i);
    };
}
$.fn.SJImageSequence = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend({}, $.fn.SJImageSequence.defaults, options);
  if(opts.count < 2 ) return this;
  return this.each(function() {
    preloadImages(opts.dir,opts.format,opts.count);
    createSequence.call(this,opts);
  });
};
// default options
$.fn.SJImageSequence.defaults = {
    seq:null,
    count:0,
    defaultDelai:70,
    delais:{},
    format: '%d.jpg',
    onstart: null,
    onended: null,
    dir:'images/',
    preload:true,
    loop:false,
    startat:0,
    endat:'',
    autostart:false
};
})(jQuery);
(function($) {
var infinit_rotation =function (rot,settings) {
  var $this = $(this);
  $(this).animate({ customRotation : rot }, {
  step: function(now,fx) {
    if(settings.pause){
      $this.stop();
      settings.rotating=false;
      return;
    }
    if(settings.stop){
      $this.stop();
      settings.rotating=false;
      return;
    }
    $(this).css({
          'transform':'rotate('+now+'deg)',
          '-webkit-transform':'rotate('+now+'deg)',
          '-ms-transform':'rotate('+now+'deg)',
          '-moz-transform':'rotate('+now+'deg)',
          '-o-transform':'rotate('+now+'deg)',
      });
    $(this).data('rot',now);
    },
    duration:parseInt(settings.time),
    easing :'linear',
    queue:false,
    complete:function() {
       infinit_rotation.call(this,rot+(settings.sens * 360),settings)
    }
  });
}
var create= function(settings) {
  var $this = $(this);
  var parent = this;
  settings.elapsed=0;
  var rot =$this.data('rot');
  $this.animate({ customRotation : rot}, {
      step: function(now,fx) {
          $(this).css({
              'transform':'rotate('+now+'deg)',
              '-webkit-transform':'rotate('+now+'deg)',
              '-ms-transform':'rotate('+now+'deg)',
              '-moz-transform':'rotate('+now+'deg)',
              '-o-transform':'rotate('+now+'deg)',
          });
          $(this).data('rot',now);
      },
        duration:0,
  });
    if(settings.seq){
        settings.seq.rotate =function () {
          if(settings.rotating) return;
          this.dispatch('startrotate');
          settings.pause = false;
          settings.stop = false;
          settings.rotating = true;
          var current_rot = $this.data('rot');
          var dest_rot = parseInt(settings.angle)+360*settings.loop;
          var time = Math.abs(settings.time/360*(dest_rot-current_rot));
        if(settings.infinit){
          infinit_rotation.call(parent,(settings.sens*360)+current_rot,settings)
        }
        else
        $this.animate({ customRotation : dest_rot}, {
        step: function(now,fx) {
          var rot =0;
          var dt = fx.end-fx.start;
          var dn = now-fx.start;
          var pt = dn/dt;
          if(settings.pause){
            settings.elapsed=pt;
            $this.stop();
            settings.rotating=false;
            return;
          }
          if(settings.stop){
            settings.elapsed=0;
            $this.stop();
            settings.rotating=false;
            return;
          }
          if(dt * settings.sens < 0 )
            rot = fx.start+((360-Math.abs(dt))*pt*settings.sens)
          else
            rot =now;
          $this.css({
                'transform':'rotate('+rot+'deg)',
                '-webkit-transform':'rotate('+rot+'deg)',
                '-ms-transform':'rotate('+rot+'deg)',
                '-moz-transform':'rotate('+rot+'deg)',
                '-o-transform':'rotate('+rot+'deg)',
            });
          $(this).data('rot',rot);
          },
          duration:parseInt(time*(1-settings.elapsed)),
          easing :'linear',
          queue :false,
          complete:function() {
             settings.seq.dispatch('endrotate');
             settings.elapsed=0;
          }
        });
      }
      settings.seq.stop =function () {
          settings.stop=true;
      }
      settings.seq.pause =function () {
          settings.pause=true;
       }
    }
}
$.fn.SJRotate = function(options) {
  if (!this.length) { return this; }
  var opts = $.extend(true, {}, $.fn.SJRotate.defaults, options);
  return this.each(function() {
    create.call(this,opts);
  });
};
// default options
$.fn.SJRotate.defaults = {
  time:0,
};
})(jQuery);
})(jQuery)
