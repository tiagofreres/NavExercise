var render = function(tmpl, data){
	var regexp = /\{\{:(\w*)\}\}/gm;
	tmpl = tmpl.replace(regexp, function(match, p){
		return data[p];
	});
	return tmpl;
};