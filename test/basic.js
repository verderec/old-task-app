var should = require('should'),
    taskApp = require('../js/node-taskstore');


describe('Task List', function () {

  var appName = 'Test App',
      listName = 'Test List',
      taskName = 'test task',
      app = taskApp(appName),
      tasks = app.find(listName) || app.add(listName);

  before(function(done) {
    // make sure we start with an empty task list
        
    if (tasks) {
      tasks.clearAll();
    }
    done();
  });

  it('should add a new task', function (done) {
    var taskId = tasks.add(taskName),
        checkApp, checkTasks, len, task;

		should.exist(taskId);
    tasks.get(taskId).name.should.equal(taskName);

    checkApp = taskApp(appName);
    checkTasks = checkApp.find(listName) || checkApp.add(listName);
    len = checkTasks.getAll().length;
    task = checkTasks.get(taskId);

    len.should.equal(1);
    task.name.should.equal(taskName);

    done();
  });

  it('should find a task', function (done) {
    var task = tasks.find(taskName);
    
		should.exist(task);
		task.should.have.property('name', taskName);
    done();
  })
  
  it('should remove a task', function (done) {
    var taskId = tasks.find(taskName).id,
        checkApp, checkTasks,
        len;

		should.exist(taskId);
    tasks.remove(taskId).should.equal(true);
    tasks.getAll().length.should.equal(0);

    checkApp = taskApp(appName);
    checkTasks = checkApp.find(listName);
    len = checkTasks.getAll().length;

    len.should.equal(0);

    done();

  });

});