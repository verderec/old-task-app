var taskList = function taskList (spec) {
  spec = spec || {};

  var that = {

    name: spec.name || 'Task List',
    
    tasks: spec.tasks || [],

    add: function add (task) {
      var newlen = that.tasks.push(task);
      localStorage.setItem(that.name, JSON.stringify(that.tasks));
      return (newlen - 1); // index of new entry
    },
  
    remove: function remove (taskId) {
      var removed = that.tasks.splice(taskId, 1);
      localStorage.setItem(that.name, JSON.stringify(that.tasks));
      return (removed.length > 0) ? true: false;
    },

    get: function get (taskId) {
      return that.tasks[taskId];
    },
  
    getAll: function getAll (taskId) {
      return that.tasks;
    },

    getName: function getName () {
      return that.name;
    },
    
    find: function find (task) {
      return that.tasks.indexOf(task);
    },
    
    search: function search (pattern, flags) {
      flags = flags || 'i';
      if (typeof pattern === 'string') {
        pattern = new RegExp(pattern, flags);
      }
      if (! pattern instanceof RegExp) {
        return [];
      } else {
        return that.tasks.filter(function (task) { return pattern.test(task); });
      }
    }
  },
  localItems = localStorage.getItem(that.name),
  tmpTasks;

  if (localItems) {
    tmpTasks = JSON.parse(localItems);
    if (tmpTasks instanceof Array) {
      that.tasks.concat(tmpTasks);
    }
  }

  if (typeof Array.prototype.forEach === 'function') {
    // real browser, or IE >=9
    that.forEach = function forEach (fn) {
      that.tasks.forEach(fn);
    };
  } else {
    // last resort - fake it
    that.forEach = function forEach (fn) {
      var len = that.tasks.length,
          i = 0;

      if (typeof fn !== 'function') {
        throw new TypeError();
      }

      for (; i < len; i++) {
        fn.call(void 0, that.tasks[i], i, that.tasks);
      }
    };
  }

  return that;
};


