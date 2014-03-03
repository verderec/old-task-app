var should = require('should'),
    taskList = require('../node-tasklist');


describe('Task List', function () {

  var listName = 'Test List',
      taskName = 'test task',
      tasks = taskList({ name: listName });

  before(function(done) {
    // make sure we start with an empty task list
    tasks.forEach(function (task, taskId) {
      tasks.remove(taskId);
    });
    done();
  });
  
  it('should add a new task', function (done) {
    var taskId = tasks.add(taskName),
        checkTasks = taskList({ name: listName}),
        len = checkTasks.getAll().length,
        task = checkTasks.get(taskId);


    taskId.should.equal(0);
    len.should.equal(1);
    task.should.equal(taskName);
    done();
  });
  
  it('should find a task', function (done) {
    var taskId = tasks.find(taskName);
    
    taskId.should.equal(0);
    tasks.get(taskId).should.equal(taskName);
    done();
  })
  
  it('should remove a task', function (done) {
    var taskId = 0,
        checkTasks,
        len;

    tasks.remove(taskId);
        
    checkTasks = taskList({ name: listName});
    len = checkTasks.getAll().length;

    len.should.equal(0);
    done();

  });
  
});