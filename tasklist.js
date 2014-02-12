var taskList = function taskList (spec) {
  spec = spec || {};

  var that = {

    name: spec.name || 'Task List',
    
    tasks: spec.tasks || [],

    add: function add (task) {
      var newlen = that.tasks.push(task);
      return (newlen - 1); // index of new entry
    },
  
    remove: function remove (taskId) {
      var removed = that.tasks.splice(taskId, 1);
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
  };

  if (typeof Array.prototype.forEach === 'function') {
    // real browser, or IE >=9
    console.log('using Array.prototype.forEach');
    that.forEach = function forEach (fn) {
      that.tasks.forEach(fn);
    };
  } else if ($ && typeof $.each === 'function') {
    // we have jQuery
    console.log('using jQuery.each');
    that.forEach = function forEach (fn) {
      $.each(that.tasks, function (i, el) {
        fn.call(void 0, that.tasks[i], i, that.tasks);
      });
    };
  } else {
    // last resort - fake it
    console.log('using local forEach');
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


