function myStorage(){
	this.NAME_PREFIX = ("xlttweb_");
}

myStorage.prototype.getValue = function(name, defval){
	return localStorage.getItem(this.NAME_PREFIX + name) || defval;
}

myStorage.prototype.getObject = function(name, remove){
	let keyname = this.NAME_PREFIX + name;
	let jsonStr = localStorage.getItem(keyname);
	
	if(remove){
		localStorage.removeItem(keyname);
	}
	
	if(jsonStr){
		try {
			return JSON.parse(jsonStr);
		} catch(ex) {
			console.error(ex);
		}
	}
	
	return null;
}

myStorage.prototype.pickValue = function(name, defval){
	let keyname = this.NAME_PREFIX + name;
	let value = localStorage.getItem(keyname);
	localStorage.removeItem(keyname);
	return (value || defval);
}

myStorage.prototype.setValue = function(name, value){
	localStorage.setItem(this.NAME_PREFIX + name, value);
}

myStorage.prototype.setObject = function(name, obj){
	localStorage.setItem(this.NAME_PREFIX + name, JSON.stringify(obj));
}

myStorage.prototype.removeItem = function(name){
	localStorage.removeItem(this.NAME_PREFIX + name);
}

myStorage.prototype.clearAll = function(){
	localStorage.clear();
}

myStorage.prototype.onceObject = function(name, obj){
	if(obj === undefined){
		let jsonStr = sessionStorage.getItem(this.NAME_PREFIX + name);
		if(jsonStr){
			return JSON.parse(jsonStr);
		}
	} else if (obj === null){
		sessionStorage.removeItem(this.NAME_PREFIX + name);
	} else {
		sessionStorage.setItem(this.NAME_PREFIX + name, JSON.stringify(obj));
	}
	return null;
}

myStorage.prototype.onceValue = function(name, obj){
	if(obj === undefined){
		return sessionStorage.getItem(this.NAME_PREFIX + name);
	} else if (obj === null){
		sessionStorage.removeItem(this.NAME_PREFIX + name);
	} else {
		sessionStorage.setItem(this.NAME_PREFIX + name, obj);
	}
	return null;
}

export default (new myStorage());