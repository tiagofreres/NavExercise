/**
 * Simple template rendering
 * @param  {string} tmpl Template containg points of insertion 
 * marked with '{{:<variable>}}'
 * @param  {Object} data Data to be replaced on 'tmpl'
 * @return {string} 
 */
var render = function(tmpl, data){
	var regexp = /\{\{:(\w*)\}\}/gm;
	tmpl = tmpl.replace(regexp, function(match, p){
		return data[p];
	});
	return tmpl;
};