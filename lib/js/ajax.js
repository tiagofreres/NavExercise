var ajax = function(url, callback){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = executeCallback;
	xhr.open('GET', url, true);
	xhr.send();
	return xhr;

	function executeCallback(){
		if (xhr.readyState === XMLHttpRequest.DONE) callback(xhr);
		else return;
	}
};