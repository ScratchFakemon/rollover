const ConfigTypes = {
  Boolean: "BOOLEAN",
  Number: "NUMBER",
  String: "STRING",
  Array: "ARRAY",
  Object: "OBJECT",
  Color: "COLOR"
};

window.ConfigTypes = ConfigTypes;

window.Configuration = [
  {
    name: "Ignore unknown commands",
    description: "When active, unknown commands will be treated as comments instead.",
    path: "commands.ignoreUnknown",
    type: ConfigTypes.Boolean,
    default: false
  },
  /*
    TO-DO: Add the extended features (more commands)
  */
  {
    name: "Typeset",
    description: "Changes the command set. Usually should be kept as-is to avoid any unexpected issues.",
    path: "commands.typeset",
    type: ConfigTypes.Object,
    default: `{"a":"a","c":"c","[":"[","]":"]","g":"g","i":"i","n":"n","p":"p","u":"u"}`,
    dangerous: true
  }
];
