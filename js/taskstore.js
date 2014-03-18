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
   * Really just a wrapper to ensure that tasks have unique IDs
   * and a creation date/time
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
   * A TaskApp is just a collection of TaskLists, and some
   * useful methods for managing that collection.
   *
   * @constructor
   * @param {String} name - name for this task app
   */
  taskApp = function taskApp (name) {
    var appName = name || 'Task App',
        taskLists = [],
        taskListsByName = {},
        taskListsById = {},

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
           *
           * @param {String|Object} spec - either a name for the list
           *                               or an Object with list properties
           * @returns String new taskList object
           */
          add: function add (spec) {
            var newList;

            // if spec is just a string, morph it into a spec Object
            if (typeof spec === 'string') {
              spec = { name: spec, description: '' }
            } else {
              spec = spec || {};
              spec.name = spec.name || (taskLists.length === 0 ? 'Task List' :  ('Task List ' + taskLists.length));
              spec.description = spec.description || '';
            }

            // create the new TaskList, unless it's alread in this collection
            // the TaskList will be loaded from localStorage by the taskList
            // constructor if the name matches a localStorage key
            if (! taskListsByName[spec.name]) {
              newList = taskList(spec);
              taskLists.push(newList);
              taskListsByName[newList.getName()] = taskListsById[newList.getId()] = taskLists.length - 1;
              that.save();
              return newList;
            } else {
              return null; // should throw an error
            }
          },
          
          /**
           * remove - remove a task list
           *
           * @param {String} remove a taskList from the collection
           * @returns {Boolean} returns true if the removal was successful
           */
          remove: function remove (id) {
            var idx = taskListsById[id],
                taskList;

            if (typeof idx === 'number') {
              taskList = taskLists[idx];
              removed = taskLists.splice(idx, 1).length;
              if (removed > 0) {
                // also clean up the ById and ByName maps
                delete taskListsById[id];
                delete taskListsByName[taskList.getName()];
                that.save();
                return true;
              }
            }
            return false;
          },
          
          /**
           * get - return a taskList with a specific id
           *
           * @param {String} id - the ID of a taskList
           * @returns {Object} - returns a taskList object, or null
           */
          get: function get (id) {
            var idx = taskListsById[id];
            
            if (typeof idx === 'number') {
              return taskLists[idx];
            }
            return null;
          },

          /**
           * forEach - call a function on each TaskList
           *
           * @param {Function} fn - the function to apply to each taskList
           */
          forEach: function forEach (fn) {
            return taskLists.forEach(fn);
          },
          
          /**
           * getAll - return all the taskLists as an array
           *
           * @returns {Array} an array of taskList objects
           */
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

            if (tmpLists && tmpLists.length) {
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
  taskList = function taskList (spec) {

    if (typeof spec === 'string') {
      spec = { name: spec, description: ''}
    };
    spec = spec || {};
    spec.name = spec.name || 'Task List';
    spec.description = spec.description || '';

    
    var listName = spec.name,
        listDescription = spec.description,
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
          
          getDescription: function getDescription () {
            return listDescription;
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
              description: listDescription,
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

              storageVersion = tmp.version ? tmp.version : storageVersion;
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
                  listDescription = tmp.description || '',
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


