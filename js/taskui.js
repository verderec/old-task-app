$( document ).on("pagecreate", "#task-page", function() {
  var tasks = taskList(),
      addTask = function addTask (task) {
        var taskId = tasks.add(task);
        displayTask(task, taskId);
      },

      displayTask = function displayTask (task, taskId) {
        $('#tasklist').append(
          [
            '<li id="', taskId, '">',
            '<a href="#">',
            task.name,
            '<br/>',
            task.details,
            '</a>',
            '<a href="#" class="delete">',
            'Delete',
            '</a>',
            '</li>'
          ].join('')
        );
        $('#' + taskId + ' .delete').on( "click", function () {
          removeTask($(this).parent('li'));
        });
        $('#tasklist').listview('refresh');
      },

      removeTask = function removeTask (taskItem) {
        var taskId = taskItem.attr("id");
        
        if (tasks.remove(taskId)) {
          taskItem.remove();
          $('#tasklist').listview('refresh');
        }
      };
  

  $("form :input").on("keypress", function(e) {
      return e.keyCode != 13;
  });

  tasks.forEach(displayTask);

  $( '#add' ).on("click", function () {
    var taskname = $('#taskname').val(),
        taskdetails = $('#taskdetails').val();
    addTask({ name: taskname, details: taskdetails });
    $( '#taskname' ).val('');
    $( '#taskdetails' ).val('');
  });

});
