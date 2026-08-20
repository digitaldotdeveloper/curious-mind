/* Curious Mind — shared app engine. Classic script; runs from file:// */
(function(){
"use strict";

var CM = window.CM = {};
var LS = {
  cart:"cm.cart", saved:"cm.saved", library:"cm.library", progress:"cm.progress",
  theme:"cm.theme", cur:"cm.currency", country:"cm.country", orders:"cm.orders", promo:"cm.promo"
};

/* ---------- tiny helpers ---------- */
function $(s,r){ return (r||document).querySelector(s); }
function $$(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
function el(tag,cls,html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
function esc(s){ return String(s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
CM.$=$; CM.$$=$$; CM.el=el; CM.esc=esc;

function read(key,fallback){
  try{ var v=localStorage.getItem(key); return v==null?fallback:JSON.parse(v); }
  catch(e){ return fallback; }
}
function write(key,val){ try{ localStorage.setItem(key,JSON.stringify(val)); }catch(e){} }
CM.read=read; CM.write=write;

CM.book = function(id){ for(var i=0;i<CATALOGUE.length;i++) if(CATALOGUE[i].id===id) return CATALOGUE[i]; return null; };
CM.param = function(n){ try{ return new URLSearchParams(location.search).get(n); }catch(e){ return null; } };

/* ---------- money / locale ---------- */
CM.currency = function(){ var c=read(LS.cur,null); return (c && CURRENCIES[c]) ? c : "USD"; };
CM.setCurrency = function(c){ if(!CURRENCIES[c]) return; write(LS.cur,c); document.dispatchEvent(new CustomEvent("cm:currency")); };
CM.country = function(){ return read(LS.country,null); };
CM.setCountry = function(c){ write(LS.country,c); };
CM.countryInfo = function(code){ for(var i=0;i<COUNTRIES.length;i++) if(COUNTRIES[i].c===code) return COUNTRIES[i]; return null; };

CM.convert = function(usd){ return usd * CURRENCIES[CM.currency()].rate; };
CM.money = function(usd, curCode){
  var code = curCode || CM.currency(), c = CURRENCIES[code];
  var v = usd * c.rate;
  var s = v.toFixed(c.dec);
  if(c.dec>0) s = s.replace(/\B(?=(\d{3})+(?!\d))/g,",");
  else s = String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,",");
  return c.after ? (s+" "+c.sym) : (c.sym+s);
};

/* Guess a sensible starting currency once, from the browser's locale. */
(function seedCurrency(){
  if(read(LS.cur,null)) return;
  var loc="";
  try{ loc = (navigator.languages&&navigator.languages[0]) || navigator.language || ""; }catch(e){}
  var m = /[-_]([A-Za-z]{2})$/.exec(loc);
  if(m){
    var info = CM.countryInfo(m[1].toUpperCase());
    if(info){ write(LS.cur, info.cur); write(LS.country, info.c); }
  }
})();

/* ---------- store state ---------- */
CM.cart    = function(){ return read(LS.cart,[]); };
CM.saved   = function(){ return read(LS.saved,[]); };
CM.library = function(){ return read(LS.library,[]); };
CM.orders  = function(){ return read(LS.orders,[]); };

CM.inCart    = function(id){ return CM.cart().indexOf(id)>-1; };
CM.isSaved   = function(id){ return CM.saved().indexOf(id)>-1; };
CM.owns      = function(id){ return CM.library().indexOf(id)>-1; };

CM.addToCart = function(id){
  var b=CM.book(id); if(!b) return false;
  if(CM.owns(id)){ CM.toast("You already own “"+b.title+"”.",{href:"library.html",label:"Library"}); return false; }
  var c=CM.cart();
  if(c.indexOf(id)>-1){ CM.toast("“"+b.title+"” is already in your bag.",{href:"cart.html",label:"View bag"}); return false; }
  c.push(id); write(LS.cart,c); CM.syncCounts(true);
  CM.toast("Added “"+b.title+"” to your bag.",{href:"cart.html",label:"View bag"});
  document.dispatchEvent(new CustomEvent("cm:cart"));
  return true;
};
CM.removeFromCart = function(id){
  var c=CM.cart(), i=c.indexOf(id); if(i<0) return;
  c.splice(i,1); write(LS.cart,c); CM.syncCounts();
  document.dispatchEvent(new CustomEvent("cm:cart"));
};
CM.clearCart = function(){ write(LS.cart,[]); write(LS.promo,null); CM.syncCounts(); document.dispatchEvent(new CustomEvent("cm:cart")); };

CM.toggleSaved = function(id){
  var s=CM.saved(), i=s.indexOf(id), b=CM.book(id);
  if(i>-1){ s.splice(i,1); CM.toast("Removed “"+b.title+"” from your list."); }
  else { s.push(id); CM.toast("Saved “"+b.title+"” for later.",{href:"shop.html?view=saved",label:"See list"}); }
  write(LS.saved,s); CM.syncCounts(i<0);
  document.dispatchEvent(new CustomEvent("cm:saved"));
  return i<0;
};

CM.progress = function(id){ var p=read(LS.progress,{}); return id? (p[id]||0) : p; };
CM.setProgress = function(id,pct){ var p=read(LS.progress,{}); p[id]=pct; write(LS.progress,p); };

CM.promo = function(){ return read(LS.promo,null); };
CM.setPromo = function(code){ write(LS.promo,code); };

/* Totals in USD; VAT from the chosen country. */
CM.totals = function(){
  var ids=CM.cart(), sub=0;
  ids.forEach(function(id){ var b=CM.book(id); if(b) sub+=b.price; });
  var promo=CM.promo(), disc=0, plabel=null;
  if(promo && PROMOS[promo]){ disc = sub*PROMOS[promo].off; plabel=PROMOS[promo].label; }
  var ci=CM.countryInfo(CM.country()), vatRate = ci?ci.vat:0;
  var taxed = sub-disc;
  var vat = taxed*vatRate;
  return { sub:sub, disc:disc, promoLabel:plabel, vatRate:vatRate, vat:vat, total:taxed+vat, count:ids.length };
};

CM.placeOrder = function(details){
  var ids=CM.cart(), t=CM.totals();
  var lib=CM.library();
  ids.forEach(function(id){ if(lib.indexOf(id)<0) lib.push(id); });
  write(LS.library,lib);
  var orders=CM.orders();
  var no = "CM-" + String(100000 + Math.floor(Math.random()*899999));
  var order = { no:no, items:ids.slice(), totalUSD:t.total, currency:CM.currency(),
                email:details.email, country:details.country, date:new Date().toISOString() };
  orders.unshift(order); write(LS.orders,orders);
  CM.clearCart();
  return order;
};

/* ---------- icons ---------- */
var ICON = {
  bag:'<svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  heart:'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.6-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.6C19 15.4 12 20 12 20z"/></svg>',
  book:'<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5z"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>',
  moon:'<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  menu:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  arrow:'<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  globe:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/></svg>'
};
CM.icon = ICON;

/* ---------- cover art ---------- */
var ART = {
  orbit:function(a,b){ return '<circle cx="50" cy="120" r="46" fill="none" stroke="'+b+'" stroke-width=".7" opacity=".55"/><circle cx="50" cy="120" r="32" fill="none" stroke="'+b+'" stroke-width=".7" opacity=".45"/><circle cx="50" cy="120" r="18" fill="'+b+'" opacity=".55"/><circle cx="82" cy="104" r="4" fill="#fff" opacity=".85"/>'; },
  waves:function(a,b){ var o=""; for(var i=0;i<9;i++) o+='<path d="M-5 '+(86+i*11)+' Q 25 '+(74+i*11)+' 50 '+(86+i*11)+' T 105 '+(86+i*11)+'" fill="none" stroke="'+b+'" stroke-width=".9" opacity="'+(.5-i*.03)+'"/>'; return o; },
  grid:function(a,b){ var o=""; for(var r=0;r<7;r++) for(var c=0;c<5;c++) o+='<rect x="'+(10+c*17)+'" y="'+(74+r*15)+'" width="9" height="9" rx="2" fill="'+b+'" opacity="'+(.14+((r*5+c)%7)*.09)+'"/>'; return o; },
  peaks:function(a,b){ return '<path d="M0 170 L26 108 L48 148 L70 96 L100 170 Z" fill="'+b+'" opacity=".6"/><path d="M0 170 L34 132 L62 170 Z" fill="#fff" opacity=".22"/><circle cx="74" cy="70" r="9" fill="#fff" opacity=".5"/>'; },
  burst:function(a,b){ var o=""; for(var i=0;i<16;i++){ var A=i*22.5*Math.PI/180; o+='<line x1="'+(50+16*Math.cos(A))+'" y1="'+(118+16*Math.sin(A))+'" x2="'+(50+44*Math.cos(A))+'" y2="'+(118+44*Math.sin(A))+'" stroke="'+b+'" stroke-width="1.1" opacity=".5"/>'; } return o+'<circle cx="50" cy="118" r="11" fill="#fff" opacity=".55"/>'; },
  moon:function(a,b){ var o='<circle cx="54" cy="118" r="34" fill="'+b+'" opacity=".7"/><circle cx="40" cy="108" r="30" fill="'+a+'"/>'; for(var i=0;i<12;i++) o+='<circle cx="'+(8+((i*29)%88))+'" cy="'+(60+((i*47)%110))+'" r="1.4" fill="#fff" opacity=".6"/>'; return o; },
  tide:function(a,b){ var o=""; for(var i=0;i<6;i++){ o+='<path d="M-5 '+(150-i*14)+' Q 30 '+(132-i*14)+' 55 '+(150-i*14)+' T 108 '+(146-i*14)+' L108 200 L-5 200 Z" fill="'+b+'" opacity="'+(.16+i*.05)+'"/>'; } return o+'<circle cx="70" cy="72" r="10" fill="#fff" opacity=".45"/>'; },
  ladder:function(a,b){ var o='<line x1="34" y1="60" x2="34" y2="180" stroke="'+b+'" stroke-width="1.2" opacity=".55"/><line x1="66" y1="60" x2="66" y2="180" stroke="'+b+'" stroke-width="1.2" opacity=".55"/>'; for(var i=0;i<8;i++) o+='<line x1="34" y1="'+(72+i*14)+'" x2="66" y2="'+(72+i*14)+'" stroke="'+b+'" stroke-width="1.2" opacity="'+(.65-i*.06)+'"/>'; return o; },
  rings:function(a,b){ var o=""; for(var i=0;i<7;i++) o+='<circle cx="50" cy="124" r="'+(9+i*8)+'" fill="none" stroke="'+b+'" stroke-width="1" opacity="'+(.6-i*.07)+'"/>'; return o; },
  dots:function(a,b){ var o=""; for(var r=0;r<9;r++) for(var c=0;c<6;c++){ var rad=((r*6+c)%5)*.55+1.1; o+='<circle cx="'+(12+c*15)+'" cy="'+(66+r*14)+'" r="'+rad+'" fill="'+b+'" opacity="'+(.25+((r+c)%4)*.14)+'"/>'; } return o; },
  arc:function(a,b){ var o=""; for(var i=0;i<5;i++) o+='<path d="M8 '+(180-i*6)+' A '+(42+i*6)+' '+(42+i*6)+' 0 0 1 92 '+(180-i*6)+'" fill="none" stroke="'+b+'" stroke-width="1.1" opacity="'+(.6-i*.09)+'"/>'; return o+'<circle cx="50" cy="150" r="6" fill="#fff" opacity=".5"/>'; }
};

/* A cover is a photographic/painted image when one has been generated into
   assets/covers/<id>.png, and the drawn SVG cover otherwise. The <img> is
   probed once per book; a missing file just leaves the drawn art in place. */
var COVER_IMG = {};
CM.coverHTML = function(b, opts){
  opts = opts||{};
  var art = (ART[b.art]||ART.orbit)(b.c[0], b.c[1]);
  return '<div class="cover'+(COVER_IMG[b.id]?" has-img":"")+'" data-cover="'+b.id+'" '+
      'style="background:linear-gradient(155deg,'+b.c[0]+','+b.c[1]+')">'+
      '<svg class="art" viewBox="0 0 100 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+art+'</svg>'+
      (COVER_IMG[b.id]!==false ? '<img class="coverimg" src="assets/covers/'+b.id+'.png" alt="" loading="lazy" decoding="async" onload="CM.coverOk(this)" onerror="CM.coverNo(this)">' : '')+
      '<span class="spine"></span><span class="gloss"></span>'+
      '<div class="ctx"><span class="by">'+esc(b.author)+'</span><h3>'+esc(b.title)+'</h3>'+
        '<span class="mark">Curious Mind</span></div>'+
    '</div>';
};
CM.coverOk = function(img){
  var c=img.closest(".cover"); if(!c) return;
  COVER_IMG[c.getAttribute("data-cover")]=true;
  c.classList.add("has-img","img-in");
};
CM.coverNo = function(img){
  var c=img.closest(".cover");
  if(c) COVER_IMG[c.getAttribute("data-cover")]=false;
  img.remove();
};

CM.stars = function(r){
  var o="", full=Math.round(r);
  for(var i=1;i<=5;i++) o+='<svg class="'+(i<=full?"":"off")+'" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.9l6-.8z"/></svg>';
  return '<span class="stars" role="img" aria-label="Rated '+r+' out of 5">'+o+'</span>';
};

/* A catalogue card. */
CM.bookCard = function(b){
  var owned = CM.owns(b.id);
  return '<article class="bookcard reveal" data-id="'+b.id+'">'+
    (b.badge?'<span class="ribbon">'+esc(b.badge)+'</span>':'')+
    '<a class="cover-link" href="book.html?id='+b.id+'" aria-label="'+esc(b.title)+' by '+esc(b.author)+'">'+CM.coverHTML(b)+'</a>'+
    '<div class="bc-body">'+
      '<h3><a href="book.html?id='+b.id+'">'+esc(b.title)+'</a></h3>'+
      '<p class="auth">'+esc(b.author)+'</p>'+
      '<div class="bc-foot">'+
        '<span class="pricetag">'+CM.money(b.price)+'</span>'+
        '<button class="savebtn" data-save="'+b.id+'" aria-pressed="'+(CM.isSaved(b.id)?"true":"false")+'" aria-label="Save '+esc(b.title)+' for later">'+ICON.heart+'</button>'+
        (owned
          ? '<a class="btn btn-quiet btn-sm" href="read.html?id='+b.id+'">Read</a>'
          : '<button class="btn btn-quiet btn-sm" data-add="'+b.id+'">Add</button>')+
      '</div>'+
    '</div></article>';
};

/* ---------- toast ---------- */
CM.toast = function(msg, action){
  var host = $(".toasts"); if(!host){ host = el("div","toasts"); document.body.appendChild(host); }
  var t = el("div","toast");
  t.innerHTML = ICON.check + '<span>'+esc(msg)+'</span>' +
    (action?' <a href="'+action.href+'">'+esc(action.label)+'</a>':'');
  host.appendChild(t);
  requestAnimationFrame(function(){ t.classList.add("in"); });
  setTimeout(function(){ t.classList.remove("in"); setTimeout(function(){ t.remove(); },500); }, action?4200:2800);
};

/* ---------- theme ---------- */
CM.theme = function(){ return read(LS.theme,null); };
CM.applyTheme = function(t){
  if(t) document.documentElement.setAttribute("data-theme",t);
  else document.documentElement.removeAttribute("data-theme");
};
CM.toggleTheme = function(){
  var cur = CM.theme();
  if(!cur) cur = matchMedia("(prefers-color-scheme: dark)").matches ? "dark":"light";
  var next = cur==="dark" ? "light":"dark";
  write(LS.theme,next); CM.applyTheme(next); CM.paintThemeBtn();
};
CM.paintThemeBtn = function(){
  var b=$("#themeBtn"); if(!b) return;
  var dark = document.documentElement.getAttribute("data-theme")==="dark" ||
             (!CM.theme() && matchMedia("(prefers-color-scheme: dark)").matches);
  b.innerHTML = dark?ICON.sun:ICON.moon;
  b.setAttribute("aria-label", dark?"Switch to light reading":"Switch to dark reading");
};
CM.applyTheme(CM.theme());

/* ---------- header / footer ---------- */
var NAV = [
  {href:"index.html", label:"Home"},
  {href:"shop.html",  label:"The Shelf"},
  {href:"library.html", label:"My Library"},
  {href:"about.html", label:"About"}
];
function here(){ var p=location.pathname.split("/").pop(); return p||"index.html"; }

CM.mountChrome = function(){
  var page = here();
  var curSel = '<label class="sr" for="curSel">Currency</label><select id="curSel" class="cursel" aria-label="Currency">'+
    Object.keys(CURRENCIES).map(function(k){
      return '<option value="'+k+'"'+(k===CM.currency()?" selected":"")+'>'+k+'</option>';
    }).join("")+'</select>';

  var header = el("header","site-header");
  header.innerHTML =
    '<div class="shell hbar">'+
      '<a class="brand" href="index.html">'+
        '<img src="assets/logo.webp" alt="" width="46">'+
        '<span class="bn">Curious Mind<span class="bs">Ebook Store</span></span>'+
      '</a>'+
      '<nav class="mainnav" aria-label="Primary">'+
        NAV.map(function(n){ return '<a href="'+n.href+'"'+(n.href===page?' aria-current="page"':'')+'>'+n.label+'</a>'; }).join("")+
      '</nav>'+
      '<div class="hicons">'+
        '<span class="curwrap">'+curSel+'</span>'+
        '<button class="iconbtn" id="themeBtn" aria-label="Toggle dark mode"></button>'+
        '<a class="iconbtn" href="shop.html?view=saved" aria-label="Saved books">'+ICON.heart+'<span class="badge" id="savedBadge">0</span></a>'+
        '<a class="iconbtn" href="cart.html" aria-label="Your bag">'+ICON.bag+'<span class="badge" id="cartBadge">0</span></a>'+
        '<button class="iconbtn burger" id="burger" aria-label="Open menu" aria-expanded="false">'+ICON.menu+'</button>'+
      '</div>'+
    '</div>';
  document.body.insertBefore(header, document.body.firstChild);

  var drawer = el("div","drawer");
  drawer.id="drawer";
  drawer.innerHTML = '<div class="dscrim" data-dclose></div><div class="dpanel" role="dialog" aria-modal="true" aria-label="Menu">'+
    '<div class="dhead"><span class="kicker">Menu</span><button class="iconbtn" data-dclose aria-label="Close menu">'+ICON.x+'</button></div>'+
    NAV.map(function(n){ return '<a href="'+n.href+'"'+(n.href===page?' aria-current="page"':'')+'>'+n.label+'</a>'; }).join("")+
    '<a href="cart.html">Your bag</a>'+
    '<div class="dfoot">DRM-free EPUB &amp; PDF · delivered instantly worldwide</div>'+
  '</div>';
  document.body.appendChild(drawer);

  var footer = el("footer","site-footer");
  footer.innerHTML = '<div class="shell">'+
    '<div class="fgrid">'+
      '<a class="brand" href="index.html"><img src="assets/logo.webp" alt="" width="60">'+
        '<span class="bn">Curious Mind<span class="bs">Est. 2024</span></span></a>'+
      '<nav><b>Shop</b><a href="shop.html">Everything</a><a href="shop.html?cat=Essays">Essays</a>'+
        '<a href="shop.html?cat=Fiction">Fiction</a><a href="shop.html?view=saved">Saved</a></nav>'+
      '<nav><b>Reading</b><a href="library.html">My library</a><a href="about.html#formats">Devices &amp; formats</a>'+
        '<a href="about.html#faq">FAQ</a></nav>'+
      '<nav><b>Shop info</b><a href="about.html">About us</a><a href="about.html#contact">Contact</a>'+
        '<a href="about.html#faq">Refunds</a></nav>'+
    '</div>'+
    '<div class="legal"><span>&copy; 2026 Curious Mind — a quiet corner for readers.</span>'+
      '<span>DRM-free, always · Delivered instantly worldwide</span></div>'+
  '</div>';
  document.body.appendChild(footer);

  CM.paintThemeBtn();
  $("#themeBtn").addEventListener("click", CM.toggleTheme);
  $("#curSel").addEventListener("change", function(){ CM.setCurrency(this.value); });

  /* drawer */
  var burger=$("#burger");
  function openD(){ drawer.classList.add("on"); burger.setAttribute("aria-expanded","true");
    document.body.style.overflow="hidden"; var f=drawer.querySelector("a,button"); if(f)f.focus(); }
  function closeD(){ drawer.classList.remove("on"); burger.setAttribute("aria-expanded","false");
    document.body.style.overflow=""; burger.focus(); }
  burger.addEventListener("click", openD);
  drawer.addEventListener("click", function(e){ if(e.target.closest("[data-dclose]")) closeD(); });
  document.addEventListener("keydown", function(e){ if(e.key==="Escape" && drawer.classList.contains("on")) closeD(); });

  /* sticky shadow */
  var onScroll=function(){ header.classList.toggle("stuck", window.scrollY>10); };
  addEventListener("scroll",onScroll,{passive:true}); onScroll();

  CM.syncCounts();
};

CM.syncCounts = function(pop){
  var c=$("#cartBadge"), s=$("#savedBadge");
  if(c){ var n=CM.cart().length; c.textContent=n; c.classList.toggle("on",n>0);
    if(pop&&n>0){ c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop"); } }
  if(s){ var m=CM.saved().length; s.textContent=m; s.classList.toggle("on",m>0); }
};

/* ---------- ambient + reveal ---------- */
CM.mountAmbient = function(){
  var a=el("div","aura"); a.setAttribute("aria-hidden","true");
  a.innerHTML='<b class="a1"></b><b class="a2"></b><b class="a3"></b>';
  document.body.appendChild(a);
  var g=el("div","grain"); g.setAttribute("aria-hidden","true"); document.body.appendChild(g);
  if(matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  var blobs=$$(".aura b"), px=0;
  function paint(){ var y=scrollY; blobs.forEach(function(b,i){
    b.style.transform="translate3d("+(px*(12+i*8))+"px,"+(y*(0.04+i*0.03))+"px,0)"; }); }
  addEventListener("scroll",paint,{passive:true});
  addEventListener("pointermove",function(e){ px=(e.clientX/innerWidth-.5); paint(); },{passive:true});
};

/* ==========================================================================
   Scroll engine — reveal in/out, parallax, and a progress bar.
   Elements opt in with data-fx="up|down|left|right|scale|rise|fade|clip".
   Anything not tagged gets a sensible default from autoFX(), so every page
   animates without hand-tagging each element.
   ========================================================================== */
CM.scroll = (function(){
  var reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var io = null, parallax = [], raf = null, bar = null;

  /* which elements animate, and how, when nothing is specified */
  var DEFAULTS = [
    [".shead",            "up"],
    [".tile",             "rise"],
    [".bookcard",         "rise"],
    [".libcard",          "rise"],
    [".lineitem",         "up"],
    [".quote-block",      "scale"],
    [".cta-band",         "scale"],
    [".resume",           "up"],
    [".summary",          "right"],
    [".bcol",             "left"],
    [".detail",           "right"],
    [".factgrid",         "up"],
    [".toclist li",       "up"],
    [".faq details",      "up"],
    [".dl-item",          "up"],
    [".prose-page p",     "up"],
    [".prose-page h2",    "up"],
    [".worldgrid > *",    "rise"],
    [".empty",            "scale"],
    [".marq",             "fade"],
    [".pagehead > *",     "up"],
    [".grid-tiles > *",   "rise"],
    [".section > h2",     "up"],
    /* the reader: paragraphs fade in as you read — opacity only, so the text
       never shifts under the eye mid-sentence */
    [".chap h1",          "up"],
    [".chap p",           "fade"],
    [".chap .rule",       "fade"],
    [".endcap",           "up"],
    [".grid-books > *",   "rise"],
    [".libgrid > *",      "rise"]
  ];

  function tag(root){
    root = root || document;
    DEFAULTS.forEach(function(rule){
      CM.$$(rule[0], root).forEach(function(el){
        if(!el.hasAttribute("data-fx") && !el.closest("[data-fx-skip]")) el.setAttribute("data-fx", rule[1]);
      });
    });
    /* legacy .reveal markup keeps working */
    CM.$$(".reveal", root).forEach(function(el){
      if(!el.hasAttribute("data-fx")) el.setAttribute("data-fx","up");
    });
    /* stagger anything that sits in a row of siblings */
    CM.$$("[data-fx]", root).forEach(function(el){
      if(el.style.getPropertyValue("--fx-d")) return;
      var sibs = el.parentElement ? CM.$$(":scope > [data-fx]", el.parentElement) : [];
      if(sibs.length > 1){
        var i = sibs.indexOf(el);
        if(i > 0) el.style.setProperty("--fx-d", Math.min(i, 5) * 70 + "ms");
      }
    });
  }

  function observe(root){
    var items = CM.$$("[data-fx]:not([data-fx-seen])", root || document);
    if(!items.length) return;
    if(reduce){ items.forEach(function(el){ el.setAttribute("data-fx-seen",""); el.classList.add("fx-in"); }); return; }
    if(!io){
      io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          /* in when it enters, out when it leaves — so scrolling back up replays it */
          en.target.classList.toggle("fx-in", en.isIntersecting);
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    }
    items.forEach(function(el){ el.setAttribute("data-fx-seen",""); io.observe(el); });
  }

  /* --- parallax: data-par="0.18" moves the element against the scroll --- */
  function collectParallax(root){
    CM.$$("[data-par]:not([data-par-seen])", root || document).forEach(function(el){
      el.setAttribute("data-par-seen","");
      parallax.push({ el: el, k: parseFloat(el.getAttribute("data-par")) || 0.12 });
    });
  }
  function paint(){
    raf = null;
    var vh = innerHeight;
    for(var i = 0; i < parallax.length; i++){
      var p = parallax[i], r = p.el.getBoundingClientRect();
      if(r.bottom < -200 || r.top > vh + 200) continue;
      /* -1 at the bottom of the viewport, +1 at the top */
      var t = 1 - (r.top + r.height / 2) / (vh / 2 + r.height / 2);
      p.el.style.setProperty("--par", (t * p.k * 100).toFixed(2) + "px");
    }
    if(bar){
      var max = document.documentElement.scrollHeight - vh;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, scrollY / max) : 0) + ")";
    }
  }
  function onScroll(){ if(!raf) raf = requestAnimationFrame(paint); }

  return {
    mount: function(){
      bar = CM.el("span","scrollbar-fx");
      bar.setAttribute("aria-hidden","true");
      document.body.appendChild(bar);
      tag(); observe(); collectParallax();
      addEventListener("scroll", onScroll, {passive:true});
      addEventListener("resize", onScroll, {passive:true});
      paint();
    },
    /* call after injecting markup so new nodes join in */
    refresh: function(root){ tag(root); observe(root); collectParallax(root); onScroll(); }
  };
})();

/* kept for older call sites */
CM.reveal = function(root){ CM.scroll.refresh(root); };

/* ---------- global delegated actions ---------- */
document.addEventListener("click", function(e){
  var add=e.target.closest("[data-add]");
  if(add){ e.preventDefault(); CM.addToCart(add.getAttribute("data-add")); return; }
  var sv=e.target.closest("[data-save]");
  if(sv){ e.preventDefault(); var on=CM.toggleSaved(sv.getAttribute("data-save"));
    $$('[data-save="'+sv.getAttribute("data-save")+'"]').forEach(function(b){ b.setAttribute("aria-pressed",on?"true":"false"); });
    document.dispatchEvent(new CustomEvent("cm:savedchange")); return; }
});

/* Repaint prices anywhere when the currency changes. */
document.addEventListener("cm:currency", function(){
  $$("[data-usd]").forEach(function(n){ n.textContent = CM.money(parseFloat(n.getAttribute("data-usd"))); });
  document.dispatchEvent(new CustomEvent("cm:repaint"));
});

/* ---------- boot ---------- */
CM.boot = function(fn){
  function go(){
    CM.mountAmbient();
    CM.mountChrome();
    if(fn) fn();
    CM.scroll.mount();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",go);
  else go();
};
})();
