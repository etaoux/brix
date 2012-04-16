function output(tmpl,data){
	var s = Mustache.to_html(tmpl,data);
	s+="<script>addBehavior();</scr"+"ipt>";
	document.write(s);
}

function addBehavior(){
	var aa = document.getElementById("testa");
	alert(aa);
}
