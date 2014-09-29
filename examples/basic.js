var Interface = require('../index.js')

var robotMethodsSpec = {
  beep: true, // function by this name just needs to exist

  boop: [ // or define a more complex method and describe its arguments as an array
    Number, // first arg better be a number or omitted. Else, kaBOOM!
    "string", // typeof secondArg should be either "string" or "undefined". || EXPLODE!
    {type: "boolean", required: true}, //specify that an argument isn't optional with required: true
    {required: true, predicate: function(value){ 
      // type-check passes if predicate returns true. Predicate is passed the appropriate argument
      return true
    }},
    function(arg){ // Shorthand predicate function. Implement your own validation logic
      return arg.foo === "bar"
    },
    {type: Array, required: true}
  ] 
}

var robotInterface = new Interface({
  methods: robotMethodsSpec,
  strict: true // inject type-checking snippets into the robot instance. true by default.
})

var robot = {
  beep: function(){
  
  },
  boop: function(a, b, c, d, e, f){
    return a + d;
  }
}
var satisfied = robotInterface.isSatisfiedBy(robot)
console.log(satisfied) // true
console.log(robot.boop(1, "woot", false, 5, {foo: "bar"}, [] )) // 6
