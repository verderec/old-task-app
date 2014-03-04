var should = require('should'),
    taskList = require('../js/node-tasklist');


describe('Task List', function () {

  var listName = 'Test',
      taskName = 'test task',
      tasks = taskList(listName);

  before(function(done) {
    // make sure we start with an empty task list
    tasks.clearAll();
    done();
  });

  it('should add a new task', function (done) {
    var taskId = tasks.add(taskName),
        checkTasks = taskList(listName),
        len = checkTasks.getAll().length,
        task = checkTasks.get(taskId);

		should.exist(taskId);
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
        checkTasks,
        len;

		should.exist(taskId);
    tasks.remove(taskId).should.equal(true);
        
    checkTasks = taskList(listName);
    len = checkTasks.getAll().length;

    len.should.equal(0);
    done();

  });

});