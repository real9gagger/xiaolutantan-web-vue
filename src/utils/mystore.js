function myStore(){
	this.NAME_PREFIX = ("xlttweb_");
}

myStore.prototype.get = function(name, defval){
	return localStorage.getItem(this.NAME_PREFIX + name) || defval;
}

myStore.prototype.getObject = function(name, remove){
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

myStore.prototype.pick = function(name, defval){
	let keyname = this.NAME_PREFIX + name;
	let value = localStorage.getItem(keyname);
	localStorage.removeItem(keyname);
	return (value || defval);
}

myStore.prototype.set = function(name, value){
	localStorage.setItem(this.NAME_PREFIX + name, value);
}

myStore.prototype.setObject = function(name, obj){
	localStorage.setItem(this.NAME_PREFIX + name, JSON.stringify(obj));
}

myStore.prototype.remove = function(name){
	localStorage.removeItem(this.NAME_PREFIX + name);
}

myStore.prototype.clear = function(){
	localStorage.clear();
}

myStore.prototype.onceObject = function(name, obj){
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

myStore.prototype.onceString = function(name, obj){
	if(obj === undefined){
		return sessionStorage.getItem(this.NAME_PREFIX + name);
	} else if (obj === null){
		sessionStorage.removeItem(this.NAME_PREFIX + name);
	} else {
		sessionStorage.setItem(this.NAME_PREFIX + name, obj);
	}
	return null;
}

export default (new myStore());