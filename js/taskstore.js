// requires IE >= 9


var app, currTaskList,
    dropbox = new Dropbox.Client({key: DROPBOX_APP_KEY}),
    dropboxLists,
    dropboxTasks,

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
             * getName - get the taskApp name
             *
             * @returns String taskApp name
             */
            getName: function getName () {
              return appName;
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
            
              console.log('Adding list');
              console.dir(spec);

              // create the new TaskList, unless it's alread in this collection
              // the TaskList will be loaded from localStorage by the taskList
              // constructor if the name matches a localStorage key
              if (! taskListsByName[spec.name]) {
                newList = taskList(spec);
                taskLists.push(newList);
                taskListsByName[newList.getName()] = taskListsById[newList.getId()] = taskLists.length - 1;
                console.log('saving new list: ' + spec.name);
                console.dir(newList);
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

              taskLists.forEach(function (taskList) {
                taskList.save();
              });
            },

            /**
             * load - load the Task App state
             */
            load: function load () {
            
              var lists = dropboxLists.query();
            
              lists.forEach(function (list) {
                console.log('Loading list ' + list.get('name'));
                that.add({
                  id: list.getId(),
                  name: list.get('name'),
                  description: list.get('description')
                });
              })
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
          listRecord = null,
          listId = null,
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
              var dbRecord,
                  saveRecord = {
                    name: listName,
                    description: listDescription,
                    version: listVersion,
                  };
            
              if (dropboxLists) {
                if (listId) {
                  dbRecord = dropboxLists.get(listId);
                  saveRecord.id = listId;
                  dbRecord.update(saveRecord);
                } else {
                  dbRecord = dropboxLists.insert(saveRecord);
                  listId = dbRecord.getId();
                }
            
                tasks.forEach(function (task) {
                  var dbRecord,
                      saveRecord = {}
                
                  Object.getOwnPropertyNames(task).forEach(function (pname) {
                    saveRecord[pname] = task[pname];
                  });
                
                  if (!saveTask.listId) {
                    saveRecord.listId = listId;
                  }
            
                  if (saveRecord.id) {
                    dbRecord = dropboxTasks.get(saveRecord.id);
                    dbRecord.update(saveRecord);
                  } else {
                    dbRecord = dropboxTasks.insert(saveRecord);
                    task.id = dbRecord.getId();
                  }
                });
              }
            },

            load: function load () {
              var lists = dropboxLists.query({name: listName}),
                  taskRecords = [],
                  newTask;
            
              if (lists.length > 0) {
                listRecord = lists[0];
                listId = listRecord.getId();
                listDescription = listRecord.get('description') || '';
                listVersion = listRecord.get('version');
              
                taskRecords = dropboxTasks.query({listId: listId});

                if (taskRecords.length > 0) {
                  taskRecords.forEach(function (task, idx) {
                    newTask = task.getFields();
                    tasks.push(newTask);
                    tasksById[task.id] = tasks.length - 1;
                  });
                }
              }
            }
          };

      that.load();

      return that;
    };

if (!dropbox.isAuthenticated()) {
  console.log('Not authenticated');
} else {
  console.log('AUTHENTICATED!');

	dropbox.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
		if (error) {
			alert('Error opening default datastore: ' + error);
		} else {

      dropboxLists = datastore.getTable('tasklists');
      dropboxTasks = datastore.getTable('tasks');
        
      console.log('lists');
      console.dir(dropboxLists);
      console.log('tasks');
      console.dir(dropboxTasks);

      console.log('Starting app');
      TaskAppUIInit();
    }
  });
}



