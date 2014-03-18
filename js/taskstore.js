// requires IE >= 9


var
  /**
   * Generate a unique ID
   *
   * @param {string} name - the name to use to generate the ID
   */
  generateId = function generateId (name) {
    return ( name ? name : Math.random().toString() )
    .replace(/[^a-zA-Z0-9]+/g, '')
    .substr(-10)
    .toLowerCase()
    + '_' + Date.now().toString();
  },

  /**
   * Task representation
   *
   * @constructor
   * @param {string|object} spec - either the name of the task
   *  or an object specitication for a new task
   */
  task = function task (spec) {

    var that = {
      name: (typeof spec === 'string')
      ? spec
      : (spec && spec.name ? spec.name : 'Task'),
      _meta: {
        ctime: Date.now()
      }
    };

    if (typeof spec !== 'string') {
      // could select specific properties from spec
      // but for simplicity, just copy all the spec's
      // own properties
      Object.getOwnPropertyNames(spec).forEach(function (pname) {
        that[pname] = spec[pname];
      });
    }

    that.id = that.id || generateId(that.name);

    return that;
  },
  
  /**
   * TaskApp representation
   *
   * @constructor
   * @param {String} name - name for this task app
   */
  taskApp = function taskApp (name) {
    var appName = name || 'Task App',
        taskLists = [],
        taskListsByName = {},

        that = {
          
          /**
           * find - find a task list by name
           * @param {String} name - name of the task list
           */
          find: function find (name) {
            var idx = taskListsByName[name];
            return (typeof idx === 'number') ? taskLists[idx] : null;
          },

          /**
           * add - add a new task list
           */
          add: function add (name) {
            name = name || 'Task List';
            if (! taskListsByName[name]) {
              taskLists.push(taskList(name));
              taskListsByName[name] = taskLists.length - 1;
              that.save();
              return taskLists[taskListsByName[name]];
            } else {
              return null; // should throw an error
            }
          },
          
          /**
           * remove - remove a task list
           */
          remove: function remove (name) {
            var idx = taskListsByName[name];

            if (typeof idx === 'number') {
              delete taskLists[idx];
              that.save();
              return true;
            }
            return false;
          },
          
          /**
           * forEach - call a function on each TaskList
           */
          forEach: function forEach (fn) {
            return taskLists.forEach(fn);
          },
          
          getAll: function getAll () {
            return taskLists;
          },

          /**
           * save - save the Task App state by saving task list names
           */
          save: function save () {
            var jsonToSave = JSON.stringify(taskLists.map(function (list) {
              return list.getName();
            }));
            localStorage.setItem(appName + ' [VERSION]', 1);
            localStorage.setItem(appName, jsonToSave);
          },

          /**
           * load - load the Task App state
           */
          load: function load () {
            var localItems = localStorage.getItem(appName),
            tmpLists = localItems ? JSON.parse(localItems) : null,
            storageVersion = localStorage.getItem(appName + ' [VERSION]');

            if (tmpLists) {
              // storageVersion doesn't really matter at this time
              // since the task constructor is flexible,
              // but here's how different versions could be handled
              switch (storageVersion) {

                case 1:
                case '1':
                  // just an array of list names
                  // FALLTHROUGH
                  tmpLists.forEach(function (listName) {
                    that.add(listName);
                  });
                  break;

                default:
                  throw new Error('Unknown task storage version')
                  break;
              }
            }
          },
        };

    that.load();
    return that;

  },

  /**
   * TaskList representation
   *
   * @constructor
   * @param {String} name - name for this task list
   */
  taskList = function taskList (name) {

    var listName = name || 'Task List',
        listId = generateId(),
        listVersion = 3,
        tasks = [],
        tasksById = {},
        that = {

          /**
           * clearAll - empty the task lsit
           */
          clearAll: function clearAll () {
            localStorage.clear();
            tasks = [];
          },
      
          /**
           * add - add a new task to the list
           * 
           * @param {Object} spec - object spec for the new task
           * @returns {String} task ID
           */
          add: function add (spec) {
            var newTask = task(spec);
            tasks.push(newTask);
            tasksById[newTask.id] = tasks.length - 1;
            that.save();
            return newTask.id;
          },

          /**
           * remove - remove a task from the list
           * 
           * @param {String} taskId - ID of the task to remove
           * @returns {Boolean} - true if the task was removed
           */
          remove: function remove (taskId) {
            var idx = tasksById[taskId],
            removed = 0;
            if (idx !== null) {
              delete tasksById[taskId];
              removed = tasks.splice(tasksById[taskId], 1).length;
              that.save();
            }

            return (removed === 1);
          },

          /**
           * get - find a task by task ID
           * 
           * @param {String} taskId - ID of the task to remove
           * @returns {Object} - the task, or null
           */
          get: function get (taskId) {
            return tasks[tasksById[taskId]];
          },

          getAll: function getAll () {
            return tasks;
          },

          getName: function getName () {
            return listName;
          },
          
          rename: function rename (newName) {
            that.listName = newName;
          },
          
          getId: function getId () {
            return listId;
          },

          forEach: function forEach (fn) {
            return tasks.forEach(fn);
          },

          find: function find (nameOrId) {
            var idx = tasksById[nameOrId],
            matches = [];

            if (!idx) {
              matches = tasks.filter(function (t) { return (t.name === nameOrId); });
            } else {
              matches.push(tasks[idx]);
            }
            return matches.length > 0 ? matches[0] : null;
          },

          search: function search (pattern, fields, flags) {
            var defaultFields = [ 'name', 'details' ];

            if (typeof fields === 'string') {
              flags = fields;
              fields = defaultFields;
            }

            fields = fields || defaultFields;
            flags = flags || 'i';

            if (typeof pattern === 'string') {
              pattern = new RegExp(pattern, flags);
            }
            if (pattern instanceof RegExp) {
              return tasks.filter(function (t) {
                return fields.some(function (field) {
                  return pattern.test(t[field]);
                });
              });
            }
            return [];
          },

          save: function save () {
            var tmp = {
              name: listName,
              id: listId,
              version: listVersion,
              tasks: tasks
            };
            localStorage.setItem(listName + ' [VERSION]', 3);
            localStorage.setItem(listName, JSON.stringify(tmp));
          },

          load: function load () {
            var localItems = localStorage.getItem(listName),
            tmp = localItems ? JSON.parse(localItems) : null,
            storageVersion = localStorage.getItem(listName + ' [VERSION]');

            if (tmp) {
              // storageVersion doesn't really matter at this time
              // since the task constructor is flexible,
              // but here's how different versions could be handled
              switch (storageVersion) {

              case null:
                // original, names only, no id
                // FALLTHROUGH
              case 1:
              case '1':
                // names and details, no id
                // FALLTHROUGH

              case 2:
              case '2':
                // names, id, other fields
                tmp.forEach(function (t) {
                  that.add(t);
                });
                break;
                
              case 3:
              case '3':
                // list name, list ID, storage version, tasks
                if (tmp.name && tmp.id && tmp.version && tmp.tasks) {
                  listName = tmp.name;
                  listId = tmp.id;
                  version = tmp.version;
                  tasks = tmp.tasks;
                } else {
                  throw new Error('Expected fields were missing');
                }
                break;

              default:
                throw new Error('Unknown task storage version')
                break;
              }
            }

            if (tasks.length > 0) {
              tasks.forEach(function (task, idx) {
                tasksById[task.id] = idx;
              });
            }
          }
        };

    that.load();

    return that;
  };


