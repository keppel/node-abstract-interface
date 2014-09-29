var Interface = function(opts) {
  this.methods = opts.methods || [];
  this.strict = opts.strict || true;
}

var getTypeString = function(type){
  if(type === Object) return "object";
  if(type === String) return "string";
  if(type === Number) return "number";
  if(type === Boolean) return "boolean";
  return type;
}

var buildTypeCheck = function(argSchema, argName) {
  if(!argSchema || !argName) return ""
  var typeCheck = "if(typeof " + argName + " !== 'undefined'){\n"
  if(argSchema.required === true){
    typeCheck = "if(true){\n"
  }
  if(argSchema === Array || argSchema.type === Array){
    var check = "if(!(" + argName + " instanceof Array)) throw new Error('Expected " + 
      argName + " to be Array. Got ' + typeof " + argName +" +' instead')"
    if(!argSchema.required){
      check = "if(typeof " + argName + " !== 'undefined'){\n" + check + "\n}"
    }
    return check;
  }
  if(typeof getTypeString(argSchema) === "string" || argSchema.type){
    var check = "if(typeof " + argName + " !== '" + getTypeString(argSchema.type || argSchema)
      + "') throw new Error('Invalid type for " + argName + ". Got ' + typeof " +argName +"+', expected " +
      getTypeString(argSchema.type || argSchema) + "')";
    
    if(!argSchema.required){
      check = "if(typeof " + argName + " !== 'undefined'){\n" + check + "\n}"
    }

    return check;
  }
  if(typeof argSchema === "function" || typeof argSchema.iterator === "function"){
    var check = "if(!(" + (argSchema.iterator || argSchema).toString() + ")(" + argName +
      ")) throw new Error('Invalid argument:  " + argName + "')"
    if(!argSchema.required){
      check = "if(typeof " + argName + " !== 'undefined'){\n" + check + "\n}"
    }
    return check;
  }
  return "";
}


Interface.prototype.isSatisfiedBy = function(instance){
  if(typeof instance !== "object"){
    return false;
  }
  for(var i in this.methods){
    if(this.methods[i] === true){
      if(!typeof instance[i] === "function"){
        return false;
     }
    }
    else if(this.methods[i] instanceof Array){
      var method = instance[i]
      if(typeof method !== "function"){
        return false;
      }
      //method is defined.. now check the arguments
      var args = method.toString().split("(")[1].split(")")[0].split(/\s*,\s*/g)
      //args is an array of the names of arguments.
      // if an interface defines an argument, that function at least needs a parameter for it!
      if(args.length < this.methods[i].length){
        return false;
      }
      if(this.strict){
        var typeChecks = [];
        for(var j in this.methods[i]){
          typeChecks.push(buildTypeCheck(this.methods[i][j], args[j]))
        }
        // now rebuild method to include typechecking snippet
        instance[i] = eval("(" + method.toString().split("{")[0] + "{\n" +
          typeChecks.join("\n") +
          method.toString().split("{")[1] + ")")
      }
    } else{
      return false
    }
  }
  return true
}
module.exports = Interface